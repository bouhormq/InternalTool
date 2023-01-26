/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useRef, useEffect } from 'react'
import { classNames } from './utils'
import db from '../firebase'
import axios from 'axios'
import { useAsyncDebounce } from 'react-table'
import timer from "../media/timer.png"
import complete from "../media/complete.png"
import bike from "../media/bike.png"
import back from "../media/back.png"
import cancell from "../media/cancell.png"
import cancelled from "../media/cancelled.png"
import failure from "../media/failure.png"
import edit from "../media/edit.png"
import check from "../media/check.png"
import exchange from "../media/exchange.png"
import { TimeForm } from './forms/timeForm'
import { CancelForm } from './forms/cancelForm'
import { collection, getDocs, query, setDoc, doc, getDoc, deleteDoc, where } from 'firebase/firestore';
import { ExportToExcel } from "./excelfile.js"
import Select from 'react-select'
import { UserAuth } from '../context/authContex'
import Editable from './forms/editable'
import { checkEmptyValues, deleteSeries } from './forms/handleForm'
import { WarehouseForm } from './forms/warehouseForm'
import { ContactForm } from './forms/contactForm'
import {InventoryForm} from './forms/inventoryForm'
import {RecipientForm} from './forms/recipientForm'
import {FlowsForm} from './forms/flowsForm'
import { DeliveryForm } from './forms/deliveryForm'
import { ExchangeForm } from './forms/exchangesForm'
import { CommentsForm } from './forms/commentsForm'
const orderid = require('order-id')('key');


// This is a custom filter UI for selecting
// a unique option from a list
export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id, render },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set()
    preFilteredRows.forEach(row => {
      options.add(row.values[id])
    })
    return [...options.values()]
  }, [id, preFilteredRows])

  // Render a multi-select box
  return (
    <label className="flex gap-x-2 items-baseline">
      <span className="text-gray-700">{render("Header")}: </span>
      <select
        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        name={id}
        id={id}
        value={filterValue}
        onChange={e => {
          setFilter(e.target.value || undefined)
        }}
      >
        <option value="">All</option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length
  const [value, setValue] = React.useState(globalFilter)
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined)
  }, 200)

  return (
    <label className="flex gap-x-2 items-baseline">
      <div class="relative -z-10">
        <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
          <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input
          type="text"
          class="block p-2 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={value || ""}
          onChange={e => {
            setValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={`${count} records...`}
        />
      </div>
    </label>
  )
}


export async function Fulfil(row) {
  /*let shop = row.shop
  let order_id = row.id
  let fulfillment_id = row.id
  let appdocRef = doc(db, "app-sessions", "offline_"+shop);
  let appdocSnap = await getDoc(appdocRef);
  if(appdocSnap.exists()){
    const app_session = appdocSnap.data();
    await axios.post(
      `https://0dfc15a9470679b09207ae8ba56a3354:472e3009fef7c56c7e90c596cef543e1@${app_session.shop}/admin/api/2022-04/orders/${order_id}/fulfillments/${fulfillment_id}/complete.json`,
       {
        headers: {
          'X-Shopify-Access-Token': app_session.accessToken,
        },
      }).catch(function (error) {
      console.log(error.response.data);
    });}*/
}
export async function EditTime(row) {
  /*let shop = row.shop
  let order_id = row.id
  let fulfillment_id = row.id
  let appdocRef = doc(db, "app-sessions", "offline_"+shop);
  let appdocSnap = await getDoc(appdocRef);
  if(appdocSnap.exists()){
    const app_session = appdocSnap.data();
    await axios.post(
      `https://0dfc15a9470679b09207ae8ba56a3354:472e3009fef7c56c7e90c596cef543e1@${app_session.shop}/admin/api/2022-04/orders/${order_id}/fulfillments/${fulfillment_id}/complete.json`,
       {
        headers: {
          'X-Shopify-Access-Token': app_session.accessToken,
        },
      }).catch(function (error) {
      console.log(error.response.data);
    });}*/
}



export function DateField({ value }) {
  return (
    <span>
      {new Date(value.slice(0, 10)).toDateString() + " - " + value.slice(11, 19)}
    </span>
  );
}

export function ShippingField({ value }) {
  return (
    <span>
      {value.address + ", " + value.city + ", " + value.postalCode + ", " + value.country}
    </span>
  );
}

export function ItemsField({ value }) {
  let items = ""
  if(value !== undefined && value !== null){
    for (let i = 0; i < value.length; ++i) {
      items += value[i].quantity + "x " + value[i].description + " (" + value[i].sku + ")";
      if (i !== value.length - 1) {
        items += ", "
      }
    }
  }
  return (
    <span>
      {items}
    </span>
  );
}

export function DateDeliveryField({ value }) {
  if(value){
    return (
      <span>
        {value.toDate().toLocaleString("sv", { timeZone: "Europe/Berlin" })}
      </span>
    );
  }
}

export function ExportClient({ value, row }) {
  return (
    <ExportToExcel client={row.name} />
  );
}


export function ContentDeliveryField({ value }) {
  return (
    <span>
      {value}
    </span>
  );
}
export function StateDeliveryField({ value }) {
  return (
    <span
      className={
        classNames(
          "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm ",
          value === 'SUCCESS' ? "bg-emerald-500	 text-emerald-100" : null,
          value !== 'SUCCESS' ? "bg-red-100 text-red-800" : null,
        )
      }
    >
      {value}
    </span>
  );
}

export const PostalCodes = ({ values }) => {
  // Loop through the array and create a badge-like component instead of a comma-separated string
  return (
    <>
    <span>[</span>
      {values.map((postal_code, idx) => {
        if(idx !== values.length-1){
          return (
            <span key={idx} className="badge">
              {postal_code + ", "}
            </span>
          );
        }
        else{
          return (
            <span key={idx} className="badge">
              {postal_code}
            </span>
          );
        }
      })}
      <span>]</span>
    </>
  );
};


//open: The fulfillment has been acknowledged by the service and is in processing.
//inProgress: The order is being fulfilled.
//success: The fulfillment was successful.
//cancelled: The fulfillment was cancelled.
//failure: The fulfillment request failed.

export const sendMessage = async (message, user) => {
  await setDoc(doc(db, "messages", message.messageID), message)
  await setDoc(doc(db, "clients", `${message.client.clientID}/messages/${message.messageID}`), message)
  await setDoc(doc(db, "clients", `${message.client.clientID}/contacts/${message.contact.contactID}/messages/${message.messageID}`), message)
  await setDoc(doc(db, "contacts", `${message.contact.contactID}/messages/${message.messageID}`), message)
  await setDoc(doc(db, "clients", `${message.client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true }); 
  await setDoc(doc(db, "clients", `${message.client.clientID}/contacts/${message.contact.contactID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true }); 
  await setDoc(doc(db, "contacts", `${message.contact.contactID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });
}

export function MessageAlert({ handleVisibility, visible, delivery }) {
  const { dropDownRiders,user } = UserAuth();
  const inputRef = useRef();
  const [inputFields, setInputFields] = useState([delivery])
  const [warehouseOptions, setWarehouseOptions] = useState([])
  const [alertVisible, setAlertVisible] = useState(false);
  const [task, setTask] = useState(`Hey ${delivery.contact.name}, wir liefern pünktlich um ${delivery.deliveryAt.split('T').pop()} Uhr an ${delivery.recipient.name}. Bitte benachrichtige das Servicepersonal für eine reibungslose Übergabe.\n\n Dein OneSpot Team. Let’s go! 🚴`);
  let message = {
    channelId: '9127c97589944871a4b6488920d43dc7',
    deliveryID: delivery.deliveryID,
    messageID: "",
    id:"",
    contact: delivery.contact,
    to: delivery.contact.number,
    client: delivery.client,
    daily: false,
    createdBy: user.email,
    createdAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}),
    type: 'text',
    content: {
      text: task
    }
  }
  useEffect(() => {
    var availableWarehouses = []
    for (var i = 0; i < delivery.availableWarehouses.length; ++i) {
      availableWarehouses.push({ value: delivery.availableWarehouses[i], label: delivery.availableWarehouses[i] })
    }
    setWarehouseOptions(availableWarehouses)
  }, [])

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    if (inputFields[0].rider.riderID.length !== 0 && inputFields[0].assignedWarehouse.length !== 0) {
      if (type === "SMS") {
        var id = orderid.generate()
        var messageID = `${delivery.client.clientID}-${delivery.contact.contactID}-${delivery.id}`
        message.id = id
        message.messageID = messageID
        inputFields[0].sms.push(messageID)
        sendMessage(message, user);
      }
      inputFields[0].fulfillmentStatus = "inProgress"
      console.log(inputFields[0])
      if (delivery.type === "Order") {
        await setDoc(doc(db, "orders", inputFields[0].deliveryID), inputFields[0]);
        await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}/orders/${inputFields[0].deliveryID}`), inputFields[0])
        await setDoc(doc(db, "contacts", `${inputFields[0].contact.contactID}/orders/${inputFields[0].deliveryID}`), inputFields[0])
        await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}/contacts/${inputFields[0].contact.contactID}/orders/${inputFields[0].deliveryID}`), inputFields[0])
        await setDoc(doc(db, "riders", `${inputFields[0].rider.riderID}/orders/${inputFields[0].deliveryID}`), inputFields[0])
      }
      else if (delivery.type === "Return") {
        await setDoc(doc(db, "returns", inputFields[0].deliveryID), inputFields[0]);
        await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}/returns/${inputFields[0].deliveryID}`), inputFields[0])
        await setDoc(doc(db, "contacts", `${inputFields[0].contact.contactID}/returns/${inputFields[0].deliveryID}`), inputFields[0])
        await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}/contacts/${inputFields[0].contact.contactID}/returns/${inputFields[0].deliveryID}`), inputFields[0])
        await setDoc(doc(db, "riders", `${inputFields[0].rider.riderID}/returns/${inputFields[0].deliveryID}`), inputFields[0])
      }
      handleVisibility(false);
      setAlertVisible(false)
      await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true }); 
      await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}/contacts/${inputFields[0].contact.contactID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true }); 
      await setDoc(doc(db, "contacts", `${inputFields[0].contact.contactID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });
    }
    else {
      setAlertVisible(true)
    }
  };

  const setRiderField = (event) => {
    var auxInputFields = inputFields[0];
    if(event){
      setTask(`Hey ${delivery.contact.name}, wir liefern pünktlich um ${delivery.deliveryAt.split('T').pop()} Uhr an ${delivery.recipient.name}. Bitte benachrichtige das Servicepersonal für eine reibungslose Übergabe.
      Diese Nummer wird nicht betreut. 
      Last-Minute Stornierung, Verspätung oder Änderungswünsche? ${event.value} ist für dich da: ${event.number}. 
      Dein OneSpot Team. Let’s go! 🚴
      `);      
      auxInputFields.rider = { name: event.value, lastName: event.lastName, number: event.number, riderID: event.riderID }
    }
    else{
      setTask(`Hey ${delivery.contact.name}, wir liefern pünktlich um ${delivery.deliveryAt.split('T').pop()} Uhr an ${delivery.recipient.name}. Bitte benachrichtige das Servicepersonal für eine reibungslose Übergabe.\n\n Dein OneSpot Team. Let’s go! 🚴`);  
      auxInputFields.rider = { name: "", lastName: "", number: "", riderID: ""}
    }
    setInputFields([auxInputFields])
  }

  const setWarehouseField = (event) => {
    var auxInputFields = inputFields[0];
    if(event){
      auxInputFields.assignedWarehouse = event.value
    }
    else{
      auxInputFields.assignedWarehouse = ""
    }
    setInputFields([auxInputFields])
  }


  if (!visible) return null;
  else {
    return (
      <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
        {alertVisible &&
              <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <strong class="block font-bold">🧙‍♂️ Hello traveler... Double check that:</strong>
                <span class="block">- All the fields are not empty.</span>
                <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <svg onClick={() => setAlertVisible(false)} class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                </span>
              </div>}
          <Select
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                marginBottom: "8px",
              }),
            }}
            className="basic-single"
            classNamePrefix="select"
            isClearable={true}
            isSearchable={true}
            name="sku"
            options={dropDownRiders}
            onChange={event => setRiderField(event)}
          />
          <Select
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                marginBottom: "8px",
              }),
            }}
            className="basic-single"
            classNamePrefix="select"
            isClearable={true}
            isSearchable={true}
            name="sku"
            options={warehouseOptions}
            onChange={event => setWarehouseField(event)}
          />
          <form onSubmit={handleSubmit}>
            <div class="grid gap-6 mb-6 md:grid-cols-1">
              <div>
                <div class="bg-orange-500 text-white font-bold rounded-t px-4 py-2">
                  The following SMS will be sent out to {delivery.contact.name} with the number {delivery.contact.number}
                </div>
                <div class="border border-t-0 border-orange-400 rounded-b bg-red-100 px-4 py-3 text-orange-700 mb-2">
                  <Editable
                    text={task}
                    placeholder="Write a task name"
                    childRef={inputRef}
                    type="input"
                    className="inline-block indent-0"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      name="task"
                      className="indent-0 inline-block shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-blue-300"
                      placeholder="Write a task name"
                      value={task}
                      onChange={e => { setTask(e.target.value)}}
                    />
                  </Editable>
                </div>
              </div>
            </div>
            <button type="button" onClick={e => { handleSubmit(e, "SMS") }} class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Deliver with SMS</button>
            <button type="button" onClick={e => { handleSubmit(e, null) }} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Deliver without SMS</button>
            <button type="button" onClick={() => { handleVisibility(false); setAlertVisible(false) }} class="ml-5 text-white bg-slate-700 hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
          </form>
        </div>
      </div>
    );
  }
}




export  async function handleOrderFlow(delivery, type, user){
  console.log("handleOrderFlow",delivery,type,user)
  for (let i = 0; i < delivery.lineItems.length; ++i) {
    delivery.lineItems[i].quantity = Number(delivery.lineItems[i].quantity)
    const docRef = doc(db, "inventory", delivery.lineItems[i].inventoryID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      let product = docSnap.data()
      if (type === "incoming") {
        product.inventory[delivery.assignedWarehouse].inventoryQuantity = product.inventory[delivery.assignedWarehouse].inventoryQuantity + delivery.lineItems[i].quantity
        product.inventoryTotalStock = product.inventoryTotalStock + delivery.lineItems[i].quantity
      }
      else if (type === "outgoing") {
        product.inventory[delivery.assignedWarehouse].inventoryQuantity = product.inventory[delivery.assignedWarehouse].inventoryQuantity - delivery.lineItems[i].quantity
        product.inventoryTotalStock = product.inventoryTotalStock - delivery.lineItems[i].quantity
      }
      product.updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin" })
      product.updatedBy = user.email
      await setDoc(doc(db, "inventory", delivery.lineItems[i].inventoryID), product)
      await setDoc(doc(db, "clients", `${delivery.client.clientID}/inventory/${delivery.lineItems[i].inventoryID}`), product)
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }
};

async function goBack(delivery,user) {
  let oldStatus = delivery.fulfillmentStatus
  if (delivery.type === "Order") {
    console.log("OUT")
    if (oldStatus === "success") {
      console.log("IN1")
      handleOrderFlow(delivery, "incoming",user)
      await deleteDoc(doc(db, "riders", `${delivery.rider.riderID}/orders/${delivery.deliveryID}`));
    }
    await deleteDoc(doc(db, "flows", `D-O-${delivery.deliveryID}`));
    await deleteDoc(doc(db, "clients", `${delivery.client.clientID}/flows/D-O-${delivery.deliveryID}`));
    await deleteDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}/flows/D-O-${delivery.deliveryID}`));
    await deleteDoc(doc(db, "contacts", `${delivery.contact.contactID}/flows/D-O-${delivery.deliveryID}`));
    if(delivery.exchanged === true){
      console.log("IN2")
      const docRef = doc(db, "exchanges", delivery.deliveryID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        let exchange = docSnap.data()
        handleOrderFlow(exchange, "outgoing",user)
      }
      await deleteDoc(doc(db, "exchanges", delivery.exchangeID));
      await deleteDoc(doc(db, "clients", `${delivery.client.clientID}/exchanges/${delivery.exchangeID}`));
      await deleteDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}/exchanges/${delivery.exchangeID}`));
      await deleteDoc(doc(db, "contacts", `${delivery.contact.contactID}/exchanges/${delivery.exchangeID}`));
      await deleteDoc(doc(db, "flows", `D-E-${delivery.deliveryID}`));
      await deleteDoc(doc(db, "clients", `${delivery.client.clientID}/flows/D-E-${delivery.deliveryID}`));
      await deleteDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}/flows/D-E-${delivery.deliveryID}`));
      await deleteDoc(doc(db, "contacts", `${delivery.contact.contactID}/flows/D-E-${delivery.deliveryID}`));
    }
    delivery.fulfillmentStatus = "open"
    delivery.flowID = ""
    delivery.assignedWarehouse = ""
    delivery.exchanged = false
    delivery.exchange = false
    delivery.comments = ""
    delivery.rider = {name:"",lastName:"",number:""}
    delivery.cancelledAt = ""
    delivery.cancelReason = ""
    await setDoc(doc(db, "orders", delivery.deliveryID), delivery);
    await setDoc(doc(db, "clients", `${delivery.client.clientID}/orders/${delivery.deliveryID}`), delivery)
    await setDoc(doc(db, "contacts", `${delivery.contact.contactID}/orders/${delivery.deliveryID}`), delivery)
    await setDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}/orders/${delivery.deliveryID}`), delivery)
  }
  else if (delivery.type === "Return") {
    if (oldStatus === "success" ) {
      handleOrderFlow(delivery, "outgoing",user)
      await deleteDoc(doc(db, "riders", `${delivery.rider.riderID}/returns/${delivery.deliveryID}`));
    }
    await deleteDoc(doc(db, "flows", `D-R-${delivery.deliveryID}`));
    await deleteDoc(doc(db, "clients", `${delivery.client.clientID}/flows/D-R-${delivery.deliveryID}`));
    delivery.fulfillmentStatus = "open"
    delivery.assignedWarehouse = ""
    delivery.exchanged = false
    delivery.exchange = false
    delivery.flowID = ""
    delivery.comments = ""
    delivery.rider = {name:"",lastName:"",number:""}
    delivery.cancelledAt = ""
    delivery.cancelReason = ""
    await setDoc(doc(db, "returns", delivery.deliveryID), delivery);
    await setDoc(doc(db, "clients", `${delivery.client.clientID}/returns/${delivery.deliveryID}`), delivery)
    await setDoc(doc(db, "contacts", `${delivery.contact.contactID}/returns/${delivery.deliveryID}`), delivery)
    await setDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}/returns/${delivery.deliveryID}`), delivery)
  }
  await setDoc(doc(db, "clients", `${delivery.client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true }); 
  await setDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true }); 
  await setDoc(doc(db, "contacts", `${delivery.contact.contactID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });
}

export function CancelAlert({ visible, handleVisibility }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    handleVisibility(false)
  };
  if (!visible) return null;
  else {
    return (
      <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            <div class="grid gap-6 mb-6 md:grid-cols-1">
              <div>
                <div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                  🧙‍♂️ Danger!!
                </div>
                <div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                  <p>If you delete this client you will no longer be able to fulfill deliveries for them</p>
                </div>
              </div>
            </div>
            <button type="submit" disabled class="text-white bg-slate-700 hover:bg-grey-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Delete</button>
            <button type="button" onClick={() => handleVisibility(false)} class="ml-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
          </form>
        </div>
      </div>
    );
  }
}

export function DeleteClient({ row }) {
  const [cancelFormVisible, setCancelFormVisible] = useState(false);
  return (
    <div style={{ display: "flex", justifyContent: "center" }} className="timer">
      <img onClick={() => setCancelFormVisible(true)} src={cancell} width={"20px"} style={{ display: "block", margin: "auto" }} />
      <CancelAlert handleVisibility={setCancelFormVisible} visible={cancelFormVisible} delivery={row} />
    </div>
  )
}

/*const addFlowRecord = async (row) => {
  const colRefFlows = collection(db, "flow" )
  const querySnapshot = await getDocs(query(colRefFlows));
  let flow = {}
  for(let i = 0; i < row.lineItems.length; ++i ){
    row.lineItems[i].quantity = Number(row.lineItems[i].quantity)
    const docRef = doc(db, "inventory", row.lineItems[i].skuInt);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      let product = docSnap.data()
      if(row.return_at){
        flow = {totalWeight:"",
          totalPrice:"",
          totalDimensions:"",
          createdAt:"",
          contact_email:"",
          updatedAt:"",
          lineItems: row.lineItems,
          client: row.client,
          invoiceStamp: "", 
          contactNumber: "", 
          warehouse: row.warehouse,
          flowNumber: `${querySnapshot.size}`,
          flowID:  `${row.client}-${querySnapshot.size}-${type}-${acronym}`,
          direction: type,
          type:'delivery'
        }
        product.inventory[row.warehouse].inventoryQuantity = product.inventory[row.warehouse].inventoryQuantity+row.lineItems[i].quantity
        product.inventoryTotalStock = product.inventoryTotalStock+row.lineItems[i].quantity
      }
      else if (row.deliveryAt){
        flow = {totalWeight:"",
          totalPrice:"",
          totalDimensions:"",
          createdAt:"",
          contact_email:"",
          updatedAt:"",
          lineItems: row.lineItems,
          client: row.client,
          invoiceStamp: "", 
          contactNumber: "", 
          warehouse: row.warehouse,
          flowNumber: `${querySnapshot.size}`,
          flowID:  `${row.client}-${querySnapshot.size}-${type}-${acronym}`,
          direction: type,
          type:'delivery'
        }
        product.inventory[row.warehouse].inventoryQuantity = product.inventory[row.warehouse].inventoryQuantity-row.lineItems[i].quantity
        product.inventoryTotalStock = product.inventoryTotalStock-row.lineItems[i].quantity
      }
      console.log(row.lineItems[i].skuInt,product)
      console.log(`${row.client}/inventory/${row.lineItems[i].sku}`,product)
      console.log(flow.flowID,flow)
      //await setDoc(doc(db, "inventory", row.lineItems[i].skuInt), product)
      //await setDoc(doc(db, "clients", `${row.client}/inventory/${row.lineItems[i].sku}`), product)
      //await setDoc(doc(db, "flow", flow.flowID), flow);
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }
}

async function deleteFlowRecord({row}) {
  let flow = {}
  for(let i = 0; i < row.lineItems.length; ++i ){
    row.lineItems[i].quantity = Number(row.lineItems[i].quantity)
    const docRef = doc(db, "inventory", row.lineItems[i].skuInt);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      let product = docSnap.data()
      if(row.return_at){
        product.inventory[row.warehouse].inventoryQuantity = product.inventory[row.warehouse].inventoryQuantity-row.lineItems[i].quantity
        product.inventoryTotalStock = product.inventoryTotalStock-row.lineItems[i].quantity
      }
      else if (row.deliveryAt){
        product.inventory[row.warehouse].inventoryQuantity = product.inventory[row.warehouse].inventoryQuantity+row.lineItems[i].quantity
        product.inventoryTotalStock = product.inventoryTotalStock+row.lineItems[i].quantity
      }
      await setDoc(doc(db, "inventory", row.lineItems[i].skuInt), product)
      await setDoc(doc(db, "clients", `${row.client}/inventory/${row.lineItems[i].sku}`), product)
      await deleteDoc(doc(db, "flow", flow.flowID));
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }
}*/

export function CancelAlertInventory({ visible, handleVisibility, inventory }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    await deleteDoc(doc(db, "inventory", inventory.inventoryID));
    await deleteDoc(doc(db, "clients", `${inventory.client.clientID}/inventory/${inventory.inventoryID}`))
    handleVisibility(false)
  };
  if (!visible) return null;
  else {
    return (
      <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            <div class="grid gap-6 mb-6 md:grid-cols-1">
              <div>
                <div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                  🧙‍♂️ Danger!!
                </div>
                <div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                  <p>If you delete this item you will no longer be able to fulfill deliveries of it</p>
                </div>
              </div>
            </div>
            <button type="submit" class="text-white bg-slate-700 hover:bg-grey-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Delete</button>
            <button type="button" onClick={() => handleVisibility(false)} class="ml-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
          </form>
        </div>
      </div>
    );
  }
}

export function ActionInventory({ row }) {
  const [cancelFormVisible, setCancelFormVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
  return (
    <div style={{ display: "flex", justifyContent: "center" }} className="timer">
      <img onClick={() => setCancelFormVisible(true)} src={cancell} width={"20px"} style={{ display: "block", margin: "auto" }} />
      <img onClick={() => setEditFormVisible(true)} src={edit} width={"20px"} style={{ display: "block", margin: "auto" }} />
      <CancelAlertInventory handleVisibility={setCancelFormVisible} visible={cancelFormVisible} inventory={row} />
      <InventoryForm handleVisibility={setEditFormVisible} visible={editFormVisible} inventory={row} key={row} edit={true} />
    </div>
  )
}

export async function FlowToInventory(flow,oposite,fulfillmentStatus,purge, user){
  console.log("FlowToInventory " + user)
  var auxflow = flow 
  if((purge !== true && (oposite !== null && fulfillmentStatus !== "failure" && !(fulfillmentStatus === "open" && flow.fulfillmentStatus === "failure"))) || (purge === true && flow.fulfillmentStatus === "success")){
    for (let i = 0; i < flow.lineItems.length; ++i) {
      const docRef = doc(db, "inventory", flow.lineItems[i].inventoryID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        let product = docSnap.data()
        if ((flow.direction === "incoming" && oposite) || (flow.direction === "outgoing" && !oposite) || flow.type === "Return") {
          product.inventory[flow.assignedWarehouse].inventoryQuantity = product.inventory[flow.assignedWarehouse].inventoryQuantity - flow.lineItems[i].quantity
          product.inventoryTotalStock = product.inventoryTotalStock - flow.lineItems[i].quantity
        }
        else if ((flow.direction === "incoming" && !oposite) || (flow.direction === "outgoing" && oposite) || flow.type === "Order") {
          product.inventory[flow.assignedWarehouse].inventoryQuantity = product.inventory[flow.assignedWarehouse].inventoryQuantity + flow.lineItems[i].quantity
          product.inventoryTotalStock = product.inventoryTotalStock + flow.lineItems[i].quantity
        }
        product.updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin" })
        product.updatedBy = user.email
        await setDoc(doc(db, "inventory", flow.lineItems[i].inventoryID), product)
        await setDoc(doc(db, "clients", `${flow.client.clientID}/inventory/${flow.lineItems[i].inventoryID}`), product)
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }
  } 
  if(fulfillmentStatus && flow.type !== "Return" && flow.type !== "Order"){
  auxflow.fulfillmentStatus = fulfillmentStatus
  auxflow.updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin" })
  auxflow.updatedBy = user.email
  auxflow.recipient = user.email
  if(fulfillmentStatus === "open" || fulfillmentStatus === "failure"){
    auxflow.recipient = ""
    if(fulfillmentStatus === "open"){
      auxflow.comments = ""
      auxflow.cancelReason = ""
      auxflow.cancelBy = ""
      auxflow.cancelAt = ""
    }
  }
  await setDoc(doc(db, "flows", auxflow.flowID), auxflow);
  await setDoc(doc(db, "clients", `${auxflow.client.clientID}/flows/${auxflow.flowID}`), auxflow)
  await setDoc(doc(db, "contacts", `${auxflow.contact.contactID}/flows/${auxflow.flowID}`), auxflow);
  await setDoc(doc(db, "clients", `${auxflow.client.clientID}/contacts/${auxflow.contact.contactID}/flows/${auxflow.flowID}`), auxflow)
  }
  if(purge){
    if(flow.type === "Return" ){
      await deleteDoc(doc(db, "returns", flow.deliveryID));
      await deleteDoc(doc(db, "clients", `${flow.client.clientID}/returns/${flow.deliveryID}`));
      await deleteDoc(doc(db, "clients", `${flow.client.clientID}/contacts/${flow.contact.contactID}/returns/${flow.deliveryID}`));
      await deleteDoc(doc(db, "contacts", `${flow.contact.contactID}/returns/${flow.deliveryID}`));
      await deleteDoc(doc(db, "flows", `D-R-${flow.deliveryID}`));
      await deleteDoc(doc(db, "clients", `${flow.client.clientID}/flows/D-R-${flow.deliveryID}`));
      await deleteDoc(doc(db, "clients", `${flow.client.clientID}/contacts/${flow.contact.contactID}/flows/D-R-${flow.deliveryID}`));
      await deleteDoc(doc(db, "contacts", `${flow.contact.contactID}/flows/D-R-${flow.deliveryID}`));
    }
    else if (flow.type === "Order"){
      if(flow.exchange){
          const docRef = doc(db, "exchanges", flow.deliveryID);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            let exchange = docSnap.data()
            handleOrderFlow(exchange, "outgoing",user)
          }
          await deleteDoc(doc(db, "exchanges", flow.deliveryID));
          await deleteDoc(doc(db, "clients", `${flow.client.clientID}/exchanges/${flow.deliveryID}`));
          await deleteDoc(doc(db, "clients", `${flow.client.clientID}/contacts/${flow.contact.contactID}/exchanges/${flow.deliveryID}`));
          await deleteDoc(doc(db, "contacts", `${flow.contact.contactID}/exchanges/${flow.deliveryID}`));
          await deleteDoc(doc(db, "flows", `D-E-${flow.deliveryID}`));
          await deleteDoc(doc(db, "clients", `${flow.client.clientID}/flows/D-E-${flow.deliveryID}`));
          await deleteDoc(doc(db, "clients", `${flow.client.clientID}/contacts/${flow.contact.contactID}/flows/D-E-${flow.deliveryID}`));
          await deleteDoc(doc(db, "contacts", `${flow.contact.contactID}/flows/D-E-${flow.deliveryID}`));
      }
      await deleteDoc(doc(db, "orders", flow.deliveryID));
      await deleteDoc(doc(db, "clients", `${flow.client.clientID}/orders/${flow.deliveryID}`));
      await deleteDoc(doc(db, "clients", `${flow.client.clientID}/contacts/${flow.contact.contactID}/orders/${flow.deliveryID}`));
      await deleteDoc(doc(db, "contacts", `${flow.contact.contactID}/orders/${flow.deliveryID}`));
      await deleteDoc(doc(db, "flows", `D-O-${flow.deliveryID}`));
      await deleteDoc(doc(db, "clients", `${flow.client.clientID}/flows/D-O-${flow.deliveryID}`));
      await deleteDoc(doc(db, "clients", `${flow.client.clientID}/contacts/${flow.contact.contactID}/flows/D-O-${flow.deliveryID}`));
      await deleteDoc(doc(db, "contacts", `${flow.contact.contactID}/flows/D-O-${flow.deliveryID}`));
    }
    else{
      await deleteDoc(doc(db, "flows", flow.flowID));
      await deleteDoc(doc(db, "clients", `${flow.client.clientID}/flows/${flow.flowID}`));
      await deleteDoc(doc(db, "contacts", `${auxflow.contact.contactID}/flows/${auxflow.flowID}`));
      await deleteDoc(doc(db, "clients", `${auxflow.client.clientID}/contacts/${auxflow.contact.contactID}/flows/${auxflow.flowID}`))
    }
  }
    await setDoc(doc(db, "clients", `${flow.client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true }); 
    await setDoc(doc(db, "clients", `${flow.client.clientID}/contacts/${flow.contact.contactID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true }); 
    await setDoc(doc(db, "contacts", `${flow.contact.contactID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });
}




export function CancelAlertFlow({ visible, handleVisibility, flow ,type}) {
  const {user} = UserAuth()
  const [cancelFormVisible, setCancelFormVisible] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    FlowToInventory(flow,true,null,true,user) 
    handleVisibility(false)
  };
  
  if (!visible) return null;
  else {
    return (
      <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        {!cancelFormVisible &&
        <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            <div class="grid gap-6 mb-6 md:grid-cols-1">
              <div>
                <div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                  🧙‍♂️ Careful Traveler!!
                </div>
                <div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                  <p>If you delete this Flow, it wont be showcased in the client report</p>
                </div>
              </div>
            </div>
            <button type="submit" class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">Delete</button>
            {flow.seriesID &&
            <button  type="button" onClick={() => {deleteSeries(flow);handleVisibility(false)}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">Delete Series</button>
            }
            {(flow.fulfillmentStatus === "open") &&
            <button type="button" onClick={() => {setCancelFormVisible(true)}} class="ml-5 text-white bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800">Cancel Instance</button>
            }
            {(flow.fulfillmentStatus === "inProgress") &&
            <button type="button" onClick={() => {setCancelFormVisible(true)}} class="ml-5 text-white bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800">Fail Instance</button>
            }
            <button type="button" onClick={() => handleVisibility(false)} class="ml-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
          </form>
        </div>
        }
        <CancelForm handleVisibility={setCancelFormVisible} visible={cancelFormVisible} delivery={flow}  flow={type ? false : true} type={type} handleFlowVisibility={handleVisibility}/>
      </div>
    );
  }
}

export function CancelAlertWarehouse({ visible, handleVisibility, warehouse }) {
  const {inventory, user} = UserAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    for(let i = 0; i < inventory.length; i++){
      delete inventory[i]["inventory"][warehouse.id]
      inventory[i].updatedBy = user.email
      inventory[i].updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
      await setDoc(doc(db, "clients", `${inventory[i].client.clientID}/inventory/${inventory[i].inventoryID}`), inventory[i])
      await setDoc(doc(db, "inventory", inventory[i].inventoryID), inventory[i]);
    }
    await deleteDoc(doc(db, "warehouses", warehouse.id));
    handleVisibility(false)
  };

  if (!visible) return null;
  else {
    return (
      <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            <div class="grid gap-6 mb-6 md:grid-cols-1">
              <div>
                <div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                  🧙‍♂️ Danger!!
                </div>
                <div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                  <p>If you delete this warehouse, you wont be able to use it for future deliveries.</p>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => handleVisibility(false)} class=" text-white bg-slate-700 hover:bg-grey-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
            <button type="submit"  class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">Delete</button>
          </form>
        </div>
      </div>
    );
  }
}

export function CancelAlertContacts({ visible, handleVisibility, contact }) {
  const {user} = UserAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    await deleteDoc(doc(db, "clients", `${contact.client.clientID}/reminders/${contact.reminderID}`))
    await deleteDoc(doc(db, "reminders", contact.reminderID))
    await deleteDoc(doc(db, "clients", `${contact.client.clientID}/contacts/${contact.contactID}`))
    await deleteDoc(doc(db, "contacts", contact.contactID))
    await setDoc(doc(db, "clients", `${contact.client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true }); 
    handleVisibility(false)
  };

  if (!visible) return null;
  else {
    return (
      <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            <div class="grid gap-6 mb-6 md:grid-cols-1">
              <div>
                <div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                  🧙‍♂️ Danger!!
                </div>
                <div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                  <p>If you delete this contact, you wont be able to use it for future deliveries.</p>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => handleVisibility(false)} class=" text-white bg-slate-700 hover:bg-grey-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
            <button type="submit"  class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">Delete</button>
          </form>
        </div>
      </div>
    );
  }
}

export function CancelAlertRecipient({ visible, handleVisibility, recipient }) {
  const {user} = UserAuth()
  const handleSubmit = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, "clients", `${recipient.client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });  
    await deleteDoc(doc(db, "clients", `${recipient.client.clientID}/recipients/${recipient.recipientID}`))
    await deleteDoc(doc(db, "recipients", recipient.recipientID))
    for(var i = 0; i < recipient.contacts.length; ++i){
      const docRef = doc(db, "contacts", `${recipient.contacts[i].contactID}`); 
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        let contact = docSnap.data()
        contact.updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
        contact.updatedBy = user.email
        const j = contact.recipients.findIndex(e => e.recipientID === recipient.recipientID);
        if (j > -1) {
          let recipients = contact.recipients
          recipients.splice(j,1)
          contact.recipients = recipients
        }
        await setDoc(doc(db, "clients", `${recipient.client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });  
        await setDoc(doc(db, "clients", `${recipient.client.clientID}/contacts/${recipient.contacts[i].contactID}`), contact)
        await setDoc(doc(db, "contacts", `${recipient.contacts[i].contactID}`), contact)
      }
    }
    handleVisibility(false)
  };

  if (!visible) return null;
  else {
    return (
      <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            <div class="grid gap-6 mb-6 md:grid-cols-1">
              <div>
                <div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                  🧙‍♂️ Danger!!
                </div>
                <div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                  <p>If you delete this recipient, you wont be able to use it for future deliveries.</p>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => handleVisibility(false)} class=" text-white bg-slate-700 hover:bg-grey-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
            <button type="submit"  class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">Delete</button>
          </form>
        </div>
      </div>
    );
  }
}

export function CancelAlertClient({ visible, handleVisibility, client }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    await deleteDoc(doc(db, "clients", client.clientID))
    handleVisibility(false)
  };

  if (!visible) return null;
  else {
    return (
      <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            <div class="grid gap-6 mb-6 md:grid-cols-1">
              <div>
                <div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                  🧙‍♂️ Danger!!
                </div>
                <div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                  <p>If you delete this client, you wont be able to use it for future deliveries and they will loose access to all their data.</p>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => handleVisibility(false)} class=" text-white bg-slate-700 hover:bg-grey-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
            <button type="submit"  class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">Delete</button>
          </form>
        </div>
      </div>
    );
  }
}


export function DailyReminderStatus({ row }) {
  let orange = (new Date(row.createdAt).getHours() < 16) & row.createdAt.startsWith(new Date().toISOString().split('T')[0])
  let green = (new Date(row.createdAt).getHours() === 16) & row.createdAt.startsWith(new Date().toISOString().split('T')[0])
  let red = ((new Date(row.createdAt).getHours() > 16) & row.createdAt.startsWith(new Date().toISOString().split('T')[0])) || !row.createdAt.startsWith(new Date().toISOString().split('T')[0])
  console.log(new Date(row.createdAt).getHours() < 16,row.createdAt.startsWith(new Date().toISOString().split('T')[0]))
  return(
    <span
      className={
        classNames(
          "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm ",
           orange & !green & !red ? "bg-amber-400 text-amber-800": null,
           green & !orange & !red ? "bg-emerald-500	 text-emerald-100": null,
           red & !green & !orange ? "bg-red-400 text-red-800": null,
        )
      }
    >
      {orange & !green & !red ? "PENDING": null}
      {green & !orange & !red ? "SENT": null}
      {red & !green & !orange ? "ALERT": null}
    </span>
  );
}

export function ActionFlow({ row }) {
  const {user} = UserAuth()
  const [cancelFormVisible, setCancelFormVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [commentsFormVisible, setCommentsFormVisible] = useState(false);
  if (row.type === "Warehouse Managment") {
    return (
      <div key={row.fulfillmentStatus} style={{ display: "flex", justifyContent: "center" }} className="timer">
        {row.fulfillmentStatus === "open" &&
        <img onClick={() => setCancelFormVisible(true)} src={cancell} width={"21px"} style={{ display: "block", margin: "auto" }} />
        }
        {row.fulfillmentStatus === "open" &&
        <img onClick={() => setCommentsFormVisible(true)} src={check} width={"22px"} style={{ display: "block", margin: "auto" }} />
        }
        {row.fulfillmentStatus !== "open" &&
        <img onClick={() => FlowToInventory(row,true,"open",null,user)} src={back} width={"22px"} style={{ display: "block", margin: "auto" }} />
        }
        {row.fulfillmentStatus === "open" &&
        <img onClick={() => setEditFormVisible(true)} src={edit} width={"23px"} style={{ display: "block", margin: "auto" }} />
        }
        <CancelAlertFlow handleVisibility={setCancelFormVisible} visible={cancelFormVisible} flow={row} />
        <FlowsForm class="z-50" handleVisibility={setEditFormVisible} visible={editFormVisible} flow={row} key={row} edit={true} />
        <CommentsForm visible={commentsFormVisible} handleVisibility={setCommentsFormVisible} delivery={row} flow={true}/>
      </div>
    )
  }
  else return null
}

export function ActionClient({ row }) {
  const [cancelFormVisible, setCancelFormVisible] = useState(false);
  return (
    <div style={{ display: "flex", justifyContent: "center" }} className="timer">
      <img onClick={() => setCancelFormVisible(true)} src={cancell} width={"20px"} style={{ display: "block", margin: "auto" }} />
      <CancelAlertClient handleVisibility={setCancelFormVisible} visible={cancelFormVisible} client={row} />
    </div>
  )
}

export function ActionWarehouse({ row }) {
  const [cancelFormVisible, setCancelFormVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
    return (
      <div style={{ display: "flex", justifyContent: "center" }} className="timer">
        <img onClick={() => setCancelFormVisible(true)} src={cancell} width={"20px"} style={{ display: "block", margin: "auto" }} />
        <img onClick={() => setEditFormVisible(true)} src={edit} width={"20px"} style={{ display: "block", margin: "auto" }} />
        <CancelAlertWarehouse handleVisibility={setCancelFormVisible} visible={cancelFormVisible} warehouse={row} />
        <WarehouseForm handleVisibility={setEditFormVisible} visible={editFormVisible} warehouse={row} key={row} edit={true} />
      </div>
    )
}

export function ActionRecipients({ row }) {
  const [cancelFormVisible, setCancelFormVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
    return (
      <div style={{ display: "flex", justifyContent: "center" }} className="timer">
        <img onClick={() => setCancelFormVisible(true)} src={cancell} width={"20px"} style={{ display: "block", margin: "auto" }} />
        <img onClick={() => setEditFormVisible(true)} src={edit} width={"20px"} style={{ display: "block", margin: "auto" }} />
        <CancelAlertRecipient handleVisibility={setCancelFormVisible} visible={cancelFormVisible} recipient={row} />
        <RecipientForm handleVisibility={setEditFormVisible} visible={editFormVisible} recipient={row} key={row} edit={true} />
      </div>
    )
}

export function ActionContacts({ row }) {
  const [cancelFormVisible, setCancelFormVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
    return (
      <div style={{ display: "flex", justifyContent: "center" }} className="timer">
        <img onClick={() => setCancelFormVisible(true)} src={cancell} width={"20px"} style={{ display: "block", margin: "auto" }} />
        <img onClick={() => setEditFormVisible(true)} src={edit} width={"20px"} style={{ display: "block", margin: "auto" }} />
        <CancelAlertContacts handleVisibility={setCancelFormVisible} visible={cancelFormVisible} contact={row} />
        <ContactForm handleVisibility={setEditFormVisible} visible={editFormVisible} contact={row} key={row} edit={true} />
      </div>
    )
}



export function StatusPillAction({ value, row }) {
  const {user} = UserAuth()
  const [timeFormVisible, seTimeFormVisible] = useState(false);
  const [cancelFormVisible, setCancelFormVisible] = useState(false);
  const [messageAlertVisible, setMessageAlertVisible] = useState(false);
  const [visibleExchangeForm, setVisibleExchangeForm] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const status = value 
  if (status.startsWith("open")) {
    return (
      <div  key={value} style={{ display: "flex", justifyContent: "center" }} className="bike">
        <img onClick={() => setCancelFormVisible(true)} src={cancell} width={"20px"} style={{ display: "block", margin: "auto" }} />
        <img onClick={() => setMessageAlertVisible(true)} src={bike} width={"25px"} style={{ display: "block", margin: "auto" }} />
        {row.fulfillmentStatus === "open" &&
          <img onClick={() => setEditFormVisible(true)} src={edit} width={"20px"} style={{ display: "block", margin: "auto" }} />
        }
        <CancelAlertFlow handleVisibility={setCancelFormVisible} visible={cancelFormVisible} flow={row} type={"cancelled"} key={"cancelled"}/>
        <MessageAlert handleVisibility={setMessageAlertVisible} visible={messageAlertVisible}  delivery={row} />
        <DeliveryForm handleVisibility={setEditFormVisible} visible={editFormVisible} type={row.type} delivery={row} key={row} edit={true} />
      </div>
    );
  }
  else if (status.startsWith("inProgress")) {
    return (
      <div key={value} style={{ display: "flex", justifyContent: "center" }} className="timer">
        <img onClick={() => setCancelFormVisible(true)} src={cancell} width={"20px"} style={{ display: "block", margin: "auto" }} />
        <img onClick={() => goBack(row,user)} src={back} width={"20px"} style={{ display: "block", margin: "auto" }} />
        <img onClick={() => seTimeFormVisible(true)} src={timer} width={"25px"} style={{ display: "block", margin: "auto" }} />
        <CancelAlertFlow handleVisibility={setCancelFormVisible} visible={cancelFormVisible} flow={row} type={"failure"} key={"failure"}/>
        <TimeForm handleVisibility={seTimeFormVisible} visible={timeFormVisible} delivery={row} timeline={row.timeline}/>
      </div>
    )
  }
  else if (status.startsWith("failure")) {
    return (
      <div key={value} className="failure">
        <img onClick={() => goBack(row,user)} src={back} width={"20px"} style={{ display: "block", margin: "auto" }} />
        <img src={failure} width={"20px"} style={{ display: "block", margin: "auto" }} />
      </div>
    )
  }
  else if (status.startsWith("cancelled")) {
    return (
      <div key={value} className="cancelled">
        <img onClick={() => goBack(row,user)} src={back} width={"20px"} style={{ display: "block", margin: "auto" }} />
        <img src={cancelled} width={"20px"} style={{ display: "block", margin: "auto" }} />
      </div>
    )
  }
  else {
    return (
      <div key={value} className="complete">
        <img onClick={() => { goBack(row,user) }} src={back} width={"20px"} style={{ display: "block", margin: "auto" }} />
        {(row.exchanged === false && row.exchange === true) &&
        <img onClick={() => setVisibleExchangeForm(true)} src={exchange} width={"21px"} style={{ display: "block", margin: "auto" }} />
        }
        <img src={complete} width={"22px"} style={{ display: "block", margin: "auto" }} />
        <ExchangeForm visible={visibleExchangeForm} handleVisibility={setVisibleExchangeForm} delivery={row} key={row}/>
      </div>
    )
  }
}

export function Edit({ value }) {
  const status = value ? value.toLowerCase() : "unknown";
  return (
    <span
      className={
        classNames(
          "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm bg-slate-300",
        )
      }
    >
      {"EDIT"}
    </span>
  );
}


export function StatusPill({ row }) {
  var status = row.fulfillmentStatus;
  if(status === "inProgress") status = "In Progress"


  return (
    <div>
      <span
        className={
          classNames(
            "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm ",
            status.startsWith("success") ? "bg-green-100 text-green-800" : null,
            status.startsWith("open") ? "bg-sky-100 text-sky-800" : null,
            status.startsWith("cancelled") ? "bg-orange-200 text-orange-800" : null,
            status.startsWith("failure") ? "bg-red-100 text-red-800" : null,
            status.startsWith("In Progress") ? "bg-indigo-100 text-indigo-800" : null,
          )
        }
      >
        {status}
      </span>
      {row.deliveryID.endsWith("R") &&
        <span
        className={
          classNames(
            "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm ",
            true ? "bg-purple-200 text-purple-800" : null
          )
        }
      >
        {"RESCHEDULED"}
      </span>
      }
    </div>
  );
}




export function StatusPillTotalInventory({ value }) {
  return (
    <span
      className={
        classNames(
          "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm ",
          value > 19 ? "bg-emerald-500	 text-emerald-100" : null,
          10 < value < 20 ? "bg-sky-100 text-sky-800" : null,
          value < 10 ? "bg-red-100 text-red-800" : null,
        )
      }
    >
      {value}
    </span>
  );
}

export function StatusPillInventory({ value, warehouses }) {
  return (
    <>
      {Object.keys(warehouses).map((warehouse, idx) => {
        return (
          <span
            key={idx}
            className={
              classNames(
                "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm ",
                value[warehouse].inventoryQuantity > 19 ? "bg-emerald-500	 text-emerald-100" : null,
                10 < value[warehouse].inventoryQuantity < 20 ? "bg-sky-100 text-sky-800" : null,
                value[warehouse].inventoryQuantity < 10 ? "bg-red-100 text-red-800" : null,
              )
            }
          >
            {warehouse + "-[" + value[warehouse].shelf.join(',') + "]: " + value[warehouse].inventoryQuantity}
          </span>
        );
      })}
    </>
  );
}

export default function Toggle({row}) {
  const [enabled, setEnabled] = useState(row.available);
  const {user} = UserAuth()
  const handleSubmit = async (e) => {
    e.preventDefault();
    let contact = row
    contact.available = !enabled
    contact.updatedAt = {updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})}
    contact.updatedBy = user.email
    await setDoc(doc(db, "contacts", contact.contactID), contact);
    await setDoc(doc(db, "clients", `${contact.client.clientID}/contacts/${contact.contactID}`), contact) 
    await setDoc(doc(db, "clients", `${contact.client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });  
    for(var i = 0; i < row.recipients.length; ++i){
      const docRef = doc(db, "recipients", `${contact.recipients[i].recipientID}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        let recipient = docSnap.data()
        for(var j = 0; j < recipient.contacts.length; ++j){
          if(recipient.contacts[j].contactID === contact.contactID){
            recipient.contacts[j].available = contact.available
            recipient.updatedAt = {updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})}
            recipient.updatedBy = user.email
            await setDoc(doc(db, "clients", `${contact.client.clientID}/recipients/${row.recipients[i].recipientID}`), recipient) 
            await setDoc(doc(db, "clients", `${contact.client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });  
            await setDoc(doc(db, "recipients", `${contact.recipients[i].recipientID}`), recipient) 
          }
        }
      }
    } 
  };


  return (
      <div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox"  class="sr-only peer" onChange={() => setEnabled(!enabled)} onClick={event => {handleSubmit(event)}} checked={enabled} ></input>
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
      </div>
  );
}

