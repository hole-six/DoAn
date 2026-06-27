import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'node:path'
import { apiTong } from './dinhtuyen/apitong.js'
import { cacheGetNgan, xoaCacheSauGhi } from './dungchung/cacheNhe.js'
import { xuLyLoi } from './dungchung/xulyloi.js'

export function taoUngDung() {
  const ungDung = express()

  ungDung.use(helmet())
  ungDung.use(cors())
  ungDung.use(morgan('dev'))
  ungDung.use(express.json({ limit: '10mb' }))
  ungDung.use(cacheGetNgan())
  ungDung.use(xoaCacheSauGhi())
  ungDung.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'), {
      setHeaders: (phanHoi, duongDan) => {
        phanHoi.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
        phanHoi.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate')
        // Cho phép download PDF trực tiếp từ browser
        if (duongDan.endsWith('.pdf')) {
          phanHoi.setHeader('Content-Type', 'application/pdf')
          phanHoi.setHeader('Content-Disposition', 'inline')
        }
      },
    }),
  )

  ungDung.use('/api', apiTong)
  ungDung.use(xuLyLoi)

  return ungDung
}
