const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')

const CREDENTIALS_PATH = 'credentials.json' // Downloaded from Google Cloud
const TOKEN_PATH = 'token.json'

async function main() {
  const credentials = require(`./${CREDENTIALS_PATH}`)
  const { client_secret, client_id, redirect_uris } = credentials.web
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  )

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline', // 👈 Important for refresh token
    scope: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
    ],
    prompt: 'consent', // 👈 Forces issuing a refresh token
  })

  console.log('Authorize this app by visiting this url:', authUrl)

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  rl.question('Enter the code from that page here: ', async (code) => {
    try {
      const { tokens } = await oAuth2Client.getToken(code)
      oAuth2Client.setCredentials(tokens)
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2))
      console.log('Tokens stored to', TOKEN_PATH)
    } catch (err) {
      console.error('Error retrieving access token', err)
    }
    rl.close()
  })
}

main()
