const { execFile } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

function exec(command, args) {
  return new Promise((resolve) => {
    execFile(command, args, { windowsHide: true }, (error, stdout) => {
      resolve(error ? '' : stdout)
    })
  })
}

function docEnvPort() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return undefined
  const raw = fs.readFileSync(envPath, 'utf8')
  const line = raw.split(/\r?\n/).find(item => item.trim().startsWith('PORT='))
  const value = line?.split('=').slice(1).join('=').trim()
  return value ? Number(value) : undefined
}

function layPort() {
  const port = Number(process.env.PORT ?? docEnvPort() ?? 5000)
  return Number.isFinite(port) && port > 0 ? port : 5000
}

async function layPidWindows(port) {
  const output = await exec('netstat.exe', ['-ano', '-p', 'tcp'])
  const pids = new Set()
  for (const line of output.split(/\r?\n/)) {
    if (!line.includes('LISTENING')) continue
    const parts = line.trim().split(/\s+/)
    const localAddress = parts[1] ?? ''
    const pid = parts[parts.length - 1]
    if (localAddress.endsWith(`:${port}`) && /^\d+$/.test(pid)) pids.add(pid)
  }
  return [...pids]
}

async function layPidUnix(port) {
  const output = await exec('lsof', ['-ti', `tcp:${port}`])
  return [...new Set(output.split(/\s+/).filter(Boolean))]
}

async function killPid(pid) {
  if (pid === String(process.pid)) return
  if (process.platform === 'win32') {
    await exec('taskkill.exe', ['/PID', pid, '/F'])
    return
  }
  await exec('kill', ['-9', pid])
}

async function main() {
  const port = layPort()
  const pids = process.platform === 'win32' ? await layPidWindows(port) : await layPidUnix(port)
  if (!pids.length) {
    console.log(`Port ${port} dang trong`)
    return
  }

  for (const pid of pids) await killPid(pid)
  console.log(`Da dung ${pids.length} process dang giu port ${port}: ${pids.join(', ')}`)
}

main().catch((error) => {
  console.error('Khong the don port:', error)
  process.exit(1)
})
