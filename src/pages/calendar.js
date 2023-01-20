
import React from "react";
import Calendar from "@ericz1803/react-google-calendar";


export function Calendars() {
    const API_KEY = "AIzaSyBi-kWJ091WgznkX5WSfJZGo50Kmkfkp20";
let calendars = [
  {
    calendarId: "f5051bedb36e11583bba398e9a2a9a237ef4fefab459b31ebfb97d4278876cfc@group.calendar.google.com",
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