import { EnrolPayloadInterface } from "../interfaces";
import { appPool } from "../dbConfig/connection";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const enrolDB = process.env.ENROL_DB;

export const model_enrolCandidate = async function (
	payload: EnrolPayloadInterface,
	pool = appPool
): Promise<EnrolPayloadInterface> {
	const conn = await pool.getConnection();

	const insertQuery = `
		INSERT INTO enrolment_Table (course, fullName, imageFile, imageFileHash,imageFileExtType, phoneNumber)
		VALUES (?, ?, ?, ?, ?,?)
	`;

	const selectQuery = `
		SELECT course, fullName, imageFile, imageFileHash, registration_status AS registrationStatus,
		       registration_message AS registrationMessage, phoneNumber
		FROM enrolment_Table
		WHERE phoneNumber = ?
		LIMIT 1
	`;

	try {
		await conn.query(insertQuery, [
			payload.course,
			payload.fullName,
			payload.imageFile,
			payload.imageFileHash,
			payload.imageFileExtType,
			payload.phoneNumber,
		]);

		const [rows]: any = await conn.query(selectQuery, [payload.phoneNumber]);

		if (!rows.length) {
			throw new Error(
				`Candidate with phoneNumber ${payload.phoneNumber} not found`
			);
		}

		return rows[0] as EnrolPayloadInterface;
	} catch (e: any) {
		throw e;
	} finally {
		conn.release();
	}
};
