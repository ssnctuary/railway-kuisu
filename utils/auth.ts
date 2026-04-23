import { JWTPayload, jwtVerify, SignJWT } from "@panva/jose";
import { encoder, HonoEnv } from "./core.ts";
import { envOrThrow } from "@dudasaus/env-or-throw";
import { bearerAuth } from "@hono/hono/bearer-auth";
import { Context } from "@hono/hono";
import { fetchUser } from "./user.ts";

export interface Payload extends JWTPayload {
	user_id: bigint;
}

interface Session {
	access_token: string;
	refresh_token: string;
}

export const honoBearerAuth = bearerAuth({
	async verifyToken(token, ctx: Context<HonoEnv>) {
		const userId = await verifyAccessToken(token);
		const user = await fetchUser(userId);

		if (!user) {
			return false;
		} else {
			ctx.set("user", user);
			return true;
		}
	},
});

export async function createAccessToken(userId: bigint): Promise<string> {
	const jwt = new SignJWT({
		user_id: userId,
		exp: Math.floor(Date.now()) + 86_400,
	}).setProtectedHeader({ alg: "HS256", typ: "JWT" });
	return await jwt.sign(encoder.encode(envOrThrow("JWT_ACCESS_KEY")));
}

export async function createRefreshToken(userId: bigint): Promise<string> {
	const jwt = new SignJWT({
		user_id: userId,
		exp: Math.floor(Date.now()) + 259_200,
	}).setProtectedHeader({ alg: "HS256", typ: "JWT" });
	return await jwt.sign(encoder.encode(envOrThrow("JWT_REFRESH_KEY")));
}

export async function createSession(userId: bigint): Promise<Session> {
	return {
		access_token: await createAccessToken(userId),
		refresh_token: await createRefreshToken(userId),
	} satisfies Session;
}

export async function verifyAccessToken(token: string): Promise<bigint> {
	const { payload } = await jwtVerify<Payload>(
		token,
		encoder.encode(envOrThrow("JWT_ACCESS_KEY")),
	);
	return payload.user_id;
}

export async function verifyRefreshToken(token: string): Promise<bigint> {
	const { payload } = await jwtVerify<Payload>(
		token,
		encoder.encode(envOrThrow("JWT_REFRESH_KEY")),
	);
	return payload.user_id;
}
