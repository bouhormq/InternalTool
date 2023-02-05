import React, { useEffect } from 'react'
import { useState } from 'react'
import db from '../../firebase'
import { setDoc,doc,getCountFromServer,query,collection,where } from 'firebase/firestore';
import { UserAuth } from '../../context/authContex';
import Select from 'react-select';
import {handleChangeInput} from './handleForm';
import { Timestamp } from "@firebase/firestore";
const orderid = require('order-id')('key');



export function InventoryForm({visible, handleVisibility, inventory, edit}) {
    const {dropDownClients, warehouses, user} = UserAuth();
    const [alertVisible, setAlertVisible] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [inputFields, setInputFields] = useState([{
      id:"",
      inventoryID:"",
      skuInt:"",
      sku: "",
      client: {name:"",clientID:""},
      title: "",
      price: "",
      updatedAt: "",
      barcode: "",
      dimensions: {H:"",W:"",L:""},
      imageId: "",
      weight: "",
      weightUnit: "KG",
      currency: "EUR",
      unitOfLength: "M",
      inventory: [],
      inventoryTotalStock: 0,
      createdAt: "",
      createdBy: "",
      updatedBy: "",
    }]);

    useEffect(() => {
      if(edit){
        setInputFields([inventory])
        setDisabled(edit);
      }
    }, [visible])

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log(inputFields[0])
      const snap = await getCountFromServer(query(
        collection(db, 'inventory'), where("sku", '==', inputFields[0].sku)
      ))
      if(snap.data().count > 0 && !edit){
        setAlertVisible(true)
      }
      else{
        if(checkEmptyValues(inputFields[0])){
          if(!edit){
            var inventory = warehouses
            for (const [key, value] of Object.entries(warehouses)) {
              inventory[key]['inventoryQuantity'] = 0
              inventory[key]['shelf'] = []
              inventory[key]['createdAt'] = Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})))
              inventory[key]['updatedAt'] = Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})))
              inventory[key]['createdBy'] = user.email
              inventory[key]['updatedBy'] = user.email
            }
            inputFields[0].id = orderid.generate()
            inputFields[0].skuInt = `${inputFields[0].client.clientID+"-"+inputFields[0].sku}`
            inputFields[0].createdAt = Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})))
            inputFields[0].createdBy = user.email
            inputFields[0].inventory = inventory
            inputFields[0].inventoryID = `${inputFields[0].client.clientID}-${inputFields[0].sku}-${inputFields[0].id}`
          }
          inputFields[0].price= parseInt(inputFields[0].price)
          inputFields[0].dimensions={H:parseInt(inputFields[0].dimensions.H),W:parseInt(inputFields[0].dimensions.W),L:parseInt(inputFields[0].dimensions.L)}
          inputFields[0].weight = parseInt(inputFields[0].weight)
          inputFields[0].updatedBy = user.email
          inputFields[0].updatedAt = Timestamp.fromDate(new Date(new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})))
          await setDoc(doc(db, "inventory", inputFields[0].inventoryID), inputFields[0]);
          await setDoc(doc(db, "clients", `${inputFields[0].client.clientID}/inventory/${inputFields[0].inventoryID}`), inputFields[0])
          setAlertVisible(false)
          clearInventoryForm()
        }
        else{
          setAlertVisible(true)
        }
      }
    };

    const checkEmptyValues = (item) => {
      if (
        item.client.length === 0 ||
        item.sku.length === 0 ||
        item.title.length === 0 ||
        item.dimensions.H.length === 0 ||
        item.dimensions.W.length === 0 ||
        item.dimensions.L.length === 0 ||
        item.price.length === 0 ||
        item.weight.length === 0
      ) {
        return false
      } 
      else{
        return true;
      }
    };

    const clearInventoryForm = (event) =>{
      handleVisibility(false)
      setInputFields([{
        id:"",
        inventoryID:"",
        skuInt:"",
        sku: "",
        client: {name:"",clientID:""},
        title: "",
        price: "",
        updatedAt: "",
        barcode: "",
        dimensions: {H:"",W:"",L:""},
        imageId: "",
        weight: "",
        weightUnit: "KG",
        currency: "EUR",
        unitOfLength: "M",
        inventory: [],
        inventoryTotalStock: 0,
        createdAt: "",
        createdBy: "",
        updatedBy: "",
      }])
  }


    const handleChangeInputForm = (event) =>{
        const newInputFields = inputFields.map( i => {     
            i[event.target.name] = event.target.value.trim()
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
                  <strong class="block font-bold">🧙‍♂️ Hello traveler... Double check that:</strong>
                  <span class="block">- All the fields are not empty.</span>
                  <span class="block">- There is no other item with the same SKU (External)</span>
                  <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <svg onClick={() => setAlertVisible(false)} class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                  </span>
                </div>
                }
                <form onSubmit={handleSubmit}>
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
                        <label for="sku" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">SKU (External)</label>
                        <input type="text" value={inputFields[0].sku} onChange={event => handleChangeInputForm(event)}  name="sku" id="sku" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="SKU (External)" required=""/>
                    </div>
                    }
                    <div >
                        <label for="title" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Title</label>
                        <input type="text" value={inputFields[0].title} onChange={event => handleChangeInputForm(event)}  name="title" id="title" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required=""/>
                    </div> 
                    <div >
                        <label for="dimensions" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Height</label>
                        <input type="number" value={inputFields[0].dimensions.H} onChange={event => handleChangeInput(event.target,"dimensions.H", inputFields[0]).then(function(value){setInputFields(value)})}  name="dimensions.H" id="dimensions.H" class="inline bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="H" required=""/>
                    </div>
                    <div>
                        <label for="dimensions" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Width</label>
                        <input type="number" value={inputFields[0].dimensions.W} onChange={event => handleChangeInput(event.target,"dimensions.W", inputFields[0]).then(function(value){setInputFields(value)})}  name="dimensions.W" id="dimensions.W" class="inline bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="W" required=""/>
                    </div>
                    <div>
                        <label for="dimensions" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Length</label>
                        <input type="number" value={inputFields[0].dimensions.L} onChange={event => handleChangeInput(event.target,"dimensions.L", inputFields[0]).then(function(value){setInputFields(value)})}  name="dimensions.L" id="dimensions.L" class="inline bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="L" required=""/>
                    </div>
                    <div >
                        <label for="price" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Price (EUR)</label>
                        <input type="number" value={inputFields[0].price} onChange={event => handleChangeInputForm(event)}  name="price" id="price" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="3" required=""/>
                    </div> 
                    <div >
                        <label for="weight" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Weight (KG)</label>
                        <input type="number" value={inputFields[0].weight} onChange={event => handleChangeInputForm(event)}  name="weight" id="weight" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="0.25" required=""/>
                    </div>            
                    </div>
                    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
                    <button type="button" onClick={() => clearInventoryForm()} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }