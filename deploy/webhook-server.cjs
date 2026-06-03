const http = require('node:http')
const crypto = require('node:crypto')
const { execFile } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return
  const raw = fs.readFileSync(filePath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index < 1) continue
    const key = trimmed.slice(0, index).trim()
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnvFile(process.env.DEPLOY_ENV_FILE ?? path.resolve(process.cwd(), '.env.production'))
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '--max-old-space-size=4096'

const PORT = Number(process.env.DEPLOY_WEBHOOK_PORT ?? 9001)
const SECRET = process.env.DEPLOY_WEBHOOK_SECRET ?? ''
const REPO_DIR = process.env.DEPLOY_REPO_DIR ?? '/var/www/itjob'
const BRANCH = process.env.DEPLOY_BRANCH ?? 'main'
const BACKEND_DIR = process.env.DEPLOY_BACKEND_DIR ?? `${REPO_DIR}/backend`
const FRONTEND_DIR = process.env.DEPLOY_FRONTEND_DIR ?? `${REPO_DIR}/frontend`
const PM2_NAME = process.env.DEPLOY_PM2_NAME ?? 'itjob-backend'
const NGINX_WEB_ROOT = process.env.DEPLOY_NGINX_WEB_ROOT ?? '/var/www/itjob-frontend'

let deploying = false

function verifySignature(rawBody, signature) {
  if (!SECRET) return false
  if (!signature) return false
  const expected = `sha256=${crypto.createHmac('sha256', SECRET).update(rawBody).digest('hex')}`
  const left = Buffer.from(expected)
  const right = Buffer.from(signature)
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { cwd, env: process.env }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout
        error.stderr = stderr
        reject(error)
        return
      }
      resolve({ stdout, stderr })
    })
  })
}

async function deploy() {
  deploying = true
  try {
    await run('git', ['fetch', '--all', '--prune'], REPO_DIR)
    await run('git', ['reset', '--hard', `origin/${BRANCH}`], REPO_DIR)
    await run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci', '--include=dev'], BACKEND_DIR)
    await run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci', '--include=dev'], FRONTEND_DIR)
    await run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], BACKEND_DIR)
    await run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], FRONTEND_DIR)
    await run('rsync', ['-a', '--delete', `${FRONTEND_DIR}/dist/`, `${NGINX_WEB_ROOT}/`], REPO_DIR)
    await run('pm2', ['reload', PM2_NAME, '--update-env'], REPO_DIR)
    console.log('Deploy success')
  } finally {
    deploying = false
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, deploying }))
    return
  }

  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404)
    res.end('Not found')
    return
  }

  let body = Buffer.alloc(0)
  req.on('data', chunk => { body = Buffer.concat([body, chunk]) })
  req.on('end', async () => {
    try {
      const signature = req.headers['x-hub-signature-256'] || req.headers['x-signature']
      if (!verifySignature(body, String(signature ?? ''))) {
        res.writeHead(401)
        res.end('Invalid signature')
        return
      }
      const payload = JSON.parse(body.toString('utf8') || '{}')
      const ref = String(payload.ref ?? '')
      if (ref !== `refs/heads/${BRANCH}`) {
        res.writeHead(200)
        res.end('Ignored')
        return
      }
      if (deploying) {
        res.writeHead(409)
        res.end('Deploy already running')
        return
      }
      await deploy()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
    } catch (error) {
      console.error('Deploy webhook failed:', error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: false, error: error.message }))
    }
  })
})

server.listen(PORT, () => {
  console.log(`Deploy webhook listening on ${PORT}`)
})
