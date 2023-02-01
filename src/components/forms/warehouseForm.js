import React, { useEffect } from 'react'
import { useState } from 'react'
import db from '../../firebase'
import { setDoc,doc,getCountFromServer, query, where, collection } from 'firebase/firestore';
import { checkEmptyValues } from './handleForm';
import { UserAuth } from '../../context/authContex';


export function WarehouseForm({visible, handleVisibility, warehouse, edit}) {
    const {inventory, user} = UserAuth();
    const [alertVisible, setAlertVisible] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [inputFields, setInputFields] = useState([{
        address: "", 
        city: "", 
        country: "",
        countryCode: "", 
        deliversTo: "", 
        postalCode: "", 
        province: "",
        id: "",
        updatedAt: "",
        createdAt: "",
        updatedBy: "",
        createdBy: "",
        calendarDeliveries: "",
        calendarFlow: ""
      }]);

      useEffect(() => {
        if(edit){
          setInputFields([warehouse])
          setDisabled(edit);
        }
      }, [visible])

  
      const handleSubmit = async (e) => {
        e.preventDefault();
        const snap = await getCountFromServer(query(
          collection(db, 'warehouses'), where("id", '==', inputFields[0].id)
        ))
        if(snap.data().count > 0 && !edit){
          setAlertVisible(true)
        }
        else{
          if(Array.isArray(inputFields[0].deliversTo)) inputFields[0].deliversTo = inputFields[0].deliversTo.toString();
          if(!edit){
            inputFields[0].createdAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
            inputFields[0].updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
            inputFields[0].updatedBy = user.email
            inputFields[0].createdBy = user.email
          }
          else{
            inputFields[0].updatedBy = user.email
            inputFields[0].updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
          }
          if(checkEmptyValues(inputFields[0]) && inputFields[0].deliversTo.match("^[,0-9 ]+$")){
              inputFields[0].deliversTo = inputFields[0].deliversTo.split(',')
              await setDoc(doc(db, "warehouses", `${inputFields[0].id}`), inputFields[0]);
              if(edit){
                for(let i = 0; i < inventory.length; i++){
                  inputFields[0]["inventoryQuantity"] = inventory[i]["inventory"][inputFields[0].id]["inventoryQuantity"]
                  inputFields[0]["shelf"] = inventory[i]["inventory"][inputFields[0].id]["shelf"]
                  inventory[i]["inventory"][inputFields[0].id] = inputFields[0]
                  inventory[i].updatedBy = user.email
                  inventory[i].updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
                  await setDoc(doc(db, "clients", `${inventory[i].client.clientID}/inventory/${inventory[i].inventoryID}`), inventory[i])  
                  await setDoc(doc(db, "inventory", inventory[i].inventoryID), inventory[i]);
                }
              }
              else{
                inputFields[0]["inventoryQuantity"] = 0
                inputFields[0]["shelf"] = []
                for(let i = 0; i < inventory.length; i++){
                  inventory[i]["inventory"][inputFields[0].id] = inputFields[0]
                  inventory[i].updatedBy = user.email
                  inventory[i].updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
                  inventory[i].createdBy = user.email
                  inventory[i].createdAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
                  await setDoc(doc(db, "clients", `${inventory[i].client.clientID}/inventory/${inventory[i].inventoryID}`), inventory[i])  
                  await setDoc(doc(db, "inventory", inventory[i].inventoryID), inventory[i]);
                }
              }
              setAlertVisible(false)
              handleVisibility(false)
              clearWarehouseForm()
            }
            else{
              setAlertVisible(true)
            }
        }
      };

      const clearWarehouseForm = () => {
        handleVisibility(false)
        setInputFields([{
          address: "", 
          city: "", 
          country: "",
          countryCode: "", 
          deliversTo: "", 
          postalCode: "", 
          province: "",
          id: "",
          updatedAt: "",
          createdAt: "",
          updatedBy: "",
          createdBy: "",
          calendarDeliveries: "",
          calendarFlow: ""
        }])
        setAlertVisible(false)
      }
  
      const handleChangeInput = (event) =>{
        const newInputFields = inputFields.map( i => {     
            i[event.target.name] = event.target.value.trim()
            return i;
        })
        setInputFields(newInputFields);
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
                  <span class="block">- There is no other warehouse with the same id.</span>
                  <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <svg onClick={() => setAlertVisible(false)} class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                  </span>
                </div>
                }
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
                        <label for="countryCode" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Country Code</label>
                        <input type="text" value={inputFields[0].countryCode} onChange={event => handleChangeInput(event)}  name="countryCode" id="countryCode" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="DE" required=""/>
                    </div>   
                    {!disabled && 
                      <div >
                        <label for="id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Id</label>
                        <input type="text"  value={inputFields[0].id} onChange={event => handleChangeInput(event)}  name="id" id="id" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="DE-FFM-NWES" required=""/>
                      </div>
                    } 
                    <div >
                        <label for="postalCode" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Postal Code</label>
                        <input type="text" value={inputFields[0].postalCode} onChange={event => handleChangeInput(event)}  name="postalCode" id="postalCode" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="60322" required=""/>
                    </div>   
                    <div >
                        <label for="province" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Province</label>
                        <input type="text" value={inputFields[0].province} onChange={event => handleChangeInput(event)}  name="province" id="province" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Hesse" required=""/>
                    </div>   
                    <div >
                        <label for="deliversTo" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Delivers To</label>
                        <input type="text" value={inputFields[0].deliversTo} onChange={event => handleChangeInput(event)}  name="deliversTo" id="deliversTo" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="60306, 60308, 60310..." required=""/>
                    </div>            
                    </div>
                    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
                    <button type="button" onClick={() => {clearWarehouseForm()}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }