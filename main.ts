import { Hono } from "@hono/hono";
import { authRoutes } from "./routes/auth.ts";
import { userRoutes } from "./routes/user.ts";

const app = new Hono().basePath("/api");

app.get("/health", function (ctx) {
	return ctx.json({ message: "ok" });
});

app.route("/auth", authRoutes);
app.route("/users", userRoutes);

export default app;
