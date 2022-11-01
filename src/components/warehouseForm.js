import React, { useEffect } from 'react'
import { useState } from 'react'
import db from '../firebase'
import { setDoc,doc } from 'firebase/firestore';


export function WarehouseForm({visible, handleVisibility,inventory}) {
    const [inputFields, setInputFields] = useState([{
        address: "", 
        city: "", 
        country: "",
        country_code: "", 
        delivers_to: "", 
        postal_code: "", 
        province: "",
        id: ""
      }]);
  
      const handleSubmit = async (e) => {
        e.preventDefault();
        inputFields[0].delivers_to = inputFields[0].delivers_to.split(',')
        await setDoc(doc(db, "warehouses", `${inputFields[0].id}`), inputFields[0]);
        inputFields[0]["inventory_quantity"] = 0
        inputFields[0]["shelf"] = []
        for(let i = 0; i < inventory.length; i++){
            inventory[i]["inventory"][inputFields[0].id] = inputFields[0]
            await setDoc(doc(db, "clients", `${inventory[i].client}/inventory/${inventory[i].sku}`), inventory[i])  
            await setDoc(doc(db, "inventory", inventory[i].client + "-" + inventory[i].sku), inventory[i]);
        }
        handleVisibility(false)
        setInputFields([{
          address: "", 
          city: "", 
          country: "",
          country_code: "", 
          delivers_to: "", 
          postal_code: "", 
          province: "",
          id: ""
        }])
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
                    <div >
                        <label for="address" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Address</label>
                        <input type="text" value={inputFields[0].address} onChange={event => handleChangeInput(event)}  name="address" id="address" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Finkenhofstraße 12, 60322 Frankfurt am Main, Germany" required=""/>
                    </div>
                    <div >
                        <label for="City" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">City</label>
                        <input type="text" value={inputFields[0].city} onChange={event => handleChangeInput(event)}  name="city" id="city" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Frankfurt am Main" required=""/>
                    </div> 
                    <div >
                        <label for="country" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Country</label>
                        <input type="text" value={inputFields[0].country} onChange={event => handleChangeInput(event)}  name="country" id="country" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Germany" required=""/>
                    </div>
                    <div >
                        <label for="country_code" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Country Code</label>
                        <input type="text" value={inputFields[0].country_code} onChange={event => handleChangeInput(event)}  name="country_code" id="country_code" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="DE" required=""/>
                    </div>   
                    <div >
                        <label for="id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Id</label>
                        <input type="text" value={inputFields[0].id} onChange={event => handleChangeInput(event)}  name="id" id="id" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="DE-FFM-NWES" required=""/>
                    </div> 
                    <div >
                        <label for="postal_code" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Postal Code</label>
                        <input type="text" value={inputFields[0].postal_code} onChange={event => handleChangeInput(event)}  name="postal_code" id="postal_code" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="60322" required=""/>
                    </div>   
                    <div >
                        <label for="province" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Province</label>
                        <input type="text" value={inputFields[0].province} onChange={event => handleChangeInput(event)}  name="province" id="province" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Hesse" required=""/>
                    </div>   
                    <div >
                        <label for="delivers_to" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Delivers To</label>
                        <input type="text" value={inputFields[0].delivers_to} onChange={event => handleChangeInput(event)}  name="delivers_to" id="delivers_to" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="60306, 60308, 60310..." required=""/>
                    </div>            
                    </div>
                    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
                    <button type="button" onClick={() => {handleVisibility(false);setInputFields([{address: "", city: "", country: "", country_code: "", delivers_to: "", postal_code: "", province: ""}])}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }