"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batLoiBatDongBo = batLoiBatDongBo;
function batLoiBatDongBo(hamXuLy) {
    return (yeuCau, phanHoi, tiepTheo) => {
        Promise.resolve(hamXuLy(yeuCau, phanHoi, tiepTheo)).catch(tiepTheo);
    };
}
