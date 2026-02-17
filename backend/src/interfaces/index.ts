export interface EnrolPayloadInterface {
	fullName: string;
	phoneNumber: string;
	imageFile: string;
	imageFileHash: string;
	imageFileExtType: string;
	course: string;
}

export interface EnrolStatusInterface {
	status: "completed" | "error";
	errorMessage?: string;
	phoneNumber: string;
}
export interface UpdateEnrolStatusInterface {
	phoneNumber: number;
	registrationStatus: "completed" | "error";
	registrationMessage?: string | null;
}
