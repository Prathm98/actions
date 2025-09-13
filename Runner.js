import Data from './Data.json' assert { type: 'json' }
import { getPageAccessToken, uploadReel, checkVideoStatus } from './fb.js'
import { uploadToInstagram, publishToInstagram } from './insta.js'
import { uploadYTVideo } from './yt.js'
import ProgressManager from './ProgressManager.cjs'
import run from './actions.cjs'
import { deleteVideosByNumber } from './cleanUp.js'

const numbers = [
  '१',
  '२',
  '३',
  '४',
  '५',
  '६',
  '७',
  '८',
  '९',
  '१०',
  '११',
  '१२',
  '१३',
  '१४',
  '१५',
  '१६',
  '१७',
  '१८',
]

const getData = (ch, verse) => {
  const DataItem = Data[`chapter${ch}`][verse - 1]
  const title = `Gita Chapter ${ch} - Verse ${verse}`
  const caption = `Gita Chapter ${ch} - Verse ${verse}

गीता अध्याय ${numbers[ch - 1]} - श्लोक ${DataItem['shloka_number']}

${DataItem['shloka'].replace(/\n/g, ' ')}

${DataItem['sandesh'].replace(/\n/g, ' ')}

#hoonerwala #explorepage #explore #Geeta #gita #bhagwat #spiritual #bhagwatgeeta #bhakti #devotional #art #motivational #chapter${ch} #गीता #अध्याय${
    numbers[ch - 1]
  } #श्लोक${DataItem['shloka_number']}

Disclaimer: This content and the images are AI-generated. The facts and information provided are for general informational purposes only and may not represent the most current or accurate details. Please verify with credible sources before making decisions. Always consult multiple references for confirmation.`

  return { title, caption }
}

const pageIdFB = process.env.FB_PAGEID
const accessTokenFB = process.env.FB_TOKEN

async function runner() {
  await run()
  const pm = new ProgressManager()
  const { currentInsta, currentYt, currentFB } = pm.getCurrent()

  const { ch: instaCh, verse: instaVerse } = pm.getChapterAndVerse(currentInsta)
  const { ch: YtCh, verse: YtVerse } = pm.getChapterAndVerse(currentYt)
  const { ch: FBCh, verse: FBVerse } = pm.getChapterAndVerse(currentFB)

  const instaData = getData(instaCh, instaVerse)
  const ytData = getData(YtCh, YtVerse)
  const fbData = getData(FBCh, FBVerse)

  let instaCreationID, fbRes, instaRes, ytRes, videoIdFB, pageAccessTokenFB

  // INSTA UPLOAD
  try {
    instaCreationID = await uploadToInstagram(
      instaData.caption,
      instaCh,
      instaVerse
    )
  } catch (err) {
    console.log('❌ Error uploading to Instagram:', err)
  }

  //   FB UPLOAD
  try {
    pageAccessTokenFB = await getPageAccessToken(accessTokenFB, pageIdFB)

    videoIdFB = await uploadReel(
      pageAccessTokenFB,
      pageIdFB,
      `./content/final${FBCh}-${FBVerse}-1.mp4`,
      fbData.caption
    )
  } catch (err) {
    console.log('❌ Error uploading to FB:', err)
  }

  // YT UPLOAD
  ytRes = await uploadYTVideo(
    `./content/final${YtCh}-${YtVerse}-0.mp4`,
    ytData.title,
    ytData.caption,
    `./thumbnails/chapter${YtCh}/${YtVerse}/covernk.png`
  )

  if (instaCreationID) {
    instaRes = await publishToInstagram(instaCreationID, pm, currentInsta)
  }

  if (pageAccessTokenFB && videoIdFB) {
    fbRes = await checkVideoStatus(videoIdFB, pageAccessTokenFB, pm, currentFB)
  }

  //   if (instaRes) pm.updateCurrentInsta(currentInsta + 1)
  //   if (fbRes) pm.updateCurrentFB(currentFB + 1)
  if (ytRes) {
    pm._load()
    pm.updateCurrentYt(currentYt + 1)
  }

  const minValue = Math.min(currentInsta, currentYt, currentFB)
  deleteVideosByNumber('./content', minValue - 5, pm)
}

runner()
