import { appPool } from "../dbConfig";
import { EnrolStatusInterface } from "../interfaces";

export const model_getEnrolStatus = async function (
	phoneNumber: number,
	pool = appPool
): Promise<EnrolStatusInterface | null> {
	const conn = await pool.getConnection();

	const query = `
			SELECT phoneNumber, status, errorMessage
			FROM enrolStatus
			WHERE phoneNumber = ?
			LIMIT 1
	`;

	try {
		const [rows] = await conn.query(query, [phoneNumber]);
		const result = rows as EnrolStatusInterface[];
		return result.length ? result[0] : null;
	} finally {
		conn.release();
	}
};
