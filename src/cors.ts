import cors, { CorsOptions } from "cors";

const ALLOWED_CORS_ORIGINS: string =
  process.env.ALLOWED_CORS_ORIGINS ??
  "http://localhost,http://127.0.0.1,http://localhost:5173,http://127.0.0.1:5173";


const CORS_OPTIONS: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    const allowedOrigins = ALLOWED_CORS_ORIGINS.split(",");
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};


export default cors(CORS_OPTIONS);
