const { spawn } = require('node:child_process')
const path = require('node:path')

const prismaCli = path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js')
const args = process.argv.slice(2)
const nodeOptions = [process.env.NODE_OPTIONS, '--dns-result-order=ipv4first']
  .filter(Boolean)
  .join(' ')

const child = spawn(process.execPath, [prismaCli, ...args], {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
  shell: false,
  stdio: 'inherit',
  windowsHide: true,
})

child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0))
})
