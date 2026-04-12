const fs = require('fs')
const axios = require('axios')

const GITHUB_PAT = process.env.GIT_PAT
const REPO = process.env.GIT_REPO
const BRANCH = process.env.GIT_BRANCH

async function downloadVideo(FILE_PATH, OUTPUT_FILE) {
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
      },
    )

    fs.writeFileSync(OUTPUT_FILE, Buffer.from(res.data))

    console.log(`🎉 Video downloaded: ${OUTPUT_FILE}`)
    return true
  } catch (err) {
    console.log('❌ Error downloading file:', err.response?.data || err.message)
    return false
  }
}

module.exports = downloadVideo
