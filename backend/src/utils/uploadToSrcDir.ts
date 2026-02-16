import fs from "fs";
import path from "path";

export function uploadImageToSrcDir(
	fileName: string,
	imageStream: { pipe: Function; on?: Function }
	//pipe and on are used by node and this prevent
): Promise<void> {
	return new Promise(function (resolve, reject) {
		const uploadDir = path.join("src", "uploads");

		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}

		const filePath = path.join(uploadDir, fileName);
		const writeStream = fs.createWriteStream(filePath);

		// @ts-ignore
		imageStream
			.on("error", reject)
			.pipe(writeStream)
			.on("error", reject)
			.on("finish", resolve);
	});
}
