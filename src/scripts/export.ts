import { promises as fs } from 'fs'
import { exportDB } from '../utils/db'

(async () => {
  const exported = await exportDB()
  await fs.writeFile('export.json', JSON.stringify(exported, null, 2))
  process.exit(0)
})()