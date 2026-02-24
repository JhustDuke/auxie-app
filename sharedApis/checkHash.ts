export async function generateSHA256Hash(file: Blob): Promise<string> {
	const arrayBuffer: ArrayBuffer = await file.arrayBuffer();

	const hashBuffer: ArrayBuffer = await crypto.subtle.digest(
		"SHA-256",
		arrayBuffer
	);

	const hashArray: number[] = Array.from(new Uint8Array(hashBuffer));

	const hashHex: string = hashArray
		.map(function (byte: number): string {
			return byte.toString(16).padStart(2, "0");
		})
		.join("");

	return hashHex;
}
