import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import React, {useState} from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore';
import db from '../firebase';

export const ExportToExcel = ({client}) => {
      const [week, setWeek] = useState("KW1");
      const [year, setYear] = useState("2022");
      var  monthoptions = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var weekoptions = ["KW1","KW2","KW3","KW4","KW5","KW6","KW7","KW8","KW9","KW10",
      "KW11","KW12","KW13","KW14","KW15","KW16","KW17","KW18","KW19","KW20",
      "KW21","KW22","KW23","KW24","KW25","KW26","KW27","KW28","KW29","KW30",
      "KW31","KW32","KW33","KW34","KW35","KW36","KW37","KW38","KW39","KW40",
      "KW41","KW42","KW43","KW44","KW45","KW46","KW47","KW48","KW49","KW50",
      "KW51","KW52"]
      var yearoptions = ["2022","2023","2024","2025","2026","2027","2028","2029","2030","2031",
      "2032","2033","2034","2035","2036","2037","2038","2039","2040","2041","2042",
      "2042"]
      function getDateOfISOWeek(w, y) {
        var simple = new Date(y, 0, 1 + (w - 1) * 7);
        var dow = simple.getDay();
        var ISOweekStart = simple;
        if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        return ISOweekStart;
      }

      function addWeeks(numOfWeeks, date = new Date()) {
        date.setDate(date.getDate() + numOfWeeks * 7);
        return date;
    }
    function padTo2Digits(num) {
      return num.toString().padStart(2, '0');
    }
    
    function formatDate(date) {
      return [
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getMonth() + 1),
        date.getFullYear(),
      ].join('-');
    }
    function getAllDaysInMonth(year, month) {
      const date = new Date(year, month, 1);
    
      const dates = [];
    
      while (date.getMonth() === month) {
        dates.push(formatDate(new Date(date)));
        date.setDate(date.getDate() + 1);
      }
    
      return dates;
    }
        const exportToCSV = async () => {
          var w = week.substring(2);
          var y = year
          const q = query(collection(db, "clients", `${client}/inventory` ));
          const q1 = query(collection(db, "clients", `${client}/orders` ));
          const q2 = query(collection(db, "clients", `${client}/returns` ));
          const q3 = query(collection(db, "clients", `${client}/flow` ), where("direction", "==", "incoming"));
          const q4 = query(collection(db, "clients", `${client}/flow` ), where("direction", "==", "outgoing"));
          function flowExcel(year, month, inventory) {
            let flow = []
            let dates = getAllDaysInMonth(year,month)
            let sku = {
              "SKU int.":	"",
              "Artikelbezeichnung": "",	
            }
            for(var i = 0; i < dates.length; ++i){
              sku[dates[i]] = ""
            }
            for(var i=0; i < inventory.length; i++){
              sku["SKU int."] = inventory[i]["SKU int."]
              sku["Artikelbezeichnung"] = inventory[i]["Article description"]
              flow.push({ ...sku })
            }
            return flow
          }
          const querySnapshot = await getDocs(q);
          let inventory=[]
          querySnapshot.forEach((doc) => {
              inventory.push({
                "Brand":doc.data().client,
                "SKU int.":	doc.data().skuInt,
                "Article description": doc.data().title,	
                "Measurements (H x W x L)":	doc.data().dimensions,
                "ON STOCK	":doc.data().inventory_total_stock,
                "IN": "",
                "OUT":""
              })
          });
          let flowIn, flowOut 
          flowIn = flowExcel(year,getDateOfISOWeek(w,y).getMonth(),inventory)
          flowOut = flowExcel(year,getDateOfISOWeek(w,y).getMonth(),inventory)
          const querySnapshot3 = await getDocs(q3);
          querySnapshot3.forEach((doc) => {
            //look for items 
            let date = new Date(doc.data().delivery_at)
            for(var i = 0; i < doc.data().line_items.length; ++i){
              let skuInt = doc.data().line_items[i]["skuInt"]
              let quantity = doc.data().line_items[i]["quantity"]
              const searchIndex = flowIn.findIndex((skuFlow) => skuFlow["SKU int."] === skuInt);
              flowIn[searchIndex][formatDate(date)] = quantity
            }
            console.log(flowIn,"flowIn")
          });
          const querySnapshot4 = await getDocs(q4);
          querySnapshot4.forEach((doc) => {
            //look for items 
            let date = new Date(doc.data().return_at)
            for(var i = 0; i < doc.data().line_items.length; ++i){
              let skuInt = doc.data().line_items[i]["skuInt"]
              let quantity = doc.data().line_items[i]["quantity"]
              const searchIndex = flowOut.findIndex((skuFlow) => skuFlow["SKU int."] === skuInt);
              flowOut[searchIndex][formatDate(date)] = quantity
            }
            console.log(flowOut,"flowOut")
          });
          const querySnapshot1 = await getDocs(q1);
          let orders=[]
          querySnapshot1.forEach((doc) => {
            if(getDateOfISOWeek(w,y) <= new Date(doc.data().delivery_at) && addWeeks(1,getDateOfISOWeek(w,y)) >= new Date(doc.data().delivery_at)){
              orders.push({
                "Order No.":doc.data().order_number,
                "Client":	client,
                "Wunschtermin": doc.data().delivery_at,	
                "Qty.":	doc.data().line_items[0].quantity,
                "SKU int.":doc.data().line_items[0].skuInt,
                "Description": doc.data().line_items[0].description,
                "Recipient":doc.data().recipient,
                "Delivery Adress":doc.data().shipping_address.address + " " + doc.data().shipping_address.address2 + ", " + doc.data().shipping_address.zip + ", " + doc.data().shipping_address.city + ", " + doc.data().shipping_address.country,
                "TOS":doc.data().tos,
                "Fulfillment Status":doc.data().fulfillment_status,
                "Late":"False",
                "Comments": doc.data().cancel_reason
              })
              if(doc.data().line_items.length > 1){
                for(let i = 1; i< doc.data().line_items.length; ++i){
                  orders.push({
                    "Order No.":"",
                    "Client":	"",
                    "Wunschtermin": "",	
                    "Qty.":	doc.data().line_items[i].quantity,
                    "SKU int.":doc.data().line_items[i].skuInt,
                    "Description": doc.data().line_items[i].description,
                    "Recipient":"",
                    "Delivery Adress":"",
                    "TOS":"",
                    "Fulfillment Status":"",
                    "Late":"",
                    "Comments": ""
                  })
                }
              }
            }
          });
          const querySnapshot2 = await getDocs(q2);
          let returns=[]
          querySnapshot2.forEach((doc) => {
            if(getDateOfISOWeek(w,y) <= new Date(doc.data().delivery_at) && addWeeks(1,getDateOfISOWeek(w,y)) >= new Date(doc.data().delivery_at)){
            returns.push({
              "Order No.":doc.data().return_number,
              "Client":	client,
              "Wunschtermin": doc.data().return_at,	
              "Qty.":	doc.data().line_items[0].quantity,
              "SKU int.":doc.data().line_items[0].skuInt,
              "Description": doc.data().line_items[0].description,
              "Returner":doc.data().recipient,
              "Return Adress":doc.data().shipping_address.address + " " + doc.data().shipping_address.address2 + ", " + doc.data().shipping_address.zip + ", " + doc.data().shipping_address.city + ", " + doc.data().shipping_address.country,
              "TOS":doc.data().tos,
              "Fulfillment Status":doc.data().fulfillment_status,
              "Late":"False",
              "Comments": doc.data().cancel_reason
            })
            if(doc.data().line_items.length > 1){
              for(let i = 1; i< doc.data().line_items.length; ++i){
                returns.push({
                  "Order No.":"",
                  "Client":	"",
                  "Wunschtermin": "",	
                  "Qty.":	doc.data().line_items[i].quantity,
                  "SKU int.":doc.data().line_items[i].skuInt,
                  "Description": doc.data().line_items[i].description,
                  "Recipient":"",
                  "Delivery Adress":"",
                  "TOS":"",
                  "Fulfillment Status":"",
                  "Late":"",
                  "Comments": ""
                })
              }
            }
          }
          });
          let descriptions = [{
            "Header":"Order Stamp",
            "Description":"Date and time at which the order was sent out by the customer",
            "Use / Comment":"",
            "Example":""
          },{
            "Header":"Qty.",
            "Description":"Order quantity",
            "Use / Comment":"",
            "Example":""
          },
          {
            "Header":"SKU int.",
            "Description":"Internal OneSpot SKU Numbner (First 3 letters of client brand name + chronological numbering)",
            "Use / Comment":"",
            "Example":"zB. WIS3 = WISAG, 3rd product stored or on list"
          },
          {
            "Header":"SKU ext.",
            "Description":"External client's SKU number",
            "Use / Comment":"",
            "Example":""
          },
          {
            "Header":"Description",
            "Description":"Product description from client",
            "Use / Comment":"",
            "Example":""
          },{
            "Header":"Recipient",
            "Description":"Name of person receiving the order",
            "Use / Comment":"",
            "Example":""
          },{
            "Header":"Time received",
            "Description":"The time at which OneSpot received the order ",
            "Use / Comment":"Should  always equal Time Stamp, otherwise check order-forwarding process with client",
            "Example":""
          },{
            "Header":"TOS",
            "Description":"Type of Scheduling. The type by which the dired order type was defined.",
            "Use / Comment":"",
            "Example":"Instant, Appointment, Jour Fix"
          },{
            "Header":"Wunschtermin",
            "Description":"Gewünschte Lieferzeit. Bei on-demand, 15min nach der Bestellung. Bei Zeitfenstern der mittlere Wert.",
            "Use / Comment":"",
            "Example":"",
          },{
            "Header":"In process",
            "Description":"Time at which we started processing the order.",
            "Use / Comment":"This will be the time at which the customer gets a -your order is being processed- SMS",
            "Example":""
          },{
            "Header":"Fail",
            "Description":"Delivery failed? ",
            "Use / Comment":"Mark Failed where delivery was no success and enter reason in commeents section",
            "Example":""
          }]
            var Inventur = XLSX.utils.book_new();
            var Rides = XLSX.utils.book_new();
            var wsInventory = XLSX.utils.json_to_sheet(inventory);
            var wsDeliveries = XLSX.utils.json_to_sheet(orders);
            var wsReturns = XLSX.utils.json_to_sheet(returns);
            var wsDescriptions = XLSX.utils.json_to_sheet(descriptions);
            var wsIn = XLSX.utils.json_to_sheet(flowIn);
            var wsOut = XLSX.utils.json_to_sheet(flowOut);
            var wsColsInventory = [
              {wch:10},
              {wch:15},
              {wch:30},
              {wch:30},
              {wch:15},
              {wch:5},
              {wch:5},
            ];
            wsInventory["!cols"] = wsColsInventory; // set column A width to 10 characters
            XLSX.utils.book_append_sheet(Inventur, wsInventory, "Inventory");
            XLSX.utils.book_append_sheet(Inventur, wsIn, "In");
            XLSX.utils.book_append_sheet(Inventur, wsOut, "Out");
            XLSX.utils.book_append_sheet(Rides, wsDeliveries, "Deliveries");
            XLSX.utils.book_append_sheet(Rides, wsReturns, "Returns");
            XLSX.utils.book_append_sheet(Rides, wsDescriptions, "Descriptions");
            XLSX.writeFile(Inventur, `${client}_Inventur_${monthoptions[getDateOfISOWeek(w,y).getMonth()]}${year.substring(2)}_Ende ${week}.xlsx`, {type: 'file'});
            XLSX.writeFile(Rides, `${client}_Rides_${monthoptions[getDateOfISOWeek(w,y).getMonth()]}${year.substring(2)}_Ende ${week}.xlsx`, {type: 'file'});
    
            //    const product1 = XLSX.utils.json_to_sheet(productDetail);
            //    const user1 = XLSX.utils.json_to_sheet(user);
            //    const wb = {Sheets:{product:product1, user:user1}, SheetNames:["product", "user"]};
            //    const excelBuffer = XLSX.write(wb, {bookType:"xlsx", type:"array"});
            //    const data = new Blob([excelBuffer], {type:fileType});
            //    FileSaver.saveAs(data, "myfile"+".xlsx") */ 
       
        }

    return(
        <div style={{display: "flex", justifyContent: "center"}}>
            <div class="mr-2">
              <select id='year' name="year" onChange={event => {setYear(event.target.value)}}  class=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                {yearoptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div class="mr-2">
              <select id='week' name="week" onChange={event => setWeek(event.target.value)}  class=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                {weekoptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <button class="text-white bg-orange-500 hover:bg-orange-400 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2" onClick={exportToCSV}>Export</button>
          </div>
    )
}