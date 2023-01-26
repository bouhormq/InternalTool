import React, { useEffect } from 'react'
import db from '../../firebase'
import { useState } from 'react'
import { setDoc,doc } from 'firebase/firestore';
import { UserAuth } from '../../context/authContex';
import {addMinutes, publishTheCalenderEvent,deleteSeries,updateLineItemStats,validateContact, handleSkuForm, handleChangeCheckbox, handleRemoveFields, handleAddFields,handleChangeSelect, tosOptions, frequencyOptions, contractLengthOptions, SchedulingVisibility} from './handleForm';
import  Select  from 'react-select';
const orderid = require('order-id')('key');




export function DeliveryForm({visible,handleVisibility,type,edit,delivery}) {
  const {dropDownClients,dropDownInventory,dropDownRecipients,dropDownContacts,user,warehouses} = UserAuth();
  const [visibleFrequencyField, setVisibleFrequencyField] = useState(true);
  const [visibleTimeField, setVisibleTimeField] = useState(true);
  const [visibleContractLength, setVisibleContractLength] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [numberContacts, setNumberContacts] = useState(2);
  const [inputFieldsGlobal, setInputFieldsGlobal] = useState([
    { id: "",
      type: type, 
      totalDimensions:"",
      daysOfWeek: [], 
      contractLength: "",
      rider:{name:"",lastName:"",number:"",riderID: ""},
      totalWeight: "",
      contact:{name: "" ,number: "",email: "", contactID: "", available: ""},
      totalPrice: "",
      financialStatus:"",
      createdAt:"",
      createdBy:"",
      cancelledAt:"",
      cancelledBy:"",
      cancelReason:"",
      assignedWarehouse: "",
      updatedAt:"",
      updatedBy:"",
      fulfillmentStatus:'open', 
      lineItems: [
        { id: orderid.generate(), quantity: "", sku: "", skuInt: "", description: ""},
      ],
      deliveryID: "", 
      client: {name:"",clientID:""},
      invoiceStamp: "", 
      deliveryAt: "", 
      recipient: {name:"",recipientID:""},
      tos: "", 
      availableWarehouses: [], 
      shippingAddress: {city: "", zip: "", country:'Germany', address: ""}, 
      frequency: "",
      timeline:{
        inProcessH: "00",
        inProcessM: "00",
        inProcessAMPM: "AM",
        outForDeliveryH:"00",
        outForDeliveryM:"00",
        outForDeliveryAMPM:"AM",
        arrivalNoteH:"00",
        arrivalNoteM:"00",
        arrivalNoteAMPM:"AM",
        deliveredH:"00",
        deliveredM:"00",
        deliveredAMPM:"AM",
        closedH:"00",
        closedM:"00",
        closedAMPM:"AM",
        timeOnSite:"0 minutes",
        inTime:true
      },
      expectedTime:"",
      suggestedTimeOut:"",
      deliveryDistance:"",
      seriesID:"",
      comments: "",
      exchange: false,
      exchanged: false,
      sms:[],
      reschedules:[],
      recipientComments:"",
      flowID: "",
      rescheduleIDs: []
    }
  ]);

  useEffect(() => {
    if(edit){
      setInputFieldsGlobal([delivery])
      setDisabled(edit);
      if(delivery.daysOfWeek.length > 0){
        delivery.daysOfWeek.forEach(element => {
          if(document.getElementById(element)){
            document.getElementById(element).checked = true;
          }
        });
      }
      if(delivery.tos !== "Jour Fix"){
        if(delivery.tos === "Instant") setVisibleTimeField(false)
        setVisibleFrequencyField(false)
        setVisibleContractLength(false)
      }
    }
  }, [visible])
  

  async function handleSubmit(editSeries){
    console.log(inputFieldsGlobal[0])
    if (checkEmptyValues(inputFieldsGlobal[0])) {
      setAlertVisible(false)
      handleVisibility(false)
      if(editSeries) deleteSeries(delivery);
      setInputFieldsGlobal(updateLineItemStats(inputFieldsGlobal[0].lineItems,inputFieldsGlobal[0]))
      inputFieldsGlobal[0].updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin" })
      inputFieldsGlobal[0].updatedBy = user.email
      if(inputFieldsGlobal[0].tos === "Jour Fix" || !edit || (edit && editSeries)) {
        inputFieldsGlobal[0].createdAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin" })
        inputFieldsGlobal[0].createdBy = user.email
      }
      if (inputFieldsGlobal[0].tos !== "Jour Fix") {
        inputFieldsGlobal[0].seriesID = ""
        if(!edit || (edit && editSeries))  inputFieldsGlobal[0].id = orderid.generate()
        if(inputFieldsGlobal[0].tos === "Instant") inputFieldsGlobal[0].deliveryAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin" });
        if (inputFieldsGlobal[0].type === "Order") {
          if(!edit || (edit && editSeries))  inputFieldsGlobal[0].deliveryID = `${inputFieldsGlobal[0].client.clientID}-${inputFieldsGlobal[0].recipient.recipientID}-${inputFieldsGlobal[0].id}`
          /*if(!edit){
            const date = new Date(inputFieldsGlobal[0].deliveryAt);
            
            const newDate = addMinutes(date, 30);
            console.log(date,newDate)
            var event = {
              summary: "Hello World",
              location: inputFieldsGlobal[0].shippingAddress.address,
              start: {
                dateTime: inputFieldsGlobal[0].deliveryAt,
                timeZone: "Europe/Berlin",
              },
              end: {
                dateTime: "2023-01-18T17:00:00-07:00",
                timeZone: "Europe/Berlin",
              },
              recurrence: ["RRULE:FREQ=DAILY;COUNT=2"],
              attendees: [],
              reminders: {
                useDefault: false,
                overrides: [
                  { method: "email", minutes: 24 * 60 },
                  { method: "popup", minutes: 10 },
                ],
              },
            };
            var calendarID = warehouses[inputFieldsGlobal[0].availableWarehouses[0]].calendarDeliveries
            console.log(calendarID)
            //publishTheCalenderEvent(event,calendarID)
          }*/
          await setDoc(doc(db, "orders", inputFieldsGlobal[0].deliveryID), inputFieldsGlobal[0]);
          await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/orders/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
          await setDoc(doc(db, "contacts", `${inputFieldsGlobal[0].contact.contactID}/orders/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
          await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/contacts/${inputFieldsGlobal[0].contact.contactID}/orders/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
        }
        else if (inputFieldsGlobal[0].type  === "Return") {
          if(!edit || (edit && editSeries))  inputFieldsGlobal[0].deliveryID = `${inputFieldsGlobal[0].client.clientID}-${inputFieldsGlobal[0].recipient.recipientID}-${inputFieldsGlobal[0].id}`
          /*if(!edit){
            const date = new Date(inputFieldsGlobal[0].deliveryAt);
            
            const newDate = addMinutes(date, 30);
            console.log(date,newDate)
            var event = {
              summary: "Hello World",
              location: "",
              start: {
                dateTime: "2023-01-18T09:00:00-07:00",
                timeZone: "Europe/Berlin",
              },
              end: {
                dateTime: "2023-01-18T17:00:00-07:00",
                timeZone: "Europe/Berlin",
              },
              recurrence: ["RRULE:FREQ=DAILY;COUNT=2"],
              attendees: [],
              reminders: {
                useDefault: false,
                overrides: [
                  { method: "email", minutes: 24 * 60 },
                  { method: "popup", minutes: 10 },
                ],
              },
            }
          }*/
          await setDoc(doc(db, "returns", inputFieldsGlobal[0].deliveryID), inputFieldsGlobal[0]);
          await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/returns/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
          await setDoc(doc(db, "contacts", `${inputFieldsGlobal[0].contact.contactID}/returns/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
          await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/contacts/${inputFieldsGlobal[0].contact.contactID}/returns/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
        }
      }
      else {
        function addMonths(numOfMonths, date) {
          date.setMonth(date.getMonth() + numOfMonths);
          return date;
        }
        function getDatesInRange(startDate, endDate) {
          const date = new Date(startDate.getTime());

          const dates = [];

          while (date <= endDate) {
            dates.push(new Date(date));
            date.setDate(date.getDate() + 1);
          }

          return dates;
        }
        let seriesID = orderid.generate()
        let endDate = addMonths(parseInt(inputFieldsGlobal[0].contractLength.substring(0, 2)), new Date(inputFieldsGlobal[0].deliveryAt))
        let startDate = new Date(inputFieldsGlobal[0].deliveryAt)
        // Usage
        const auxdates = getDatesInRange(startDate, endDate)
        var dates = []
        var interval = 1
        if(inputFieldsGlobal[0].frequency === "Bi-Weekly") interval = 1
        if(inputFieldsGlobal[0].frequency === "Monthly") interval = 4
        if(inputFieldsGlobal[0].frequency !== "Weekly"){
          for(var i = 0 ; i*7 < auxdates.length; i++){
            if(i%interval === 0) dates.push(...auxdates.slice(0+(i*7),6+(i*7)))
            console.log(i,i%interval,i*7)
          }
        }
        else{
          dates = auxdates
        }
        console.log(dates.length)
        let send = false
        for (let i = 0; i < dates.length; i++) {
          var date = new Date(dates[i])
          if (date.getDay() === 0 && inputFieldsGlobal[0].daysOfWeek.includes('sunday')) {
            inputFieldsGlobal[0].deliveryAt = date.toLocaleString("sv", { timeZone: "Europe/Berlin" })
            send = true
          }
          else if (date.getDay() === 1 && inputFieldsGlobal[0].daysOfWeek.includes('monday')) {
            inputFieldsGlobal[0].deliveryAt = date.toLocaleString("sv", { timeZone: "Europe/Berlin" })
            send = true
          }
          else if (date.getDay() === 2 && inputFieldsGlobal[0].daysOfWeek.includes('tuesday')) {
            inputFieldsGlobal[0].deliveryAt = date.toLocaleString("sv", { timeZone: "Europe/Berlin" })
            send = true
          }
          else if (date.getDay() === 3 && inputFieldsGlobal[0].daysOfWeek.includes('wednesday')) {
            inputFieldsGlobal[0].deliveryAt = date.toLocaleString("sv", { timeZone: "Europe/Berlin" })
            send = true
          }
          else if (date.getDay() === 4 && inputFieldsGlobal[0].daysOfWeek.includes('thursday')) {
            inputFieldsGlobal[0].deliveryAt = date.toLocaleString("sv", { timeZone: "Europe/Berlin" })
            send = true
          }
          else if (date.getDay() === 5 && inputFieldsGlobal[0].daysOfWeek.includes('friday')) {
            inputFieldsGlobal[0].deliveryAt = date.toLocaleString("sv", { timeZone: "Europe/Berlin" })
            send = true
          }
          else if (date.getDay() === 6 && inputFieldsGlobal[0].daysOfWeek.includes('saturday')) {
            inputFieldsGlobal[0].deliveryAt = date.toLocaleString("sv", { timeZone: "Europe/Berlin" })
            send = true
          }
          console.log("number", date.getDay(),send)
          if (send) {
            if(!edit || (edit && editSeries))  inputFieldsGlobal[0].seriesID = seriesID
            if(!edit || (edit && editSeries))  inputFieldsGlobal[0].id = orderid.generate()
            if (inputFieldsGlobal[0].type === "Order") {
              inputFieldsGlobal[0].deliveryID = `${inputFieldsGlobal[0].client.clientID}-${inputFieldsGlobal[0].recipient.recipientID}-${inputFieldsGlobal[0].id}`
              await setDoc(doc(db, "orders", inputFieldsGlobal[0].deliveryID), inputFieldsGlobal[0]);
              await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/orders/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
              await setDoc(doc(db, "contacts", `${inputFieldsGlobal[0].contact.contactID}/orders/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
              await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/contacts/${inputFieldsGlobal[0].contact.contactID}/orders/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
            }
            else if (inputFieldsGlobal[0].type  === "Return") {
              inputFieldsGlobal[0].deliveryID = `${inputFieldsGlobal[0].client.clientID}-${inputFieldsGlobal[0].recipient.recipientID}-${inputFieldsGlobal[0].id}`
              await setDoc(doc(db, "returns", inputFieldsGlobal[0].deliveryID), inputFieldsGlobal[0]);
              await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/returns/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
              await setDoc(doc(db, "contacts", `${inputFieldsGlobal[0].contact.contactID}/returns/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
              await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/contacts/${inputFieldsGlobal[0].contact.contactID}/returns/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
            }
            send = false
          }
          if(inputFieldsGlobal[0].frequency === "Bi-Weekly" && i%6 === 0) i = i + 6;
          if(inputFieldsGlobal[0].frequency === "Montly" && i%29 === 0) i = i + 29;
        }
      }
      await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true }); 
      await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/contacts/${inputFieldsGlobal[0].contact.contactID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true }); 
      await setDoc(doc(db, "contacts", `${inputFieldsGlobal[0].contact.contactID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });
      clearDeliveryForm()
    }
    else {
      setAlertVisible(true)
    }
  };

  const clearDeliveryForm = () => {
    setInputFieldsGlobal([
      { id: "",
      type: type, 
      totalDimensions:"",
      daysOfWeek: [], 
      contractLength: "",
      rider:{name:"",lastName:"",number:"",riderID: ""},
      totalWeight: "",
      contact:{name: "" ,number: "",email: "", contactID: "", available: ""},
      totalPrice: "",
      financialStatus:"",
      createdAt:"",
      createdBy:"",
      cancelledAt:"",
      cancelledBy:"",
      cancelReason:"",
      assignedWarehouse: "",
      updatedAt:"",
      updatedBy:"",
      fulfillmentStatus:'open', 
      lineItems: [
        { id: orderid.generate(), quantity: "", sku: "", skuInt: "", description: ""},
      ],
      deliveryID: "", 
      client: {name:"",clientID:""},
      invoiceStamp: "", 
      deliveryAt: "", 
      recipient: {name:"",recipientID:""},
      tos: "", 
      availableWarehouses: [], 
      shippingAddress: {city: "", zip: "", country:'Germany', address: ""}, 
      frequency: "",
      timeline:{
        inProcessH: "00",
        inProcessM: "00",
        inProcessAMPM: "AM",
        outForDeliveryH:"00",
        outForDeliveryM:"00",
        outForDeliveryAMPM:"AM",
        arrivalNoteH:"00",
        arrivalNoteM:"00",
        arrivalNoteAMPM:"AM",
        deliveredH:"00",
        deliveredM:"00",
        deliveredAMPM:"AM",
        closedH:"00",
        closedM:"00",
        closedAMPM:"AM",
        timeOnSite:"0 minutes",
        inTime:true
      },
      expectedTime:"",
      suggestedTimeOut:"",
      deliveryDistance:"",
      seriesID:"",
      comments: "",
      exchange: false,
      exchanged: false,
      sms:[],
      reschedules:[],
      recipientComments:"",
      flowID: "",
      rescheduleIDs: []
    }
    ])
    setVisibleTimeField(true)
    setVisibleFrequencyField(true)
    setVisibleContractLength(true)
    setAlertVisible(false)
    handleVisibility(false)
  }

  const handleChangeInputFieldsGlobal = async (event) => {    
    const newInputFieldsGlobal = inputFieldsGlobal.map(i => {
      i[event.target.name] = event.target.value  
      return i;
    })
    setInputFieldsGlobal(newInputFieldsGlobal)
  }

  const setRecipientField = (event) =>{
    var auxInputFields = inputFieldsGlobal[0];
    if(event){
      setContactField(null)
      auxInputFields.availableWarehouses = event.availableWarehouses
      auxInputFields.shippingAddress = event.shippingAddress
      auxInputFields.recipient = {name:event.value,recipientID:event.recipientID}
      var defaultContact = {}
      for(var i = 0; i < dropDownContacts.length; ++i){
        defaultContact = dropDownContacts.filter((obj) =>  validateContact(obj,inputFieldsGlobal[0]))
      }
      setNumberContacts(defaultContact.length )
      if(defaultContact.length === 1){
        auxInputFields.contact = {name:defaultContact[0].value,number:defaultContact[0].number,email:defaultContact[0].email, contactID:defaultContact[0].contactID, available: defaultContact[0].available}
      }
    }
    else{
      auxInputFields.availableWarehouses = ""
      auxInputFields.shippingAddress = {city: "", zip: "", country:'Germany', address: ""}
      auxInputFields.recipient = {name: "",recipientID: ""}
      setContactField(null)
    }
    setInputFieldsGlobal([auxInputFields])
  }

 

  const setContactField = (event) =>{
    var auxInputFields = inputFieldsGlobal[0];
    if(event){
      auxInputFields.contact = {name: event.value, number: event.number , email: event.email ,contactID: event.contactID, available: event.available}
    }
    else{
      auxInputFields.contact = {name: "", number: "", email: "" ,contactID: "", available: ""}
    }
    setInputFieldsGlobal([auxInputFields])
  }  


  const checkEmptyValues = (item) => {
    if (
      item.client.clientID.length === 0 ||
      item.client.name.length === 0 ||
      item.invoiceStamp.length === 0 ||
      item.tos.length === 0 ||
      item.availableWarehouses.length === 0 ||
      item.contact.name.length  === 0 ||
      item.contact.number.length  === 0 ||
      item.contact.email.length  === 0 ||
      item.deliveryAt.length  === 0 ||
      item.lineItems[0].sku.length  === 0 ||
      item.lineItems[0].quantity.length  === 0 
      ) {
      return false
    }
    else {
      if (item.tos === 'Jour Fix' & (
        item.contractLength.length === 0 ||
        item.daysOfWeek.length === 0 ||
        item.frequency.length === 0 )
      ) {
        return false
      }
      else {
        return true;
      }
    }
  };
 
  const setClientField = (event) =>{
    var auxInputFields = inputFieldsGlobal[0];
    if(event){
      auxInputFields.client = {name: event.value, clientID: event.clientID}
      setRecipientField(null)
    }
    else{
      auxInputFields.client = {name: "", clientID: ""}
      setRecipientField(null)
    }
    setInputFieldsGlobal([auxInputFields])
  } 
  

  if(!visible) return null;
  else{
      return (
          <div className="overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
            {alertVisible &&
              <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <strong class="block font-bold">🧙‍♂️ Hello traveler... Double check that:</strong>
                <span class="block">- All the fields are not empty.</span>
                <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <svg onClick={() => setAlertVisible(false)} class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                </span>
              </div>
              }
              <form>
                  <div class="grid gap-6 mb-6 md:grid-cols-4">
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
                          onChange={event => setClientField(event)}
                        />
                      </div>
                      }
                      {!disabled &&
                      <div >
                        <label for="recipient" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Recipient</label>
                        <Select
                                className="basic-single"
                                classNamePrefix="select"
                                isClearable={true}
                                isSearchable={true}
                                name="recipient"
                                options={dropDownRecipients}
                                key={inputFieldsGlobal[0].client.clientID}
                                isOptionDisabled={(option) =>  option.client.clientID !== inputFieldsGlobal[0].client.clientID}
                                onChange={event => setRecipientField(event)}
                            />
                      </div> 
                      }
                      {numberContacts > 1  &&
                      <div >
                        <label for="contact" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Contact</label>
                        <Select
                                className="basic-single"
                                classNamePrefix="select"
                                isClearable={true}
                                isSearchable={true}
                                name="contact"
                                key={inputFieldsGlobal[0].recipient.recipientID}
                                options={dropDownContacts}
                                isOptionDisabled={(option) => (!validateContact(option,inputFieldsGlobal[0]))}
                                onChange={event => setContactField(event)}
                                defaultValue={edit && {value:inputFieldsGlobal[0].contact.name, label:inputFieldsGlobal[0].contact.name, email:inputFieldsGlobal[0].contact.email, number:inputFieldsGlobal[0].contact.number, contactID: inputFieldsGlobal[0].contact.contactID, available: inputFieldsGlobal[0].contact.available}}
                            />
                      </div> 
                      }
                      <div>
                          <label for="invoiceStamp" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Invoice Stamp</label>
                          <input  name="invoiceStamp" type="datetime-local" value={inputFieldsGlobal[0].invoiceStamp} onChange={event => handleChangeInputFieldsGlobal(event)} id="invoiceStamp" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Select date"/>
                      </div>
                      <div>
                        <label for="tos" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">TOS</label>
                        <Select
                                className="basic-single"
                                classNamePrefix="select"
                                isClearable={true}
                                isSearchable={true}
                                name="tos"
                                options={tosOptions}
                                defaultValue={edit && {value:inputFieldsGlobal[0].tos,label:inputFieldsGlobal[0].tos}}
                                onChange={event => {handleChangeSelect(event,"tos",true, inputFieldsGlobal[0]).then(function(value){setInputFieldsGlobal(value);SchedulingVisibility(inputFieldsGlobal[0],setVisibleTimeField,setVisibleFrequencyField,setVisibleContractLength)})}}
                            />
                      </div> 
                      <div>
                          <label style={{visibility: visibleTimeField  ? 'visible' : 'hidden' }} for="deliveryAt" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Delivery At </label>
                          <input style={{visibility: visibleTimeField  ? 'visible' : 'hidden' }} value={inputFieldsGlobal[0].deliveryAt} onChange={event => handleChangeInputFieldsGlobal(event)} id="deliveryAt" name="deliveryAt" type="datetime-local" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Select date"/>
                      </div>  
                      <div> 
                        <label style={{visibility: visibleFrequencyField  ? 'visible' : 'hidden' }} for="frequency" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Frequency</label>
                        <div style={{visibility: visibleFrequencyField  ? 'visible' : 'hidden' }} >
                          <Select
                                  style={{visibility: visibleFrequencyField  ? 'visible' : 'hidden' }} 
                                  className="basic-single"
                                  classNamePrefix="select"
                                  isClearable={true}
                                  isSearchable={true}
                                  name="Frequency"
                                  options={frequencyOptions}
                                  defaultValue={edit && {value:inputFieldsGlobal[0].frequency,label:inputFieldsGlobal[0].frequency}}
                                  onChange={event => handleChangeSelect(event,"frequency",true, inputFieldsGlobal[0]).then(function(value){setInputFieldsGlobal(value)})}
                              />
                        </div>
                      </div> 
                      <div>
                        <label style={{visibility: visibleContractLength ? 'visible' : 'hidden' }} for="contractLength" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Contract Length</label>
                        <div style={{visibility: visibleContractLength ? 'visible' : 'hidden' }} >
                        <Select
                                className="basic-single"
                                classNamePrefix="select"
                                isClearable={true}
                                isSearchable={true}
                                name="contractLength"
                                options={contractLengthOptions}
                                defaultValue={edit && {value:inputFieldsGlobal[0].contractLength,label:inputFieldsGlobal[0].contractLength}}
                                onChange={event => handleChangeSelect(event,"contractLength",true, inputFieldsGlobal[0]).then(function(value){setInputFieldsGlobal(value)})}
                            />
                        </div>
                        
                      </div> 
                      <div>
                      <label style={{visibility: visibleFrequencyField ? 'visible' : 'hidden' }} for="daysOfWeek" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Days of the Week</label>
                      <div style={{visibility: visibleFrequencyField  ? 'visible' : 'hidden' }} class="inline-flex mt-4">
                      <div class="flex items-center mr-4">
                    <input onChange={event => { handleChangeCheckbox(event, inputFieldsGlobal[0].daysOfWeek)}} name="inline-checkbox" type="checkbox" id="monday" value="monday" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <label for="inline-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">M</label>
                        </div>
                        <div class="flex items-center mr-4">
                          <input onChange={event => handleChangeCheckbox(event, inputFieldsGlobal[0].daysOfWeek)} name="inline-checkbox" type="checkbox" id="tuesday"  value="tuesday" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                          <label for="inline-2-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">T</label>
                        </div>
                        <div class="flex items-center mr-4">
                          <input onChange={event => handleChangeCheckbox(event, inputFieldsGlobal[0].daysOfWeek)} name="inline-checkbox" type="checkbox" id="wednesday" value="wednesday" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                          <label for="inline-checked-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">W</label>
                        </div>
                        <div class="flex items-center mr-4">
                          <input onChange={event => handleChangeCheckbox(event, inputFieldsGlobal[0].daysOfWeek)} name="inline-checkbox" type="checkbox" id="thursday" value="thursday" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                          <label for="inline-checked-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">T</label>
                        </div>
                        <div class="flex items-center mr-4">
                          <input onChange={event => handleChangeCheckbox(event, inputFieldsGlobal[0].daysOfWeek)} name="inline-checkbox" type="checkbox" id="friday" value="friday" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                          <label for="inline-checked-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">F</label>
                        </div>
                        <div class="flex items-center mr-4">
                          <input onChange={event => handleChangeCheckbox(event, inputFieldsGlobal[0].daysOfWeek)} name="inline-checkbox" type="checkbox" id="saturday" value="saturday" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                          <label for="inline-checked-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">S</label>
                        </div>
                        <div class="flex items-center mr-4">
                          <input onChange={event => handleChangeCheckbox(event, inputFieldsGlobal[0].daysOfWeek)} name="inline-checkbox" type="checkbox" id="sunday" value="sunday" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                          <label for="inline-checked-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">S</label>
                        </div>
                          </div>
                    </div>
                    </div>
                    {inputFieldsGlobal[0].lineItems.map(inputField => (
              <div key={inputField.id} style={{ gridColumn: "1 / -1" }}>
                <div class="grid gap-6 mb-6 md:grid-cols-4">
                  <div>
                    <label for="quantity" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Quantity</label>
                    <input name="quantity" value={inputField.quantity} onChange={event => handleSkuForm(event, inputField.id, "quantity", inputFieldsGlobal[0]).then(function (value) { setInputFieldsGlobal(value) })} type="number" id="quantity" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="1" required="" />
                  </div>
                  <div>
                    <label for="sku" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">SKU</label>
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isClearable={true}
                      isSearchable={true}
                      name="sku"
                      options={dropDownInventory}
                      isOptionDisabled={(option) => option.client.clientID !== inputFieldsGlobal[0].client.clientID}
                      defaultValue={edit && {value:inputField.sku,label:`${inputField.sku} (${inputField.title})`,client:inputFieldsGlobal[0].client.clientID,title:inputField.title, dimensions:inputField.dimensions, weight:inputField.weight,price:inputField.price, inventoryID: inputField.inventoryID}}
                      onChange={event => handleSkuForm(event, inputField.id, "sku", inputFieldsGlobal[0]).then(function (value) { setInputFieldsGlobal(value) })}
                    />
                  </div>
                  <div>
                    <button type="button" onClick={() => { handleAddFields(inputFieldsGlobal[0]).then(function (value) { setInputFieldsGlobal(value) }) }} class="mt-7 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">+</button>
                    <button type="button" disabled={inputFieldsGlobal[0]["lineItems"].length === 1} onClick={() => handleRemoveFields(inputField.id, inputFieldsGlobal[0]).then(function (value) { setInputFieldsGlobal(value) })} class="mt-7 ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">-</button>
                  </div>
                </div>
              </div>
            ))}
            {!edit &&
            <button type="button" onClick={() => {handleSubmit()}}class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
            }
            {edit &&
            <button type="button" onClick={() => {handleSubmit(false)}}  class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Edit</button>
            }  
            {(edit && delivery.seriesID && delivery.seriesID.length > 0)  &&
            <button type="button" onClick={() => {handleSubmit(true)}} class="ml-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Edit Series</button>
            }           
            <button type="button" onClick={() => {clearDeliveryForm()}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
            </form>
            </div>
          </div>
        );
  }
  }