// src/routes/health.ts
import { ServerRoute } from "@hapi/hapi";

export const healthRoute: ServerRoute = {
	path: "/",
	method: "GET",
	handler: (_req, h) => h.response({ status: "ok" }).code(200),
};
