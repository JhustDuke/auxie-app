import $ from "jquery";

/* -------------------- CONSTANTS -------------------- */

/* -------------------- REGISTRATION TIMER -------------------- */
let timer;
let registrationStartTime: number = 0;

/**
 * Starts or restarts the registration timer
 */
function startRegistrationTimer() {
	timer = new Date();
	registrationStartTime = timer.getTime();
	registrationStartTime;
}

/* -------------------- INIT -------------------- */
document.addEventListener("DOMContentLoaded", startRegistrationTimer);

/* -------------------- IMAGE PREVIEW -------------------- */
const img = $("img")[0] as HTMLImageElement;

$("input[type='file']").on("change", function () {
	const file: File | undefined = (this as HTMLInputElement).files?.[0];
	if (!file) return;

	const reader = new FileReader();

	reader.onload = function (e: ProgressEvent<FileReader>) {
		img.src = e.target?.result as string;
	};

	reader.readAsDataURL(file);
});

/* -------------------- FORM HANDLER -------------------- */
$("#form").on("submit", function (e: Event) {
	e.preventDefault();

	const fullName: string = ($("#fullName").val() as string).trim();
	const email: string = ($("#email").val() as string).trim();
	const phone: string = ($("#phone").val() as string).trim();
	const course: string = $("#course").val() as string;

	if (!fullName || !email || !phone || !course) {
		alert("Please fill in all required fields.");
		return;
	}

	let timeTaken = (Date.now() - registrationStartTime) / 1000;

	if (timeTaken >= 60) {
		const minutes = (Date.now() - registrationStartTime) / 60000;
		timeTaken = Number(minutes.toFixed(3));
		alert("This registration took:" + timeTaken + "minutes");
		return;
	}

	alert("This registration took: " + timeTaken + "secs");

	($("#form")[0] as HTMLFormElement).reset();
});
