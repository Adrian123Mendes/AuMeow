import path from "path";
import { fileURLToPath } from "url";

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const PET_UPLOAD_DIR = process.env.PET_UPLOAD_DIR
  ? path.resolve(process.env.PET_UPLOAD_DIR)
  : path.join(backendDir, "uploads", "pets");
