/**
 * Render file .puml -> PNG nét cao.
 *
 * Pipeline:
 * - lấy SVG đầy đủ từ PlantUML public server
 * - convert local sang PNG bằng sharp với density cao
 *
 * Mặc định:
 * - chỉ export 3 nhóm chính: activity, sequence, robustness
 * - gom tất cả ảnh vào 1 thư mục: docs/export-png/all
 *
 * Ví dụ:
 *   node render.mjs
 *   node render.mjs --out all-highres --dpi 300
 *   node render.mjs --split
 *   node render.mjs --include-erd --include-usecase
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import zlib from 'zlib'
import sharp from '../../frontend/node_modules/sharp/lib/index.js'

const EXPORT_ROOT = path.resolve(import.meta.dirname)
const DIAGRAM_ROOT = path.resolve(import.meta.dirname, '..', 'so-do')
const PLANTUML_SERVER_URL = 'https://www.plantuml.com/plantuml/svg'

const GROUPS = [
  { folder: '02-activity', prefix: 'activity', enabledByDefault: true },
  { folder: '03-sequence', prefix: 'sequence', enabledByDefault: true },
  { folder: '04-robustness', prefix: 'robustness', enabledByDefault: true },
  { folder: '01-usecase', prefix: 'usecase', enabledByDefault: false },
  { folder: '05-erd-du-lieu', prefix: 'erd', enabledByDefault: false },
]

function parseArgs(argv) {
  const options = {
    outFolderName: 'all',
    dpi: 300,
    split: false,
    includePrefixes: new Set(
      GROUPS.filter(item => item.enabledByDefault).map(item => item.prefix),
    ),
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--out' && argv[index + 1]) {
      options.outFolderName = argv[index + 1]
      index += 1
      continue
    }

    if (arg === '--dpi' && argv[index + 1]) {
      const value = Number(argv[index + 1])
      if (!Number.isNaN(value) && value >= 96) options.dpi = value
      index += 1
      continue
    }

    if (arg === '--split') {
      options.split = true
      continue
    }

    if (arg === '--include-usecase') {
      options.includePrefixes.add('usecase')
      continue
    }

    if (arg === '--include-erd') {
      options.includePrefixes.add('erd')
      continue
    }
  }

  return options
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })
}

function buildFriendlyFileName(baseName, groupPrefix) {
  const pattern = new RegExp(`^(\\d+)-${groupPrefix}-(.+)$`, 'i')
  const matched = baseName.match(pattern)
  if (!matched) return `${baseName}.png`

  const [, order, name] = matched
  return `${order}-${name}.png`
}

function listDiagramTasks(options) {
  const groups = GROUPS.filter(item => options.includePrefixes.has(item.prefix))
  const tasks = []

  for (const group of groups) {
    const srcDir = path.join(DIAGRAM_ROOT, group.folder)
    if (!fs.existsSync(srcDir)) continue

    const files = fs.readdirSync(srcDir)
      .filter(fileName => fileName.endsWith('.puml'))
      .sort((left, right) => left.localeCompare(right, 'vi'))

    for (const fileName of files) {
      const baseName = path.basename(fileName, '.puml')
      const outputDir = options.split
        ? path.join(EXPORT_ROOT, options.outFolderName, group.prefix)
        : path.join(EXPORT_ROOT, options.outFolderName)
      const outputFileName = options.split
        ? buildFriendlyFileName(baseName, group.prefix)
        : `${group.prefix}-${baseName}.png`

      tasks.push({
        prefix: group.prefix,
        srcPath: path.join(srcDir, fileName),
        outPath: path.join(outputDir, outputFileName),
        label: `${group.prefix}/${baseName}`,
      })
    }
  }

  return tasks
}

function injectHighResSettings(source, dpi) {
  const normalized = source.replace(/^\uFEFF/, '')
  if (!normalized.includes('@startuml')) return normalized

  let result = normalized

  if (!/skinparam\s+dpi\s+\d+/i.test(result)) {
    result = result.replace(/@startuml[^\n\r]*/, match => `${match}\nskinparam dpi ${dpi}`)
  }

  if (!/skinparam\s+padding\s+\d+/i.test(result)) {
    result = result.replace(/@startuml[^\n\r]*([\r\n]+)/, match => `${match}skinparam padding 20\n`)
  }

  return result
}

function encode6bit(value) {
  if (value < 10) return String.fromCharCode(48 + value)
  if (value < 36) return String.fromCharCode(65 + value - 10)
  if (value < 62) return String.fromCharCode(97 + value - 36)
  if (value === 62) return '-'
  return '_'
}

function append3bytes(byte1, byte2, byte3) {
  const c1 = byte1 >> 2
  const c2 = ((byte1 & 0x3) << 4) | (byte2 >> 4)
  const c3 = ((byte2 & 0xf) << 2) | (byte3 >> 6)
  const c4 = byte3 & 0x3f
  return `${encode6bit(c1 & 0x3f)}${encode6bit(c2 & 0x3f)}${encode6bit(c3 & 0x3f)}${encode6bit(c4 & 0x3f)}`
}

function plantumlEncode(buffer) {
  let output = ''
  for (let index = 0; index < buffer.length; index += 3) {
    if (index + 2 === buffer.length) output += append3bytes(buffer[index], buffer[index + 1], 0)
    else if (index + 1 === buffer.length) output += append3bytes(buffer[index], 0, 0)
    else output += append3bytes(buffer[index], buffer[index + 1], buffer[index + 2])
  }
  return output
}

function deflateEncode(text) {
  return new Promise((resolve, reject) => {
    zlib.deflateRaw(Buffer.from(text, 'utf8'), { level: 9 }, (error, buffer) => {
      if (error) return reject(error)
      resolve(plantumlEncode(buffer))
    })
  })
}

function fetchSvg(encoded) {
  return new Promise((resolve, reject) => {
    const url = `${PLANTUML_SERVER_URL}/${encoded}`
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} khi render ${url.slice(0, 100)}...`))
        return
      }

      const chunks = []
      response.on('data', chunk => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      response.on('error', reject)
    }).on('error', reject)
  })
}

async function svgToPng(svg, outPath, dpi) {
  const densityCandidates = Array.from(new Set([dpi, 240, 200, 180, 150, 120, 96, 72]))
    .filter(value => value <= dpi)
    .sort((left, right) => right - left)

  let lastError = null

  for (const density of densityCandidates) {
    try {
      await sharp(Buffer.from(svg, 'utf8'), { density, limitInputPixels: false })
        .png({ compressionLevel: 9, palette: false, adaptiveFiltering: true, quality: 100 })
        .toFile(outPath)
      return
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message : String(error)
      if (!message.includes('pixel limit')) throw error
    }
  }

  throw lastError
}

async function renderFile(task, dpi) {
  const source = fs.readFileSync(task.srcPath, 'utf8')
  const preparedSource = injectHighResSettings(source, dpi)
  const encoded = await deflateEncode(preparedSource)
  const svg = await fetchSvg(encoded)
  ensureDir(path.dirname(task.outPath))
  await svgToPng(svg, task.outPath, dpi)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const tasks = listDiagramTasks(options)

  if (!tasks.length) {
    console.log('Không tìm thấy sơ đồ PlantUML để export.')
    return
  }

  const targetDir = options.split
    ? EXPORT_ROOT
    : path.join(EXPORT_ROOT, options.outFolderName)

  ensureDir(targetDir)

  console.log(`\nExport ${tasks.length} sơ đồ PNG nét cao`)
  console.log(`- Nguồn: ${DIAGRAM_ROOT}`)
  console.log(`- Đích:  ${targetDir}`)
  console.log(`- DPI:   ${options.dpi}`)
  console.log(`- Chế độ: ${options.split ? 'tách thư mục theo nhóm' : 'gom 1 thư mục chung'}\n`)

  const batchSize = 2
  let done = 0
  let failed = 0

  for (let index = 0; index < tasks.length; index += batchSize) {
    const batch = tasks.slice(index, index + batchSize)
    await Promise.all(batch.map(async task => {
      try {
        await renderFile(task, options.dpi)
        done += 1
        console.log(`[${String(done).padStart(2, '0')}/${tasks.length}] ✓ ${task.label}`)
      } catch (error) {
        failed += 1
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[ERR] ${task.label}: ${message}`)
      }
    }))
  }

  console.log(`\nXong. Thành công: ${done}/${tasks.length}. Lỗi: ${failed}.`)
  console.log(`Ảnh PNG nằm tại: ${targetDir}`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
