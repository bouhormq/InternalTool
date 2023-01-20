import { gapi } from 'gapi-script'

gapi.load('client:auth2', async () => {
  gapi.client.init({
    apiKey: "AIzaSyBi-kWJ091WgznkX5WSfJZGo50Kmkfkp20",
    clientId: "414345920391-du9k4dacovq09q49q6dgqsqnp3vdf4fm.apps.googleusercontent.com",
    scope: 'https://www.googleapis.com/auth/plus.login openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
  })

  gapi.client.load('drive', 'v3', () => {})
})

export default gapi