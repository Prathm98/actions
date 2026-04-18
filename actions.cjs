const ProgressManager = require('./ProgressManager.cjs')
const downloadVideo = require('./fetchFiles.cjs')
const fs = require('fs')
const path = require('path')

const FILE_PATH = path.join(__dirname, 'progress.json')

async function run(filePath = FILE_PATH, series = '') {
  const pm = new ProgressManager(filePath)

  const { currentInsta, currentYt, currentFB } = pm.getCurrent()

  const checkIfFileExists = (path) => {
    try {
      return fs.existsSync(path)
    } catch (err) {
      return false
    }
  }

  const getFiles = async (current) => {
    const filePath = `content${series}/outputc${current}.mp4`
    const outputFile = `content${series}/final${current}.mp4`

    console.log('processing', filePath)

    if (checkIfFileExists(outputFile)) {
      console.log(`${outputFile} already exists, skipping download)`)
      return true
    } else {
      return downloadVideo(filePath, outputFile)
    }
  }

  const status1 =
    (await getFiles(currentInsta, 0)) && (await getFiles(currentInsta, 1))
  const status2 =
    (await getFiles(currentYt, 0)) && (await getFiles(currentYt, 1))
  const status3 =
    (await getFiles(currentFB, 0)) && (await getFiles(currentFB, 1))

  return { status1, status2, status3 }
}

module.exports = run

// run()
