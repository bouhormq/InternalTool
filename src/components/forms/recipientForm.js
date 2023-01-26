import React, { useEffect } from 'react'
import { useState } from 'react'
import db from '../../firebase'
import { setDoc,doc,getDoc, getCountFromServer, collection,where, query} from 'firebase/firestore';
import { UserAuth } from '../../context/authContex';
import Select from 'react-select';
import {handleChangeInput,checkEmptyValues} from './handleForm'
const orderid = require('order-id')('key');



export function RecipientForm({visible, handleVisibility, edit, recipient}) {
    const {dropDownClients, dropDownWarehouses, dropDownContacts, dropDownCity, dropDownCountry, dropDownPostalCode, user} = UserAuth();
    const [alertVisible, setAlertVisible] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [name, setName] = useState("");
    const [contactsToUpdate, setContactsToUpdate] = useState([]);
    const [inputFields, setInputFields] = useState([{
        shippingAddress: {city: "", postalCode: "", country:"Germany", address: ""}, 
        availableWarehouses: [],
        client: {name:"",clientID:""},
        name: "",
        id: "",
        recipientID: "",
        contacts:[],
        updatedAt: "",
        createdAt: "",
        updatedBy: user.email,
        createdBy: user.email
      }]);

      useEffect(() => {
        if(edit){
          setInputFields([recipient])
          setContactsToUpdate(recipient.contacts)
          setDisabled(edit);
          setName(recipient.name)
        }
      }, [visible])

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log(inputFields[0])
      const snap = await getCountFromServer(query(
        collection(db, 'recipients'), where("name", '==', inputFields[0].name)
      ))
      if(snap.data().count > 0 && (!edit || (edit && (name !== inputFields[0].name)))){
        setAlertVisible(true)
      }
      else{
        if(!edit){
          inputFields[0].id = orderid.generate()
          inputFields[0].recipientID = `${inputFields[0].client.clientID}-${inputFields[0].name}-${inputFields[0].id}`
          inputFields[0].createdAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
          inputFields[0].updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
        }
        if(checkEmptyValues(inputFields[0])){
          if(edit){
            inputFields[0].updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
            inputFields[0].updatedBy = user.email
            for(var i = 0; i < contactsToUpdate.length; ++i){
              const docRef = doc(db, "contacts", `${contactsToUpdate[i].contactID}`); 
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                let contact = docSnap.data()
                const j = contact.recipients.findIndex(e => e.recipientID === inputFields[0].recipientID);
                if (j > -1) {
                  let recipients = contact.recipients
                  recipients.splice(j,1)
                  contact.recipients = recipients
                  contact.updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
                  contact.updatedBy = user.email
                }
                await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}/contacts/${contactsToUpdate[i].contactID}`), contact)
                await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });  
                await setDoc(doc(db, "contacts", `${contactsToUpdate[i].contactID}`), contact)
              }
            }
          }
          for(var i = 0; i < inputFields[0].contacts.length; ++i){
            const docRef = doc(db, "contacts", `${inputFields[0].contacts[i].contactID}`); 
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              let contact = docSnap.data()
              contact.updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
              contact.updatedBy = user.email
              contact.recipients.push({name:inputFields[0].name, availableWarehouses:inputFields[0].availableWarehouses,shippingAddress:inputFields[0].shippingAddress, recipientID: inputFields[0].recipientID})
              await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}/contacts/${inputFields[0].contacts[i].contactID}`), contact)
              await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });  
              await setDoc(doc(db, "contacts", `${inputFields[0].contacts[i].contactID}`), contact)
            }
          }
          await setDoc(doc(db, "recipients", inputFields[0].recipientID), inputFields[0]);
          await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}/recipients/${inputFields[0].recipientID}`), inputFields[0]) 
          await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });  
          setAlertVisible(false)
          clearRecipientForm()
        }
        else{
          setAlertVisible(true)
        }
      }
    };

    const clearRecipientForm = () => {
      setInputFields([{
        shippingAddress: {city: "", postalCode: "", country:'Germany', address: ""}, 
        availableWarehouses: [],
        client: {name:"",clientID:""},
        name: "",
        id: "",
        recipientID: "",
        contacts:[],
        updatedAt: "",
        createdAt: "",
        updatedBy: user.email,
        createdBy: user.email
      }])
      handleVisibility(false)
      setAlertVisible(false)
    }

    const setClientField = (event) =>{
      var auxInputFields = inputFields[0];
      if(event){
        auxInputFields.client = {name: event.value, clientID: event.clientID}
        setContactField(null)
      }
      else{
        setContactField(null)
        auxInputFields.client = {name: "", clientID: ""}
      }
      setInputFields([auxInputFields])
    } 
    const setContactField = (event) =>{
      var auxInputFields = inputFields[0];
      if(event){
        let elements = []
        for(var i = 0; i < event.length; ++i){
          elements.push({name: event[i].value ,number: event[i].number ,email: event[i].email, contactID: event[i].contactID, available: event[i].available})
        }
        auxInputFields.contacts = elements
      }
      else{
        auxInputFields.contacts = []
      }
      setInputFields([auxInputFields])
    }

    

    const setCountryField = (event) =>{
      var auxInputFields = inputFields[0];
      if(event){
        auxInputFields.shippingAddress.country = event.value
        setCityField(null)
      }
      else{
        auxInputFields.shippingAddress.country = ""
        setCityField(null)
      }
      setInputFields([auxInputFields])
    } 

    const setCityField = (event) =>{
      var auxInputFields = inputFields[0];
      if(event){
        auxInputFields.shippingAddress.city = event.value
        setavailableWarehouseField(null)
      }
      else{
        auxInputFields.shippingAddress.city = ""
        setavailableWarehouseField(null)
      }
      setInputFields([auxInputFields])
    } 

    const setavailableWarehouseField = (event) =>{
      var auxInputFields = inputFields[0];
      if(event){
        let elements = []
        for(var i = 0; i < event.length; ++i){
            elements.push(event[i].value)
        }
        auxInputFields.availableWarehouses = elements
        setPostalCodeField(null)
      }
      else{
        auxInputFields.availableWarehouses = []
        setPostalCodeField(null)
      }
      setInputFields([auxInputFields])
    } 

    const setPostalCodeField = (event) =>{
      var auxInputFields = inputFields[0];
      if(event){
        auxInputFields.shippingAddress.postalCode = event.value
      }
      else{
        auxInputFields.shippingAddress.postalCode = ""
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
                  <strong class="block font-bold">🧙‍♂️ Hello traveler... Double check that:</strong>
                  <span class="block">- All the fields are not empty.</span>
                  <span class="block">- There is no other recipient with the same name</span>
                  <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                  </span>
                </div>
                }
                <form onSubmit={handleSubmit}>
                    <div class="grid gap-6 mb-6 md:grid-cols-4">
                    {!disabled &&
                      <div >
                          <label for="address" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Name</label>
                          <input type="text" value={inputFields[0].name} onChange={event => handleChangeInput(event.target,'name',inputFields[0]).then(function(value){setInputFields(value)})}  name="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="H&M" required=""/>
                      </div>
                    }
                    {!disabled &&
                      <div>
                      <label for="client" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Client</label>
                        <Select
                              className="basic-single"
                              classNamePrefix="select"
                              isClearable={true}
                              isSearchable={true}
                              name="client"
                              options={dropDownClients}
                              defaultValue={edit && {value:inputFields[0].client.name,label:inputFields[0].client.name, clientID: inputFields[0].client.clientID}} 
                              onChange={event => setClientField(event)}
                          />
                      </div>
                    }
                    <div >
                        <label for="contacts" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Contacts</label>
                        <Select
                                className="basic-multi-select"
                                isMulti
                                classNamePrefix="select"
                                isClearable={true}
                                isSearchable={true}
                                isOptionDisabled={(option) => option.available === false || option.clientID !== inputFields[0].client.clientID}
                                name="contacts"
                                key={inputFields[0].client.clientID}
                                defaultValue={edit && inputFields[0].contacts.map(function(row) {
                                  return {value:row.name, label:row.name, email:row.email, number:row.number, contactID: row.contactID, available: row.available}
                               })}
                                options={dropDownContacts}
                                onChange={event => setContactField(event)}
                            />
                    </div>
                      <div >
                        <label for="shippingAddress.country" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Country</label>
                        <Select
                                className="basic-single"
                                classNamePrefix="select"
                                isClearable={true}
                                isSearchable={true}
                                name="shippingAddress.country"
                                options={dropDownCountry}
                                defaultValue={edit && {label:"Germany",value:"Germany"}}
                                onChange={event => setCountryField(event)}
                            />
                    </div> 
                    <div >
                        <label for="shippingAddress.city" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">City</label>
                        <Select
                                className="basic-single"
                                classNamePrefix="select"
                                isClearable={true}
                                isSearchable={true}
                                name="shippingAddress.city"
                                key={inputFields[0].shippingAddress.country}
                                options={dropDownCity}
                                defaultValue={edit && {value:inputFields[0].shippingAddress.city,label:inputFields[0].shippingAddress.city}}
                                isOptionDisabled={(option) => option.country !== inputFields[0].shippingAddress.country}
                                onChange={event => setCityField(event)}
                            />
                    </div> 
                    <div >
                        <label for="availableWarehouses" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Warehouses</label>
                        <Select
                                className="basic-multi-select"
                                isMulti
                                classNamePrefix="select"
                                isClearable={true}
                                isSearchable={true}
                                name="availableWarehouses" 
                                options={dropDownWarehouses}
                                key={inputFields[0].shippingAddress.city}
                                defaultValue={edit && inputFields[0].availableWarehouses.map(function(row) {
                                  return {value:row, label:row}
                               })}
                                isOptionDisabled={(option) => option.city !== inputFields[0].shippingAddress.city}
                                onChange={event => setavailableWarehouseField(event)}
                            />
                    </div> 
                    <div >
                        <label for="shippingAddress.postal_code" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Postal Code</label>
                        <Select
                                className="basic-single"
                                classNamePrefix="select"
                                isClearable={true}
                                isSearchable={true}
                                name="postalCode"
                                options={dropDownPostalCode}
                                key={inputFields[0].availableWarehouses}
                                defaultValue={edit && {value:inputFields[0].shippingAddress.postalCode,label:inputFields[0].shippingAddress.postalCode}}
                                isOptionDisabled={(option) =>  !inputFields[0].availableWarehouses.includes(option.warehouse)}
                                onChange={event => setPostalCodeField(event)}
                            />
                    </div> 
                    <div >
                        <label for="shippingAddress.address" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Address</label>
                        <input type="text" value={inputFields[0].shippingAddress.address} onChange={event => handleChangeInput(event.target,'shippingAddress.address',inputFields[0]).then(function(value){setInputFields(value)})}  name="shippingAddress.address" id="shippingAddress.address" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Finkenhofstraße 12, 60322 Frankfurt am Main, Germany" required=""/>
                    </div>      
                    </div>
                    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
                    <button type="button" onClick={() => {clearRecipientForm()}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }