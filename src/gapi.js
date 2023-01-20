import { gapi } from 'gapi-script'


export var GoogleAuth;
export function onLoad(){
  var SCOPE = 'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar';
  function handleClientLoad() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    gapi.load('client:auth2', initClient);
  }

function initClient() {
  // In practice, your app can retrieve one or more discovery documents.
  var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

  // Initialize the gapi.client object, which app uses to make API requests.
  // Get API key and client ID from API Console.
  // 'scope' field specifies space-delimited list of access scopes.
    gapi.client.init({
        apiKey: "AIzaSyBi-kWJ091WgznkX5WSfJZGo50Kmkfkp20",
        clientId: "414345920391-du9k4dacovq09q49q6dgqsqnp3vdf4fm.apps.googleusercontent.com",
        scope: SCOPE,
      'discoveryDocs': [discoveryUrl],
    }).then(async function () {
      console.log(gapi.auth2.getAuthInstance())
      GoogleAuth = gapi.auth2.getAuthInstance()
    });
  }
  handleClientLoad()
}

