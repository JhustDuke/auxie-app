import $ from "jquery";
import axios, { AxiosError } from "axios";
import { backendUrls } from "auxie-shared";

/* -------------------- GLOBAL HASH TRACKER -------------------- */
let storedPassportHash: string = "";

/* -------------------- LOCAL STORAGE HELPERS -------------------- */
const PHONE_STORAGE_KEY = "enrolledPhones";

/**
 * Retrieve stored phones from localStorage
 */
function getStoredPhones(): string[] {
	const raw = localStorage.getItem(PHONE_STORAGE_KEY);
	console.log("📦 getStoredPhones:", raw);
	return raw ? JSON.parse(raw) : [];
}

/**
 * Store a phone in localStorage if not already present
 */
function storePhone(phone: string): void {
	const phones = getStoredPhones();
	console.log("📦 Before storing:", phones);

	if (!phones.includes(phone)) {
		phones.push(phone);
		localStorage.setItem(PHONE_STORAGE_KEY, JSON.stringify(phones));
		console.log("✅ Stored phone:", phone);
	}
}

/**
 * Clear all stored phones from localStorage
 */
function clearStoredPhones(): void {
	console.log("🗑 clearStoredPhones called");
	localStorage.removeItem(PHONE_STORAGE_KEY);
}

/* -------------------- RENDER STORED PHONES IN MODAL -------------------- */
function renderStoredPhones(): void {
	const container = $("#storedPhones");
	container.empty();

	const phones = getStoredPhones();
	console.log("📱 Rendering phones:", phones);

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
				console.log("🗑 Clear button clicked");
				clearStoredPhones();
				container.empty();
				container.text("recent registration");
			});

		container.append(clearBtn);
	}
}

/* -------------------- FORM VALIDATION -------------------- */
/**
 * Enables/disables submit button based on required fields
 */
function validateForm(): void {
	const fullName = ($("#fullName").val() as string).trim();
	const phoneNumber = ($("#phone").val() as string).trim();
	const course = ($("#course").val() as string).trim();
	const passportInput = $("#passport")[0] as HTMLInputElement;
	const passportFile = passportInput.files?.[0];

	const isValid =
		fullName && phoneNumber && course && passportFile && storedPassportHash;

	console.log("🧪 Form validity:", !!isValid);
	$("button[type='submit']").prop("disabled", !isValid);
}

/* -------------------- PASSPORT PREVIEW + HASH -------------------- */
$("#passport").on({
	change: async function (e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];

		console.log("📸 Selected file:", file);

		if (!file) {
			console.log("❌ No file selected");
			validateForm();
			return;
		}

		const arrayBuffer = await file.arrayBuffer();
		const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const newHash = hashArray
			.map(function (b) {
				return b.toString(16).padStart(2, "0");
			})
			.join("");

		storedPassportHash = storedPassportHash || newHash;

		console.log("🔐 Generated hash:", newHash);
		console.log("📌 storedPassportHash:", storedPassportHash);

		const reader = new FileReader();
		reader.onload = function () {
			$("#img").attr("src", reader.result as string);
		};
		reader.readAsDataURL(file);

		setTimeout(validateForm, 100); // Ensure form updates after hash is ready
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

		console.log("🚀 Form submit triggered");
		console.log("fullName:", fullName);
		console.log("phoneNumber:", phoneNumber);
		console.log("course:", course);
		console.log("passportFile exists:", !!passportFile);
		console.log("storedPassportHash:", storedPassportHash);

		if (!passportFile || !storedPassportHash) {
			alert("Image and hash are required");
			submitBtn.prop("disabled", false).html("Submit");
			return;
		}

		const data = new FormData();
		data.append("fullName", fullName);
		data.append("phoneNumber", phoneNumber);
		data.append("course", course);
		data.append("imageFile", passportFile);
		data.append("imageFileHash", storedPassportHash);

		console.log("✅ imageFile appended");
		console.log("✅ imageFileHash appended");

		try {
			const response = await axios.post(
				`${backendUrls.regAgents}/enrolCandidate`,
				data
			);

			console.log("✅ Backend response:", response.data);

			storePhone(phoneNumber);
			renderStoredPhones();

			alert(JSON.stringify(response.data.newCandidate, null, 2));

			($("#form")[0] as HTMLFormElement).reset();
			$("#img").attr("src", "");
			storedPassportHash = "";
			validateForm();
		} catch (err) {
			const axiosError = err as AxiosError<{ message?: string }>;
			console.log("❌ Axios error:", axiosError.response?.data);
			alert(axiosError.response?.data?.message || "Unknown error");
			validateForm();
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
			console.log("📂 Modal opened");
			renderStoredPhones();
		}
	},
});

$("#closeModalBtn").on({
	click: function () {
		console.log("📂 Modal closed");
		$("#statusModal").css("display", "none");
	},
});

/* -------------------- CHECK STATUS BUTTON -------------------- */
$("#checkStatusBtn").on({
	click: async function () {
		const phone = ($("#candidatePhone").val() as string).trim();
		const placeholder = $("#statusPlaceholder");

		console.log("🔍 Checking status for:", phone);

		if (!phone) {
			placeholder.text("Please enter a phone number.").css("color", "red");
			return;
		}

		placeholder.text("Checking...").css("color", "orange");

		try {
			const response = await axios.get(
				`${
					backendUrls.regAgents
				}/getCandidateByPhone?phoneNumber=${encodeURIComponent(phone)}`
			);

			console.log("✅ Status response:", response.data);

			placeholder
				.text(
					`Status for ${phone}: ${JSON.stringify(
						response.data.candidate.registrationStatus
					)}`
				)
				.css("color", "green");
		} catch (err) {
			const axiosError = err as AxiosError<{ message?: string }>;
			console.log("❌ Status error:", axiosError.response?.data);
			placeholder
				.text(axiosError.response?.data?.message || "Failed to check status.")
				.css("color", "red");
		}
	},
});

/* -------------------- CANDIDATE PHONE INPUT -------------------- */
$("#candidatePhone").on({
	input: function () {
		$("#statusPlaceholder")
			.text("click the button to check")
			.css("color", "black");
		validateForm();
	},
});

/* -------------------- INITIAL DISABLE SUBMIT -------------------- */
$("button[type='submit']").prop("disabled", true);
