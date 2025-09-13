import fs from 'fs'
import path from 'path'

function deleteVideosByNumber(contentDir = './content', number, pm) {
  if (!number || !pm) return
  const dirPath = path.resolve(contentDir)

  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Content folder not found: ${dirPath}`)
    return
  }

  const files = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter(
      (f) => f.isFile() && f.name.startsWith('final') && f.name.endsWith('.mp4')
    )

  const { ch, verse } = pm.getChapterAndVerse(number)

  const deletePath = `final${ch}`

  let deleted = 0

  files.forEach((file) => {
    const base = path.parse(file.name).name
    const baseArr = base.replace('final', '').split('-')

    if (baseArr[0] <= ch && baseArr[1] < verse) {
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
