import { addElemToDom, emitCustomEvent } from "../utils";
import { FormDataInterface } from "../interfaces";
import { CustomEvents as customEventsNames } from "./customEvents";

export const formMethods = (function () {
	// ===============================
	// INTERNAL HELPER
	// ===============================
	const createPill = function (
		elem: HTMLInputElement | HTMLSelectElement,
		value: string,
		pillText: string
	): void {
		if (!value) return;
		if (elem.parentElement?.querySelector(".ext-pill")) return;

		elem.value = value;

		addElemToDom({
			parentElem: elem.parentElement || document.body,
			typeOfElem: "button",
			textContent: pillText,
			elemAttributes: {
				class: "ext-pill red lighten-3",
				type: "button",
			},
			pluginFunc: function (parent, pill) {
				parent.insertBefore(pill, elem.nextSibling);

				pill.addEventListener("dblclick", function () {
					elem.value = "";
					pill.remove();
				});
			},
		});
	};

	// ===============================
	// PUBLIC API
	// ===============================
	return {
		handleInput: function (
			input: HTMLInputElement,
			formData: FormDataInterface
		): void {
			if (!formData) return;

			const placeholder = input.placeholder?.toLowerCase() || "";

			if (input.type === "file") {
				const imageFileName = extractFilename(input);
				emitCustomEvent({
					eventName: customEventsNames.onImageFileNameEmit,
					payload: {
						imageFileName,
					},
				});
			}

			if (placeholder.includes("full name") && formData.fullName) {
				createPill(input, formData.fullName, "Full Name");
				return;
			}

			if (placeholder.includes("email") && formData.email) {
				createPill(input, formData.email, "Email");
				return;
			}

			if (placeholder.includes("phone") && formData.phone) {
				emitCustomEvent({
					eventName: customEventsNames.onPhoneNumberEmit,
					payload: {
						phone: formData.phone,
					},
				});
				createPill(input, formData.phone, "Phone");
			}
		},

		handleSelect: function (select: HTMLSelectElement, course?: string): void {
			const courses = Array.from(select.options);
			const payloadCourse = courses.find(function (entry) {
				return entry.value.toLowerCase() === course?.toLowerCase();
			});
			if (!payloadCourse) {
				createPill(select, "null", `${course} not found`);
				return;
			}
			select.value = payloadCourse.value;
			createPill(select, payloadCourse.value, "Course");
		},

		handleEvent: function (e: Event, formData: FormDataInterface): void {
			const target = e.target as HTMLElement;
			if (!target) return;

			emitImageToActionModal(formData);

			if (target.tagName === "INPUT") {
				const input = target as HTMLInputElement;

				if (input.placeholder) {
					this.handleInput(input, formData);
				}
				return;
			}

			if (target.tagName === "SELECT") {
				this.handleSelect(target as HTMLSelectElement, formData.course);
			}
		},
	};
})();

// ===============================
// IMAGE EMITTER (SINGLE SOURCE)
// ===============================
let imageEmitted = false;

const emitImageToActionModal = function (formData: FormDataInterface): void {
	if (imageEmitted) {
		return;
	}
	if (!formData?.imageFile) {
		console.log("phone not available");
		return;
	}
	if (!formData?.phone) {
		console.log("phone not available");
		return;
	}

	emitCustomEvent({
		eventName: customEventsNames.imagePrepared,
		payload: formData,
	});
	imageEmitted = true;
};

function extractFilename(input: HTMLInputElement): string | null {
	if (!input.files || input.files.length === 0) {
		console.log("No file selected");
		return null;
	}

	const file = input.files[0];
	const nameParts = file.name.split(".");
	if (nameParts.length === 1) return file.name; // no extension
	nameParts.pop(); // remove extension
	return nameParts.join(".");
}
