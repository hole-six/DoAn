const { execFileSync } = require('node:child_process')

if (process.platform !== 'win32') {
  process.exit(0)
}

const projectPath = process.cwd().replace(/\//g, '\\')
const escapedPath = projectPath.replace(/\\/g, '\\\\')
const query = `
$items = Get-CimInstance Win32_Process -Filter "name = 'node.exe'" | Where-Object {
  $_.CommandLine -match "${escapedPath}.*frontend.*vite" -or
  $_.CommandLine -match "${escapedPath}.*backend.*tsx.*src/maychu.ts" -or
  $_.CommandLine -match "file:///C:/Users/ACER/Downloads/DoAn/backend/node_modules/tsx.*src/maychu.ts"
}
foreach ($item in $items) {
  Stop-Process -Id $item.ProcessId -Force -ErrorAction SilentlyContinue
}
`

try {
  execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', query], {
    stdio: 'ignore',
  })
} catch {
  // Best-effort cleanup only.
}
