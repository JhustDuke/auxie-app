import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { model_getEnrolStatus } from "../../models";

/* ===================== GET ===================== */
export const getEnrolStatusRoute: ServerRoute = {
	path: "/enrol-status",
	method: "GET",
	handler: getEnrolStatusHandler,
};

export async function getEnrolStatusHandler(
	req: Request,
	res: ResponseToolkit
) {
	const candidateId: number = Number(req.query.candidateId);

	if (!candidateId || Number.isNaN(candidateId)) {
		return res.response({ message: "candidateId is required" }).code(400);
	}

	const status = await model_getEnrolStatus(candidateId);

	if (!status) {
		return res.response({ message: "Status not found" }).code(404);
	}

	return res.response(status).code(200);
}
