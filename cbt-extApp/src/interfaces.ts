export interface FormDataInterface {
	fullName?: string;
	email?: string;
	phone?: string;
	course?: string;
	imageFile?: any;
}
export interface MessagePayloadInterface {
	fetchSize: string;
}
export interface UiState {
	isDataAvailable: boolean;
	shouldShowActionBtn: boolean;

	customMessage: string;
	shouldShowError: boolean;
}

export interface CsState {
	latestFormData: FormDataInterface | null;
	phone: string | null;
	fileName: string | null;
	shouldCheckImageMatch: boolean;
	ui: Partial<UiState>;
}

export interface BackendResponseInterface {
	id: number;
	fullName: string;
	email: string;
	phone: string;
	course: string;
	imageFile: Blob;
	imageFileHash: string;
	imageFileExtType: string;
}

export interface GeneratorResultInterface<T> {
	value: T;
	done: boolean;
}
