// import { google } from 'googleapis'
// import fs from 'fs'
// import credentials from './credentials.json' assert { type: 'json' }

// const { client_id, client_secret, redirect_uris } = credentials.web
// const oAuth2Client = new google.auth.OAuth2(
//   client_id,
//   client_secret,
//   redirect_uris[0]
// )

// const SCOPES = [
//   'https://www.googleapis.com/auth/youtube.upload',
//   'https://www.googleapis.com/auth/youtube',
// ]

// const authUrl = oAuth2Client.generateAuthUrl({
//   access_type: 'offline',
//   prompt: 'consent', // ⚠️ ensures refresh_token is returned
//   scope: SCOPES,
// })
// console.log('Authorize here:', authUrl)

// 👇 replace with your actual code from URL
// const CODE =
//   '4/0AVMBsJg3FMrIMVrCt-k9WKN4JhCN9djN0vmVn2FtIkP_7QV91gX7pcrhw3RNToxKEVay1A'

// async function main() {
//   try {
//     const { tokens } = await oAuth2Client.getToken(CODE)
//     console.log('✅ Got tokens:', tokens)

//     fs.writeFileSync('token.json', JSON.stringify(tokens, null, 2))
//     console.log('Saved token.json with refresh_token.')

//     console.log('⚠️ COPY THIS REFRESH TOKEN INTO GITHUB SECRETS:')
//     console.log(tokens.refresh_token)
//   } catch (err) {
//     console.error(
//       '❌ Error exchanging code:',
//       err.response?.data || err.message
//     )
//   }
// }

// main()
