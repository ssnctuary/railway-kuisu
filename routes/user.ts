import { Hono } from "@hono/hono";
import { HonoEnv } from "../utils/core.ts";
import { honoBearerAuth } from "../utils/auth.ts";
import { fetchUser } from "../utils/user.ts";

export const userRoutes = new Hono<HonoEnv>();

userRoutes.use(honoBearerAuth);

userRoutes.get("/:id", async function (ctx) {
	const { id } = ctx.req.param();
	const user = ctx.get("user");
	const fetchedUser = await fetchUser(id === "me" ? user.id : BigInt(id));

	if (fetchedUser) {
		return ctx.json(fetchedUser);
	} else {
		return ctx.json({ error: "user not found" }, 404);
	}
});
