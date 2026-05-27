export class LoiUngDung extends Error {
  maTrangThai: number

  constructor(thongBao: string, maTrangThai = 400) {
    super(thongBao)
    this.maTrangThai = maTrangThai
  }
}
