import { appPool } from "../index";

export const createEnrolStatusTable = async function () {
	const createSQLTable = `CREATE TABLE IF NOT EXISTS enrolStatus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phoneNumber INT NOT NULL,
    status ENUM('processing', 'completed', 'error') DEFAULT 'processing',
    errorMessage VARCHAR(255) DEFAULT 'there was an error',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (phoneNumber) REFERENCES enrol(id)
);`;
	const conn = await appPool.getConnection();
	try {
		await conn.query(createSQLTable);
		console.log(`enrol_status created or already exists.`);
	} catch (err) {
		console.error("❌ Error creating enrol status table", err);
		throw err;
	} finally {
		conn.release();
	}
};
