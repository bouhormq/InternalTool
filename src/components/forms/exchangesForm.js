import React, { useEffect } from 'react'
import db from '../../firebase'
import { useState } from 'react'
import { setDoc,doc } from 'firebase/firestore';
import { UserAuth } from '../../context/authContex';
import {updateLineItemStats, handleSkuForm, handleRemoveFields, handleAddFields, checkEmptyValues} from './handleForm';
import { deliveryToFlow } from './handleForm';
import { Timestamp } from "@firebase/firestore";
import  Select  from 'react-select';
const orderid = require('order-id')('key');


export function ExchangeForm({visible,handleVisibility,delivery}) {
  const {dropDownInventory,user} = UserAuth();
  const [alertVisible, setAlertVisible] = useState(false);
  const [inputFieldsGlobal, setInputFieldsGlobal] = useState([{ 
    id: delivery.id,
    type: "Exchange", 
    totalDimensions:"",
    rider:delivery.rider,
    totalWeight: "",
    contact:delivery.contact,
    totalPrice: "",
    financialStatus:"",
    createdAt:"",
    createdBy:"",
    assignedWarehouse: delivery.assignedWarehouse,
    fulfillmentStatus:'success', 
    lineItems: [
      { id: orderid.generate(), quantity: "", sku: "", skuInt: "", description: ""},
    ],
    deliveryID: delivery.deliveryID,
    client: delivery.client,
    invoiceStamp: "", 
    deliveryAt: delivery.deliveryAt, 
    recipient: delivery.recipient, 
    availableWarehouses: delivery.availableWarehouses, 
    shippingAddress: delivery.shippingAddress,  
    timeline:delivery.timeline, 
    expectedTime:delivery.expectedTime, 
    suggestedTimeOut:delivery.suggestedTimeOut, 
    deliveryDistance:delivery.deliveryDistance, 
    comments: delivery.comments,
    flowID: "",
    sms: delivery.sms,

  }
  ]);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputFieldsGlobal[0].lineItems[0].sku.length  !== 0 || inputFieldsGlobal[0].lineItems[0].quantity.length  !== 0 ) { 
      setAlertVisible(false)
      handleVisibility(false)
      setInputFieldsGlobal(updateLineItemStats(inputFieldsGlobal[0].lineItems,inputFieldsGlobal[0]))
      inputFieldsGlobal[0].createdAt = Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})))
      inputFieldsGlobal[0].createdBy = "test@email.com"
      inputFieldsGlobal[0].invoiceStamp = Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})))
      await setDoc(doc(db, "exchanges", inputFieldsGlobal[0].deliveryID), inputFieldsGlobal[0]);
      await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/exchanges/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
      await setDoc(doc(db, "contacts", `${inputFieldsGlobal[0].contact.contactID}/exchanges/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
      await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/contacts/${inputFieldsGlobal[0].contact.contactID}/exchanges/${inputFieldsGlobal[0].deliveryID}`), inputFieldsGlobal[0])
      await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}`), { updatedAt: Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}))), updatedBy: "test@email.com" }, { merge: true }); 
      await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client.clientID}/contacts/${inputFieldsGlobal[0].contact.contactID}`), { updatedAt: Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}))), updatedBy: "test@email.com" }, { merge: true }); 
      await setDoc(doc(db, "contacts", `${inputFieldsGlobal[0].contact.contactID}`), { updatedAt: Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}))), updatedBy: "test@email.com" }, { merge: true });
      delivery.exchanged = true
      await setDoc(doc(db, "orders", inputFieldsGlobal[0].deliveryID), delivery);
      await setDoc(doc(db, "clients", `${delivery.client.clientID}/orders/${delivery.deliveryID}`), delivery)
      await setDoc(doc(db, "contacts", `${delivery.contact.contactID}/orders/${delivery.deliveryID}`), delivery)
      await setDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}/orders/${delivery.deliveryID}`), delivery)
      await setDoc(doc(db, "clients", `${delivery.client.clientID}`), { updatedAt: Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}))), updatedBy: "test@email.com" }, { merge: true }); 
      await setDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}`), { updatedAt: Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}))), updatedBy: "test@email.com" }, { merge: true }); 
      await setDoc(doc(db, "contacts", `${delivery.contact.contactID}`), { updatedAt: Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}))), updatedBy: "test@email.com" }, { merge: true });
      deliveryToFlow(inputFieldsGlobal[0],true,user)
      clearDeliveryForm()
    }
    else {
      setAlertVisible(true)
    }
  };

  const clearDeliveryForm = () => {
    setInputFieldsGlobal([
      { 
        id: delivery.id,
        type: "Exchange", 
        totalDimensions:"",
        rider:delivery.rider,
        totalWeight: "",
        contact:delivery.contact,
        totalPrice: "",
        financialStatus:"",
        createdAt:"",
        createdBy:"",
        assignedWarehouse: delivery.assignedWarehouse,
        fulfillmentStatus:'success', 
        lineItems: [
          { id: orderid.generate(), quantity: "", sku: "", skuInt: "", description: ""},
        ],
        deliveryID: delivery.deliveryID,
        exchangeID: "", 
        client: delivery.client,
        invoiceStamp: "", 
        deliveryAt: delivery.deliveryAt, 
        recipient: delivery.recipient, 
        availableWarehouses: delivery.availableWarehouses, 
        shippingAddress: delivery.shippingAddress,  
        timeline:delivery.timeline, 
        expectedTime:delivery.expectedTime, 
        suggestedTimeOut:delivery.suggestedTimeOut, 
        deliveryDistance:delivery.deliveryDistance, 
        comments: delivery.comments,
        flowID: `D-E-${delivery.id}`,
        sms: delivery.sms,
    
      }
    ])
    setAlertVisible(false)
    handleVisibility(false)
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
              <form onSubmit={handleSubmit}>
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
                      isOptionDisabled={(option) => option.client.clientID !== delivery.client.clientID}
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
            <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>        
            <button type="button" onClick={() => {clearDeliveryForm()}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
            </form>
            </div>
          </div>
        );
  }
  }
