// apiConfig.ts
interface ApiConfigInterface {
	regAgents: string;
	extApp: string;
	//cbtUI: string;
}

// Local dev URLs
const dev: ApiConfigInterface = {
	regAgents: "http://localhost:3333",
	extApp: "http://localhost:3333",
	// cbtUI: "http://localhost:3333",
};

// Production URLs
const prod: ApiConfigInterface = {
	regAgents: "https://backend-apis-cgn1.onrender.com",
	extApp: "https://backend-apis-cgn1.onrender.com",
	//	cbtUI: "https://backend-apis-cgn1.onrender.com",
};

/**
 * Automatically select URLs based on environment
 */
export const backendUrls = (function (): ApiConfigInterface {
	if (typeof window !== "undefined") {
		return window.location.hostname.startsWith("localhost") ? dev : prod;
	}
	//@ts-ignore
	return process.env.NODE_ENV === "production" ? prod : dev;
})();
