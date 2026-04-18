import Data1 from './Data1.json' assert { type: 'json' }
import Data2 from './Data2.json' assert { type: 'json' }
import { getPageAccessToken, uploadReel, checkVideoStatus } from './fb.js'
import { uploadToInstagram, publishToInstagram } from './insta.js'
import { uploadYTVideo } from './yt.js'
import ProgressManager from './ProgressManager.cjs'
import run from './actions.cjs'
import { deleteVideosByNumber } from './cleanUp.js'
import CounterManager from './CounterManager.cjs'

const TOTAL_SERIES = 2
const PLAYLISTS = {
  1: 'PLVNn8UuPqxhfzG12RJdfydeTLSnRiYkoc',
  2: 'PLVNn8UuPqxhdeJDJ6A0EQrqMy48DN4ht3',
}

const FILE_PATHS = {}
for (let i = 1; i <= TOTAL_SERIES; i++) {
  FILE_PATHS[i] = path.join(__dirname, `progress${i}.json`)
}

const Data = { 1: Data1, 2: Data2 }

const getData = (ch, series) => {
  const DataItem = Data[series][ch - 1]
  const title = `${DataItem['title']}`
  const caption = `
${DataItem['title'].replace(/\n/g, ' ')}

${DataItem['summary'].replace(/\n/g, ' ')}

#daily_bytes #explorepage #explore #art #motivational #episode${ch} ${DataItem['hashtags'].join(' ')}

Disclaimer: This content and the images are AI-generated. The facts and information provided are for general informational purposes only and may not represent the most current or accurate details. Please verify with credible sources before making decisions. Always consult multiple references for confirmation.`

  return { title, caption }
}

const pageIdFB = process.env.FB_PAGEID
const accessTokenFB = process.env.FB_TOKEN

async function runner() {
  for (let index = 1; index <= TOTAL_SERIES; index++) {
    await run(FILE_PATHS[index], `${index}`)
  }
  const cm = new CounterManager()
  const { counter } = cm.getCurrent()

  const currentSeries = (counter % TOTAL_SERIES) + 1

  const pm = new ProgressManager(FILE_PATHS[currentSeries])
  const { currentInsta, currentYt, currentFB } = pm.getCurrent()
  const minValue = Math.min(currentInsta, currentYt, currentFB)

  const instaCh = currentInsta
  const YtCh = currentYt
  const FBCh = currentFB

  const instaData = getData(instaCh, currentSeries)
  const ytData = getData(YtCh, currentSeries)
  const fbData = getData(FBCh, currentSeries)

  let instaCreationID, fbRes, instaRes, ytRes, videoIdFB, pageAccessTokenFB

  if (minValue === currentYt) {
    // YT UPLOAD
    ytRes = await uploadYTVideo(
      `./content${currentSeries}/final${YtCh}.mp4`,
      ytData.title,
      ytData.caption,
      `./thumbnails${currentSeries}/fact${YtCh}.png`,
      PLAYLISTS[currentSeries],
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
      instaCreationID = await uploadToInstagram(
        instaData.caption,
        instaCh,
        `${currentSeries}`,
      )
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
        `./content${currentSeries}/final${FBCh}.mp4`,
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

  deleteVideosByNumber(`./content${currentSeries}`, minValue - 5, pm)
}

runner()
