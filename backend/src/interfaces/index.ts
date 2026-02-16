export interface EnrolPayloadInterface {
	fullName: string;
	email: string;
	phoneNumber: string;
	passport: string;
	passportHash: string;
	course: string;
}

export interface EnrolStatusInterface {
	status: "processing" | "completed" | "error";
	errorMessage?: string;
	phoneNumber: string;
}
export interface UpdateEnrolStatusInterface {
	phoneNumber: number;
	status: "processing" | "completed" | "error";
	errorMessage?: string | null;
}
