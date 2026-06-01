export class LoiUngDung extends Error {
  maTrangThai: number
  maLoi: string
  loiTruong?: Record<string, string[]>
  goiYHanhDong?: string

  constructor(
    thongBao: string,
    maTrangThai = 400,
    maLoi = 'APP_ERROR',
    loiTruong?: Record<string, string[]>,
    goiYHanhDong?: string,
  ) {
    super(thongBao)
    this.maTrangThai = maTrangThai
    this.maLoi = maLoi
    this.loiTruong = loiTruong
    this.goiYHanhDong = goiYHanhDong
  }
}
