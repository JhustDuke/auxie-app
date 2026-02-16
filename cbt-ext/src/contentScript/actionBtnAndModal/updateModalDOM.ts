import { CustomEvents } from "../customEvents";
import { modalState } from "./modalState";

export function updateModalDom(modal_id: string): void {
	const modal = document.getElementById(modal_id);
	if (!modal) return;

	const img = modal.querySelector<HTMLImageElement>("img");
	const downloadBtn =
		modal.querySelector<HTMLButtonElement>("#modalDownloadBtn");
	const counter = modal.querySelector<HTMLDivElement>("#ext-enrolCounter");

	if (!img || !downloadBtn || !counter) {
		console.log("updateModal missing required fields");
		return;
	}

	// image rendering
	if (modalState.isImageAvailable && modalState.imageFile) {
		if (modalState.imageFile instanceof Blob) {
			img!.src = URL.createObjectURL(modalState.imageFile);
		} else {
			img.src = "data:image/png;base64," + modalState.imageFile;
		}
		img.alt = "";
		downloadBtn.disabled = false;
	} else {
		img.src = "#";
		img.alt = "No image available";
		downloadBtn.disabled = true;
	}
	//watchNextBtn();
	// update steps counter
	counter.textContent = `${modalState.stepsBackward} / ${modalState.stepsForward}`;
}

function watchNextBtn() {
	const nextBtn = document.getElementById("ext-nextBtn") as HTMLButtonElement;
	if (nextBtn) {
		nextBtn.disabled = modalState.canGoForward;
	} else {
		console.log("nextBtn not found");
	}
}

function watchPrevBtn() {
	const prevBtn = document.getElementById("ext-prevBtn") as HTMLButtonElement;
	if (prevBtn) {
		prevBtn.disabled = modalState.canGoBack;
	} else {
		console.log("prevBtn not found");
	}
}
