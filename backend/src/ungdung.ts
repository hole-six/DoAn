import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { apiTong } from './dinhtuyen/apitong.js'
import { xuLyLoi } from './dungchung/xulyloi.js'

export function taoUngDung() {
  const ungDung = express()

  ungDung.use(helmet())
  ungDung.use(cors())
  ungDung.use(morgan('dev'))
  ungDung.use(express.json({ limit: '2mb' }))

  ungDung.use('/api', apiTong)
  ungDung.use(xuLyLoi)

  return ungDung
}
