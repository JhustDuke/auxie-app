import { appPool } from "../dbConfig/connection";
import { EnrolPayloadInterface } from "../interfaces";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const enrolDB = process.env.ENROL_DB;

export const model_getCandidateByPhone = async function (
	phoneNumber: string,
	pool = appPool
): Promise<EnrolPayloadInterface | null> {
	const conn = await pool.getConnection();

	const selectQuery = `
		SELECT course, fullName, imageFile, imageFileHash,imageFileExtType, registration_status AS registrationStatus, phoneNumber, registration_message AS registrationMessage
		FROM enrolment_Table
		WHERE phoneNumber = ?
		LIMIT 1
	`;

	try {
		const [rows]: any = await conn.query(selectQuery, [phoneNumber]);

		if (!rows.length) {
			throw new Error("data not found");
		}

		return rows[0] as EnrolPayloadInterface;
	} catch (error: any) {
		throw error;
	} finally {
		conn.release();
	}
};
