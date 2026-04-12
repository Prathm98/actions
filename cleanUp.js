import fs from 'fs'
import path from 'path'

function deleteVideosByNumber(contentDir = './content', number) {
  if (!number) return
  const dirPath = path.resolve(contentDir)

  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Content folder not found: ${dirPath}`)
    return
  }

  const files = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter(
      (f) =>
        f.isFile() && f.name.startsWith('final') && f.name.endsWith('.mp4'),
    )

  const deletePath = `final${number}`

  let deleted = 0

  files.forEach((file) => {
    const base = path.parse(file.name).name
    const numberpart = +base.replace('final', '')
    if (numberpart < number) {
      const filePath = path.join(dirPath, file.name)
      fs.unlinkSync(filePath)
      console.log(`🗑️ Deleted: ${base}`)
      deleted++
    }
  })

  if (deleted === 0) {
    console.warn(`⚠️ No matching file found for item_id=${deletePath}`)
  }
}

export { deleteVideosByNumber }
