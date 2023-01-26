
import React from "react";
import Calendar from "@ericz1803/react-google-calendar";


export function Calendars() {
    const API_KEY = "AIzaSyBi-kWJ091WgznkX5WSfJZGo50Kmkfkp20";
    let calendars = [
      {
        calendarId: "811e3aa5109bc01ba523f7c1a95ff18a4d83e051ed4ae3f0b649e3925c9ca9cc@group.calendar.google.com",
        color: "#429ef5", //optional, specify color of calendar 2 events
      },{
        calendarId: "5a647fe498d3218ad3a90f65ba60830e92ef1c6b8aaf8e0c34a4eee175f2e4c4@group.calendar.google.com",
        color: "#f5e042", //optional, specify color of calendar 2 events
      },{
        calendarId: "9de25627c245987235cf1979ae1839a75d4122173c3d6e1b0077fdfafa04bf90@group.calendar.google.com",
        color: "#fc9803", //optional, specify color of calendar 2 events
      },{
        calendarId: "681044226639cf5ba6ff8afefff8e44020fece328b51e918623f14a8dce9ce16@group.calendar.google.com",
        color: "#a103fc", //optional, specify color of calendar 2 events
      }
    ]

        

    

    return (
      <div class="container mx-auto">
        <div className="mt-5">
        <div className="mb-6">
              <span class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Calendar 🚴‍♂️ 📅</span>
            </div>
            <div className="mt-4 flex flex-col">
      <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
         <Calendar apiKey={API_KEY} calendars={calendars} className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"/>
        </div>
        </div>
        </div>
        </div>        
        </div>
    </div>


    );
}