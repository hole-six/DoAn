"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bienMoiTruong = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.bienMoiTruong = {
    cong: Number(process.env.PORT ?? 5000),
    chuoiKetNoiMongo: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/da_nang_it_jobs',
    khoaJwt: process.env.JWT_SECRET ?? 'development-secret',
    khoaJwtLamMoi: process.env.JWT_REFRESH_SECRET ?? `${process.env.JWT_SECRET ?? 'development-secret'}-refresh`,
    duongDanFrontend: process.env.CLIENT_URL ?? 'http://localhost:5173',
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:5000/api/auth/google/callback',
};
