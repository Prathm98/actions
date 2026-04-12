import axios from 'axios'

async function refreshInstagramToken(longLivedToken) {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${longLivedToken}`
  const { data } = await axios.get(url)
  console.log('✅ Refreshed token:')
  console.log('Expires in:', data.expires_in, 'seconds')
  return data.access_token
}

const ACCESS_TOKEN = process.env.INSTA_SECRET

refreshInstagramToken(ACCESS_TOKEN)
