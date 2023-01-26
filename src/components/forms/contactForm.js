import React, { useEffect } from 'react'
import { useState } from 'react'
import db from '../../firebase'
import { setDoc,doc,getCountFromServer, collection, where,query,deleteDoc } from 'firebase/firestore';
import { UserAuth } from '../../context/authContex';
import Select from 'react-select';
import {roleOptions} from './handleForm'
const orderid = require('order-id')('key');


export function ContactForm({visible, handleVisibility, edit, contact}) {
    const {dropDownClients, user} = UserAuth();
    const [alertVisible, setAlertVisible] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [number, setNumber] = useState("");
    const [role, setRole] = useState("");
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
        createdAt: "",
        updatedBy: user.email,
        createdBy: user.email,
        role: "",
        reminderID: ""
      }]);

      useEffect(() => {
        if(edit){
          setInputFields([contact])
          setDisabled(edit);
          setNumber(contact.number)
          setRole(contact.role)
        }
      }, [visible])
  
      const handleSubmit = async (e) => {
        e.preventDefault();
        const snap = await getCountFromServer(query(
          collection(db, 'contacts'), where("number", '==', inputFields[0].number)
        ))
        if(snap.data().count > 0 && (!edit || (edit && (number !== inputFields[0].number)))){
          setAlertVisible(true)
        }
        else{
          inputFields[0].updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
          inputFields[0].updatedBy = user.email
          if(!edit){
            inputFields[0].id = orderid.generate()
            inputFields[0].contactID = `${inputFields[0].client.clientID}-${inputFields[0].name}-${inputFields[0].id}`
            inputFields[0].createdAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
            inputFields[0].updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
          }
          if(checkEmptyValues(inputFields[0]) && inputFields[0].number.match('^[\+][(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$')){
            if(edit){
              if(role !== "Property Manager" && inputFields[0].role === "Property Manager"){
                var id = orderid.generate()
                inputFields[0].reminderID = `${inputFields[0].client.clientID}-${inputFields[0].name}-${id}`
                var reminder = {
                  id: id,
                  reminderID: `${inputFields[0].client.clientID}-${inputFields[0].name}-${id}`,
                  client: inputFields[0].client,
                  content:"From Monday to Friday this field should change according to the orders planned the next day",
                  contact:{contactID:inputFields[0].contactID, name:inputFields[0].name,email:inputFields[0].email,number:inputFields[0].number,available:inputFields[0].available},
                  createdAt:new Date().toLocaleString("sv", { timeZone: "Europe/Berlin" }),
                  updatedAt:new Date().toLocaleString("sv", { timeZone: "Europe/Berlin" }),
                }
                await setDoc(doc(db, `clients/${inputFields[0].client.clientID}/contacts/${inputFields[0].contactID}/reminders/${inputFields[0].reminderID}`),reminder)
                await setDoc(doc(db, `contacts/${inputFields[0].contactID}/reminders/${inputFields[0].reminderID}`),reminder)
                await setDoc(doc(db, `clients/${inputFields[0].client.clientID}/reminders/${inputFields[0].reminderID}`),reminder)
                await setDoc(doc(db, `reminders/${inputFields[0].reminderID}`),reminder)
              }
              else if(role === "Property Manager" && inputFields[0].role !== "Property Manager"){
                await deleteDoc(doc(db, "clients", `${inputFields[0].client.clientID}/contacts/${inputFields[0].contactID}/reminders/${inputFields[0].reminderID}`));
                await deleteDoc(doc(db, "clients", `reminders/${inputFields[0].reminderID}`));
                await deleteDoc(doc(db, "contacts", `${inputFields[0].client.clientID}/reminders/${inputFields[0].reminderID}`));
                await deleteDoc(doc(db, "reminders", `${inputFields[0].reminderID}`));
                inputFields[0].reminderID = ""
              }
              await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}/contacts/${inputFields[0].contactID}`), inputFields[0])  
              await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });  
              await setDoc(doc(db, "contacts", inputFields[0].contactID), inputFields[0]);
              setAlertVisible(false)
              handleVisibility(false)
            }
            if(!edit){
              var id = orderid.generate()
              inputFields[0].reminderID = `${inputFields[0].client.clientID}-${inputFields[0].name}-${id}`
              var reminder = {
                id: id,
                reminderID: `${inputFields[0].client.clientID}-${inputFields[0].name}-${id}`,
                client: inputFields[0].client,
                content:"From Monday to Friday this field should change according to the orders planned the next day",
                contact:{contactID:inputFields[0].contactID, name:inputFields[0].name,email:inputFields[0].email,number:inputFields[0].number,available:inputFields[0].available},
                createdAt:new Date().toLocaleString("sv", { timeZone: "Europe/Berlin" }),
                updatedAt:new Date().toLocaleString("sv", { timeZone: "Europe/Berlin" }),
              }
              await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}/contacts/${inputFields[0].contactID}`), inputFields[0])  
              await setDoc(doc(db, "contacts", inputFields[0].contactID), inputFields[0]);
              if(inputFields[0].role === "Property Manager"){
                await setDoc(doc(db, `clients/${inputFields[0].client.clientID}/contacts/${inputFields[0].contactID}/reminders/${reminder.reminderID}`),reminder)
                await setDoc(doc(db, `contacts/${inputFields[0].contactID}/reminders/${reminder.reminderID}`),reminder)
                await setDoc(doc(db, `clients/${inputFields[0].client.clientID}/reminders/${reminder.reminderID}`),reminder)
                await setDoc(doc(db, `reminders/${reminder.reminderID}`),reminder)
              }
            }
            await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });  
            setAlertVisible(false)
            handleVisibility(false)
            clearContactForm()
          }
          else{
            setAlertVisible(true)
          }
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
          createdAt: "",
          updatedBy: user.email,
          createdBy: user.email,
          role: "",
          reminderID: ""
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

    const setRoleField = (event) =>{
      var auxInputFields = inputFields[0];
      if(event){
        auxInputFields.role = event.value
      }
      else{
        auxInputFields.role = ""
      }
      setInputFields([auxInputFields])
    } 

    const checkEmptyValues = (item) => {
      if (
        inputFields[0].name.length === 0 ||
        inputFields[0].number.length === 0 ||
        inputFields[0].email.length === 0 ||
        inputFields[0].client.clientID.length === 0 ||
        inputFields[0].role.length === 0 
      ) {
        return false
      }
      else {
        return true;
      }
    };
    

    if(!visible) return null;
    else{
        return (
            <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
              {alertVisible  &&
                  <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <strong class="block font-bold">🧙‍♂️ Hello traveler... Double check that:</strong>
                  <span class="block">- All the fields are not empty.</span>
                  <span class="block">- There is no other contact with the same phone number.</span>
                  <span class="block">- The country code is present in the phone number.</span>
                  <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <svg onClick={() => setAlertVisible(false)} class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
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
                    <div >
                    <label for="role" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Role</label>
                    <Select
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            name="role"
                            options={roleOptions}
                            defaultValue={edit && {value:inputFields[0].role, label:inputFields[0].role}}
                            onChange={event => setRoleField(event)}
                        />
                    </div> 
                    </div>
                    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
                    <button type="button" onClick={() => {clearContactForm()}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }