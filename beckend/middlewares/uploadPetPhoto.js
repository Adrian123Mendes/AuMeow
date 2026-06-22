import fs from "fs";
import multer from "multer";
import path from "path";
import { PET_UPLOAD_DIR } from "../config/uploads.js";

const ALLOWED_IMAGE_EXTENSIONS = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".avif",
    ".heic",
    ".heif"
]);

function ensureUploadDir() {
    if (!fs.existsSync(PET_UPLOAD_DIR)) {
        fs.mkdirSync(PET_UPLOAD_DIR, { recursive: true });
    }
}

function sanitizeFileName(originalName = "pet") {
    const extension = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, extension)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "pet";

    return `${Date.now()}-${baseName}${extension}`;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            ensureUploadDir();
            cb(null, PET_UPLOAD_DIR);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        cb(null, sanitizeFileName(file.originalname));
    }
});

function fileFilter(req, file, cb) {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const hasAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.has(extension);
    const hasImageMime = file.mimetype?.startsWith("image/") && file.mimetype !== "image/svg+xml";
    const hasGenericMime = !file.mimetype || file.mimetype === "application/octet-stream";

    if (hasAllowedExtension && (hasImageMime || hasGenericMime)) {
        cb(null, true);
        return;
    }

    cb(new Error("Arquivo inválido. Envie uma imagem JPG, PNG, WEBP, GIF, AVIF ou HEIC."), false);
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

function getUploadErrorResponse(error) {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return {
                status: 400,
                error: "A foto deve ter no máximo 5 MB."
            };
        }

        return {
            status: 400,
            error: "Não foi possível processar a foto enviada."
        };
    }

    if (error?.code === "EACCES" || error?.code === "EPERM") {
        return {
            status: 500,
            error: "Não foi possível salvar a foto do pet.",
            details: `Sem permissão de escrita em ${PET_UPLOAD_DIR}.`
        };
    }

    return {
        status: 400,
        error: error?.message || "Foto inválida."
    };
}

export function uploadPetPhoto(req, res, next) {
    upload.single("foto")(req, res, (error) => {
        if (!error) {
            next();
            return;
        }

        console.error("Erro no upload da foto do pet:", error);
        const response = getUploadErrorResponse(error);
        res.status(response.status).json({
            error: response.error,
            details: response.details
        });
    });
}

export default upload;
