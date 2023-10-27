import React, { useEffect } from 'react'
import db from '../../firebase'
import { useState } from 'react'
import { setDoc, doc } from 'firebase/firestore';
import { UserAuth } from '../../context/authContex';
import { Timestamp } from "@firebase/firestore";
import {deleteSeries,updateLineItemStats,handleSkuForm, handleChangeCheckbox, handleRemoveFields, handleAddFields, handleChangeSelect, tosOptions, frequencyOptions, contractLengthOptions, SchedulingVisibility } from './handleForm';
import Select from 'react-select';
const orderid = require('order-id')('key');




export function FlowsForm({ visible, handleVisibility, direction, edit ,flow}) {
  const { dropDownClients, dropDownInventory, dropDownWarehouses, dropDownContacts, user } = UserAuth();
  const [visibleFrequencyField, setVisibleFrequencyField] = useState(true);
  const [visibleTimeField, setVisibleTimeField] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [visibleContractLength, setVisibleContractLength] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [inputFieldsGlobal, setInputFieldsGlobal] = useState([
    {
      id: "",
      type: "Warehouse Managment",
      totalDimensions: {H:0,W:0,L:0},
      daysOfWeek: [],
      contractLength: "",
      totalWeight: 0,
      contact: {name: "" ,number: "" ,email: "", contactID: "", available: ""},
      totalPrice: 0,
      financialStatus: "",
      createdAt: "",
      createdBy: "",
      cancelledAt: "",
      cancelledBy: "",
      cancelReason: "",
      assignedWarehouse: "",
      updatedAt: "",
      updatedBy:"",
      fulfillmentStatus: 'open',
      lineItems: [
        { id: orderid.generate(), quantity: "", sku: "", skuInt: "", description: "", inventoryID: "" },
      ],
      flowID: "",
      client: {name:"",clientID:""},
      invoiceStamp: "",
      deliveryAt: "",
      recipient:"",
      tos: "",
      frequency: "",
      seriesID: "",
      direction: direction,
      comments: "",
      sms: []
    }
  ]);
  
  useEffect(() => {
    if(edit){
      setInputFieldsGlobal([flow])
      setDisabled(edit);
      if(flow.daysOfWeek.length > 0){
        flow.daysOfWeek.forEach(element => {
          if(document.getElementById(element)){
            document.getElementById(element).checked = true;
          }
        });
      }
      if(flow.tos !== "Jour Fix"){
        if(flow.tos === "Instant") setVisibleTimeField(false)
        setVisibleFrequencyField(false)
        setVisibleContractLength(false)
      }
    }
  }, [visible])


  async function handleSubmit(editSeries){
    if (checkEmptyValuesFlow(inputFieldsGlobal[0])) {
      console.log(inputFieldsGlobal[0])
      setAlertVisible(false)
      handleVisibility(false)
      if(editSeries) deleteSeries(flow)
      setInputFieldsGlobal(updateLineItemStats(inputFieldsGlobal[0].lineItems,inputFieldsGlobal[0]))
      inputFieldsGlobal[0].updatedAt = Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})))
      inputFieldsGlobal[0].updatedBy = "test@email.com"
      if(inputFieldsGlobal[0].tos === "Jour Fix" || !edit || (edit && editSeries)) {
        inputFieldsGlobal[0].createdAt = Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})))
        inputFieldsGlobal[0].createdBy = "test@email.com"
      }
      if (inputFieldsGlobal[0].tos !== "Jour Fix") {
        inputFieldsGlobal[0].seriesID = ""
        if(!edit || (edit && editSeries)) inputFieldsGlobal[0].id = orderid.generate()
        if(inputFieldsGlobal[0].tos === "Instant") inputFieldsGlobal[0].deliveryAt = Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})));
        if (inputFieldsGlobal[0].direction === "outgoing") {
          if(!edit || (edit && editSeries)) inputFieldsGlobal[0].flowID = `WM-O-${inputFieldsGlobal[0].client.clientID}-${inputFieldsGlobal[0].assignedWarehouse}-${inputFieldsGlobal[0].id}`
          await setDoc(doc(db, "flows", inputFieldsGlobal[0].flowID), inputFieldsGlobal[0]);
          await setDoc(doc(db, "contacts", `${inputFieldsGlobal[0].contact.contactID}/flows/${inputFieldsGlobal[0].flowID}`), inputFieldsGlobal[0])
          await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/flows/${inputFieldsGlobal[0].flowID}`), inputFieldsGlobal[0])
          await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/contacts/${inputFieldsGlobal[0].contact.contactID}/flows/${inputFieldsGlobal[0].flowID}`), inputFieldsGlobal[0])

        }
        else if (inputFieldsGlobal[0].direction  === "incoming") {
          if(!edit || (edit && editSeries)) inputFieldsGlobal[0].flowID = `WM-I-${inputFieldsGlobal[0].client.clientID}-${inputFieldsGlobal[0].assignedWarehouse}-${inputFieldsGlobal[0].id}`
          await setDoc(doc(db, "flows", inputFieldsGlobal[0].flowID), inputFieldsGlobal[0]);
          await setDoc(doc(db, "contacts", `${inputFieldsGlobal[0].contact.contactID}/flows/${inputFieldsGlobal[0].flowID}`), inputFieldsGlobal[0])
          await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/contacts/${inputFieldsGlobal[0].contact.contactID}/flows/${inputFieldsGlobal[0].flowID}`), inputFieldsGlobal[0])
          await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/flows/${inputFieldsGlobal[0].flowID}`), inputFieldsGlobal[0])
        }
      }
      else {
        function addMonths(numOfMonths, date) {
          var  aux = new Date(date)
          aux.setMonth(date.getMonth() + numOfMonths);

          return aux;
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
        var startDate =  new Date(inputFieldsGlobal[0].deliveryAt.seconds*1000)
        let endDate = addMonths(parseInt(inputFieldsGlobal[0].contractLength.substring(0, 2)), startDate)
        // Usage
        const dates = getDatesInRange(startDate, endDate)
        let send = false
        for (let i = 0; i < dates.length; i++) {
          var date = new Date(dates[i])
          if (dates[i].getDay() === 0 && inputFieldsGlobal[0].daysOfWeek.includes('sunday')) {
            inputFieldsGlobal[0].deliveryAt = Timestamp.fromDate(new Date(date))
            send = true
          }
          else if (dates[i].getDay() === 1 && inputFieldsGlobal[0].daysOfWeek.includes('monday')) {
            inputFieldsGlobal[0].deliveryAt = Timestamp.fromDate(new Date(date))
            send = true
          }
          else if (dates[i].getDay() === 2 && inputFieldsGlobal[0].daysOfWeek.includes('tuesday')) {
            inputFieldsGlobal[0].deliveryAt = Timestamp.fromDate(new Date(date))
            send = true
          }
          else if (dates[i].getDay() === 3 && inputFieldsGlobal[0].daysOfWeek.includes('wednesday')) {
            inputFieldsGlobal[0].deliveryAt = Timestamp.fromDate(new Date(date))
            send = true
          }
          else if (dates[i].getDay() === 4 && inputFieldsGlobal[0].daysOfWeek.includes('thursday')) {
            inputFieldsGlobal[0].deliveryAt = Timestamp.fromDate(new Date(date))
            send = true
          }
          else if (dates[i].getDay() === 5 && inputFieldsGlobal[0].daysOfWeek.includes('friday')) {
            inputFieldsGlobal[0].deliveryAt = Timestamp.fromDate(new Date(date))
            send = true
          }
          else if (dates[i].getDay() === 6 && inputFieldsGlobal[0].daysOfWeek.includes('saturday')) {
            inputFieldsGlobal[0].deliveryAt = Timestamp.fromDate(new Date(date))
            send = true
          }
          if (send) {
            if(!edit || (edit && editSeries)) inputFieldsGlobal[0].seriesID = seriesID
            if(!edit || (edit && editSeries)) inputFieldsGlobal[0].id = orderid.generate()
            if (inputFieldsGlobal[0].direction  === "outgoing") {
              inputFieldsGlobal[0].flowID = `WM-O-${inputFieldsGlobal[0].client.clientID}-${inputFieldsGlobal[0].assignedWarehouse}-${inputFieldsGlobal[0].id}`
              await setDoc(doc(db, "flows", inputFieldsGlobal[0].flowID), inputFieldsGlobal[0]);
              await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/flows/${inputFieldsGlobal[0].flowID}`), inputFieldsGlobal[0])
              await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/contacts/${inputFieldsGlobal[0].contact.contactID}/flows/${inputFieldsGlobal[0].flowID}`), inputFieldsGlobal[0])
              await setDoc(doc(db, "contacts", `${inputFieldsGlobal[0].contact.contactID}/flows/${inputFieldsGlobal[0].flowID}`), inputFieldsGlobal[0])
            }
            else if (inputFieldsGlobal[0].direction  === "incoming") {
              inputFieldsGlobal[0].flowID = `WM-I-${inputFieldsGlobal[0].client.clientID}-${inputFieldsGlobal[0].assignedWarehouse}-${inputFieldsGlobal[0].id}`
              await setDoc(doc(db, "flows", inputFieldsGlobal[0].flowID), inputFieldsGlobal[0]);
              await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/flows/${inputFieldsGlobal[0].flowID}`), inputFieldsGlobal[0])
              await setDoc(doc(db, "contacts", `${inputFieldsGlobal[0].contact.contactID}/flows/${inputFieldsGlobal[0].flowID}`), inputFieldsGlobal[0])
              await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/contacts/${inputFieldsGlobal[0].contact.contactID}/flows/${inputFieldsGlobal[0].flowID}`), inputFieldsGlobal[0])
            }
            send = false
          }
        } 
      }
      await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}`), { updatedAt: Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}))), updatedBy: "test@email.com" }, { merge: true }); 
      await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/contacts/${inputFieldsGlobal[0].contact.contactID}`), { updatedAt: Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}))), updatedBy: "test@email.com" }, { merge: true }); 
      await setDoc(doc(db, "contacts", `${inputFieldsGlobal[0].contact.contactID}`), { updatedAt: Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}))), updatedBy: "test@email.com" }, { merge: true });
      clearDeliveryForm()
    }
    else {
      setAlertVisible(true)
    }
  };

  const clearDeliveryForm = () => {
    setInputFieldsGlobal([
      {
        id: "",
        type: "Warehouse Managment",
        totalDimensions: {H:0,W:0,L:0},
        daysOfWeek: [],
        contractLength: "",
        totalWeight: 0,
        contact: {name: "" ,number: "" ,email: "", contactID: "", available: ""},
        totalPrice: 0,
        financialStatus: "",
        createdAt: "",
        createdBy: "",
        cancelledAt: "",
        cancelledBy: "",
        cancelReason: "",
        assignedWarehouse: "",
        updatedAt: "",
        updatedBy:"",
        fulfillmentStatus: 'open',
        lineItems: [
          { id: orderid.generate(), quantity: "", sku: "", skuInt: "", description: "", inventoryID: "" },
        ],
        flowID: "",
        client: {name:"",clientID:""},
        invoiceStamp: "",
        deliveryAt: "",
        recipient:"",
        tos: "",
        frequency: "",
        seriesID: "",
        direction: direction,
        comments: "",
        sms: []
      },
    ])
    setVisibleTimeField(true)
    setVisibleFrequencyField(true)
    setVisibleContractLength(true)
    setAlertVisible(false)
    handleVisibility(false)
  }

  const handleChangeInputFieldsGlobal = async (event) => {    
    const newInputFieldsGlobal = inputFieldsGlobal.map(i => {
      i[event.target.name] = Timestamp.fromDate(new Date(event.target.value)) 
      return i;
    })
    setInputFieldsGlobal(newInputFieldsGlobal)
  }


  const checkEmptyValuesFlow = (item) => {
    if (
      item.client.clientID.length === 0 ||
      item.client.name.length === 0 ||
      item.invoiceStamp.length === 0 ||
      item.tos.length === 0 ||
      item.assignedWarehouse.length === 0 ||
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

  const setContactField = (event) =>{
    var auxInputFields = inputFieldsGlobal[0];
    if(event){
      auxInputFields.contact = {name: event.value ,number: event.number ,email: event.email, contactID: event.contactID, available: event.available}
    }
    else{
      auxInputFields.contact = {name: "" ,number: "" ,email: "", contactID: "", available: ""}
    }
    setInputFieldsGlobal([auxInputFields])
  }

  const setClientField = (event) =>{
    var auxInputFields = inputFieldsGlobal[0];
    if(event){
      auxInputFields.client = {name: event.value, clientID: event.clientID}
      setContactField(null)
    }
    else{
      auxInputFields.client = {name: "", clientID: ""}
      setContactField(null)
    }
    setInputFieldsGlobal([auxInputFields])
  } 

  const setAssignedWarehouseField = (event) =>{
    var auxInputFields = inputFieldsGlobal[0];
    if(event){
      auxInputFields.assignedWarehouse = event.value
    }
    else{
      auxInputFields.assignedWarehouse = ""
    }
    setInputFieldsGlobal([auxInputFields])
  } 


  if (!visible) return null;
  else {
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
          <form >
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
              <div>
                <label for="contact" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Contact</label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isClearable={true}
                  isSearchable={true}
                  name="contact"
                  key={inputFieldsGlobal[0].client.clientID}
                  isOptionDisabled={(option) => option.available === false || option.clientID !== inputFieldsGlobal[0].client.clientID}
                  defaultValue={edit && {value:inputFieldsGlobal[0].contact.name, label:inputFieldsGlobal[0].contact.name, email:inputFieldsGlobal[0].contact.email, number:inputFieldsGlobal[0].contact.number, contactID: inputFieldsGlobal[0].contact.contactID, available: inputFieldsGlobal[0].contact.available}}
                  options={dropDownContacts}
                  onChange={event => setContactField(event)}
                />
              </div>
              {!disabled &&              
              <div>
                <label for="assignedWarehouse" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Warehouse</label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isClearable={true}
                  isSearchable={true}
                  name="assignedWarehouse"
                  options={dropDownWarehouses}
                  onChange={event => setAssignedWarehouseField(event)}
                />
              </div>
              }
              <div>
                <label for="invoiceStamp" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Invoice Stamp</label>
                <input name="invoiceStamp" type="datetime-local" key={inputFieldsGlobal[0].invoiceStamp} value={inputFieldsGlobal[0].invoiceStamp.seconds ? new Date(inputFieldsGlobal[0].invoiceStamp.seconds*1000).toISOString().replace(":00.000Z", "") : ""} onChange={event => handleChangeInputFieldsGlobal(event)} id="invoiceStamp" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Select date" />
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
                  onChange={event => { handleChangeSelect(event, "tos", true, inputFieldsGlobal[0]).then(function (value) { setInputFieldsGlobal(value); SchedulingVisibility(inputFieldsGlobal[0], setVisibleTimeField, setVisibleFrequencyField, setVisibleContractLength) }) }}
                />
              </div>
              <div>
                <label style={{ visibility: visibleTimeField ? 'visible' : 'hidden' }} for="deliveryAt" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Delivery At </label>
                <input style={{ visibility: visibleTimeField ? 'visible' : 'hidden' }} key={inputFieldsGlobal[0].deliveryAt} value={inputFieldsGlobal[0].deliveryAt.seconds ? new Date(inputFieldsGlobal[0].deliveryAt.seconds*1000).toISOString().replace(":00.000Z", "") : ""} onChange={event => handleChangeInputFieldsGlobal(event)} id="deliveryAt" name="deliveryAt" type="datetime-local" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Select date" />
              </div>
              <div>
                <label style={{ visibility: visibleFrequencyField ? 'visible' : 'hidden' }} for="frequency" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Frequency</label>
                <div style={{ visibility: visibleFrequencyField ? 'visible' : 'hidden' }} >
                  <Select
                    style={{ visibility: visibleFrequencyField ? 'visible' : 'hidden' }}
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={true}
                    isSearchable={true}
                    name="Frequency"
                    options={frequencyOptions}
                    defaultValue={edit && {value:inputFieldsGlobal[0].frequency,label:inputFieldsGlobal[0].frequency}}
                    onChange={event => handleChangeSelect(event, "frequency", true, inputFieldsGlobal[0]).then(function (value) { setInputFieldsGlobal(value) })}
                  />
                </div>
              </div>
              <div>
                <label style={{ visibility: visibleContractLength ? 'visible' : 'hidden' }} for="contractLength" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Contract Length</label>
                <div style={{ visibility: visibleContractLength ? 'visible' : 'hidden' }} >
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable={true}
                    isSearchable={true}
                    name="contractLength"
                    options={contractLengthOptions}
                    defaultValue={edit && {value:inputFieldsGlobal[0].contractLength,label:inputFieldsGlobal[0].contractLength}}
                    onChange={event => handleChangeSelect(event, "contractLength", true, inputFieldsGlobal[0]).then(function (value) { setInputFieldsGlobal(value) })}
                  />
                </div>

              </div>
              <div>
                <label style={{ visibility: visibleFrequencyField ? 'visible' : 'hidden' }} for="daysOfWeek" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Days of the Week</label>
                <div style={{ visibility: visibleFrequencyField ? 'visible' : 'hidden' }} class="inline-flex mt-4">

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
            {(edit && flow.seriesID && flow.seriesID.length > 0)  &&
            <button type="button" onClick={() => {handleSubmit(true)}} class="ml-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Edit Series</button>
            }           
            <button type="button" onClick={() => {clearDeliveryForm()}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
          </form>
        </div>
      </div>
    );
  }
}
