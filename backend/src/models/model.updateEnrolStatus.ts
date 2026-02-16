import { appPool } from "../dbConfig/connection";
import { UpdateEnrolStatusInterface } from "../interfaces";

export const model_updateEnrolStatus = async function (
	payload: UpdateEnrolStatusInterface,
	pool = appPool
): Promise<void> {
	const conn = await pool.getConnection();

	const query = `
		UPDATE enrolStatus
		SET status = ?, errorMessage = ?
		WHERE phoneNumber= ?
	`;

	try {
		await conn.query(query, [
			payload.status,
			payload.errorMessage ?? null,
			payload.phoneNumber,
		]);
	} catch (error: any) {
		throw error || "failed to update candidate info";
	} finally {
		conn.release();
	}
};
