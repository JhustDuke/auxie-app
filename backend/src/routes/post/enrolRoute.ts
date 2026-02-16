import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { model_enrol } from "../../models";
import { EnrolPayloadInterface } from "../../interfaces";
import { getMissingField } from "../../utils/validatePayload";
import path from "path";
import fs from "fs";

export const enrolRoute: ServerRoute = {
	path: "/enrol",
	method: "POST",
	options: {
		payload: {
			parse: true,
			output: "stream",
			multipart: true,
			maxBytes: 5 * 1024 * 1024, // 5MB limit
		},
		cors: {
			origin: ["*"],
			headers: ["Content-Type"],
		},
	},
	handler: enrolHandler,
};

export async function enrolHandler(req: Request, res: ResponseToolkit) {
	const payload = req.payload as any as EnrolPayloadInterface & {
		passport: {
			hapi: { filename: string };
			pipe: Function;
		};
	};

	const missingField = getMissingField(payload);
	if (missingField) {
		return res
			.response({ message: `Missing required field: ${missingField}` })
			.code(400);
	}

	const ext = path.extname(payload.passport.hapi.filename);
	const fileName = `${payload.phoneNumber}${ext}`;
	const filePath = path.join("src/uploads", fileName);

	const writeStream = fs.createWriteStream(filePath);
	payload.passport.pipe(writeStream);

	try {
		const result = await model_enrol({
			...payload,
			passport: fileName, // store renamed file
		});

		return res
			.response({
				success: true,
				candidateId: (result as any).insertId,
			})
			.code(201);
	} catch (e: any) {
		return res.response({ message: e.message }).code(500);
	}
}
