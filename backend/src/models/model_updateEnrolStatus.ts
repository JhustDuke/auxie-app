import { appPool } from "../dbConfig/connection";
import {
	UpdateEnrolStatusInterface,
	EnrolPayloadInterface,
} from "../interfaces";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const enrolDB = process.env.ENROL_DB;

export const model_updateEnrolStatus = async function (
	payload: UpdateEnrolStatusInterface,
	pool = appPool
): Promise<EnrolPayloadInterface> {
	const conn = await pool.getConnection();

	const updateQuery = `
		UPDATE enrolment_Table
		SET registration_status = ?, registration_message = ?
		WHERE phoneNumber = ?
	`;

	const selectQuery = `
		SELECT course, fullName,imageFile,imageFileHash,imageFileExtType, registration_status AS registrationStatus, registration_message AS registrationMessage, phoneNumber
		FROM enrolment_Table
		WHERE phoneNumber = ?
		LIMIT 1
	`;

	try {
		const [updateResult]: any = await conn.query(updateQuery, [
			payload.registrationStatus,
			payload.registrationMessage ?? null,
			payload.phoneNumber,
		]);

		if (!updateResult.affectedRows) {
			throw new Error(`phoneNumber ${payload.phoneNumber} does not exist`);
		}

		const [rows]: any = await conn.query(selectQuery, [payload.phoneNumber]);

		if (!rows.length) {
			throw new Error(
				`Candidate with phoneNumber ${payload.phoneNumber} not found`
			);
		}

		return rows[0] as EnrolPayloadInterface;
	} catch (error: any) {
		throw error || new Error("Failed to update candidate info");
	} finally {
		conn.release();
	}
};
