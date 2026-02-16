import { appPool } from "../index";

export const createEnrolStatusTable = async function () {
	const createSQLTable = `CREATE TABLE IF NOT EXISTS enrolMent_Status_Table(
    id 
					INT PRIMARY KEY AUTO_INCREMENT,
    phoneNumber 
					INT NOT NULL,
    registration_status 
					ENUM('processing', 'completed', 'error') DEFAULT 'processing',
    errorMessage 
					VARCHAR(255) DEFAULT 'there was an error',
    updatedAt 
					TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY
					(phoneNumber) REFERENCES enrolment_table(id)
);`;
	const conn = await appPool.getConnection();
	try {
		await conn.query(createSQLTable);
		console.log(`enrol_status_table created.`);
	} catch (err) {
		console.error("❌ Error creating enrol status table", err);
		throw err;
	} finally {
		conn.release();
	}
};
