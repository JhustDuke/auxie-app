import { EnrolPayloadInterface } from "../interfaces";
import { appPool } from "../dbConfig/connection";

export const model_enrol = async function (
	payload: EnrolPayloadInterface,
	pool = appPool
) {
	const conn = await pool.getConnection();

	const insertQuery = `INSERT INTO enrol(course,fullName,passport,passportHash,phone,email) VALUES(?,?,?,?,?)`;

	try {
		const [result] = await conn.query(insertQuery, [
			payload.course,
			payload.fullName,
			payload.passport,
			payload.passportHash,
			payload.phoneNumber,
			payload.email,
		]);
		return result;
	} catch (e: any) {
		throw e;
	} finally {
		conn.release();
	}
};
