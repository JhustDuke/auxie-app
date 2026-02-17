interface ModalInterface {
	imageFile: Blob | null;
	phone: string | null;
	isImageAvailable: boolean;
	stepsForward: number;
	stepsBackward: number;
	canGoForward: boolean;
	canGoBack: boolean;
}

const modalState: ModalInterface = {
	imageFile: null,
	phone: null,
	isImageAvailable: false,
	stepsForward: 0,
	stepsBackward: 0,
	canGoForward: true,
	canGoBack: false,
};

export const actionModalStore = (function modalStore() {
	const stateUpdateHistory: Record<string, string[]> = {};

	function trackUpdate(prop: keyof ModalInterface, updatedBy: string) {
		if (!stateUpdateHistory[prop]) stateUpdateHistory[prop] = [];
		stateUpdateHistory[prop].push(updatedBy);
	}

	return {
		setPhoneNumber(phone: string, updatedBy: string) {
			modalState.phone = phone;
			trackUpdate("phone", updatedBy);
		},
		getPhoneNumber() {
			return modalState.phone;
		},
		setImageFile(imagefile: Blob, updatedBy: string) {
			modalState.imageFile = imagefile;
			trackUpdate("imageFile", updatedBy);
		},
		getImageFile() {
			return modalState.imageFile;
		},
		setCanGoBack(val: boolean, updatedBy: string) {
			modalState.canGoBack = val;
			trackUpdate("canGoBack", updatedBy);
		},
		getCanGoBack() {
			return modalState.canGoBack;
		},
		setCanGoForward(val: boolean, updatedBy: string) {
			modalState.canGoForward = val;
			trackUpdate("canGoForward", updatedBy);
		},
		getCanGoForward() {
			return modalState.canGoForward;
		},
		incrementStepsForward(updatedBy: string) {
			modalState.stepsForward++;
			trackUpdate("stepsForward", updatedBy);
		},
		incrementStepsBackward(updatedBy: string) {
			modalState.stepsBackward++;
			trackUpdate("stepsBackward", updatedBy);
		},
		reduceStepsForward(updatedBy: string) {
			modalState.stepsForward--;
			trackUpdate("stepsForward", updatedBy);
		},
		reduceStepsBackward(updatedBy: string) {
			modalState.stepsBackward--;
			trackUpdate("stepsBackward", updatedBy);
		},
		getStepsForward() {
			return modalState.stepsForward;
		},
		getStepsBackward() {
			return modalState.stepsBackward;
		},
		getUpdateHistory(prop: keyof ModalInterface) {
			return stateUpdateHistory[prop] || [];
		},
	};
})();
