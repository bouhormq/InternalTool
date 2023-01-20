import React, { useEffect } from 'react'
import { useState } from 'react'
import db from '../../firebase'
import { setDoc,doc } from 'firebase/firestore';
import { UserAuth } from '../../context/authContex';
import Select from 'react-select';
import {handleChangeSelect,checkEmptyValues} from './handleForm'
const orderid = require('order-id')('key');


export function ContactForm({visible, handleVisibility, edit, contact}) {
    const {dropDownClients} = UserAuth();
    const [alertVisible, setAlertVisible] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [inputFields, setInputFields] = useState([{
        name: "", 
        number: "", 
        email: "",
        recipients: [], 
        client: {name:"",clientID:""},
        id: "",
        contactID: "",
        available: true,
        updatedAt: "",
        createdAt: ""
      }]);

      useEffect(() => {
        if(edit){
          setInputFields([contact])
          setDisabled(edit);
        }
      }, [visible])
  
      const handleSubmit = async (e) => {
        e.preventDefault();
        if(!edit){
          inputFields[0].id = orderid.generate()
          inputFields[0].contactID = `${inputFields[0].client.clientID}-${inputFields[0].name}-${inputFields[0].id}`
          inputFields[0].createdAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
        }
        if(checkEmptyValues(inputFields[0]) && inputFields[0].number.match('^[\+][(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$')){
          inputFields[0].updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
          await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}/contacts/${inputFields[0].contactID}`), inputFields[0])  
          await setDoc(doc(db, "contacts", inputFields[0].contactID), inputFields[0]);
          setAlertVisible(false)
          clearContactForm()
        }
        else{
          setAlertVisible(true)
        }
      };

      const clearContactForm = () => {
        setInputFields([{
          name: "", 
          number: "", 
          email: "",
          recipients: [], 
          client: {name:"",clientID:""},
          id: "",
          contactID: "",
          available: true,
          updatedAt: "",
          createdAt: ""
      }])
      handleVisibility(false)
      setAlertVisible(false)
      }
  
      const handleChangeInput = (event) =>{
        const newInputFields = inputFields.map( i => {     
            i[event.target.name] = event.target.value
            return i;
        })
        setInputFields(newInputFields);
    }

    const setClientField = (event) =>{
      var auxInputFields = inputFields[0];
      if(event){
        auxInputFields.client = {name: event.value, clientID: event.clientID}
      }
      else{
        auxInputFields.client = {name: "", clientID: ""}
      }
      setInputFields([auxInputFields])
    } 
    

    if(!visible) return null;
    else{
        return (
            <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
              {alertVisible  &&
                  <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <strong class="font-bold">🧙‍♂️ Hello traveler...</strong>
                  <span class="block sm:inline">Double check that all the fields are not empty and that the country code is present in the phone number.</span>
                  <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                  </span>
                </div>
                }
                <form onSubmit={handleSubmit}>
                    <div class="grid gap-6 mb-6 md:grid-cols-4">
                     { !disabled &&
                    <div >
                        <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Name</label>
                        <input type="text" value={inputFields[0].name} onChange={event => handleChangeInput(event)}  name="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Salim Bouhorma" required=""/>
                    </div>
                    }
                    <div >
                        <label for="number" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Number</label>
                        <input type="text" value={inputFields[0].number} onChange={event => handleChangeInput(event)}  name="number" id="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="+34640801500" required=""/>
                    </div> 
                    <div >
                        <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email</label>
                        <input type="text" value={inputFields[0].email} onChange={event => handleChangeInput(event)}  name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="salim@onespot.com" required=""/>
                    </div>
                    {!disabled &&
                      <div >
                      <label for="country_code" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Client</label>
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
                    }       
                    </div>
                    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
                    <button type="button" onClick={() => {clearContactForm()}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }