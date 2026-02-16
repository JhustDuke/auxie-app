interface ModalInterface {
	imageFile: Blob | null;
	phone: string | null;
	isImageAvailable: boolean;
	stepsForward: number;
	stepsBackward: number;
	canGoForward: boolean;
	canGoBack: boolean;
}

export const modalState: ModalInterface = {
	imageFile: null,
	phone: null,
	isImageAvailable: false,
	stepsForward: 0,
	stepsBackward: 0,
	canGoForward: true,
	canGoBack: false,
};
