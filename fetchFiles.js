import fs from 'fs'
import axios from 'axios'

const GITHUB_PAT = process.env.GIT_PAT // your PAT with "repo" scope
const REPO = process.env.GIT_REPO
const BRANCH = process.env.GIT_BRANCH
const FILE_PATH = 'content/final1/final1-0.mp4' // path inside repo
const OUTPUT_FILE = './downloaded.mp4'

async function downloadVideo() {
  try {
    // 1️⃣ Get file from GitHub API
    const res = await axios.get(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_PAT}`,
          Accept: 'application/vnd.github.v3.raw', // 👈 binary response
        },
        responseType: 'arraybuffer', // 👈 important
      }
    )

    fs.writeFileSync(OUTPUT_FILE, Buffer.from(res.data))

    console.log(`🎉 Video downloaded: ${OUTPUT_FILE}`)
  } catch (err) {
    console.error(
      '❌ Error downloading file:',
      err.response?.data || err.message
    )
  }
}

downloadVideo()

export default downloadVideo
