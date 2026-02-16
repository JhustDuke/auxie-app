import { appPool } from "../index";

export const createEnrolTable = async function () {
	const createSQLTable = `CREATE TABLE IF NOT EXISTS enrol (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course VARCHAR(100) NOT NULL,
				fullName VARCHAR(255) NOT NULL,
    passport VARCHAR(255) NOT NULL,
    passportHash VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;
	const conn = await appPool.getConnection();
	try {
		await conn.query(createSQLTable);
		console.log(`enrol_table created or already exists.`);
	} catch (err) {
		console.error("❌ Error creating enrol table:", err);
		throw err;
	} finally {
		conn.release();
	}
};
