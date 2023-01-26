import React from 'react'
import { useState } from 'react'
import db from '../../firebase'
import { setDoc,doc } from 'firebase/firestore';
import { UserAuth } from '../../context/authContex';
import { deliveryToFlow } from './handleForm';


export function TimeForm({visible, handleVisibility, delivery, timeline}) {
    const {user} = UserAuth()
    const [inputFields, setInputFields] = useState([timeline]);
    const [alertVisible, setAlertVisible] = useState(false);
    const [checked, setChecked] = useState(false);
    const [comments, setComments] = useState(delivery.comments);
    const hours = [ '00',  '01', '02', '03',  '04',  '05', '06',  '07', '08', '09', '10', '11', '12']
    const minutes = [ '00',  '01', '02', '03',  '04',  '05', '06',  '07', '08', '09', 
    '10',  '11', '12', '13',  '14',  '15', '16',  '17', '18', '19',
    '20',  '21', '22', '23',  '24',  '25', '26',  '27', '28', '29',
    '30',  '31', '32', '33',  '34',  '35', '36',  '37', '38', '39',
     '40',  '41', '42', '43',  '44',  '45', '46',  '47', '48', '49',
    '50',  '51', '52', '53',  '54',  '55', '56',  '57', '58', '59','60']

    function isSorted(arr) {
      const limit = arr.length - 1;
      return arr.every((_, i) => (i < limit ? arr[i] <= arr[i + 1] : true));
    }

      const handleChange = () => {
        setChecked(!checked);
      };

    function checkCorrectTime(timeline){
      let inProcess = convertTime12to24(timeline.inProcessH + ":" + timeline.inProcessM + " " + timeline.inProcessAMPM)
      inProcess = new Date(1999,3,19,inProcess.substring(0,2),inProcess.substring(3,5),0);
      let outForDelivery = convertTime12to24(timeline.outForDeliveryH + ":" + timeline.outForDeliveryM + " " + timeline.outForDeliveryAMPM)
      outForDelivery = new Date(1999,3,19,outForDelivery.substring(0,2),outForDelivery.substring(3,5),0);
      let arrivalNote = convertTime12to24(timeline.arrivalNoteH + ":" + timeline.arrivalNoteM + " " + timeline.arrivalNoteAMPM)
      arrivalNote = new Date(1999,3,19,arrivalNote.substring(0,2),arrivalNote.substring(3,5),0);
      let delivered = convertTime12to24(timeline.deliveredH + ":" + timeline.deliveredM + " " + timeline.deliveredAMPM)
      delivered = new Date(1999,3,19,delivered.substring(0,2),delivered.substring(3,5),0);
      let closed = convertTime12to24(timeline.closedH + ":" + timeline.closedM + " " + timeline.closedAMPM)
      closed = new Date(1999,3,19,closed.substring(0,2),closed.substring(3,5),0);
      if(isSorted([inProcess,outForDelivery,arrivalNote,delivered,closed])){
        return true
      }
      else{
        return false
      }
    }
    

    
    

    const handleSubmit = async (e) => {
      e.preventDefault();
      delivery.exchange = checked;
      delivery.comments = comments;
      delivery.timeline = inputFields[0];
      delivery.fulfillmentStatus = "success";
      delivery.timeline.closedH = new Date().toLocaleTimeString({ timeZone: "Europe/Berlin"},{hour: '2-digit', minute:'2-digit', hour12: true }).toUpperCase().substring(0,2);
      delivery.timeline.closedM = new Date().toLocaleTimeString({ timeZone: "Europe/Berlin"},{hour: '2-digit', minute:'2-digit', hour12: true }).toUpperCase().substring(3,5);
      delivery.timeline.closedAMPM = new Date().toLocaleTimeString({ timeZone: "Europe/Berlin"},{hour: '2-digit', minute:'2-digit', hour12: true }).toUpperCase().substring(6,8);
      if(checkCorrectTime(timeline)){
        delivery.flowID = await deliveryToFlow(delivery,false,user)
        if (delivery.type === "Order") {
          await setDoc(doc(db, "orders", delivery.deliveryID), delivery);
          await setDoc(doc(db, "clients", `${delivery.client.clientID}/orders/${delivery.deliveryID}`), delivery)
          await setDoc(doc(db, "contacts", `${delivery.contact.contactID}/orders/${delivery.deliveryID}`), delivery)
          await setDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}/orders/${delivery.deliveryID}`), delivery)
        }
        else if (delivery.type  === "Return") {
          await setDoc(doc(db, "returns", delivery.deliveryID), delivery);
          await setDoc(doc(db, "clients", `${delivery.client.clientID}/returns/${delivery.deliveryID}`), delivery)
          await setDoc(doc(db, "contacts", `${delivery.contact.contactID}/returns/${delivery.deliveryID}`), delivery)
          await setDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}/returns/${delivery.deliveryID}`), delivery)
        }
        handleVisibility(false)
        setAlertVisible(false)
        await setDoc(doc(db, "clients", `${delivery.client.clientID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true }); 
        await setDoc(doc(db, "clients", `${delivery.client.clientID}/contacts/${delivery.contact.contactID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true }); 
        await setDoc(doc(db, "contacts", `${delivery.contact.contactID}`), { updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}), updatedBy: user.email }, { merge: true });
      }
      else{
        setAlertVisible(true)
      }
    };

    const convertTime12to24 = time12h => {
      const [time, modifier] = time12h.split(" ");
    
      let [hours, minutes] = time.split(":");
    
      if (hours === "12") {
        hours = "00";
      }
    
      if (modifier === "PM") {
        hours = parseInt(hours, 10) + 12;
      }
    
      return `${hours}:${minutes}`;
    };
 

    const handleChangeInput = (event) =>{
        const newInputFields = inputFields.map( i => {     
            i[event.target.name] = event.target.value
            return i;
        })
        let startDate = convertTime12to24(newInputFields[0].inProcessH+":"+newInputFields[0].inProcessM+" "+newInputFields[0].inProcessAMPM)
        let endDate = convertTime12to24(newInputFields[0].deliveredH+":"+newInputFields[0].deliveredM+" "+newInputFields[0].deliveredAMPM)
        startDate = new Date(
          1999,
          3,
          19,
          startDate.substring(0,2),
          startDate.substring(3,5),
          0
        );
        endDate = new Date(
          1999,
          3,
          19,
          endDate.substring(0,2),
          endDate.substring(3,5),
          0
        );
        let difference = endDate.getTime() - startDate.getTime();
        let minuteDifference = Math.floor(difference / 60000);
        newInputFields[0].timeOnSite = minuteDifference+" minutes" 
        setInputFields(newInputFields);
    }


    if(!visible) return null;
    else{
        return (
            <div className="z-10 overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
              {alertVisible  &&
                  <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <strong class="block font-bold">🧙‍♂️ Holy smokes! Are you a time traveler? That's literally impossible!</strong>
                  <span class="block">Double check the inserted times again.</span>
                  <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <svg onClick={() => setAlertVisible(false)} class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                  </span>
                </div>
                }
                <form onSubmit={handleSubmit}>
                    <div class="grid gap-6 mb-6 md:grid-cols-4">
                        <div >
                          <label for="inProcess" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">In Process</label>
                          <div class="flex bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <select onChange={event => handleChangeInput(event)} value={timeline.inProcessH} name="inProcessH" class="bg-transparent text-xl appearance-none outline-none">
                            {hours.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <span class="text-xl ">:</span>
                            <select onChange={event => handleChangeInput(event)} value={timeline.inProcessM} name="inProcessM" class="bg-transparent text-xl appearance-none outline-none ">
                            {minutes.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <select onChange={event => handleChangeInput(event)} value={timeline.inProcessAMPM} name="inProcessAMPM" class="bg-transparent text-xl appearance-none outline-none">
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div> 
                        <div >
                          <label for="outForDelivery" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Out For Delivery</label>
                          <div class="flex bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <select onChange={event => handleChangeInput(event)} value={timeline.outForDeliveryH} name="outForDeliveryH" class="bg-transparent text-xl appearance-none outline-none">
                            {hours.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <span class="text-xl ">:</span>
                            <select onChange={event => handleChangeInput(event)} value={timeline.outForDeliveryM} name="outForDeliveryM" class="bg-transparent text-xl appearance-none outline-none ">
                            {minutes.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <select onChange={event => handleChangeInput(event)} value={timeline.outForDeliveryAMPM} name="outForDeliveryAMPM" class="bg-transparent text-xl appearance-none outline-none">
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div> 
                        <div >
                          <label for="arrivalNote" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Arrival Note</label>
                          <div class="flex bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <select onChange={event => handleChangeInput(event)} value={timeline.arrivalNoteH} name="arrivalNoteH" class="bg-transparent text-xl appearance-none outline-none">
                            {hours.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <span class="text-xl ">:</span>
                            <select onChange={event => handleChangeInput(event)} value={timeline.arrivalNoteM} name="arrivalNoteM" class="bg-transparent text-xl appearance-none outline-none ">
                            {minutes.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <select onChange={event => handleChangeInput(event)} value={timeline.arrivalNoteAMPM} name="arrivalNoteAMPM" class="bg-transparent text-xl appearance-none outline-none">
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div> 
                        <div >
                          <label for="delivered" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Delivered</label>
                          <div class="flex bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <select onChange={event => handleChangeInput(event)} value={timeline.deliveredH} name="deliveredH" class="bg-transparent text-xl appearance-none outline-none">
                            {hours.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <span class="text-xl ">:</span>
                            <select onChange={event => handleChangeInput(event)} value={timeline.deliveredM} name="deliveredM" class="bg-transparent text-xl appearance-none outline-none ">
                            {minutes.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <select onChange={event => handleChangeInput(event)} value={timeline.deliveredAMPM} name="deliveredAMPM" class="bg-transparent text-xl appearance-none outline-none">
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div> 
                        <div >
                          <label for="timeOnSite" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Time On Site</label>
                          <input type="text" value={timeline.timeOnSite} disabled name="timeOnSite" id="timeOnSite" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                        </div> 
                        <div >
                          <label for="inTime" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">On Time?</label>
                          <input type="text" value={timeline.inTime} disabled name="inTime" id="inTime" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                        </div> 
                        {delivery.type === "Order" &&
                        <label class="text-xl font-medium text-gray-900 dark:text-gray-300">
                        <input
                          class="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          type="checkbox"
                          checked={checked}
                          onChange={handleChange}
                        />
                           Exchange
                        </label>
                        }
                      </div>
                      <div>
                        <label for="comments" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Comments</label>
                        <input name="comments" value={comments} onChange={event => setComments(event.target.value)} type="text" id="comments" class="mb-5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Comments..." required="" />
                      </div>
                    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
                    <button type="button" onClick={() => {handleVisibility(false)}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }