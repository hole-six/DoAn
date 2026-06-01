import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'node:path'
import { apiTong } from './dinhtuyen/apitong.js'
import { xuLyLoi } from './dungchung/xulyloi.js'

export function taoUngDung() {
  const ungDung = express()

  ungDung.use(helmet())
  ungDung.use(cors())
  ungDung.use(morgan('dev'))
  ungDung.use(express.json({ limit: '10mb' }))
  ungDung.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'), {
      setHeaders: (phanHoi) => {
        phanHoi.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
      },
    }),
  )

  ungDung.use('/api', apiTong)
  ungDung.use(xuLyLoi)

  return ungDung
}
