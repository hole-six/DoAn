"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ketNoiDuLieu = ketNoiDuLieu;
const mongoose_1 = __importDefault(require("mongoose"));
const bienmoitruong_js_1 = require("./bienmoitruong.js");
async function ketNoiDuLieu() {
    await mongoose_1.default.connect(bienmoitruong_js_1.bienMoiTruong.chuoiKetNoiMongo);
    console.log(`Da ket noi MongoDB: ${mongoose_1.default.connection.name}`);
}
