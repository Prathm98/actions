import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'
import ProgressManager from './ProgressManager.cjs'

const pm = new ProgressManager()

// 1️⃣ Get Page Access Token using System User Token
async function getPageAccessToken(access_token, page_id) {
  try {
    const res = await axios.get(`https://graph.facebook.com/v23.0/${page_id}`, {
      params: {
        fields: 'access_token',
        access_token: access_token,
      },
    })
    console.log('✅ Page Access Token retrieved')
    return res.data.access_token
  } catch (err) {
    console.error(
      '❌ Error fetching Page Access Token:',
      err.response?.data || err.message
    )
    throw err
  }
}

// 2️⃣ Upload video reel
async function uploadReel(pageToken, pageId, videoFilePath, caption) {
  // prepare video file
  const form = new FormData()
  form.append('upload_phase', 'start')
  form.append('access_token', pageToken)

  try {
    // start upload session
    const startRes = await axios.post(
      `https://graph-video.facebook.com/v23.0/${pageId}/video_reels`,
      form,
      { headers: form.getHeaders() }
    )

    const { video_id, upload_url } = startRes.data
    console.log('✅ Upload session started:', { video_id, upload_url })

    // 2️⃣ Upload video file via PUT to rupload
    const videoBuffer = fs.readFileSync(videoFilePath)
    await axios.post(upload_url, videoBuffer, {
      headers: {
        Authorization: `OAuth ${pageToken}`,
        'Content-Type': 'video/mp4',
        Offset: 0,
        file_size: videoBuffer.length,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
    console.log('✅ Video file uploaded to rupload')

    // 3️⃣ Finish upload
    const finishRes = await axios.post(
      `https://graph-video.facebook.com/v23.0/${pageId}/video_reels`,
      {
        upload_phase: 'finish',
        video_id: video_id,
        description: caption,
        access_token: pageToken,
        video_state: 'PUBLISHED',
      }
    )

    return video_id
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message)
  }
}

async function checkVideoStatus(VIDEO_ID, PAGE_TOKEN, pm, currentFB) {
  let checks = 0
  const maxChecks = 18
  const intervalMs = 5000

  const statusUrl = `https://graph.facebook.com/v23.0/${VIDEO_ID}`

  const intervalId = setInterval(async () => {
    checks++
    try {
      const res = await axios.get(statusUrl, {
        params: {
          fields: 'status',
          access_token: PAGE_TOKEN,
        },
      })

      const status = res.data?.status
      console.log(`⏳ [FB Check ${checks}] Video Status:`, status)

      if (status?.processing_phase?.status === 'complete') {
        console.log('✅ FB Video processing completed!')
        clearInterval(intervalId)
        pm.updateCurrentFB(currentFB + 1)
        return true
      } else if (
        status?.processing_phase?.status === 'error' ||
        checks >= maxChecks
      ) {
        console.log('❌ FB Video processing failed or timed out.')
        clearInterval(intervalId)
        return false
      }
    } catch (err) {
      console.log(
        '❌ FB Error checking status:',
        err.response?.data || err.message
      )
      clearInterval(intervalId)
      return false
    }
  }, intervalMs)
}

export { getPageAccessToken, uploadReel, checkVideoStatus }
