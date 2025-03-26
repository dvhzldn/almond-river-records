import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

console.log("✅ .env exists?", fs.existsSync(envPath));
console.log("✅ Raw content:\n", fs.readFileSync(envPath, "utf-8"));
console.log("✅ SUPABASE_URL:", process.env.SUPABASE_URL);
