import fs from 'fs'
import { google } from 'googleapis'

import credentials from './credentials.json' assert { type: 'json' }
import token from './token.json' assert { type: 'json' }
import readline from 'readline'

// Load client secrets from a local file.
const CREDENTIALS_PATH = './credentials.json'
const TOKEN_PATH = './token.json'

// Scopes required for uploading videos
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
]

async function authorize() {
  const { client_secret, client_id, redirect_uris } = credentials.web
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  )

  // Load previously saved token
  if (token) {
    oAuth2Client.setCredentials(token)
    return oAuth2Client
  } else {
    // First time: get a new token
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    })
    console.log('Authorize this app by visiting this url:', authUrl)

    // After visiting URL, paste code from consent screen here:
    const readlineObj = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    return new Promise((resolve) => {
      readlineObj.question(
        'Enter the code from that page here: ',
        async (code) => {
          readlineObj.close()
          const { tokens } = await oAuth2Client.getToken(code)
          oAuth2Client.setCredentials(tokens)
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
          resolve(oAuth2Client)
        }
      )
    })
  }
}

async function uploadVideo(auth, videoPath, title, description, thumbnail) {
  const service = google.youtube('v3')

  try {
    const res = await service.videos.insert(
      {
        auth,
        part: 'snippet,status',
        requestBody: {
          snippet: {
            title,
            description,
            tags: [
              'hoonerwala',
              'explorepage',
              'explore',
              'Geeta',
              'gita',
              'bhagwat',
              'spiritual',
              'bhagwatgeeta',
              'bhakti',
              'devotional',
              'art',
              'motivational',
            ],
            categoryId: '24',
          },
          status: {
            privacyStatus: 'public', // "public" | "unlisted" | "private"
            selfDeclaredMadeForKids: false, // ✅ Not made for kids
          },
        },
        media: {
          body: fs.createReadStream(videoPath), // path to your video file
        },
      },
      {
        // Helpful for large uploads
        onUploadProgress: (evt) => {
          const progress = (evt.bytesRead / fs.statSync(videoPath).size) * 100
          process.stdout.write(`Uploading: ${progress.toFixed(2)}%\r`)
        },
      }
    )
    console.log('\nYT Video uploaded. Video ID:', res.data.id)

    const thumbRes = await service.thumbnails.set({
      auth,
      videoId: res.data.id,
      media: {
        body: fs.createReadStream(thumbnail), // your thumbnail image
      },
    })

    console.log('✅ YT Thumbnail set:', thumbRes.data)

    //  Now add to playlist
    console.log('📺 YT Adding video to playlist...')
    await service.playlistItems.insert({
      auth,
      part: 'snippet',
      requestBody: {
        snippet: {
          playlistId: 'PLTrWyFxce72SUKsyLabrMCz94WfTYkpzN',
          resourceId: {
            kind: 'youtube#video',
            videoId: res.data.id,
          },
        },
      },
    })
    console.log('✅ YT Video added to playlist!')
    return true
  } catch (err) {
    console.log('YT Error uploading video:', err)
    return false
  }
}

const uploadYTVideo = async (videoPath, title, description, thumbnail) => {
  try {
    const auth = await authorize()
    const res = await uploadVideo(
      auth,
      videoPath,
      title,
      description,
      thumbnail
    )
    return res
  } catch (error) {
    console.log('YT Error uploading video:', error)
    return false
  }
}

export { uploadYTVideo }
