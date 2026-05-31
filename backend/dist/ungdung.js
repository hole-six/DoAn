"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taoUngDung = taoUngDung;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const node_path_1 = __importDefault(require("node:path"));
const apitong_js_1 = require("./dinhtuyen/apitong.js");
const xulyloi_js_1 = require("./dungchung/xulyloi.js");
function taoUngDung() {
    const ungDung = (0, express_1.default)();
    ungDung.use((0, helmet_1.default)());
    ungDung.use((0, cors_1.default)());
    ungDung.use((0, morgan_1.default)('dev'));
    ungDung.use(express_1.default.json({ limit: '2mb' }));
    ungDung.use('/uploads', express_1.default.static(node_path_1.default.join(process.cwd(), 'uploads'), {
        setHeaders: (phanHoi) => {
            phanHoi.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        },
    }));
    ungDung.use('/api', apitong_js_1.apiTong);
    ungDung.use(xulyloi_js_1.xuLyLoi);
    return ungDung;
}
