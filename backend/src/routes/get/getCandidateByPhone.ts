import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { model_getCandidateByPhone } from "../../models";
import { validatePayloadPhoneNumber as validatePhoneNumber } from "../../utils";
import Boom from "@hapi/boom";

export const getCandidateByPhoneRoute: ServerRoute = {
	path: "/getCandidateByPhone",
	method: "GET",
	options: {
		cors: {
			origin: ["*"],
			headers: ["Content-Type", "application/json"],
		},
	},
	handler: getCandidateByPhoneHandler,
};

export async function getCandidateByPhoneHandler(
	req: Request,
	res: ResponseToolkit
) {
	if (!req.query) {
		throw Boom.badRequest("missing required fields");
	}
	const { phoneNumber } = req.query as { phoneNumber?: string };

	try {
		validatePhoneNumber(phoneNumber);

		const candidate = await model_getCandidateByPhone(phoneNumber!);

		return res.response({ message: "successful", candidate }).code(200);
	} catch (err: any) {
		return res.response({ message: err.message }).code(400);
	}
}
