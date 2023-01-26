import React, { useState, useRef } from 'react'
import db from '../../firebase'
import { setDoc,doc } from 'firebase/firestore';
import {FlowToInventory, sendMessage} from '../tableCells'
import { deliveryToFlow } from './handleForm';
import Editable from './editable'
import Select from 'react-select'
import { dropDownCancelOptions,dropDownCancelOptionsFlow } from './handleForm';
import { UserAuth } from '../../context/authContex';
const orderid = require('order-id')('key');



  export function CancelForm({visible, handleVisibility, delivery, type, flow, handleFlowVisibility}) {
    const inputRef = useRef();
    const {user} = UserAuth()
    const [alertVisible, setAlertVisible] = useState(false);
    const [task, setTask] = useState("");
    const [inputFields, setInputFields] = useState("");
    const [inputFields1, setInputFields2] = useState("");
    let failOption = [{value:`Lieferung an ${delivery.recipient.name} fehlgeschlagen: Zum heutigen Drop-Off Termin wurde kein Empfänger angetroffen.
    Unter folgendem Link können Sie eine Nachlieferung anfordern: https://cal.com/onespot/delivery?metadata[id]=${delivery.deliveryID}.
    Wir liefern Mo.-Sa. zwischen 7.00 und 23.00 Uhr zu frei wählbaren 30-Minuten Slots, oder sofort innerhalb von 30 Minuten.
    Wir freuen uns!`, label:"No staff was present", labelGerman:"Es war kein Personal anwesend"}]

  //const [task, setTask] = useState(`Hey ${delivery.contact.name}, wir liefern pünktlich um ${delivery.deliveryAt.split('T').pop()} Uhr an ${delivery.recipient.name}. Bitte benachrichtige das Servicepersonal für eine reibungslose Übergabe.\n\n Dein OneSpot Team. Let’s go! 🚴`);
  const handleSubmit = async (e,sms) => {
    delivery.cancelReason = inputFields
    delivery.comments = inputFields1
    delivery.cancelledBy = user.email
    delivery.cancelledAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin" })
    delivery.updatedBy = user.email
    delivery.updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin" })
    e.preventDefault();
    if (delivery.cancelReason) {
      if(!flow){
        delivery.fulfillmentStatus = type
        if(sms && inputFields){
          delivery.sms.push(cancelwithSMS())
        }
        if(delivery.type === "Order"){
          await setDoc(doc(db, "orders", delivery.deliveryID), delivery);
          await setDoc(doc(db, "clients", `${delivery.client.clientID}/orders/${delivery.deliveryID}`), delivery)
          await setDoc(doc(db, "contacts", `${delivery.contact.contactID}/orders/${delivery.deliveryID}`), delivery)
          await setDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}/orders/${delivery.deliveryID}`), delivery)
          deliveryToFlow(delivery,false,user)
        }
        else if (delivery.type === "Return"){
          await setDoc(doc(db, "returns", delivery.deliveryID), delivery);
          await setDoc(doc(db, "clients", `${delivery.client.clientID}/returns/${delivery.deliveryID}`), delivery)
          await setDoc(doc(db, "contacts", `${delivery.contact.contactID}/returns/${delivery.deliveryID}`), delivery)
          await setDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}/returns/${delivery.deliveryID}`), delivery)
          deliveryToFlow(delivery,false,user)
        }
      }
      else{
        await setDoc(doc(db, "flows", delivery.flowID), delivery);
        await setDoc(doc(db, "clients", `${delivery.client.clientID}/flows/${delivery.flowID}`), delivery)
        await setDoc(doc(db, "contacts", `${delivery.contact.contactID}/flows/${delivery.flowID}`), delivery);
        await setDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}/flows/${delivery.flowID}`), delivery)
        FlowToInventory(delivery,null,"failure",null, user)
      }
      await setDoc(doc(db, "clients", `${delivery.client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true }); 
      await setDoc(doc(db, "contacts", `${delivery.contact.contactID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });  
      await setDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });   
      handleFlowVisibility(false)
      handleVisibility(false)
    }
    else {
      setAlertVisible(true)
    }
  };


    const cancelwithSMS = () =>{
      var id = orderid.generate()
      var messageID = `${delivery.client.clientID}-${delivery.contact.contactID}-${delivery.id}`
      let message = {
        channelId: '9127c97589944871a4b6488920d43dc7',
        deliveryID: delivery.deliveryID,
        messageID: messageID,
        id:id,
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
      sendMessage(message,user)
      return messageID
    } 
  
    const setReasonField = (event) => {
      if(event){
        setInputFields(event.label)
        if(!flow){
          let text = `🚨 Leider musste wir die Lieferung an ${delivery.recipient.name} stornieren: Der Grund ist ${event.labelGerman}
          ${event.value}`
          setTask(text);
        }     
      }
      else{
        setTask("");  
        setInputFields("")
      }
    }

    const handleChangeInput = (event) =>{
      setInputFields2(event.target.value);
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
            </div>
            }
            <label for="cancelReason" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Cancel Reason</label>
            {flow &&
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
              options={dropDownCancelOptionsFlow}
              onChange={event => setReasonField(event)}
            />
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
            />}
            <form onSubmit={handleSubmit}>
              <div class="grid gap-6 mb-6 md:grid-cols-2">
              <div class="max-w-max	">
                <label for="comments" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Comments</label>
                <input type="text" value={inputFields1} onChange={event => handleChangeInput(event)} name="comments" id="comments" class="max-w-max	 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Comments..." required=""/>
              </div>
              {!flow &&
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
                 }
              </div>
              {!flow && <button type="button" onClick={e => { handleSubmit(e, "SMS") }} class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Deliver with SMS</button>}
              {!flow &&<button type="button" onClick={e => { handleSubmit(e, null) }} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Deliver without SMS</button>}
              {flow &&<button type="button" onClick={e => { handleSubmit(e, null) }} class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>}
              <button type="button" onClick={() => { handleVisibility(false); setAlertVisible(false) }} class="ml-5 text-white bg-slate-700 hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
            </form>
          </div>
        </div>
      );
    }
  }