/* eslint-disable jsx-a11y/alt-text */
import React, {useState} from 'react'
import { classNames } from './utils'
import db from '../firebase'
import axios from 'axios'
import {useAsyncDebounce} from 'react-table'
import timer from "../media/timer.png"
import complete from "../media/complete.png"
import bike from "../media/bike.png"
import back from "../media/back.png"
import cancell from "../media/cancell.png"
import cancelled from "../media/cancelled.png"
import failure from "../media/failure.png"
import edit from "../media/edit.png"
import { TimeForm } from './timeForm'
import {CancelForm} from './cancelForm'
import { collection, getDocs,query,setDoc,doc,getDoc,deleteDoc } from 'firebase/firestore';
import {ExportToExcel} from "./excelfile.js"
  
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
           <div class="relative">
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
        {value.address + " " + value.address2 + ", " + value.zip + ", " + value.city + ", " + value.country } 
      </span>
    );
  }
  
  export function ItemsField({ value }) {
    let items = ""
    for(let i = 0; i < value.length; ++i){
      items += value[i].sku + ": " + value[i].quantity;
      if(i !== value.length-1){
        items +=  ", "
      }
    }
    return (
      <span>
        {items} 
      </span>
    );
  }

  export function DateDeliveryField({ value }) {
    if (value && value.endTime){
      return (
        <span>
          {value.endTime.toDate().toLocaleString("sv", { timeZone: "Europe/Berlin"})} 
        </span>
      );
    }
    else return null
  }

  export function ExportClient({ value,row }) {
      return (
            <ExportToExcel client={row.name}/>
      );
  }

  
  export function ContentDeliveryField({ value }) {
    if (value && value.text){
      return (
        <span>
          {value.text}
        </span>
      );
    }
    else return null
  }
  export function StateDeliveryField({ value }) {
    if(value && value.state){
      return (
        <span
          className={
            classNames(
              "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm ",
              value.state === 'SUCCESS' ? "bg-emerald-500	 text-emerald-100" : null,
              value.state !== 'SUCCESS' ? "bg-red-100 text-red-800" : null,
            )
          }
        >
          {value.state}
        </span>
      );
    }
    return null
  }
  

//open: The fulfillment has been acknowledged by the service and is in processing.
//in_progress: The order is being fulfilled.
//success: The fulfillment was successful.
//cancelled: The fulfillment was cancelled.
//failure: The fulfillment request failed.

const sendMessage = async (message,order) => {
  await setDoc(doc(db, "messages", `${order.client}-(${order.contactNumber})-(${new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})})`), message)
  await setDoc(doc(db, "clients", `${order.client}/messages/(${order.contactNumber})-(${new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})})`), message)
}

export function MessageAlert({handleVisibility,visible,inProgressOrder,order}) {
  let message = {
    client: order.client,
    channelId: '9127c97589944871a4b6488920d43dc7',
    to: order.contactNumber,
    type: 'text',
    content: {
      text: `Hey ${order.recipient}, deine Bestellung kommt in den nächsten 30 min ✨emissionsfrei - mit OneSpot 🌱⏱`
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    sendMessage(message,order);
    inProgressOrder(order);
    handleVisibility(false);
  };
  if(!visible) return null;
  else{
      return (
          <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
              <form onSubmit={handleSubmit}>
                  <div class="grid gap-6 mb-6 md:grid-cols-1">
                  <div>
                    <div class="bg-orange-500 text-white font-bold rounded-t px-4 py-2">
                      The following SMS will be sent out to {message.to}
                    </div>
                    <div class="border border-t-0 border-orange-400 rounded-b bg-red-100 px-4 py-3 text-orange-700">
                      <p>{message.content.text}</p>
                    </div>
                  </div>
                  </div>
                  <button  type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Deliver with SMS</button>
                  <button type="button" onClick={() => {handleVisibility(false);inProgressOrder(order)}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Deliver without SMS</button>
                  <button type="button" onClick={() => handleVisibility(false)} class="ml-5 text-white bg-slate-700 hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
              </form>
            </div>
          </div>
        );
  }
}



  const inProgressOrder = async (order) =>{
    order.fulfillment_status = "in_progress"
    if(order.delivery_at){
      await setDoc(doc(db, "orders", order.client + "-" + order.order_number), order);
      await setDoc(doc(db, "clients", `${order.client}/orders/${order.order_number}`), order)
    }
    else if(order.return_at){
      await setDoc(doc(db, "returns", order.client + "-" + order.return_number), order);
      await setDoc(doc(db, "clients", `${order.client}/returns/${order.return_number}`), order)
    }
  }

  export const handleOrderFlow = async (order,type) => {
    for(let i = 0; i < order.line_items.length; ++i ){
      order.line_items[i].quantity = Number(order.line_items[i].quantity)
      const docRef = doc(db, "inventory", order.line_items[i].skuInt);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        let product = docSnap.data()
        if(type === "incoming"){
          product.inventory[order.warehouse].inventory_quantity = product.inventory[order.warehouse].inventory_quantity+order.line_items[i].quantity
          product.inventory_total_stock = product.inventory_total_stock+order.line_items[i].quantity
        }
        else if (type === "outgoing"){
          product.inventory[order.warehouse].inventory_quantity = product.inventory[order.warehouse].inventory_quantity-order.line_items[i].quantity
          product.inventory_total_stock = product.inventory_total_stock-order.line_items[i].quantity
        }
        await setDoc(doc(db, "inventory", order.line_items[i].skuInt), product)
        await setDoc(doc(db, "clients", `${order.client}/inventory/${order.line_items[i].sku}`), product)
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }
  };

  async function goBack(order){
    let oldStatus = order.fulfillment_status
    order.fulfillment_status = "open"
    if(order.delivery_at){
      await setDoc(doc(db, "orders", order.client + "-" + order.order_number), order);
      await setDoc(doc(db, "clients", `${order.client}/orders/${order.order_number}`), order)
      if(oldStatus === "success"){
        handleOrderFlow(order,"incoming")
        await deleteDoc(doc(db, "flow", `${order.client}-${order.numberFlows}-outgoing-${"WM"}`));
        await deleteDoc(doc(db, "clients", `${order.client}/flow/${order.client}-${order.numberFlows}-outgoing-${"WM"}`));
      }
    }
    else if(order.return_at){
      await setDoc(doc(db, "returns", order.client + "-" + order.return_number), order);
      await setDoc(doc(db, "clients", `${order.client}/returns/${order.return_number}`), order)
      if(oldStatus === "success"){
        handleOrderFlow(order,"outgoing")
        await deleteDoc(doc(db, "flow", `${order.client}-${order.numberFlows}-outgoing-${"WM"}`));
        await deleteDoc(doc(db, "clients", `${order.client}/flow/${order.client}-${order.numberFlows}-outgoing-${"WM"}`));
      }
    }
  }

  export function CancelAlert({visible,handleVisibility,order}) {
    const handleSubmit = async (e) => {
      e.preventDefault();
      handleVisibility(false)
    };
    if(!visible) return null;
    else{
        return (
            <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <form onSubmit={handleSubmit}>
                    <div class="grid gap-6 mb-6 md:grid-cols-1">
                    <div>
                      <div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                        Danger
                      </div>
                      <div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                        <p>If you delete this client you will no longer be able to fulfill deliveries for them</p>
                      </div>
                    </div>
                    </div>
                    <button  type="submit" disabled class="text-white bg-slate-700 hover:bg-grey-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Delete</button>
                    <button type="button" onClick={() => handleVisibility(false)} class="ml-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }

  export function DeleteClient({row }) {
    const [cancelFormVisible, setCancelFormVisible] = useState(false);
    return(
      <div style={{display: "flex", justifyContent: "center"}} className="timer">
          <img onClick={() => setCancelFormVisible(true)} src={cancell} width={"20px"} style={{display:"block",margin:"auto"}}/>
          <CancelAlert handleVisibility={setCancelFormVisible} visible={cancelFormVisible} order={row}/>
      </div>
    )
  }

  /*const addFlowRecord = async (row) => {
    const colRefFlows = collection(db, "flow" )
    const querySnapshot = await getDocs(query(colRefFlows));
    let flow = {}
    for(let i = 0; i < row.line_items.length; ++i ){
      row.line_items[i].quantity = Number(row.line_items[i].quantity)
      const docRef = doc(db, "inventory", row.line_items[i].skuInt);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        let product = docSnap.data()
        if(row.return_at){
          flow = {total_weight:'',
            total_price:'',
            total_dimensions:'',
            created_at:'',
            contact_email:'',
            updated_at:'',
            line_items: row.line_items,
            client: row.client,
            invoiceStamp: '', 
            contactNumber: '', 
            warehouse: row.warehouse,
            flowNumber: `${querySnapshot.size}`,
            flowID:  `${row.client}-${querySnapshot.size}-${type}-${acronym}`,
            direction: type,
            type:'delivery'
          }
          product.inventory[row.warehouse].inventory_quantity = product.inventory[row.warehouse].inventory_quantity+row.line_items[i].quantity
          product.inventory_total_stock = product.inventory_total_stock+row.line_items[i].quantity
        }
        else if (row.delivery_at){
          flow = {total_weight:'',
            total_price:'',
            total_dimensions:'',
            created_at:'',
            contact_email:'',
            updated_at:'',
            line_items: row.line_items,
            client: row.client,
            invoiceStamp: '', 
            contactNumber: '', 
            warehouse: row.warehouse,
            flowNumber: `${querySnapshot.size}`,
            flowID:  `${row.client}-${querySnapshot.size}-${type}-${acronym}`,
            direction: type,
            type:'delivery'
          }
          product.inventory[row.warehouse].inventory_quantity = product.inventory[row.warehouse].inventory_quantity-row.line_items[i].quantity
          product.inventory_total_stock = product.inventory_total_stock-row.line_items[i].quantity
        }
        console.log(row.line_items[i].skuInt,product)
        console.log(`${row.client}/inventory/${row.line_items[i].sku}`,product)
        console.log(flow.flowID,flow)
        //await setDoc(doc(db, "inventory", row.line_items[i].skuInt), product)
        //await setDoc(doc(db, "clients", `${row.client}/inventory/${row.line_items[i].sku}`), product)
        //await setDoc(doc(db, "flow", flow.flowID), flow);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }
  }

  async function deleteFlowRecord({row}) {
    let flow = {}
    for(let i = 0; i < row.line_items.length; ++i ){
      row.line_items[i].quantity = Number(row.line_items[i].quantity)
      const docRef = doc(db, "inventory", row.line_items[i].skuInt);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        let product = docSnap.data()
        if(row.return_at){
          product.inventory[row.warehouse].inventory_quantity = product.inventory[row.warehouse].inventory_quantity-row.line_items[i].quantity
          product.inventory_total_stock = product.inventory_total_stock-row.line_items[i].quantity
        }
        else if (row.delivery_at){
          product.inventory[row.warehouse].inventory_quantity = product.inventory[row.warehouse].inventory_quantity+row.line_items[i].quantity
          product.inventory_total_stock = product.inventory_total_stock+row.line_items[i].quantity
        }
        await setDoc(doc(db, "inventory", row.line_items[i].skuInt), product)
        await setDoc(doc(db, "clients", `${row.client}/inventory/${row.line_items[i].sku}`), product)
        await deleteDoc(doc(db, "flow", flow.flowID));
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }
  }*/

  export function CancelAlertInventroy({visible,handleVisibility,product}) {
    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log(product)
      await deleteDoc(doc(db, "inventory", product.client + "-" + product.sku));
      await deleteDoc(doc(db, "clients", `${product.client}/inventory/${product.sku}`))
      handleVisibility(false)
    };
    if(!visible) return null;
    else{
        return (
            <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <form onSubmit={handleSubmit}>
                    <div class="grid gap-6 mb-6 md:grid-cols-1">
                    <div>
                      <div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                        Danger
                      </div>
                      <div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                        <p>If you delete this item you will no longer be able to fulfill deliveries of it</p>
                      </div>
                    </div>
                    </div>
                    <button  type="submit" class="text-white bg-slate-700 hover:bg-grey-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Delete</button>
                    <button type="button" onClick={() => handleVisibility(false)} class="ml-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }

  export function DeleteInventory({row}) {
    const [cancelFormVisible, setCancelFormVisible] = useState(false);
    return(
      <div style={{display: "flex", justifyContent: "center"}} className="timer">
          <img onClick={() => setCancelFormVisible(true)} src={cancell} width={"20px"} style={{display:"block",margin:"auto"}}/>
          <CancelAlertInventroy handleVisibility={setCancelFormVisible} visible={cancelFormVisible} product={row}/>
      </div>
    )
  }

  export function CancelAlertFlow({visible,handleVisibility,flow}) {
    const handleSubmit = async (e) => {
      e.preventDefault();
      for(let i = 0; i < flow.line_items.length; ++i ){
        flow.line_items[i].quantity = Number(flow.line_items[i].quantity)
        const docRef = doc(db, "inventory", flow.line_items[i].skuInt);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          let product = docSnap.data()
          if(flow.direction === "incoming"){
            product.inventory[flow.warehouse].inventory_quantity = product.inventory[flow.warehouse].inventory_quantity-flow.line_items[i].quantity
            product.inventory_total_stock = product.inventory_total_stock-flow.line_items[i].quantity
          }
          else if (flow.direction === "outgoing"){
            product.inventory[flow.warehouse].inventory_quantity = product.inventory[flow.warehouse].inventory_quantity+flow.line_items[i].quantity
            product.inventory_total_stock = product.inventory_total_stock+flow.line_items[i].quantity
          }
          await setDoc(doc(db, "inventory", flow.line_items[i].skuInt), product)
          await setDoc(doc(db, "clients", `${flow.client}/inventory/${flow.line_items[i].sku}`), product)
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      }
      console.log("submit",flow)
      await deleteDoc(doc(db, "flow", flow.flowID));
      await deleteDoc(doc(db, "clients", `${flow.client}/flow/${flow.flowID}`));
      handleVisibility(false)
    };
    if(!visible) return null;
    else{
        return (
            <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <form onSubmit={handleSubmit}>
                    <div class="grid gap-6 mb-6 md:grid-cols-1">
                    <div>
                      <div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                        Danger
                      </div>
                      <div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                        <p>If you delete this flow, inventory levels will readjust and the flow will be deleted</p>
                      </div>
                    </div>
                    </div>
                    <button  type="submit" class="text-white bg-slate-700 hover:bg-grey-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Delete</button>
                    <button type="button" onClick={() => handleVisibility(false)} class="ml-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }

  export function ActionFlow({row}) {
    const [cancelFormVisible, setCancelFormVisible] = useState(false);
    if(row.type === "Warehouse Managment"){
      return(
        <div style={{display: "flex", justifyContent: "center"}} className="timer">
            <img onClick={() => setCancelFormVisible(true)} src={cancell} width={"20px"} style={{display:"block",margin:"auto"}}/>
            <CancelAlertFlow handleVisibility={setCancelFormVisible} visible={cancelFormVisible} flow={row}/>
        </div>
      )
    }
    else return null
  }
  
  export function StatusPillAction({ value, row }) {
    const [timeFormVisible, seTimeFormVisible] = useState(false);
    const [cancelFormVisible, setCancelFormVisible] = useState(false);
    const [messageAlertVisible, setMessageAlertVisible] = useState(false);
    const status = value ? value.toLowerCase() : "unknown";
    if(status.startsWith("open")){
      return (   
        <div  style={{display: "flex", justifyContent: "center"}}  className="bike">
            <img onClick={() => setCancelFormVisible(true)} src={cancell} width={"20px"} style={{display:"block",margin:"auto"}}/>
            <img onClick={() => setMessageAlertVisible(true)} src={bike} width={"25px"} style={{display:"block",margin:"auto"}}/>
            <CancelForm handleVisibility={setCancelFormVisible} visible={cancelFormVisible} order={row} type={"cancelled"}/>
            <MessageAlert handleVisibility={setMessageAlertVisible} visible={messageAlertVisible} inProgressOrder={inProgressOrder} order={row}/>
        </div>
      );
    }
    else if (status.startsWith("in_progress")){
      return(
        <div style={{display: "flex", justifyContent: "center"}} className="timer">
            <img onClick={() => goBack(row)} src={back} width={"20px"} style={{display:"block",margin:"auto"}}/>
            <img onClick={() => setCancelFormVisible(true)} src={cancell} width={"20px"} style={{display:"block",margin:"auto"}}/>
            <img onClick={() => seTimeFormVisible(true)} src={timer} width={"25px"} style={{display:"block",margin:"auto"}}/>
            <TimeForm handleVisibility={seTimeFormVisible} visible={timeFormVisible} order={row} timeline={row.timeline}/>
            <CancelForm handleVisibility={setCancelFormVisible} visible={cancelFormVisible} order={row} type={"failure"}/>
        </div>
      )
    }
    else if (status.startsWith("failure")){
      return(
        <div className="failure">
            <img onClick={() => goBack(row)} src={back} width={"20px"} style={{display:"block",margin:"auto"}}/>
            <img src={failure} width={"20px"} style={{display:"block",margin:"auto"}}/>
        </div>
      )
    }
    else if (status.startsWith("cancelled")){
      return(
        <div className="cancelled">
            <img onClick={() => goBack(row)} src={back} width={"20px"} style={{display:"block",margin:"auto"}}/>
            <img src={cancelled} width={"20px"} style={{display:"block",margin:"auto"}}/>
        </div>
      )
    }
    else{
      return(
        <div className="complete">
            <img onClick={() => {goBack(row)}} src={back} width={"20px"} style={{display:"block",margin:"auto"}}/>
            <img src={complete} width={"22px"} style={{display:"block",margin:"auto"}}/>
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
  
  
  export function StatusPill({ value }) {
    const status = value ? value.toLowerCase().replace("_"," ") : "unknown";
    
    return (
      <span
        className={
          classNames(
            "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm ",
            status.startsWith("success") ? "bg-green-100 text-green-800" : null,
            status.startsWith("open") ? "bg-sky-100 text-sky-800" : null,
            status.startsWith("cancelled") ? "bg-orange-200 text-orange-800" : null,
            status.startsWith("failure") ? "bg-red-100 text-red-800" : null,
            status.startsWith("in progress") ? "bg-indigo-100 text-indigo-800" : null,
          )
        }
      >
        {status}
      </span>
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
  
  export function StatusPillInventory({ value,warehouses }) {
    return (
          <>
            {Object.keys(warehouses).map((warehouse, idx) => {
              return (
                <span
            key={idx}
            className={
              classNames(
                "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm ",
                value[warehouse].inventory_quantity > 19 ? "bg-emerald-500	 text-emerald-100" : null,
                10 < value[warehouse].inventory_quantity < 20 ? "bg-sky-100 text-sky-800" : null,
                value[warehouse].inventory_quantity < 10 ? "bg-red-100 text-red-800" : null,
              )
            }
          >
            {warehouse + "-[" + value[warehouse].shelf.join(',') + "]: " + value[warehouse].inventory_quantity}
          </span>
          );
        })}
      </>
    );
  }

