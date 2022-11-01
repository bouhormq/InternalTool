import React, { useEffect } from 'react'
import { useState } from 'react'
import db from '../firebase'
import { setDoc,doc } from 'firebase/firestore';


export function InventoryForm({visible, handleVisibility,clients,warehouses}) {
    const [inputFields, setInputFields] = useState([{sku:"",client:Object.keys(clients)[0],title:"",dimensions:""}]);

    useEffect(  () => {
      if(Object.keys(clients)[0] !== undefined && inputFields[0].client === undefined){
        inputFields[0].client = Object.keys(clients)[0]
        setInputFields([{sku:"",client:Object.keys(clients)[0],title:"",dimensions:""}])
        inputFields[0].line_items = [{sku:"",client:Object.keys(clients)[0],title:"",dimensions:""}]
      }
    })

    const handleSubmit = async (e) => {
      e.preventDefault();
      var inventory = warehouses
      for (const [key, value] of Object.entries(warehouses)) {
        inventory[key]['inventory_quantity'] = 0
        inventory[key]['shelf'] = []
      }
      var product = {
        skuInt:`${inputFields[0].client+"-"+inputFields[0].sku}`,
        sku: inputFields[0].sku,
        client: inputFields[0].client,
        product_id:"",
        title: inputFields[0].title,
        price: "",
        created_at: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}),
        updated_at: "",
        barcode: "",
        dimensions: inputFields[0].dimensions,
        image_id: "",
        weight: "",
        weight_unit: "g",
        inventory: inventory,
        inventory_total_stock: 0,
        created_at: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}),
        updated_at: ""
      }
      console.log(product)
      await setDoc(doc(db, "inventory", inputFields[0].client + "-" + inputFields[0].sku), product);
      await setDoc(doc(db, "clients", `${inputFields[0].client}/inventory/${inputFields[0].sku}`), product)
      handleVisibility(false)
      setInputFields([{sku:"",client:Object.keys(clients)[0],title:"",dimensions:""}])
    };

    const handleChangeInput = (event) =>{
        const newInputFields = inputFields.map( i => {     
            i[event.target.name] = event.target.value
            return i;
        })
        setInputFields(newInputFields);
        console.log(inputFields)
    }


    if(!visible) return null;
    else{
        return (
            <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <form onSubmit={handleSubmit}>
                    <div class="grid gap-6 mb-6 md:grid-cols-4">
                      <div>
                        <label for="client" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Client</label>
                        <select id='client' name="client" onChange={event => handleChangeInput(event)} value={inputFields[0].client}  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                          {Object.keys(clients).map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    <div >
                        <label for="sku" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">SKU (External)</label>
                        <input type="text" value={inputFields[0].sku} onChange={event => handleChangeInput(event)}  name="sku" id="sku" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="SKU (External)" required=""/>
                    </div>
                    <div >
                        <label for="title" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Title</label>
                        <input type="text" value={inputFields[0].title} onChange={event => handleChangeInput(event)}  name="title" id="title" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required=""/>
                    </div> 
                    <div >
                        <label for="dimensions" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Dimensions</label>
                        <input type="text" value={inputFields[0].dimensions} onChange={event => handleChangeInput(event)}  name="dimensions" id="dimensions" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="HxWxL" required=""/>
                    </div>         
                    </div>
                    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
                    <button type="button" onClick={() => {handleVisibility(false);setInputFields([{sku:"",client:Object.values(clients)[0].name,title:"",dimensions:""}])}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }