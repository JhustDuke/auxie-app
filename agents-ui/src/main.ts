import $ from "jquery";
import axios, { AxiosError } from "axios";

/* -------------------- GLOBAL HASH TRACKER -------------------- */
let storedPassportHash: string = "";

/* -------------------- LOCAL STORAGE HELPERS -------------------- */
const PHONE_STORAGE_KEY = "enrolledPhones";

function getStoredPhones(): string[] {
	const raw = localStorage.getItem(PHONE_STORAGE_KEY);
	return raw ? JSON.parse(raw) : [];
}

function storePhone(phone: string): void {
	const phones = getStoredPhones();
	if (!phones.includes(phone)) {
		phones.push(phone);
		localStorage.setItem(PHONE_STORAGE_KEY, JSON.stringify(phones));
	}
}

function clearStoredPhones(): void {
	localStorage.removeItem(PHONE_STORAGE_KEY);
}

/* -------------------- RENDER STORED PHONES IN MODAL -------------------- */
function renderStoredPhones(): void {
	const container = $("#storedPhones");
	container.empty();

	const phones = getStoredPhones();

	container.append(
		$("<div>").addClass("text-dark fw-bold mb-2").text("Recent registrations")
	);

	phones.forEach(function (phone) {
		const btn = $("<button>")
			.text(phone)
			.addClass("btn btn-sm btn-outline-dark w-100 mb-2")
			.on("dblclick", function () {
				$("#candidatePhone").val(phone);
			});

		container.append(btn);
	});

	if (phones.length > 0) {
		const clearBtn = $("<button>")
			.text("Clear Recent")
			.addClass("btn btn-sm red lighten-1 white-text w-100 mt-2")
			.on("click", function () {
				clearStoredPhones();
				container.empty();
				container.text("recent registration");
			});

		container.append(clearBtn);
	}
}

/* -------------------- PASSPORT PREVIEW + HASH -------------------- */
$("#passport").on({
	change: async function (e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const arrayBuffer = await file.arrayBuffer();
		const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const newHash = hashArray
			.map(function (b) {
				return b.toString(16).padStart(2, "0");
			})
			.join("");

		storedPassportHash = storedPassportHash || newHash;

		const reader = new FileReader();
		reader.onload = function () {
			$("#img").attr("src", reader.result as string);
		};
		reader.readAsDataURL(file);
	},
});

/* -------------------- FORM SUBMIT + AXIOS -------------------- */
$("#form").on({
	submit: async function (e: Event) {
		e.preventDefault();

		const submitBtn = $("button[type='submit']");
		submitBtn.prop("disabled", true).html(`
			<span class="spinner-border spinner-border-sm"></span>
			Processing...
		`);

		const fullName = ($("#fullName").val() as string).trim();
		const phoneNumber = ($("#phone").val() as string).trim();
		const course = ($("#course").val() as string).trim();

		const passportInput = $("#passport")[0] as HTMLInputElement;
		const passportFile = passportInput.files?.[0];

		const data = new FormData();
		data.append("fullName", fullName);
		data.append("phoneNumber", phoneNumber);
		data.append("course", course);

		if (passportFile && storedPassportHash) {
			data.append("imageFile", passportFile);
			data.append("imageFileHash", storedPassportHash);
		}

		try {
			const response = await axios.post(
				"https://auxie-kwfy.onrender.com/enrolCandidate",
				data
			);

			storePhone(phoneNumber);
			renderStoredPhones();

			alert(JSON.stringify(response.data.newCandidate, null, 2));

			($("#form")[0] as HTMLFormElement).reset();
			$("#img").attr("src", "");
			storedPassportHash = "";
		} catch (err) {
			const axiosError = err as AxiosError<{ message?: string }>;
			alert(axiosError.response?.data?.message || "Unknown error");
		} finally {
			submitBtn.prop("disabled", false).html("Submit");
		}
	},
});

/* -------------------- MODAL TOGGLE -------------------- */
$("#toggleModalBtn").on({
	click: function () {
		const modal = $("#statusModal");
		const isHidden = modal.css("display") === "none";
		modal.css("display", isHidden ? "block" : "none");

		if (isHidden) {
			renderStoredPhones();
		}
	},
});

$("#closeModalBtn").on({
	click: function () {
		$("#statusModal").css("display", "none");
	},
});

/* -------------------- CHECK STATUS BUTTON (AXIOS + QUERY STRING) -------------------- */
$("#checkStatusBtn").on({
	click: async function () {
		const phone = ($("#candidatePhone").val() as string).trim();
		const placeholder = $("#statusPlaceholder");

		if (!phone) {
			placeholder.text("Please enter a phone number.").css("color", "red");
			return;
		}

		placeholder.text("Checking...").css("color", "orange");

		try {
			const response = await axios.get(
				`https://auxie-kwfy.onrender.com/getCandidateByPhone?phoneNumber=${encodeURIComponent(
					phone
				)}`
			);
			console.log(response.data);

			placeholder
				.text(
					`Status for ${phone}: ${JSON.stringify(
						response.data.candidate.registrationStatus
					)}`
				)
				.css("color", "green");
		} catch (err) {
			const axiosError = err as AxiosError<{ message?: string }>;
			placeholder
				.text(axiosError.response?.data?.message || "Failed to check status.")
				.css("color", "red");
		}
	},
});

$("#candidatePhone").on({
	input: function () {
		$("#statusPlaceholder")
			.text("click the button to check")
			.css("color", "black");
	},
});
