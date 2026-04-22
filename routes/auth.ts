import { Hono } from "@hono/hono";
import { HonoEnv } from "../utils/core.ts";
import { createUser, fetchHashedPassword, LoginSchema } from "../utils/user.ts";
import { v } from "../utils/valibot.ts";
import { createSession } from "../utils/auth.ts";
import { verify } from "@bronti/bcrypt";

export const authRoutes = new Hono<HonoEnv>();

authRoutes.post("/login", async function (ctx) {
	const payload = v.parse(LoginSchema, await ctx.req.json());
	const hashedPassword = await fetchHashedPassword(payload.username);

	const invalidResponse = ctx.json(
		{ error: "username or password invalid" },
		400,
	);

	if (!hashedPassword) {
		return invalidResponse;
	} else {
		const valid = verify(payload.password, hashedPassword.password);

		if (!valid) {
			return invalidResponse;
		} else {
			return ctx.json(await createSession(hashedPassword.id));
		}
	}
});

authRoutes.post("/signup", async function (ctx) {
	const payload = v.parse(LoginSchema, await ctx.req.json());
	const newUser = await createUser(payload);

	return ctx.json(await createSession(newUser.id));
});
