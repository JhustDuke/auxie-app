import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { fileTypeFromBuffer } from "file-type";
import { Readable } from "stream";
import { model_enrolCandidate } from "../../models";
import { EnrolPayloadInterface } from "../../interfaces";
import {
	validateEnrolPayload,
	uploadImageToSrcDir,
	checkImgExtTypes,
	checkMimeType,
	createNewFileNameWithPhoneNumber,
} from "../../utils";
import Boom from "@hapi/boom";

export const enrolRoute: ServerRoute = {
	path: "/enrolCandidate",
	method: "POST",
	options: {
		payload: {
			parse: true,
			//make the payload output a data so passport image is turned into buffer for storage in DB__the image to buffer is provided by hapi output:'data'
			output: "data",
			multipart: true,
			maxBytes: 2 * 1024 * 1024, // 2MB limit
		},
		cors: {
			origin: ["*"],
			headers: ["Content-Type", "application/json"],
		},
	},
	handler: enrolHandler,
};

export async function enrolHandler(req: Request, res: ResponseToolkit) {
	if (!req.payload) {
		throw Boom.badData("missing required data");
	}

	const { course, fullName, imageFile, imageFileHash, phoneNumber } =
		req.payload as EnrolPayloadInterface;
	try {
		//this validates/sanitizes the enrol payload for missing fields and wrong fields inputs
		validateEnrolPayload(req.payload as any);

		const type = await fileTypeFromBuffer(Buffer.from(imageFile));
		if (!type) throw new Error("Unsupported image type");

		// Force mimetype for frontend use
		const forcedMime = "image/" + type.ext;
		const forcedExt = "." + type.ext;

		//check image mime type (now gotten from buffer detection, not headers)
		checkMimeType(type.mime);

		//check the image file has the allowed ext type throws error if not
		checkImgExtTypes(forcedExt);

		//rebuild the filename to carry candidates phone number but extract the image extension name first
		const newFileName = createNewFileNameWithPhoneNumber(phoneNumber, type.ext);

		//any error from here is caught by the global error handler at the server file level

		const imageFileStream = new Readable();
		imageFileStream.push(imageFile);
		imageFileStream.push(null); // End the stream

		//this uses the phoneNumber for quick retrieval from memory
		await uploadImageToSrcDir(newFileName, imageFileStream);

		const newCandidate = await model_enrolCandidate({
			fullName,
			imageFileHash,
			imageFileExtType: forcedMime,
			course,
			phoneNumber,
			imageFile, // store renamed file
		});

		return res
			.response({
				status: true,
				newCandidate,
			})
			.code(201);
	} catch (e: any) {
		throw Boom.badRequest(e.message || "could not add candidate");
	}
}
