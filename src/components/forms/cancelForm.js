import React, { useState, useRef } from 'react'
import db from '../../firebase'
import { setDoc,doc } from 'firebase/firestore';
import {FlowToInventory, sendMessage} from '../tableCells'
import { deliveryToFlow } from './handleForm';
import Editable from './editable'
import Select from 'react-select'
import { dropDownCancelOptions } from './handleForm';


  export function CancelForm({visible, handleVisibility, delivery, type, flow, handleFlowVisibility}) {
    const inputRef = useRef();
    const [alertVisible, setAlertVisible] = useState(false);
    const [task, setTask] = useState("");
    const [inputFields, setInputFields] = useState("");

    let failOption = [{value:`Lieferung an ${delivery.recipient.name} fehlgeschlagen: Zum heutigen Drop-Off Termin wurde kein Empfänger angetroffen.
    Unter folgendem Link können Sie eine Nachlieferung anfordern: https://cal.com/onespot/delivery?metadata[id]=${delivery.deliveryID}.
    Wir liefern Mo.-Sa. zwischen 7.00 und 23.00 Uhr zu frei wählbaren 30-Minuten Slots, oder sofort innerhalb von 30 Minuten.
    Wir freuen uns!`, label:"No staff was present"}]

  //const [task, setTask] = useState(`Hey ${delivery.contact.name}, wir liefern pünktlich um ${delivery.deliveryAt.split('T').pop()} Uhr an ${delivery.recipient.name}. Bitte benachrichtige das Servicepersonal für eine reibungslose Übergabe.\n\n Dein OneSpot Team. Let’s go! 🚴`);
  const handleSubmit = async (e,sms) => {
    e.preventDefault();
    if (delivery.cancelReason) {
      if(!flow){
        if(sms) delivery.SMS.reschedule = true
        delivery.cancelReason = inputFields
        delivery.fulfillmentStatus = type
        if(delivery.type === "Order"){
          await setDoc(doc(db, "orders", delivery.deliveryID), delivery);
          await setDoc(doc(db, "clients", `${delivery.client.clientID}/orders/${delivery.deliveryID}`), delivery)
          deliveryToFlow(delivery)
        }
        else if (delivery.type === "Return"){
          await setDoc(doc(db, "returns", delivery.deliveryID), delivery);
          await setDoc(doc(db, "clients", `${delivery.client.clientID}/returns/${delivery.deliveryID}`), delivery)
          deliveryToFlow(delivery)
        }
        if(delivery.SMS.reschedule && inputFields){
          cancelwithSMS()
        }
      }
      else{
        delivery.cancelReason = inputFields
        await setDoc(doc(db, "flows", delivery.flowID), delivery);
        await setDoc(doc(db, "clients", `${delivery.client.clientID}/flows/${delivery.flowID}`), delivery)
        FlowToInventory(delivery,null,"failure",null)
      }
      handleFlowVisibility(false)
      handleVisibility(false)
    }
    else {
      setAlertVisible(true)
    }
  };


    const cancelwithSMS = () =>{
      let message = {
        client: delivery.client,
        contact: delivery.contact,
        daily: false,
        channelId: '9127c97589944871a4b6488920d43dc7',
        to: delivery.contact.number,
        type: 'text',
        content: {
          text: task
        }
      }
      sendMessage(message,delivery)
    } 
  
    const setReasonField = (event) => {
      if(event){
        setInputFields(event.label)
        let text = `🚨 Leider musste wir die Lieferung an ${delivery.recipient.name} stornieren: Der Grund ist ${event.labelGerman}
        ${event.value}`
        setTask(text);     
      }
      else{
        setTask("");  
        setInputFields("")
      }
    }
    
  
  
    if (!visible) return null;
    else {
      return (
        <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
            {alertVisible &&
              <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <strong class="font-bold">🧙‍♂️ Hello traveler...</strong>
                <span class="block sm:inline">Double check that all the fields are not empty</span>
                <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                </span>
              </div>
            }
            {!flow &&
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
              name="option"
              options={type === "cancelled" ? dropDownCancelOptions : failOption}
              onChange={event => setReasonField(event)}
            />
    }
            <form onSubmit={handleSubmit}>
              <div class="grid gap-6 mb-6 md:grid-cols-1">
                <div>
                  <div class="bg-orange-500 text-white font-bold rounded-t px-4 py-2">
                    The following SMS will be sent out to {delivery.contact.name} with the number {delivery.contact.number}
                  </div>
                  <div class="border border-t-0 border-orange-400 rounded-b bg-red-100 px-4 py-3 text-orange-700 mb-2">
                    <Editable
                      text={task}
                      placeholder="Write the SMS to send or select a template"
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
                        onChange={e => {setTask(e.target.value)}}
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