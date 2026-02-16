import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { model_updateEnrolStatus } from "../../models";
import { UpdateEnrolStatusInterface } from "../../interfaces";

export const updateEnrolStatusRoute: ServerRoute = {
	path: "/enrol-status",
	method: "PATCH",
	handler: updateEnrolStatusHandler,
};

export async function updateEnrolStatusHandler(
	req: Request,
	res: ResponseToolkit
) {
	const payload = req.payload as UpdateEnrolStatusInterface;

	if (payload.phoneNumber === undefined) {
		return res.response({ message: "phoneNumber is required" }).code(400);
	}

	if (typeof payload.phoneNumber !== "number") {
		return res.response({ message: "phoneNumber format is wrong" }).code(422);
	}

	if (!payload.status) {
		return res.response({ message: "status is required" }).code(400);
	}

	if (payload.status === "error" && !payload.errorMessage) {
		return res
			.response({ message: "errorMessage is required when status is error" })
			.code(400);
	}

	try {
		await model_updateEnrolStatus(payload);
		return res.response({ message: "Enrol status updated" }).code(200);
	} catch (error: any) {
		return res.response({ message: error.message }).code(422);
	}
}
