import { promises as fs } from 'fs'
import { importDB, ExportData } from '../utils/db'

(async () => {
  const data = await fs.readFile('export.json', 'utf-8')
  const exportData = JSON.parse(data) as ExportData
  await importDB(exportData)
  process.exit(0)
})()  