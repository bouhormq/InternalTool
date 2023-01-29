import { gapi } from 'gapi-script'
import { SCOPE, CLIENT_ID, API_KEY, DISCOVERY_DOCS } from './gapiVar';


export var GoogleAuth;
export function onLoad(){
  function handleClientLoad() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    gapi.load('client:auth2', initClient);
  }

function initClient() {
  // In practice, your app can retrieve one or more discovery documents.

  // Initialize the gapi.client object, which app uses to make API requests.
  // Get API key and client ID from API Console.
  // 'scope' field specifies space-delimited list of access scopes.
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPE,
      'discoveryDocs': DISCOVERY_DOCS,
    }).then(async function () {
      console.log(gapi.auth2.getAuthInstance())
      GoogleAuth = gapi.auth2.getAuthInstance()
    });
  }
  handleClientLoad()
}

//export a function that gets start time(date picker), location, name 
export const addCalendarEvent = (startDate,address,clientName) => {
  
  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      scope: SCOPE,
      'discoveryDocs': DISCOVERY_DOCS,
    })


    gapi.client.load('calendar', 'v3')
//time zone list:
// https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
    let timeZone = "Asia/Jerusalem"; 
    let duration = '00:30:00'; //duration of each event, here 30 minuts


  //event start time - im passing datepicker time, and making it match      //with the duration time, you can just put iso strings:
//2020-06-28T09:00:00-07:00' 

    let msDuration = (Number(duration.split(':')[0]) * 60 * 60 + Number(duration.split(':')[1]) * 60  + Number(duration.split(':')[2])) * 1000;
    let endDate = new Date(startDate.getTime() + msDuration);
    let isoStartDate = new Date(startDate.getTime()-new Date().getTimezoneOffset()*60*1000).toISOString().split(".")[0];
    let isoEndDate = new Date(endDate.getTime()-(new Date().getTimezoneOffset())*60*1000).toISOString().split(".")[0];


//sign in with pop up window
    gapi.auth2.getAuthInstance().signIn()
    .then(() => { 
      let event = {
        'summary': clientName, // or event name
        'location': address, //where it would happen
        'start': {
          'dateTime': isoStartDate,
          'timeZone': timeZone
        },
        'end': {
          'dateTime': isoEndDate,
          'timeZone': timeZone
        },
        'recurrence': [
          'RRULE:FREQ=DAILY;COUNT=1' 
        ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'popup', 'minutes': 20}
          ]
        }
      }
       
//if you need to list your events than keep it
       gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
      }).then(response => {
        const events = response.result.items
        console.log('EVENTS: ', events)
      })
      
//end of event listing
     
      let request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event,
      })


      request.execute(event => {
        console.log(event)
        window.open(event.htmlLink)
      })
      


    })
  })
}