import React from 'react'
import { useState } from 'react'
import db from '../firebase'
import { setDoc,doc } from 'firebase/firestore';


export function CancelForm({visible, handleVisibility, order, type}) {
    const [inputFields, setInputFields] = useState(order.cancel_reason);
    const handleSubmit = async (e) => {
      e.preventDefault();
      order.cancel_reason = inputFields
      order.fulfillment_status = type
      console.log(order)
      if(order.delivery_at){
        console.log("Delivery updated")
        await setDoc(doc(db, "orders", order.client + "-" + order.order_number), order);
        await setDoc(doc(db, "clients", `${order.client}/orders/${order.order_number}`), order)
      }
      else if(order.return_at){
        console.log("Return updated")
        await setDoc(doc(db, "returns", order.client + "-" + order.return_number), order);
        await setDoc(doc(db, "clients", `${order.client}/returns/${order.return_number}`), order)
      }
      handleVisibility(false)
    };

    const handleChangeInput = (event) =>{
        setInputFields(event.target.value);
    }


    if(!visible) return null;
    else{
        return (
            <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <form onSubmit={handleSubmit}>
                    <div class="grid gap-6 mb-6 md:grid-cols-2">
                      <div style={{gridColumn: "1 / -1"}}>
                        <label for="cancel_reason" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Reason</label>
                        <input type="text" value={inputFields} onChange={event => handleChangeInput(event)} name="cancel_reason" id="cancel_reason" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required=""/>
                      </div>
                    </div>
                    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
                    <button type="button" onClick={() => {handleVisibility(false)}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }