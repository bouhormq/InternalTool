import { gapi } from 'gapi-script'
import { SCOPE, CLIENT_ID, API_KEY, DISCOVERY_DOCS } from './gapiVar';
import { UserAuth } from './context/authContex';




//export a function that gets start time(date picker), location, name 
export default function addCalendarEvent(startDate,address,clientName,calendarId){
  

  var  gapi = window.gapi
  
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
    let timeZone = "Europe/Berlin"; 
    let duration = '00:30:00'; //duration of each event, here 30 minuts


  //event start time - im passing datepicker time, and making it match      //with the duration time, you can just put iso strings:
//2020-06-28T09:00:00-07:00' 

    let msDuration = (Number(duration.split(':')[0]) * 60 * 60 + Number(duration.split(':')[1]) * 60  + Number(duration.split(':')[2])) * 1000;
    let endDate = new Date(startDate.getTime() + msDuration);
    let isoStartDate = new Date(startDate.getTime()-new Date().getTimezoneOffset()*60*1000).toISOString().split(".")[0];
    let isoEndDate = new Date(endDate.getTime()-(new Date().getTimezoneOffset())*60*1000).toISOString().split(".")[0];


//sign in with pop up window
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

      
      console.log("HELLO")
      let request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event,
      })

      console.log("ADIOS")

      request.execute(event => {
        console.log(event)
        window.open(event.htmlLink)
      })
      


  })
}