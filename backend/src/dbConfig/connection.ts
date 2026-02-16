import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_NAME;

if (!dbName || !/^[a-zA-Z0-9_]+$/.test(dbName)) {
	throw new Error("❌ Invalid or missing DB_NAME in .env");
}

// This pool connects to the server without a database (for DB creation)
const adminPool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	port: Number(process.env.DB_PORT),
	waitForConnections: true,
	connectionLimit: 10,
});

// This pool connects to the specific DB (for app queries)
export const appPool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	port: Number(process.env.DB_PORT),
	database: dbName,
	waitForConnections: true,
	connectionLimit: 10,
});

export async function createDB() {
	let conn;
	try {
		conn = await adminPool.getConnection();
		await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
		console.log(`✅ Database '${dbName}' created.`);
	} catch (err: any) {
		const msg =
			err?.message ||
			err?.sqlMessage ||
			err?.code ||
			"Unknown database error occurred";
		console.error("❌ DB init error:", msg);
		throw new Error(msg);
	} finally {
		if (conn) conn.release();
	}
}
