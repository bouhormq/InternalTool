import React, { useEffect } from 'react'
import db from '../firebase'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { collection, onSnapshot, getDocs,query,setDoc,doc } from 'firebase/firestore';
import { handleChangeCheckbox, handleRemoveFields, handleAddFields, getClientProducts } from './handleForm';
import { UserAuth } from '../context/authContex';




export function OrderForm({visible,handleVisibility}) {
  const {warehouses,clients,numberFlows} = UserAuth();
  const [numberOrders, setnumberOrders] = useState(0);
  const [products, setProducts] = useState([]);
  const [selectedClient, setselectedClient] = useState();
  const [visibleFrequencyField, setVisibleFrequencyField] = useState(true);
  const [visibleTimeField, setVisibleTimeField] = useState(true);
  const [visibleContractLength, setVisibleContractLength] = useState(true);
  const [inputFieldsGlobal, setInputFieldsGlobal] = useState([
    { daysOfWeek: [ ], 
    contractLength:'3 Months',
    total_weight:'',
    contactEmail:'',
    total_price:'',
    processed_at:'',
    financial_status:'',
    created_at:'',
    contact_email:'',
    confirmed:'',
    closed_at:'',
    cancelled_at:'',
    cancel_reason:'',
    updated_at:'',
    order_number: numberOrders,
    intOrderNumber:undefined,
    fulfillment_status:'open', 
    line_items: [],
    orderID: `${selectedClient}-${numberOrders}`, 
    client: undefined,
    orderStamp: '', 
    delivery_at: '', 
    recipient: '', 
    contactNumber: '', 
    tos: 'Jour Fix', 
    warehouse: Object.keys(warehouses)[0], 
    shipping_address: {city: '', zip: '', country:'Germany', address: ''}, 
    frequency: 'weekly',
    timeline:{
      inProcess_h: "00",
      inProcess_m: "00",
      inProcess_ampm: "AM",
      outForDelivery_h:"00",
      outForDelivery_m:"00",
      outForDelivery_ampm:"AM",
      arrivalNote_h:"00",
      arrivalNote_m:"00",
      arrivalNote_ampm:"AM",
      delivered_h:"00",
      delivered_m:"00",
      delivered_ampm:"AM",
      closed_h:"00",
      closed_m:"00",
      closed_ampm:"AM",
      timeOnSite:"0 minutes",
      inTime:true
    },
    expectedTime:"",
    suggestedTimeOut:"",
    deliveryDistance:"",
    numberFlows:""
  },
  ]);
  const [inputFields, setInputFields] = useState([
    { id: uuidv4(), quantity: '', sku: '', skuInt: '', description: ''},
  ]);


  const getProducts = async (client) => {
    const colRefOrders = collection(db, `clients/${client}/orders` )
    const colRefIntOrders = collection(db, `orders` )
    const colRefProducts = collection(db, `clients/${client}/inventory` )
    const querySnapshot = await getDocs(query(colRefOrders));
    const querySnapshot1 = await getDocs(query(colRefProducts));
    const querySnapshot2 = await getDocs(query(colRefIntOrders));

    let newproducts = {};
    setProducts([])
    querySnapshot1.forEach((doc) => {
      newproducts[doc.id] = doc.data()
      setProducts(newproducts)
    });
    let selectedsku = Object.keys(newproducts)[0]
    setInputFields([{ id: uuidv4(), quantity: '', sku: selectedsku, skuInt: `${client}-${selectedsku}`, description: ''},])
    inputFieldsGlobal[0].line_items = [
      { id: uuidv4(), quantity: '', sku: selectedsku, skuInt: `${client}-${selectedsku}`, description: ''},
    ]
    setnumberOrders(querySnapshot.size)
    inputFieldsGlobal[0].orderID = `${client}-${querySnapshot.size}`
    inputFieldsGlobal[0].order_number = querySnapshot.size
    inputFieldsGlobal[0].intOrderNumber = querySnapshot2.size
  }

  useEffect(  () => {
    if(Object.keys(clients)[0] !== undefined && inputFieldsGlobal[0].client === undefined){
      getProducts(Object.keys(clients)[0])
    }
    else if(inputFieldsGlobal[0].client !== undefined){
      getProducts(inputFieldsGlobal[0].client)
    }
  }, [Object.keys(clients)[0],inputFieldsGlobal[0].client])

 
  useEffect(  () => {
      if(inputFieldsGlobal[0].client === undefined){
        inputFieldsGlobal[0].client = Object.keys(clients)[0]
        setselectedClient(Object.keys(clients)[0])
        getProducts(Object.keys(clients)[0])
      }
      if(warehouses !== undefined){
        inputFieldsGlobal[0].shipping_address.city = Object.values(warehouses)[0].city
        inputFieldsGlobal[0].shipping_address.zip = Object.values(warehouses)[0].delivers_to[0]
      }
    })



  const handleSubmit = async (e) => {
    e.preventDefault();
    handleVisibility(false)
    inputFieldsGlobal[0].created_at = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
    if(inputFieldsGlobal[0].tos !== "Jour Fix" ){
      inputFieldsGlobal[0].numberFlows = numberFlows
      await setDoc(doc(db, "orders", inputFieldsGlobal[0].client + "-" + inputFieldsGlobal[0].order_number), inputFieldsGlobal[0]);
      await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client}/orders/${inputFieldsGlobal[0].order_number}`), inputFieldsGlobal[0])
    }
    else{

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
      let endDate = addMonths(parseInt(inputFieldsGlobal[0].contractLength.substring(0,2)), new Date(inputFieldsGlobal[0].delivery_at)) 
      let startDate = new Date(inputFieldsGlobal[0].delivery_at)
      // Usage
      const dates = getDatesInRange(startDate, endDate)
      let send = false
      for(let i = 0; i < dates.length; i ++){
        if(dates[i].getDay() === 0 && inputFieldsGlobal[0].daysOfWeek.includes('sunday')){
          inputFieldsGlobal[0].delivery_at = dates[i].toLocaleString("sv", { timeZone: "Europe/Berlin"})
          send = true
        }
        else if(dates[i].getDay() === 1 && inputFieldsGlobal[0].daysOfWeek.includes('monday')){
          inputFieldsGlobal[0].delivery_at = dates[i].toLocaleString("sv", { timeZone: "Europe/Berlin"})
          send = true
        }
        else if(dates[i].getDay() === 2 && inputFieldsGlobal[0].daysOfWeek.includes('tuesday')){
          inputFieldsGlobal[0].delivery_at = dates[i].toLocaleString("sv", { timeZone: "Europe/Berlin"})
          send = true
        }
        else if(dates[i].getDay() === 3 && inputFieldsGlobal[0].daysOfWeek.includes('wednesday')){
          inputFieldsGlobal[0].delivery_at = dates[i].toLocaleString("sv", { timeZone: "Europe/Berlin"})
          send = true
        }
        else if(dates[i].getDay() === 4 && inputFieldsGlobal[0].daysOfWeek.includes('thursday')){
          inputFieldsGlobal[0].delivery_at = dates[i].toLocaleString("sv", { timeZone: "Europe/Berlin"})
          send = true
        }
        else if(dates[i].getDay() === 5 && inputFieldsGlobal[0].daysOfWeek.includes('friday')){
          inputFieldsGlobal[0].delivery_at = dates[i].toLocaleString("sv", { timeZone: "Europe/Berlin"})
          send = true
        }
        else if(dates[i].getDay() === 6 && inputFieldsGlobal[0].daysOfWeek.includes('saturday')){
          inputFieldsGlobal[0].delivery_at = dates[i].toLocaleString("sv", { timeZone: "Europe/Berlin"})
          send = true
        } 
        if(send){
          inputFieldsGlobal[0].numberFlows = numberFlows
          await setDoc(doc(db, "orders", inputFieldsGlobal[0].client + "-" + inputFieldsGlobal[0].order_number), inputFieldsGlobal[0]);
          await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client}/orders/${inputFieldsGlobal[0].order_number}`), inputFieldsGlobal[0])
          send = false
        }  
      }
    }
    clearForm()
  };

  const clearForm = () => {
    let selectedsku = Object.keys(products)[0]
    setInputFields([{ id: uuidv4(), quantity: '', sku: selectedsku, skuInt: `${selectedClient}-${selectedsku}`, description: ''},])
    setInputFieldsGlobal([
      { daysOfWeek: [ ], 
      contractLength:'3 Months',
      total_weight:'',
      total_price:'',
      processed_at:'',
      financial_status:'',
      created_at:'',
      contact_email:'',
      confirmed:'',
      intOrderNumber:undefined,
      closed_at:'',
      cancelled_at:'',
      contactEmail:'',
      cancel_reason:'',
      updated_at:'',
      order_number: '', 
      fulfillment_status:'open', 
      line_items: [
        { id: uuidv4(), quantity: '', sku: selectedsku, skuInt: `${selectedClient}-${selectedsku}`, description: ''},
      ],
      orderID: `${selectedClient}-${numberOrders}`, 
      client: undefined,
      orderStamp: '', 
      delivery_at: '', 
      recipient: '', 
      contactNumber: '', 
      tos: 'Jour Fix', 
      warehouse: Object.keys(warehouses)[0], 
      shipping_address: {city: Object.values(warehouses)[0].city, zip: Object.values(warehouses)[0].delivers_to[0], country:'Germany', address: ''}, 
      frequency: 'weekly',
      timeline:{
        inProcess_h: "00",
        inProcess_m: "00",
        inProcess_ampm: "AM",
        outForDelivery_h:"00",
        outForDelivery_m:"00",
        outForDelivery_ampm:"AM",
        arrivalNote_h:"00",
        arrivalNote_m:"00",
        arrivalNote_ampm:"AM",
        delivered_h:"00",
        delivered_m:"00",
        delivered_ampm:"AM",
        closed_h:"00",
        closed_m:"00",
        closed_ampm:"AM",
        timeOnSite:"0 minutes",
        inTime:true
      },
      expectedTime:"",
      suggestedTimeOut:"",
      deliveryDistance:"",
      numberFlows:""
    },
    ])
    setVisibleTimeField(true)
    setVisibleFrequencyField(true)
    setVisibleContractLength(true)
  }

  const handleChangeInputFieldsGlobal = async (event) => {    
    const newInputFieldsGlobal = inputFieldsGlobal.map(i => {
       if(event.target.name === "tos" ){
        i[event.target.name] = event.target.value
        if(event.target.value !== "Jour Fix"){
          setVisibleTimeField(true)
          setVisibleFrequencyField(false)
          setVisibleContractLength(false)
          var checkboxes = document.getElementsByName('inline-checkbox');
          for (var checkbox of checkboxes) {
              checkbox.checked = false;
          }
          i["frequency"] = "";
          i["contractLength"] = "";
          i["delivery_at"] = "";
          i["daysOfWeek"]=[];
          if(event.target.name === "tos" && event.target.value === "Instant"){
            setVisibleTimeField(false)
            i["delivery_at"] = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
          }
        }
        else{
          setVisibleTimeField(true)
          setVisibleFrequencyField(true)
          setVisibleContractLength(true)
          i["frequency"] = "weekly";
          i["contractLength"] = "3 Months";
          i["delivery_at"] = "";
        }
      }
      else if(event.target.name === "address" || event.target.name === "city" || event.target.name === "zip"){
        i["shipping_address"][event.target.name] = event.target.value
      }
      else{
        i[event.target.name] = event.target.value
      }
      return i;
    })
    setInputFieldsGlobal(newInputFieldsGlobal)
    if(event.target.name === "client"){
      inputFieldsGlobal[0].client = event.target.value
      setselectedClient(event.target.value)
      let newproducts = await getClientProducts(event.target.value)
      var selectedsku = Object.keys(newproducts)[0]
      setInputFields([{ id: uuidv4(), quantity: '', sku: selectedsku, skuInt: `${event.target.value}-${selectedsku}`, description: ''}])
      inputFieldsGlobal[0].line_items = [{ id: uuidv4(), quantity: '', sku: selectedsku, skuInt: `${event.target.value}-${selectedsku}`, description: ''}]
    }
    console.log("input: ", inputFieldsGlobal[0].client,inputFieldsGlobal[0].order_number,JSON.stringify(inputFieldsGlobal[0].line_items))
  }

  const handleChangeInputFields = async (id, event) => {
    let newInputFields = inputFields.map(i => {
      if(id === i.id) {
        i[event.target.name] = event.target.value
        if(event.target.name === "sku"){
          i["skuInt"] = `${selectedClient}-${event.target.value}`
        }
      }
      return i;
    })
    inputFieldsGlobal[0].line_items = newInputFields
    setInputFields(newInputFields);
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
                          <select id='client' name="client" onChange={event => handleChangeInputFieldsGlobal(event)} value={inputFieldsGlobal[0].client}  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                            {Object.keys(clients).map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                      </div>
                      <div >
                        <label for="recipient" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Recipient</label>
                        <input type="text" value={inputFieldsGlobal[0].recipient} onChange={event => handleChangeInputFieldsGlobal(event)}  name="recipient" id="recipient"class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Name LastName" required=""/>
                      </div> 
                      <div >
                        <label for="contactNumber" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Contact Number</label>
                        <input type="text" value={inputFieldsGlobal[0].contactNumber} onChange={event => handleChangeInputFieldsGlobal(event)} name="contactNumber" id="contactNumber" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="+49 · · · · · · · · ·" required=""/>
                      </div>
                      <div >
                        <label for="contactEmail" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Contact Email</label>
                        <input type="email" value={inputFieldsGlobal[0].contactEmail} onChange={event => handleChangeInputFieldsGlobal(event)} name="contactEmail" id="contactEmail" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="client@company.com" required=""/>
                      </div>
                      { inputFields.map(inputField => (
                        <div key={inputField.id} style={{gridColumn: "1 / -1"}}> 
                          <div class="grid gap-6 mb-6 md:grid-cols-4"> 
                            <div>
                              <label for="quantity" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Quantity</label>
                              <input name="quantity" value={inputField.quantity} onChange={event => handleChangeInputFields(inputField.id, event)} type="number" id="quantity" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="1" required=""/>
                            </div>
                            <div>
                              <label for="sku" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">SKU</label>
                                <select id='sku' name="sku" onChange={event => handleChangeInputFields(inputField.id, event)} value={inputField.sku}  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                                  {Object.keys(products).map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                            </div>
                            <div >
                              <label for="description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Description</label>
                              <input name="description" value={inputField.description} onChange={event => handleChangeInputFields(inputField.id, event)} type="text" id="description" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="description" required=""/>
                            </div> 
                            <div>
                              <button type="button" onClick={() => handleAddFields(inputFields,products,selectedClient).then(function(value){setInputFields(value);inputFieldsGlobal[0].line_items=value})} class="mt-7 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">+</button>
                              <button type="button" disabled={inputFields.length === 1} onClick={() => handleRemoveFields(inputField.id, inputFields).then(function(value){setInputFields(value);inputFieldsGlobal[0].line_items=value})} class="mt-7 ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">-</button>
                            </div>
                          </div>
                        </div>
                      )) }
                       <div>
                          <label for="orderStamp" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Order Stamp</label>
                          <input  name="orderStamp" type="datetime-local" value={inputFieldsGlobal[0].orderStamp} onChange={event => handleChangeInputFieldsGlobal(event)} id="orderStamp" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Select date"/>
                      </div>
                      <div>
                        <label for="tos" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">TOS</label>
                        <select name="tos" onChange={event => handleChangeInputFieldsGlobal(event)} value={inputFieldsGlobal[0].tos}  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="Jour Fix">Jour Fix</option>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="Appointment">Appointment</option>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="Instant">Instant</option>
                        </select>
                      </div> 
                      <div>
                          <label style={{visibility: visibleTimeField  ? 'visible' : 'hidden' }} for="delivery_at" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Delivery At </label>
                          <input style={{visibility: visibleTimeField  ? 'visible' : 'hidden' }} value={inputFieldsGlobal[0].delivery_at} onChange={event => handleChangeInputFieldsGlobal(event)} id="delivery_at" name="delivery_at" type="datetime-local" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Select date"/>
                          <div style={{visibility: visibleFrequencyField  ? 'visible' : 'hidden' }} class="inline-flex mt-4">
                            <div class="flex items-center mr-4">
                                <input onChange={event => handleChangeCheckbox( event, inputFieldsGlobal[0].daysOfWeek)}  name="inline-checkbox" type="checkbox" value="monday" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                <label for="inline-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">M</label>
                            </div>
                            <div class="flex items-center mr-4">
                                <input onChange={event => handleChangeCheckbox( event, inputFieldsGlobal[0].daysOfWeek)} name="inline-checkbox" type="checkbox" value="tuesday" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                <label for="inline-2-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">T</label>
                            </div>
                            <div class="flex items-center mr-4">
                                <input  onChange={event => handleChangeCheckbox( event, inputFieldsGlobal[0].daysOfWeek)} name="inline-checkbox" type="checkbox" value="wednesday" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                <label for="inline-checked-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">W</label>
                            </div>
                            <div class="flex items-center mr-4">
                                <input  onChange={event => handleChangeCheckbox( event, inputFieldsGlobal[0].daysOfWeek)} name="inline-checkbox" type="checkbox" value="thursday" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                <label for="inline-checked-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">T</label>
                            </div>
                            <div class="flex items-center mr-4">
                                <input  onChange={event => handleChangeCheckbox( event, inputFieldsGlobal[0].daysOfWeek)} name="inline-checkbox" type="checkbox" value="friday" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                <label for="inline-checked-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">F</label>
                            </div>
                            <div class="flex items-center mr-4">
                                <input  onChange={event => handleChangeCheckbox( event, inputFieldsGlobal[0].daysOfWeek)} name="inline-checkbox" type="checkbox" value="saturday" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                <label for="inline-checked-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">S</label>
                            </div>
                            <div class="flex items-center mr-4">
                                <input  onChange={event => handleChangeCheckbox( event, inputFieldsGlobal[0].daysOfWeek)} name="inline-checkbox" type="checkbox" value="sunday" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                <label for="inline-checked-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">S</label>
                            </div>
                          </div>
                      </div>  
                      <div> 
                        <label style={{visibility: visibleFrequencyField  ? 'visible' : 'hidden' }} for="frequency" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Frequency</label>
                        <select style={{visibility: visibleFrequencyField  ? 'visible' : 'hidden' }} name="frequency" onChange={event => handleChangeInputFieldsGlobal(event)} value={inputFieldsGlobal.frequency}  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="weekly">Weekly</option>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="bi-weekly">Bi-weekly</option>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="monthly">Monthly</option>
                        </select>
                      </div> 
                      <div>
                        <label for="warehouse" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Warehouse</label>
                        <select name="warehouse" onChange={event => handleChangeInputFieldsGlobal(event)} value={inputFieldsGlobal[0].warehouse}  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                            {Object.keys(warehouses).map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                        </select>
                      </div> 
                      <div>
                        <label for="address" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Adress</label>
                        <input type="text" value={inputFieldsGlobal[0].shipping_address.address} onChange={event => handleChangeInputFieldsGlobal(event)} name="address" id="address" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Finkenhofstraße 12" required=""/>
                      </div>
                      <div>
                        <label for="zip" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Zip Code</label>
                        <select name="zip" onChange={event => handleChangeInputFieldsGlobal(event)} value={inputFieldsGlobal[0].shipping_address.zip}  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                            {Object.values(warehouses[inputFieldsGlobal[0].warehouse]['delivers_to']).map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label style={{visibility: visibleContractLength ? 'visible' : 'hidden' }} for="contractLength" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Contract Length</label>
                        <select style={{visibility: visibleContractLength ? 'visible' : 'hidden' }} name="contractLength" onChange={event => handleChangeInputFieldsGlobal(event)} value={inputFieldsGlobal.contractLength}  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="3 Months">3 Months</option>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="4 Months">4 Months</option>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="5 Months">5 Months</option>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="6 Months">6 Months</option>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="7 Months">7 Months</option>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="8 Months">8 Months</option>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="9 Months">9 Months</option>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="10 Months">10 Months</option>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="11 Months">11 Months</option>
                          <option  class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" value="12 Months">12 Months</option>
                        </select>
                      </div> 
                    </div>
                  <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                  <button type="button" onClick={() => {handleVisibility(false); clearForm()}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
              </form>
            </div>
          </div>
        );
  }
  }