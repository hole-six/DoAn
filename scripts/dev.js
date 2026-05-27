const { spawn, execFileSync } = require('node:child_process')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
let shuttingDown = false

const services = [
  { name: 'backend', cwd: 'backend' },
  { name: 'frontend', cwd: 'frontend' },
]

const children = services.map(({ name, cwd }) => {
  const child = spawn('npm run dev', {
    cwd: path.join(rootDir, cwd),
    stdio: 'inherit',
    shell: true,
  })

  child.on('exit', (code, signal) => {
    if (shuttingDown) return
    shuttingDown = true
    stopAll(child)
    process.exit(code ?? (signal ? 1 : 0))
  })

  child.on('error', (error) => {
    console.error(`[${name}] ${error.message}`)
    if (!shuttingDown) {
      shuttingDown = true
      stopAll(child)
      process.exit(1)
    }
  })

  return child
})

function stopAll(except) {
  for (const child of children) {
    if (child !== except && !child.killed) stopProcessTree(child)
  }
}

function stopProcessTree(child) {
  if (process.platform === 'win32') {
    try {
      execFileSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' })
      return
    } catch {
      // Fall back to the default kill below.
    }
  }
  child.kill()
}

process.on('SIGINT', () => {
  if (shuttingDown) return
  shuttingDown = true
  stopAll()
})

process.on('SIGTERM', () => {
  if (shuttingDown) return
  shuttingDown = true
  stopAll()
})
