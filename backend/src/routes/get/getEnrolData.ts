import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { model_getEnrolData } from "../../models";

/* ===================== GET ===================== */
export const getEnrolDataRoute: ServerRoute = {
	path: "/getEnrolData",
	method: "GET",
	options: {
		cors: {
			origin: ["*"],
			headers: ["Content-Type", "application/json"],
		},
	},
	handler: getEnrolDataHandler,
};

export async function getEnrolDataHandler(req: Request, res: ResponseToolkit) {
	try {
		const toBeProcessedData = await model_getEnrolData();

		return res.response(toBeProcessedData).code(200);
	} catch (err: any) {
		return res.response({ message: err.message }).code(400);
	}
}
