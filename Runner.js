import Data from './Data.json' assert { type: 'json' }
import { getPageAccessToken, uploadReel, checkVideoStatus } from './fb.js'
import { uploadToInstagram, publishToInstagram } from './insta.js'
import { uploadYTVideo } from './yt.js'
import ProgressManager from './ProgressManager.cjs'
import run from './actions.cjs'
import { deleteVideosByNumber } from './cleanUp.js'

const getData = (ch) => {
  const DataItem = Data[ch - 1]
  const title = `Chanakya Niti - Episode ${ch}`
  const caption = `
${DataItem['meaning_english'].replace(/\n/g, ' ')}

${DataItem['shloka'].replace(/\n/g, ' ')}

${DataItem['meaning_hindi'].replace(/\n/g, ' ')}

${DataItem['hook_hindi'].replace(/\n/g, ' ')}

#daily_bytes #explorepage #explore #art #motivational #episode${ch} ${DataItem['hashtags'].join(' ')}

Disclaimer: This content and the images are AI-generated. The facts and information provided are for general informational purposes only and may not represent the most current or accurate details. Please verify with credible sources before making decisions. Always consult multiple references for confirmation.`

  return { title, caption }
}

const pageIdFB = process.env.FB_PAGEID
const accessTokenFB = process.env.FB_TOKEN

async function runner() {
  await run()
  const pm = new ProgressManager()
  const { currentInsta, currentYt, currentFB } = pm.getCurrent()
  const minValue = Math.min(currentInsta, currentYt, currentFB)

  const instaCh = currentInsta
  const YtCh = currentYt
  const FBCh = currentFB

  const instaData = getData(instaCh)
  const ytData = getData(YtCh)
  const fbData = getData(FBCh)

  let instaCreationID, fbRes, instaRes, ytRes, videoIdFB, pageAccessTokenFB

  if (minValue === currentYt) {
    // YT UPLOAD
    ytRes = await uploadYTVideo(
      `./content/final${YtCh}.mp4`,
      ytData.title,
      ytData.caption,
      `./thumbnails/${YtCh}/cover.png`,
    )
    if (ytRes) {
      pm._load()
      pm.updateCurrentYt(currentYt + 1)
    } else {
      process.exit(1)
    }
  }

  if (minValue === currentInsta) {
    // INSTA UPLOAD
    try {
      instaCreationID = await uploadToInstagram(instaData.caption, instaCh)
    } catch (err) {
      console.log('❌ Error uploading to Instagram:', err)
    }
  }

  if (minValue === currentFB) {
    //   FB UPLOAD
    try {
      pageAccessTokenFB = await getPageAccessToken(accessTokenFB, pageIdFB)

      videoIdFB = await uploadReel(
        pageAccessTokenFB,
        pageIdFB,
        `./content/final${FBCh}.mp4`,
        fbData.caption,
      )
    } catch (err) {
      console.log('❌ Error uploading to FB:', err)
    }
  }

  if (minValue === currentInsta && instaCreationID) {
    instaRes = await publishToInstagram(instaCreationID, pm, currentInsta)
    // if (!instaRes) {
    //   console.log('Instagram upload failed, existing...')
    //   process.exit(1)
    // }
  }

  if (minValue === currentFB && pageAccessTokenFB && videoIdFB) {
    fbRes = await checkVideoStatus(videoIdFB, pageAccessTokenFB, pm, currentFB)

    // if (!fbRes) {
    //   console.log('Facebook upload failed, existing...')
    //   process.exit(1)
    // }
  }

  deleteVideosByNumber('./content', minValue - 5, pm)
}

runner()
