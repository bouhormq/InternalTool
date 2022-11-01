import React from 'react'
import { doc } from 'firebase/firestore'
import db from '../firebase'
import { useEffect, useState } from 'react';
import { setDoc } from 'firebase/firestore'


export default function MessageForm({visible,handleVisibility,clients}) {
    const [inputFieldsGlobal, setInputFieldsGlobal] = useState([{
        channelId: '9127c97589944871a4b6488920d43dc7',
        to: '',
        type: 'text',
        content: {
          text: ''
        }
      }]);
      const [selectedClient, setselectedClient] = useState();

      useEffect(  () => {  
        if(Object.keys(clients)[0] !== undefined && selectedClient === undefined ){
          setselectedClient(Object.keys(clients)[0])
        }
      })

      const clearForm = () => {
        setInputFieldsGlobal([{
            channelId: '9127c97589944871a4b6488920d43dc7',
            to: '',
            type: 'text',
            content: {
              text: ''
            }
          }])
          handleVisibility(false)
        }


    const handleSubmit = async (e) => {
      e.preventDefault();
      inputFieldsGlobal[0].client = selectedClient
      await setDoc(doc(db, "messages", `${selectedClient}-(${inputFieldsGlobal[0].to})-(${new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})})`), inputFieldsGlobal[0])
      await setDoc(doc(db, "clients", `${selectedClient}/messages/(${inputFieldsGlobal[0].to})-(${new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})})`), inputFieldsGlobal[0])
      clearForm()
    };

    const handleChangeInput = (event) => {
        if(event.target.name === "client"){
            setselectedClient(event.target.value)
        }
      const newInputFields = inputFieldsGlobal.map( i => {     
        if(event.target.name === "to"){
            i[event.target.name] = event.target.value
        }
        else if (event.target.name === "content"){
            i[event.target.name] = {text: event.target.value}
        }
        return i;
    })
    setInputFieldsGlobal(newInputFields)
    }

    if(!visible) return null;
    else{
        return (
            <div className="overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <form onSubmit={handleSubmit}>
                    <div class="grid gap-6 mb-6 md:grid-cols-4">
                        <div>
                          <label for="client" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Client</label>
                          <select id='client' name="client" onChange={event => handleChangeInput(event)} value={selectedClient}  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                            {Object.keys(clients).map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div >
                            <label for="to" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Contact Number</label>
                            <input type="text" value={inputFieldsGlobal[0].to} onChange={event => handleChangeInput(event)} name="to" id="to" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="+49 · · · · · · · · ·" required=""/>
                        </div>
                        <div style={{gridColumn: "1 / -1"}}>
                          <label for="content" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Content</label>
                          <input type="text" value={inputFieldsGlobal.client} onChange={event => handleChangeInput(event)}  name="content" id="content"class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Deine Bestellung kommt in den nächsten 30 min ✨emissionsfrei - mit OneSpot 🌱⏱" required=""/>
                        </div> 
                      </div>
                    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Send</button>
                    <button type="button" onClick={() => clearForm()} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }