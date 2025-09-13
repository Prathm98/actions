import axios from 'axios'
import FormData from 'form-data'
import ProgressManager from './ProgressManager.cjs'

// // --- CONFIG ---
const ACCESS_TOKEN = process.env.INSTA_SECRETE
const IG_USER_ID = process.env.INSTA_USERID

async function uploadToInstagram(captionText, ch, verse) {
  const caption = captionText

  // Step 1: Create media container
  const form = new FormData()
  form.append(
    'video_url',
    `https://raw.githubusercontent.com/Prathm98/actions/refs/heads/insta/content/final${ch}-${verse}-1.mp4`
  )
  form.append('media_type', 'REELS')
  form.append('caption', caption)
  form.append('access_token', ACCESS_TOKEN)
  form.append('thumb_offset', 2)

  const mediaUrl = `https://graph.instagram.com/v23.0/${IG_USER_ID}/media`
  let creationId
  try {
    const res = await axios.post(mediaUrl, form, { headers: form.getHeaders() })
    creationId = res.data.id
    console.log('🎬 Media container created:', creationId)
    return creationId
  } catch (err) {
    console.error(
      '❌ Error creating media container:',
      err.response?.data || err.message
    )
    return
  }
}

async function publishToInstagram(creationId, pm, currentInsta) {
  // Step 2: Poll with interval until upload finishes
  const statusUrl = `https://graph.instagram.com/v23.0/${creationId}`
  let checks = 0
  const maxChecks = 24

  const intervalId = setInterval(async () => {
    checks++
    try {
      const res = await axios.get(statusUrl, {
        params: {
          fields: 'status_code',
          access_token: ACCESS_TOKEN,
        },
      })

      const status = res.data.status_code
      console.log(`⏳ [Insta Check ${checks}] Upload status: ${status}`)

      if (status === 'FINISHED') {
        clearInterval(intervalId)

        // Step 3: Publish the reel
        const publishUrl = `https://graph.instagram.com/v23.0/${IG_USER_ID}/media_publish`
        try {
          const publishRes = await axios.post(publishUrl, {
            creation_id: creationId,
            access_token: ACCESS_TOKEN,
          })
          console.log('✅ Insta Reel published:', publishRes.data)

          pm.updateCurrentInsta(currentInsta + 1)
          return true
        } catch (err) {
          console.log(
            '❌ Insta Error publishing media:',
            err.response?.data || err.message
          )
          return false
        }
      } else if (status === 'ERROR' || checks >= maxChecks) {
        clearInterval(intervalId)
        console.log(
          '❌ Insta Upload failed or timed out, not publishing.',
          res.data
        )
        return false
      }
    } catch (err) {
      clearInterval(intervalId)
      console.log(
        '❌ Insta Error checking status:',
        err.response?.data || err.message
      )
      return false
    }
  }, 5000) // check every 5 seconds
}

export { uploadToInstagram, publishToInstagram }
