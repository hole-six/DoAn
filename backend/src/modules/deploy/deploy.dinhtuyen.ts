import { Router } from 'express'

export const dinhTuyenDeploy = Router()

dinhTuyenDeploy.get('/health', (_yeuCau, phanHoi) => {
  phanHoi.json({
    duLieu: {
      ok: true,
      service: 'itjob-backend',
      time: new Date().toISOString(),
    },
  })
})
