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
