import { emitCustomEvent } from "../../utils";
import { CustomEvents } from "../customEvents";
import { modalState } from "./modalState";
import { modal_ids } from "./modal_ids";

export function wireModalEvents(
	modal: HTMLElement,
	updateCallback?: () => void
): void {
	const elems = modal_ids(modal);

	const missingElems: string[] = [];
	for (const key in elems) {
		if (!elems[key as keyof typeof elems]) missingElems.push(key);
	}
	if (missingElems.length > 0) {
		console.warn(
			"[wireModalEvents] missing required elements:",
			missingElems.join(", ")
		);
		return;
	}

	const submitBtn = elems.submitBtn as HTMLButtonElement;
	const closeBtn = elems.closeBtn as HTMLButtonElement;
	const selectEl = elems.selectEl as HTMLSelectElement;
	const errorReasonInput = elems.errorReasonInput as HTMLInputElement;
	const errorText = elems.errorText as HTMLElement;
	const downloadBtn = elems.downloadBtn as HTMLButtonElement;
	const prevBtn = elems.prevBtn as HTMLButtonElement;
	const nextBtn = elems.nextBtn as HTMLButtonElement;

	// Submit & Close
	submitBtn.addEventListener("click", function () {
		modal.style.display = "none";
		if (updateCallback) updateCallback();
	});
	closeBtn.addEventListener("click", function () {
		modal.style.display = "none";
		if (updateCallback) updateCallback();
	});

	// Status select
	selectEl.addEventListener("change", function () {
		const isError = selectEl.value === "error";
		errorReasonInput.classList.toggle("d-none", !isError);
		errorText.classList.toggle("d-none", !isError);
		submitBtn.disabled = isError;
		if (updateCallback) updateCallback();
	});

	// Error reason input
	errorReasonInput.addEventListener("input", function () {
		const isValid = errorReasonInput.value.trim().length >= 5;
		submitBtn.disabled = !isValid;
		errorText.classList.toggle("d-none", isValid);
		if (updateCallback) updateCallback();
	});

	// Download button
	downloadBtn.addEventListener("click", function () {
		if (
			!modalState.isImageAvailable ||
			!modalState.imageFile ||
			!modalState.phone
		) {
			console.log("[downloadBtn] blocked: state incomplete");
			return;
		}
		emitCustomEvent({
			eventName: CustomEvents.initDownload,
			payload: { imageFile: modalState.imageFile, phone: modalState.phone },
		});
		console.log("[downloadBtn] download event emitted");
		if (updateCallback) updateCallback();
	});

	// Prev & Next buttons
	prevBtn.addEventListener("click", function () {
		emitCustomEvent({ eventName: CustomEvents.getPrev });
		console.log("[prevBtn] prev event emitted");
		handlePrevCounter();
		if (updateCallback) updateCallback();
	});
	nextBtn.addEventListener("click", function () {
		emitCustomEvent({ eventName: CustomEvents.getNext });
		console.log("[nextBtn] next event emitted");
		handleNextCounter();
		if (updateCallback) updateCallback();
	});
}

function handleNextCounter() {
	modalState.stepsBackward++;
	if (modalState.stepsForward > 0) {
		modalState.stepsForward--;
	}
}

function handlePrevCounter() {
	modalState.stepsForward++;
	if (modalState.stepsBackward > 0) modalState.stepsBackward--;
}
