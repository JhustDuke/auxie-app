import { CustomEvents } from "../customEvents";
import { actionModalStore } from "./actionModalStore";
import { FormDataInterface } from "../../interfaces";
import { updateNavButtons } from "../../utils";

const spinner = `<div class="spinner-border" role="status">
	<span class="visually-hidden">Loading...</span>
</div>`;

export async function updateModalDom(modal_id: string) {
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
	/**
	 * whats the problem, the image is now served via http
	 * but the mock sent it via payload
	 * and some state watcher depended on payload
	 * so what i want is to get is via http
	 * turn it to blob and
	 * enable the download btn when it has been succeeded
	 * and also change the look the state of isImageAvailable
	 */
	let currentObjectUrl: string | null = null;

	try {
		downloadBtn.disabled = true;
		downloadBtn.innerHTML = spinner;

		const blob = await fetchImage();

		//this part of the code would be passed as payload to the bgscript
		//to init the download process for the image
		//in the actionModal events downloadBtn listener
		actionModalStore.setImageFile(blob, "updateModalDom");

		if (currentObjectUrl) {
			URL.revokeObjectURL(currentObjectUrl);
		}

		//this converts it to an image that can easily be previewed by the user
		currentObjectUrl = URL.createObjectURL(blob);
		img.src = currentObjectUrl;

		downloadBtn.disabled = false;
		downloadBtn.innerHTML = "Download";
	} catch (err: any) {
		downloadBtn.disabled = false;
		downloadBtn.innerHTML = "Refetch data";
	}

	counter.textContent = `${actionModalStore.getStepsBackward()} / ${actionModalStore.getStepsForward()}`;
}

/**
 * WHAT DO I WANT?
 * I WANT TO FETCH THE PICTURE VIA NETWORK
 * WHILE ITS FETCHING SHOW A SPINNER TO INDICATE ITS
 *
 * WHEN ITS GOTTEN TURN IT TO BLOB
 * DISPLAY IN THE PASSPORT SECTION
 * ENABLE THE DOWNLOAD BTN
 * CACHE IT
 * WHEN THE NEXT/PREV IS CLICKED AGAIN, REPEAT THE PROCESS
 *
 */

function buildImgUrl() {
	const backend = `https://auxie-kwfy.onrender.com`;
	const uploads = "uploads";
	const phonenumber = actionModalStore.getPhoneNumber();
	const url = `${backend}/${uploads}/08160487143.png`;
	return url;
}

async function fetchImage() {
	const url = buildImgUrl();

	try {
		const res = await fetch(url);

		if (!res.ok) {
			console.log("fetchImageAsBlob: response not ok");
			throw new Error("Failed to fetch image");
		}
		const blob = await res.blob();

		return blob;
	} catch (err: any) {
		throw new Error("fetching failed");
	}
}

/* =========================
   THESE CUSTOM EVENTS ARE PLA
			HERE BECAUSE OF THE LIFECYCLE 
			IT INSTIGATED IN THE MODAL EVENTS
			AND BEING KEPT HERE HELPS UPDATE THE MODAL AS SOON
			THE EVENT IS FIRED
========================= */
document.addEventListener(
	CustomEvents.onRecieveNextEnrolData,
	function (e: Event) {
		const payload = (e as CustomEvent<IteratorResult<FormDataInterface>>)
			.detail;

		actionModalStore.setCanGoBack(true, "onRecievingEnrol");
		updateNavButtons(!payload.done, true);

		if (payload.done) {
			console.log("[onRecieveNextEnrol] no more data");
			return;
		}
	}
);

/* =========================
   Prev enrol data
========================= */
document.addEventListener(
	CustomEvents.onRecievePrevEnrolData,
	function (e: Event) {
		const payload = (e as CustomEvent<IteratorResult<FormDataInterface>>)
			.detail;

		updateNavButtons(true, !payload.done);

		if (payload.done) {
			console.log("[onRecievePrevEnrol] no more previous data");
			return;
		}
	}
);

/* =========================
THESE EVENT WHEN FIRED ENABLES/DISABLE THE NEXT/PREV
BTN ITS INSTIGATED FREOM  CS SCRIPT
========================= */
document.addEventListener(CustomEvents.disableNextBtn, function () {
	updateNavButtons(false, actionModalStore.getCanGoBack());
});

document.addEventListener(CustomEvents.disablePrevBtn, function () {
	updateNavButtons(true, false);
});
