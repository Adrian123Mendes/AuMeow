import multer from "multer";
import path from "path";
import fs from "fs";

// Define o diretório onde as imagens serão salvas
const uploadDir = path.resolve("uploads/pets");

// Garante que a pasta exista
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

// Filtra tipos de arquivo (somente imagens)
function fileFilter(req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Arquivo inválido: apenas imagens são permitidas."), false);
    }
}

const upload = multer({
    storage,
    fileFilter
});

export default upload;
