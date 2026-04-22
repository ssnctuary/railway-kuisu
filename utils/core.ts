import { neon } from "@neon/serverless";
import { envOrThrow } from "@dudasaus/env-or-throw";
import { User } from "./user.ts";

export interface HonoEnv {
	Variables: {
		user: User;
	};
}

export const db = neon(envOrThrow("NEON_URL"));
export const encoder = new TextEncoder();
