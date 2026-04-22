import { db } from "./core.ts";
import { v } from "./valibot.ts";
import { hash } from "@bronti/bcrypt";

export async function createUsersTable() {
	await db.query(
		`CREATE TABLE IF NOT EXISTS users(
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP,
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT NOT NULL
        )`,
	);
	await db.query(
		`CREATE UNIQUE INDEX IF NOT EXISTS uniq_username ON users (username) WHERE deleted_at IS NULL`,
	);
}

export interface HashedPassword {
	id: bigint;
	password: string;
}

export const UserSchema = v.object({
	created_at: v.date(),
	deleted_at: v.nullable(v.date()),
	id: v.bigint(),
	username: v.string(),
});
export type User = v.InferOutput<typeof UserSchema>;

export const LoginSchema = v.object({
	...v.pick(UserSchema, ["username"]).entries,
	password: v.string(),
});

export async function createUser(
	data: v.InferOutput<typeof LoginSchema>,
): Promise<User> {
	const [newUser] = await db.query(
		`INSERT INTO users (password, username) VALUES ($1, $2) returning id, username`,
		[hash(data.password), data.username],
	) as User[];
	return newUser;
}

export async function fetchHashedPassword(
	username: string,
): Promise<HashedPassword | null> {
	const users = await db.query(
		`SELECT id, password FROM users WHERE username = $1 AND deleted_at IS NULL`,
		[username],
	) as HashedPassword[];
	return users.at(0) ?? null;
}

export async function fetchUser(id: bigint): Promise<User | null> {
	const users = await db.query(
		`SELECT id, username FROM users WHERE id = $1 AND deleted_at IS NULL`,
		[id],
	) as User[];
	return users.at(0) ?? null;
}
