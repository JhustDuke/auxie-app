import { ServerRoute } from "@hapi/hapi";
import { enrolRoute } from "./post";
import { getEnrolStatusRoute } from "./get";
import { updateEnrolStatusRoute } from "./patch";
import { healthRoute } from "./heatlhRoute";

export const allRoutes: ServerRoute[] = [
	enrolRoute,
	getEnrolStatusRoute,
	updateEnrolStatusRoute,
	healthRoute,
];
