import { addElemToDom, updateNavButtons } from "../../utils";
import { csDom } from "../csDOM";
import { CustomEvents } from "../customEvents";
import { modalState } from "./modalState";
import { wireModalEvents } from "./modalEvents";
import { updateModalDom } from "./updateModalDOM";
import { FormDataInterface } from "../../interfaces";

const MODAL_ID = csDom.actionModal?.id as string;

/* =========================
   Modal lifecycle
========================= */
export function showModal(): void {
	const modal = document.getElementById(MODAL_ID);

	if (modal) {
		modal.style.display = "block";
		updateModalDom(modal.id);
		return;
	}

	createModal();
}

function createModal(): void {
	addElemToDom({
		parentElem: document.body,
		typeOfElem: "div",
		elemAttributes: {
			id: MODAL_ID,
			style: "display: block;",
		},
		pluginFunc: function (_, modal) {
			modal.innerHTML = getModalTemplate();
			wireModalEvents(modal, function () {
				updateModalDom(modal.id);
			});
		},
	});
}

/* =========================
   State updater (single source)
========================= */
function applyEnrolData(data: FormDataInterface): void {
	modalState.imageFile = data.imageFile;
	modalState.phone = data.phone as string;
	modalState.isImageAvailable = true;

	updateModalDom(MODAL_ID);
}

/* =========================
   Payload handler
========================= */
function handleEnrolPayload(payload: IteratorResult<FormDataInterface>): void {
	if (!payload || payload.done) {
		console.log("[handleEnrolPayload] no data available");
		return;
	}

	applyEnrolData(payload.value);
}

/* =========================
   Image prepared
========================= */
document.addEventListener(CustomEvents.imagePrepared, function (e: Event) {
	const payload = (e as CustomEvent<FormDataInterface>).detail;

	if (!payload?.imageFile || !payload.phone) {
		console.log("[imagePrepared] missing required fields");
		return;
	}

	applyEnrolData(payload);
});

/* =========================
   Next enrol data
========================= */
document.addEventListener(
	CustomEvents.onRecieveNextEnrolData,
	function (e: Event) {
		const payload = (e as CustomEvent<IteratorResult<FormDataInterface>>)
			.detail;

		modalState.canGoBack = true;
		updateNavButtons(!payload.done, true);

		if (payload.done) {
			console.log("[onRecieveNextEnrol] no more data");
			return;
		}

		handleEnrolPayload(payload);
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

		handleEnrolPayload(payload);
	}
);

/* =========================
   External nav controls
========================= */
document.addEventListener(CustomEvents.disableNextBtn, function () {
	updateNavButtons(false, modalState.canGoBack);
});

document.addEventListener(CustomEvents.disablePrevBtn, function () {
	updateNavButtons(true, false);
});

/* =========================
   Modal template
========================= */
function getModalTemplate(): string {
	return `
<!-- =========================
     Modal Overlay
========================= -->
<div id='ext-actionModal'
	class="position-fixed w-100 h-100 d-flex align-items-center justify-content-center"
	style="top: 0; left: 0">

	<!-- =========================
         Modal Container
    ========================= -->
	<div
		class="position-relative bg-white p-4 rounded border d-flex flex-column gap-3"
		style="width: 360px">

		<!-- =========================
             Passport Preview Section
        ========================= -->
		<div class="d-flex flex-column align-items-center justify-content-center gap-2">
			<img
				src="#"
				alt="No pics available"
				class="img-fluid"
				style="border: 2px solid #000; width: 100px; height: 120px" />

			<!-- =========================
                 Counter
            ========================= -->
			<div
				id="ext-enrolCounter"
				class="text-center fw-bold text-muted">
				0 / 0
			</div>

			<button
				class="btn btn-success btn-sm"
				id="modalDownloadBtn"
				disabled>
				Download Image
			</button>
		</div>

		<!-- =========================
             Status Select
        ========================= -->
		<h5 class="mt-3">Select Status</h5>
		<select
			id="ext-statusSelect"
			class="form-select">
			<option value="success">Success</option>
			<option value="error">Error</option>
		</select>

		<!-- =========================
             Error Reason
        ========================= -->
		<div class="my-2">
			<input
				type="text"
				id="ext-errorReason"
				placeholder="type in reason"
				class="form-control d-none" />
			<p
				id="errorText"
				class="text-danger d-none">
				supply error reason (5 words min)
			</p>
		</div>

		<!-- =========================
             Action Buttons
        ========================= -->
		<div class="d-flex justify-content-end gap-2 mt-3">
			<button
				id="ext-submitStatusBtn"
				class="btn btn-danger">
				Submit
			</button>

			<button
				id="ext-closeModalBtn"
				class="btn btn-secondary">
				Close
			</button>
		</div>

		<!-- =========================
             Prev Button
        ========================= -->
		<button
			id="ext-prevBtn"
			class="btn black white-text position-absolute p-1"
			style="top: 50%; left: 1px; transform: translateY(-50%)">
			prev
		</button>

		<!-- =========================
             Next Button
        ========================= -->
		<button
			id="ext-nextBtn"
			class="btn black white-text position-absolute p-1"
			style="top: 50%; right: 1px; transform: translateY(-50%)">
			next
		</button>
	</div>
</div>
`;
}
