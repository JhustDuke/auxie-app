import { createDB } from "../dbConfig/connection";
import { createEnrolStatusTable, createEnrolTable } from "../dbConfig/tables";

export async function startupDB() {
	try {
		await Promise.all([
			createDB(),
			createEnrolTable(),
			createEnrolStatusTable(),
		]);
		console.log("✅ All tables set up.");
	} catch (err) {
		console.error("❌ Error setting up tables:", err);
		throw err;
	}
}
