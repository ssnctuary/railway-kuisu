import { Hono } from "@hono/hono";
import { authRoutes } from "./routes/auth.ts";

const app = new Hono().basePath("/api");

app.get("/health", function (ctx) {
	return ctx.json({ message: "ok" });
});

app.route("/auth", authRoutes);

export default app;
