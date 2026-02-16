import { EnrolPayloadInterface } from "../interfaces";

export function getMissingField(payload: EnrolPayloadInterface): string | null {
	const requiredFields: (keyof EnrolPayloadInterface)[] = [
		"course",
		"fullName",
		"passport",
		"passportHash",
		"phoneNumber",
	];

	for (const field of requiredFields) {
		if (!payload?.[field]) {
			return field;
		}
	}

	return null;
}
