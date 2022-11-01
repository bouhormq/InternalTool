import React from 'react'
import { doc } from 'firebase/firestore'
import db from '../firebase'
import { useState } from 'react'
import { setDoc } from 'firebase/firestore'


export default function ClientForm({visible,handleVisibility}) {
    const [inputFieldsGlobal, setInputFieldsGlobal] = useState({ client:''});

    async function CreateStats(client) {
      await setDoc(doc(db, "clients", `${client}/stats/orders`), {
        n_fulfillments_cancelled: 0,
        n_fulfillments_error: 0,
        n_fulfillments_failure: 0,
        n_fulfillments_open: 0,
        n_fulfillments_pending: 0,
        n_fulfillments_success:  0,
        n_orders: 0,
        n_reviews: 0,
        review_score: 0,
      })
    }

    async function CreateInfo(client) {
      await setDoc(doc(db, "clients", `${client}/info/general`), {
        country_code: "DE",
        created_at: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
      })
      await setDoc(doc(db, "clients", `${client}/info/preferences`), {
        shipping_price: 349,
      })
    }

    const handleSubmit = async (e) => {
      e.preventDefault();
      handleVisibility(false)
      await setDoc(doc(db, "clients", inputFieldsGlobal.client), {
        name: inputFieldsGlobal.client,
      })
      await CreateStats(inputFieldsGlobal.client);
      await CreateInfo(inputFieldsGlobal.client);
    };

    const handleChangeInput = (event) => {
      setInputFieldsGlobal({client: event.target.value})
    }

    if(!visible) return null;
    else{
        return (
            <div className="overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <form onSubmit={handleSubmit}>
                    <div class="grid gap-6 mb-6 md:grid-cols-1">
                        <div >
                          <label for="client" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Client</label>
                          <input type="text" value={inputFieldsGlobal.client} onChange={event => handleChangeInput(event)}  name="client" id="client"class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Name" required=""/>
                        </div> 
                      </div>
                    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                    <button type="button" onClick={() => handleVisibility(false)} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }