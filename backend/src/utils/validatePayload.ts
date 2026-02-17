import {
	EnrolPayloadInterface,
	UpdateEnrolStatusInterface,
} from "../interfaces";
import path from "path";
// -------------------------
// Generic helpers
// -------------------------

/** Check required fields and throw if any is missing */
export function checkMissingFields<T extends object>(
	requiredFields: (keyof T)[],
	payload: T
) {
	for (const field of requiredFields) {
		if (!payload[field]) {
			throw new Error(`Missing required field ${String(field)}`);
		}
	}
}

/** Ensure string and reject injectable characters */
export function sanitizeStringField(field: any, fieldName: string): string {
	const str = String(field);
	const forbidden = /[;'"`]/;
	if (forbidden.test(str)) {
		throw new Error(`${fieldName} contains invalid characters`);
	}
	return str;
}

// -------------------------
// Enrol-specific validation
// -------------------------
export function validateEnrolPayload(payload: EnrolPayloadInterface) {
	// Required fields
	const requiredField: (keyof EnrolPayloadInterface)[] = [
		"course",
		"fullName",
		"imageFile",
		"imageFileHash",
		"phoneNumber",
	];
	checkMissingFields(requiredField, payload);

	//check wrong entries
	for (let payloadEntry in payload) {
		if (!requiredField.includes(payloadEntry as any)) {
			throw new Error(`unknown entry supplied "${payloadEntry}"`);
		}
	}

	// Sanitize string fields
	payload.phoneNumber = sanitizeStringField(payload.phoneNumber, "phoneNumber");
	payload.fullName = sanitizeStringField(payload.fullName, "fullName");
	payload.course = sanitizeStringField(payload.course, "course");

	// Passport must have hapi.filename and pipe
	// if (
	// 	!payload.passport?.hapi?.filename ||
	// 	typeof payload.passport.pipe !== "function"
	// ) {
	// 	throw new Error("Invalid passport file");
	// }
}

// -------------------------
// Phone number only validation
// -------------------------
export function validatePayloadPhoneNumber(phoneNumber?: string) {
	if (!phoneNumber) throw new Error("phoneNumber is required");
	return sanitizeStringField(phoneNumber, "phoneNumber");
}

// -------------------------
// Update-specific validation
// -------------------------
export function validateUpdatePayload(payload: UpdateEnrolStatusInterface) {
	// @ts-ignore
	payload.phoneNumber = validatePayloadPhoneNumber(payload.phoneNumber);

	// registrationMessage
	if (payload.registrationMessage) {
		payload.registrationMessage = sanitizeStringField(
			payload.registrationMessage,
			"registrationMessage"
		);
	}

	// Enum validation
	const validStatuses = ["ERROR", "COMPLETED"];
	if (!payload.registrationStatus)
		throw new Error("registrationStatus is required");

	const payloadStatus = payload.registrationStatus.toUpperCase();
	if (!validStatuses.includes(payloadStatus)) {
		throw new Error(
			"Invalid status provided, valid statuses are: ERROR, COMPLETED"
		);
	}

	// registrationMessage required if ERROR
	if (payloadStatus === "ERROR" && !payload.registrationMessage) {
		throw new Error("registrationMessage is required when status is ERROR");
	}
}

export function createNewFileNameWithPhoneNumber(
	phoneNumber: string,
	fileExtType: string
) {
	const fileExt = path.extname(fileExtType);

	const newfileName = phoneNumber + fileExt;
	return newfileName;
}

export function checkImgExtTypes(extname: string) {
	const allowedExt = [".jpg", ".png", "jpeg"];
	if (!allowedExt.includes(extname)) {
		throw new Error("wrong file type, allowed is:['.jpg','.png','jpeg']");
	}

	/**
	 * what do i want?
	 * if the arg ends with png or .png
	 * and is contains in allowedExt
	 * *** the problem is
	 * the updated function only give an ext not a path
	 *
	 */
}

export function checkMimeType(mimeType: string) {
	const allowedMimeTypes = ["image/jpeg", "image/png"];

	if (!allowedMimeTypes.includes(mimeType)) {
		throw new Error("wrong mime type, allowed: ['image/jpeg', 'image/png']");
	}
}
