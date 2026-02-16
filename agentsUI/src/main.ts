import $ from "jquery";

/* -------------------- GLOBAL HASH TRACKER -------------------- */
let storedPassportHash: string = "";

/* -------------------- PASSPORT PREVIEW + HASH + MATCH CHECK -------------------- */
$("#passport").on({
	change: async function (e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		/* ---- HASH FILE ---- */
		const arrayBuffer = await file.arrayBuffer();
		const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const newHash = hashArray
			.map(function (b) {
				return b.toString(16).padStart(2, "0");
			})
			.join("");

		/* ---- MATCH CHECK ---- */
		if (storedPassportHash === "") {
			storedPassportHash = newHash;
			console.log("first hash stored:", storedPassportHash);
		} else {
			if (storedPassportHash === newHash) {
				console.log("it's a match");
			} else {
				console.log("not a match");
			}
		}

		/* ---- PREVIEW ---- */
		const reader = new FileReader();
		reader.onload = function () {
			$("#img").attr("src", reader.result as string);
		};
		reader.readAsDataURL(file);
	},
});

/* -------------------- FORM SUBMIT + AJAX -------------------- */
$("#form").on({
	submit: async function (e: Event) {
		e.preventDefault();

		const submitBtn = $("button[type='submit']");
		submitBtn.prop("disabled", true);
		submitBtn.html(`
            <span class="spinner-border spinner-border-sm" role="status"></span>
            Processing...
        `);

		const data = new FormData();
		data.append("fullName", ($("#fullName").val() as string).trim());
		data.append("email", $("#email").val() as string);
		data.append("phone", ($("#phone").val() as string).trim());
		data.append("course", $("#course").val() as string);

		const passportInput = $("#passport")[0] as HTMLInputElement;
		const passportFile = passportInput.files?.[0];

		if (passportFile) {
			// append file & stored hash (computed on change)
			data.append("passport", passportFile);
			data.append("passportHash", storedPassportHash);
		}

		try {
			const response = await $.ajax({
				url: "/enrol",
				method: "POST",
				data,
				processData: false,
				contentType: false,
			});

			console.log("server response:", response);
		} catch (err) {
			console.error("AJAX error:", err);
		}

		submitBtn.prop("disabled", false).html("Submit");
	},
});

/* -------------------- MODAL TOGGLE -------------------- */
$("#toggleModalBtn").on({
	click: function () {
		const modal = $("#statusModal");
		const isHidden = modal.css("display") === "none";
		modal.css("display", isHidden ? "block" : "none");
	},
});

$("#closeModalBtn").on({
	click: function () {
		$("#statusModal").css("display", "none");
	},
});

/* -------------------- CHECK STATUS BUTTON + INPUT (AJAX) -------------------- */
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
			const response = await $.ajax({
				url: "/check-status",
				method: "POST",
				data: { phone },
				dataType: "json",
			});

			placeholder
				.text(`Status for ${phone}: ${response.status}`)
				.css("color", response.status === "completed" ? "green" : "orange");
		} catch (err) {
			console.error("AJAX error:", err);
			placeholder.text("Failed to check status.").css("color", "red");
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
