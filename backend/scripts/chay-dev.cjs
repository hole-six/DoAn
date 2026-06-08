const { spawn } = require('node:child_process')
const path = require('node:path')

const tsxCli = path.join(__dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs')
const nodeOptions = [process.env.NODE_OPTIONS, '--use-system-ca', '--dns-result-order=ipv4first'].filter(Boolean).join(' ')

const child = spawn(process.execPath, [tsxCli, 'watch', 'src/maychu.ts'], {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
  shell: false,
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0))
})
