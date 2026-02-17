import { ServerRoute } from "@hapi/hapi";

import { enrolRoute } from "./post";
import {
	baseRoute,
	getEnrolDataRoute,
	getEnrolStatusRoute,
	getCandidateByPhoneRoute,
} from "./get";
import { updateEnrolStatusRoute } from "./patch";
import { notFoundRoute } from "./404";
import { deleteEnrolTable } from "./delete/deleteTable";

export const allRoutes: ServerRoute[] = [
	baseRoute,
	enrolRoute,
	getEnrolDataRoute,
	getEnrolStatusRoute,
	getCandidateByPhoneRoute,
	updateEnrolStatusRoute,
	deleteEnrolTable,
	notFoundRoute,
];
