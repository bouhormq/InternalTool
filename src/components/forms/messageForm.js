import React from 'react'
import { doc } from 'firebase/firestore'
import db from '../../firebase'
import { useEffect, useState } from 'react';
import { setDoc } from 'firebase/firestore'
import {handleChangeInput,checkEmptyValues,handleChangeSelect} from './handleForm'
import { UserAuth } from '../../context/authContex';
import { Timestamp } from "@firebase/firestore";
import Select from 'react-select';
const orderid = require('order-id')('key');




export default function MessageForm({visible,handleVisibility}) {
  const {user, dropDownClients,dropDownContacts} = UserAuth();
    const [alertVisible, setAlertVisible] = useState(false);
    const [inputFieldsGlobal, setInputFieldsGlobal] = useState([{
        channelId: '9127c97589944871a4b6488920d43dc7',
        messageID: "",
        id:"",
        contact: {name: "" ,number: "" ,email: "", contactID: "", available: ""},
        to: "",
        client: {name:"",clientID:""},
        daily: false,
        createdBy: "",
        createdAt: "",
        type: 'text',
        content: {
          text: ""
        }
      }]);

      const clearMessageForm = () => {
        setInputFieldsGlobal([{
          channelId: '9127c97589944871a4b6488920d43dc7',
          messageID: "",
          id:"",
          contact: {name: "" ,number: "" ,email: "", contactID: "", available: ""},
          to: "",
          client: {name:"",clientID:""},
          daily: false,
          createdBy: "",
          createdAt: "",
          type: 'text',
          content: {
            text: ""
          }
        }])
          handleVisibility(false)
          setAlertVisible(false)
        }


    const handleSubmit = async (e) => {
      e.preventDefault();
      inputFieldsGlobal[0].id = orderid.generate()
      inputFieldsGlobal[0].messageID = `${inputFieldsGlobal[0].client.clientID}-${inputFieldsGlobal[0].contact.contactID}-${inputFieldsGlobal[0].id }`
      inputFieldsGlobal[0].createdBy = user.email
      inputFieldsGlobal[0].createdAt = Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})))
      console.log(inputFieldsGlobal[0])
      if(checkEmptyValues(inputFieldsGlobal[0]) && inputFieldsGlobal[0].to.match('^[\+][(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$')){
        await setDoc(doc(db, "messages", inputFieldsGlobal[0].messageID), inputFieldsGlobal[0])
        await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/messages/${inputFieldsGlobal[0].messageID}`), inputFieldsGlobal[0])
        await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/contacts/${inputFieldsGlobal[0].contact.contactID}/messages/${inputFieldsGlobal[0].messageID}`), inputFieldsGlobal[0])
        await setDoc(doc(db, "contacts", `${inputFieldsGlobal[0].contact.contactID}/messages/${inputFieldsGlobal[0].messageID}`), inputFieldsGlobal[0])
        await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}`), { updatedAt: Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}))), updatedBy: user.email }, { merge: true });  
        setAlertVisible(false)
        clearMessageForm()
      }
      else{
        setAlertVisible(true)
      }
    };

    const setContactField = (event) =>{
      var auxInputFields = inputFieldsGlobal[0];
      if(event){
        auxInputFields.contact = {name: event.value ,number: event.number ,email: event.email, contactID: event.contactID, available: event.available}
        auxInputFields.to = event.number 
      }
      else{
        auxInputFields.contact = {}
        auxInputFields.to = ""
      }
      setInputFieldsGlobal([auxInputFields])
    }

    const setClientField = (event) =>{
      var auxInputFields = inputFieldsGlobal[0];
      if(event){
        setContactField(null)
        auxInputFields.client = {name: event.value, clientID: event.clientID}
      }
      else{
        setContactField(null)
        auxInputFields.client = {name: "", clientID: ""}
      }
      setInputFieldsGlobal([auxInputFields])
    } 


    if(!visible) return null;
    else{
        return (
            <div className="overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
              {alertVisible  &&
                  <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <strong class="block font-bold">🧙‍♂️ Hello traveler... Double check that:</strong>
                  <span class="block">- All the fields are not empty.</span>
                  <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <svg onClick={() => setAlertVisible(false)} class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                  </span>
                </div>
                }
                <form onSubmit={handleSubmit}>
                    <div class="grid gap-6 mb-6 md:grid-cols-4">
                      <div>
                          <label for="client" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Client</label>
                          <Select
                                className="basic-single"
                                classNamePrefix="select"
                                isClearable={true}
                                isSearchable={true}
                                name="client"
                                options={dropDownClients}
                                onChange={event => setClientField(event)}
                            />
                      </div>
                        <div>
                          <label for="contact" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Contact</label>
                          <Select
                                className="basic-single"
                                classNamePrefix="select"
                                isClearable={true}
                                isSearchable={true}
                                name="contact"
                                options={dropDownContacts}
                                key={inputFieldsGlobal[0].client.clientID}
                                isOptionDisabled={(option) => option.available === false || option.clientID !== inputFieldsGlobal[0].client.clientID}
                                onChange={event => setContactField(event)}
                            />
                      </div>
                        <div style={{gridColumn: "1 / -1"}}>
                          <label for="content.text" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Content</label>
                          <input type="text" value={inputFieldsGlobal.client} onChange={event => handleChangeInput(event.target,"content.text", inputFieldsGlobal[0]).then(function(value){setInputFieldsGlobal(value)})}  name="content.text" id="content.text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Deine Bestellung kommt in den nächsten 30 min ✨emissionsfrei - mit OneSpot 🌱⏱" required=""/>
                        </div> 
                      </div>
                    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Send</button>
                    <button type="button" onClick={() => clearMessageForm()} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }