import React from 'react'
import { useState } from 'react'
import db from '../firebase'
import { setDoc,doc } from 'firebase/firestore';
import { handleOrderFlow } from './tableCells';
import { UserAuth } from '../context/authContex';


export function TimeForm({visible, handleVisibility, order, timeline}) {
    const [inputFields, setInputFields] = useState([timeline]);
    const {warehouses,clients,numberFlows} = UserAuth();
    const hours = [ '00',  '01', '02', '03',  '04',  '05', '06',  '07', '08', '09', '10', '11', '12']
    const minutes = [ '00',  '01', '02', '03',  '04',  '05', '06',  '07', '08', '09', 
    '10',  '11', '12', '13',  '14',  '15', '16',  '17', '18', '19',
    '20',  '21', '22', '23',  '24',  '25', '26',  '27', '28', '29',
    '30',  '31', '32', '33',  '34',  '35', '36',  '37', '38', '39',
     '40',  '41', '42', '43',  '44',  '45', '46',  '47', '48', '49',
    '50',  '51', '52', '53',  '54',  '55', '56',  '57', '58', '59','60']

  
    
    

    const handleSubmit = async (e) => {
      e.preventDefault();
      order.timeline = inputFields[0]
      order.fulfillment_status = "success"
      order.timeline.closed_h = new Date().toLocaleTimeString({ timeZone: "Europe/Berlin"},{hour: '2-digit', minute:'2-digit', hour12: true }).toUpperCase().substring(0,2)
      order.timeline.closed_m = new Date().toLocaleTimeString({ timeZone: "Europe/Berlin"},{hour: '2-digit', minute:'2-digit', hour12: true }).toUpperCase().substring(3,5)
      order.timeline.closed_ampm = new Date().toLocaleTimeString({ timeZone: "Europe/Berlin"},{hour: '2-digit', minute:'2-digit', hour12: true }).toUpperCase().substring(6,8)
      if(order.delivery_at){
        await setDoc(doc(db, "orders", order.client + "-" + order.order_number), order);
        await setDoc(doc(db, "clients", `${order.client}/orders/${order.order_number}`), order)
        handleOrderFlow(order,"outgoing")
        let flow = { 
          total_weight:order.total_weight,
          total_price:order.total_price,
          delivery_at:order.delivery_at,
          total_dimensions:"",
          created_at:order.created_at,
          contact_email:order.contactEmail,
          updated_at:order.updated_at,
          line_items: order.line_items,
          client: order.client,
          invoiceStamp: order.orderStamp, 
          contactNumber: order.contactNumber, 
          shipping_address: order.shipping_address,
          warehouse: order.warehouse,
          flowNumber: `${numberFlows}`,
          clientFlowNumber: "",
          flowID:`${order.client}-${numberFlows}-outgoing-${"WM"}`,
          type: "Order",
          direction: "outgoing",
        }
        await setDoc(doc(db, "flow", flow.flowID), flow);
        await setDoc(doc(db, "clients", `${flow.client}/flow/${flow.flowID}`), flow);
      }
      else if(order.return_at){
        await setDoc(doc(db, "returns", order.client + "-" + order.return_number), order);
        await setDoc(doc(db, "clients", `${order.client}/returns/${order.return_number}`), order)
        handleOrderFlow(order,"incoming")
        let flow = { 
          total_weight:order.total_weight,
          total_price:order.total_price,
          delivery_at:order.delivery_at,
          total_dimensions:"",
          created_at:order.created_at,
          contact_email:order.contactEmail,
          updated_at:order.updated_at,
          line_items: order.line_items,
          client: order.client,
          invoiceStamp: order.orderStamp, 
          contactNumber: order.contactNumber, 
          shipping_address: order.shipping_address,
          warehouse: order.warehouse,
          flowNumber: `${numberFlows}`,
          clientFlowNumber: "",
          flowID:`${order.client}-${numberFlows}-outgoing-${"WM"}`,
          type: "Order",
          direction: "outgoing",
        }
        await setDoc(doc(db, "flow", flow.flowID), flow);
        await setDoc(doc(db, "clients", `${flow.client}/flow/${flow.flowID}`), flow);
      }
      handleVisibility(false)
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
        let startDate = convertTime12to24(newInputFields[0].inProcess_h+":"+newInputFields[0].inProcess_m+" "+newInputFields[0].inProcess_ampm)
        let endDate = convertTime12to24(newInputFields[0].delivered_h+":"+newInputFields[0].delivered_m+" "+newInputFields[0].delivered_ampm)
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
                <form onSubmit={handleSubmit}>
                    <div class="grid gap-6 mb-6 md:grid-cols-4">
                        <div >
                          <label for="inProcess" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">In Process</label>
                          <div class="flex bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <select onChange={event => handleChangeInput(event)} value={timeline.inProcess_h} name="inProcess_h" class="bg-transparent text-xl appearance-none outline-none">
                            {hours.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <span class="text-xl ">:</span>
                            <select onChange={event => handleChangeInput(event)} value={timeline.inProcess_m} name="inProcess_m" class="bg-transparent text-xl appearance-none outline-none ">
                            {minutes.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <select onChange={event => handleChangeInput(event)} value={timeline.inProcess_ampm} name="inProcess_ampm" class="bg-transparent text-xl appearance-none outline-none">
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div> 
                        <div >
                          <label for="outForDelivery" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Out For Delivery</label>
                          <div class="flex bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <select onChange={event => handleChangeInput(event)} value={timeline.outForDelivery_h} name="outForDelivery_h" class="bg-transparent text-xl appearance-none outline-none">
                            {hours.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <span class="text-xl ">:</span>
                            <select onChange={event => handleChangeInput(event)} value={timeline.outForDelivery_m} name="outForDelivery_m" class="bg-transparent text-xl appearance-none outline-none ">
                            {minutes.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <select onChange={event => handleChangeInput(event)} value={timeline.outForDelivery_ampm} name="outForDelivery_ampm" class="bg-transparent text-xl appearance-none outline-none">
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div> 
                        <div >
                          <label for="arrivalNote" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Arrival Note</label>
                          <div class="flex bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <select onChange={event => handleChangeInput(event)} value={timeline.arrivalNote_h} name="arrivalNote_h" class="bg-transparent text-xl appearance-none outline-none">
                            {hours.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <span class="text-xl ">:</span>
                            <select onChange={event => handleChangeInput(event)} value={timeline.arrivalNote_m} name="arrivalNote_m" class="bg-transparent text-xl appearance-none outline-none ">
                            {minutes.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <select onChange={event => handleChangeInput(event)} value={timeline.arrivalNote_ampm} name="arrivalNote_ampm" class="bg-transparent text-xl appearance-none outline-none">
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div> 
                        <div >
                          <label for="delivered" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Delivered</label>
                          <div class="flex bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <select onChange={event => handleChangeInput(event)} value={timeline.delivered_h} name="delivered_h" class="bg-transparent text-xl appearance-none outline-none">
                            {hours.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <span class="text-xl ">:</span>
                            <select onChange={event => handleChangeInput(event)} value={timeline.delivered_m} name="delivered_m" class="bg-transparent text-xl appearance-none outline-none ">
                            {minutes.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                            ))}
                            </select>
                            <select onChange={event => handleChangeInput(event)} value={timeline.delivered_ampm} name="delivered_ampm" class="bg-transparent text-xl appearance-none outline-none">
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
                      </div>
                    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
                    <button type="button" onClick={() => {handleVisibility(false)}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                </form>
              </div>
            </div>
          );
    }
  }