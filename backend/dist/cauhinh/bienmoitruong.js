"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bienMoiTruong = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = __importDefault(require("dotenv"));
const cacDuongDanMoiTruong = [
    node_path_1.default.resolve(process.cwd(), '.env'),
    node_path_1.default.resolve(process.cwd(), 'backend/.env'),
    node_path_1.default.resolve(process.cwd(), '../backend/.env'),
];
for (const duongDan of cacDuongDanMoiTruong) {
    if (node_fs_1.default.existsSync(duongDan)) {
        dotenv_1.default.config({ path: duongDan });
        break;
    }
}
exports.bienMoiTruong = {
    cong: Number(process.env.PORT ?? 5000),
    chuoiKetNoiMongo: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/da_nang_it_jobs',
    khoaJwt: process.env.JWT_SECRET ?? 'development-secret',
    khoaJwtLamMoi: process.env.JWT_REFRESH_SECRET ?? `${process.env.JWT_SECRET ?? 'development-secret'}-refresh`,
    duongDanFrontend: process.env.CLIENT_URL ?? 'http://localhost:5173',
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:5000/api/auth/google/callback',
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite',
    smtpHost: process.env.SMTP_HOST ?? '',
    smtpPort: Number(process.env.SMTP_PORT ?? 587),
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER ?? '',
    smtpPass: process.env.SMTP_PASS ?? '',
    smtpFrom: process.env.SMTP_FROM ?? 'ITJob <no-reply@itjob.local>',
    crawlerIntervalHours: Number(process.env.CRAWLER_INTERVAL_HOURS ?? 6),
    crawlerBatchLimit: Number(process.env.CRAWLER_BATCH_LIMIT ?? 5),
};
