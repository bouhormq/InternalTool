import { collection, getDocs,query, setDoc, doc, getDoc, deleteDoc, where } from 'firebase/firestore';
import { handleOrderFlow } from '../tableCells';
import { UserAuth } from '../../context/authContex';
import db from '../../firebase'
const orderid = require('order-id')('key');

export function addMinutes(date, minutes) {
  date.setMinutes(date.getMinutes() + minutes);

  return date;
}

export const tosOptions = [
  {value:"Jour Fix",label:"Jour Fix"},
  {value:"Appointment",label:"Appointment"},
  {value:"Instant",label:"Instant"}]

export const frequencyOptions = [
  {value:"Weekly",label:"Weekly"},
  {value:"Bi-Weekly",label:"Bi-Weekly"},
  {value:"Monthly",label:"Monthly"}
 ]

 export const roleOptions = [
  {value:"Property Manager",label:"Property Manager"},
  {value:"Other",label:"Other"}
 ]

export const contractLengthOptions = [
  {value:"3 Months",label:"3 Months"},
  {value:"4 Months",label:"4 Months"},
  {value:"5 Months",label:"5 Months"},
  {value:"6 Months",label:"6 Months"},
  {value:"7 Months",label:"7 Months"},
  {value:"8 Months",label:"8 Months"},
  {value:"9 Months",label:"9 Months"},
  {value:"10 Months",label:"10 Months"},
  {value:"11 Months",label:"11 Months"},
  {value:"12 Months",label:"12 Months"}
 ]

 export const dropDownCancelOptions = [
  {value:"Sobald unser Inventar eine Nachlieferung zulässt, werden wir Ihnen per SMS einen Link schicken, mit dem Sie das gewünschte Datum und die gewünschte Zeit für eine Nachlieferung wählen können. Wir werden Sie außerdem telefonisch für das Aufstocken des Materials kontaktieren.",label:"Not enough stock", labelGerman:"Nicht genügend Material auf Lager"},
  {value:"Sobald unser Personal eine Nachlieferung zulässt, werden wir Ihnen per SMS einen Link schicken, mit dem Sie das gewünschte Datum und die gewünschte Zeit für eine Nachlieferung wählen können. Es entstehen Ihnen natürlich keine weiteren Kosten – wir entschuldigen uns für die Unannehmlichkeiten!",label:"Staff shortage", labelGerman:"Fehlendes Personal"},
  {value:"Leider haben wir gerade mit Force-Mayeur-Schwierigkeiten zu kämpfen. Wir werden Sie kontaktieren, sobald wir wieder einsatzfähig sind und entschuldigen uns für die entstandenen Unannehmlichkeiten!",label:"Force Mayeur", labelGerman:"Force Mayeur"},
 ]

 export const dropDownCancelOptionsFlow = [
  {value:"",label:"Delivery staff didn't come"},
  {value:"",label:"Staff shortage"},
 ]

 

 export function updateLineItemStats(lineItems,inputFieldsGlobal){
  var  auxInputFieldsGlobal = inputFieldsGlobal
  var  totalDimensions = {H:"",W:"",L:""}
  var totalPrice = lineItems.reduce((accumulator, object) => {
    return accumulator + object.price;
  }, 0);
  var totalWeight = lineItems.reduce((accumulator, object) => {
    return accumulator + object.weight;
  }, 0);
  totalDimensions.H = lineItems.reduce((accumulator, object) => {
    return accumulator + object.dimensions.H;
  }, 0);
  totalDimensions.W = lineItems.reduce((accumulator, object) => {
    return accumulator + object.dimensions.W;
  }, 0);
  totalDimensions.L = lineItems.reduce((accumulator, object) => {
    return accumulator + object.dimensions.L;
  }, 0);
  auxInputFieldsGlobal.totalWeight = totalWeight
  auxInputFieldsGlobal.totalDimensions = totalDimensions
  auxInputFieldsGlobal.totalPrice = totalPrice
  return [auxInputFieldsGlobal];
 }

 
 export const validateContact = (option, inputFields) =>{
  if(option.available === true && option.recipients){
    for(var i = 0; i < option.recipients.length; ++i){
      if(option.recipients[i].recipientID === inputFields.recipient.recipientID) return true
    }
  }
  return false
}  

 export function SchedulingVisibility(inputFields, setVisibleTimeField,setVisibleFrequencyField,setVisibleContractLength){
    if(inputFields["tos"] !== "Jour Fix"){
      setVisibleTimeField(true)
      setVisibleFrequencyField(false)
      setVisibleContractLength(false)
      var checkboxes = document.getElementsByName('inline-checkbox');
      for (var checkbox of checkboxes) {
          checkbox.checked = false;
      }
      inputFields["frequency"] = "";
      inputFields["contractLength"] = "";
      inputFields["deliveryAt"] = "";
      inputFields["daysOfWeek"]=[];
      if(inputFields.tos === "Instant"){
        setVisibleTimeField(false)
        inputFields["deliveryAt"] = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
      }
    }
    else{
      setVisibleTimeField(true)
      setVisibleFrequencyField(true)
      setVisibleContractLength(true)
      inputFields["frequency"] = "";
      inputFields["contractLength"] = "";
      inputFields["deliveryAt"] = "";
      inputFields["daysOfWeek"]=[];
    }
  }

  export const checkEmptyValues = (item) => {
    if (typeof item === 'object' && item !== null) {
      for (const val of Object.values(item)) {
        if (!checkEmptyValues(val)) {
          return false;
        }
      }
    } else if (item.length === 0) {
      return false;
    }
    return true;
  };

export const handleChangeCheckbox = (event, daysOfWeek) => {
    var daysOfWeekArray = daysOfWeek
      if(event.target.checked === true) {
        daysOfWeekArray.push(event.target.value.trim())
      }
      if(event.target.checked === false) {
        var index = daysOfWeekArray.indexOf(event.target.value.trim());
        if (index !== -1) {
          daysOfWeekArray.splice(index, 1);
        }
      }
  }

export const handleRemoveFields = async (id,inputFields) => {
    var auxInputFields = inputFields
    const values  = [...inputFields.lineItems];
    values.splice(values.findIndex(value => value.id === id), 1);
    auxInputFields.lineItems = values
    return [auxInputFields]
  }

 export const handleAddFields = async (inputFields) => {
  var auxInputFields = inputFields
  auxInputFields.lineItems =  [...inputFields.lineItems, { id: orderid.generate(), quantity: "", sku: "", skuInt: "", description: ""}]
  return [auxInputFields]
  }

  export const getClientProducts = async (client) => {
    const colRefProducts = collection(db, `clients/${client}/inventory` )
    const querySnapshot1 = await getDocs(query(colRefProducts));
    let newproducts = {};
    querySnapshot1.forEach((doc) => {
      newproducts[doc.id] = doc.data()
    }); 
    return newproducts
  }

  

  export const getClientOrders= async (client) => {
    const colRefOrders = collection(db, `clients/${client}/orders` )
    const querySnapshot1 = await getDocs(query(colRefOrders));
    let neworders = {};
    querySnapshot1.forEach((doc) => {
      neworders[doc.id] = doc.data()
    }); 
    return neworders
  }
  
    export const setPropertyNestedObject = (obj, path, value) => {
      const [head, ...rest] = path.split('.')

      return {
          ...obj,
          [head]: rest.length
              ? setPropertyNestedObject(obj[head], rest.join('.'), value)
              : value
      }
    }

    export async function deleteSeries(flow){
      var q = null
      if(flow.deliveryID && flow.type === "Order") q = query(collection(db, "orders"), where("seriesID", "==", flow.seriesID), where('fulfillmentStatus', 'in', ["open","inProgress"]));
      else if(flow.deliveryID && flow.type === "Return") q = query(collection(db, "returns"), where("seriesID", "==", flow.seriesID), where('fulfillmentStatus', 'in', ["open","inProgress"]));
      else q = query(collection(db, "flows"), where("seriesID", "==", flow.seriesID), where('fulfillmentStatus', 'in', ["open","inProgress"]));
      const querySnapshot = await getDocs(q);
      var flows = [] 
      querySnapshot.forEach(async (doc) => {
        flows.push(doc.data())
      });
      var assignedWarehouse = flows[0].assignedWarehouse
      var lineItems = flows[0].lineItems
      var direction = null
      if(flow.flowID) direction = flows[0].direction
      else if(flow.deliveryID && flow.type === "Order") direction = "Order"
      else if(flow.deliveryID && flow.type === "Return") direction = "Return"
      var successes = 0
      var totalQuantity = {}
      flows.forEach(element => {if(element.fulfillmentStatus === "success"){successes += 1}})
      lineItems.forEach(element => {totalQuantity[element.inventoryID] = element.quantity * successes} )
      for (let i = 0; i < lineItems.length; ++i) {
        const docRef = doc(db, "inventory", lineItems[i].inventoryID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && assignedWarehouse) {
          let product = docSnap.data()
          if (direction === "incoming" || direction === "Return" ) {
            product.inventory[assignedWarehouse].inventoryQuantity = product.inventory[assignedWarehouse].inventoryQuantity - totalQuantity[lineItems[i].inventoryID]
            product.inventoryTotalStock = product.inventoryTotalStock - totalQuantity[lineItems[i].inventoryID]
          }
          else if (direction === "outgoing" || direction === "Order" ) {
            product.inventory[assignedWarehouse].inventoryQuantity = product.inventory[assignedWarehouse].inventoryQuantity + totalQuantity[lineItems[i].inventoryID]
            product.inventoryTotalStock = product.inventoryTotalStock + totalQuantity[lineItems[i].inventoryID]
          }
          await setDoc(doc(db, "inventory", lineItems[i].inventoryID), product)
          await setDoc(doc(db, "clients", `${flow.client.clientID}/inventory/${lineItems[i].inventoryID}`), product)
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      }
      if(flow.deliveryID && flow.type === "Order"){
        flows.forEach(async element => {
          await deleteDoc(doc(db, "orders", element.deliveryID));
          await deleteDoc(doc(db, "clients", `${element.client.clientID}/orders/${element.deliveryID}`));
          await deleteDoc(doc(db, "flows", `D-O-${element.deliveryID}`));
          await deleteDoc(doc(db, "clients", `${element.client.clientID}/flows/D-O-${element.deliveryID}`));
          await deleteDoc(doc(db, "clients", `${element.client.clientID}/contacts/${element.contact.contactID}/orders/${element.deliveryID}`));
          await deleteDoc(doc(db, "contacts", `${element.contact.contactID}/orders/${element.deliveryID}`));
        })
      }
      else if(flow.deliveryID && flow.type === "Return") {
        flows.forEach(async element => {
          await deleteDoc(doc(db, "returns", element.deliveryID));
          await deleteDoc(doc(db, "clients", `${element.client.clientID}/returns/${element.deliveryID}`));
          await deleteDoc(doc(db, "flows", `D-R-${element.deliveryID}`));
          await deleteDoc(doc(db, "clients", `${element.client.clientID}/flows/D-R-${element.deliveryID}`));
          await deleteDoc(doc(db, "clients", `${element.client.clientID}/contacts/${element.contact.contactID}/returns/${element.deliveryID}`));
          await deleteDoc(doc(db, "contacts", `${element.contact.contactID}/returns/${element.deliveryID}`));
        })
      }
      else{
        flows.forEach(async element => {
          await deleteDoc(doc(db, "flows", element.flowID));
          await deleteDoc(doc(db, "clients", `${element.client.clientID}/flows/${element.flowID}`));
          await deleteDoc(doc(db, "clients", `${element.client.clientID}/contacts/${element.contact.contactID}/flows/${element.flowID}`));
          await deleteDoc(doc(db, "contacts", `${element.contact.contactID}/flows/${element.flowID}`));
        })
      }
    };

    export const handleChangeInput = async (event, name, inputFields) =>{
      var  auxInputFields = inputFields
      if(name.includes('.')){
        auxInputFields = setPropertyNestedObject(inputFields, name, event.value.trim())
      }
      else{
        auxInputFields[name] = event.value.trim()
      }
      return [auxInputFields];
    }

  export const handleChangeSelect = async (event, name, single, inputFields) =>{
    var auxInputFields = inputFields
    if(!single){
      if(event){
        let elements = []
        for(var i = 0; i < event.length; ++i){
            elements.push(event[i].label)
        }
        if(name.includes('.')){
          auxInputFields = setPropertyNestedObject(auxInputFields, name, elements)
        }
        else{
          auxInputFields[name] = elements
        }
      }
      else{
        auxInputFields[name] = []
      }
    }
    else{
      if(event){
        if(name.includes('.')){
          auxInputFields = setPropertyNestedObject(auxInputFields, name, event.value)
        }
        else{
          auxInputFields[name] = event.value
        }
      }
      else{
        if(name.includes('.')){
          auxInputFields = setPropertyNestedObject(auxInputFields, name, "")
        }
        else{
          auxInputFields[name] = ""
        }
      }
    }  

    return [auxInputFields]
}

export async function deliveryToFlow(delivery,exchange,user){
  var flowID = ""
  if(delivery.type === "Order"){
    flowID = `D-O-${delivery.deliveryID}`
    let flow = {
      id: delivery.id,
      type: "Order",
      totalDimensions: delivery.totalDimensions,
      daysOfWeek: delivery.daysOfWeek,
      contractLength: delivery.contractLength,
      totalWeight: delivery.totalWeight,
      contact: delivery.contact,
      totalPrice: delivery.totalPrice,
      financialStatus: delivery.financialStatus,
      createdAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}),
      createdBy: user.email,
      cancelledAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}),
      cancelledBy: delivery.cancelledBy,
      cancelReason: delivery.cancelReason,
      assignedWarehouse: delivery.assignedWarehouse,
      updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}),
      updatedBy:new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}),
      fulfillmentStatus: delivery.fulfillmentStatus,
      lineItems: delivery.lineItems,
      flowID: `D-O-${delivery.deliveryID}`,
      deliveryID: delivery.deliveryID,
      client: delivery.client,
      invoiceStamp: delivery.invoiceStamp,
      deliveryAt: delivery.deliveryAt,
      recipient:delivery.recipient,
      tos: delivery.tos,
      frequency: delivery.frequency,
      seriesID: delivery.seriesID,
      direction: "outgoing",
      comments: delivery.comments,
      sms: delivery.sms,
    }
    console.log(flow,delivery)
    if("deliveryToFlow",delivery.fulfillmentStatus === "success") handleOrderFlow(delivery,"outgoing",user)
    await setDoc(doc(db, "flows", flow.flowID), flow);
    await setDoc(doc(db, "clients", `${flow.client.clientID}/flows/${flow.flowID}`), flow)
    await setDoc(doc(db, "clients", `${flow.client.clientID}/contacts/${flow.contact.contactID}/flows/${flow.flowID}`), flow)
    await setDoc(doc(db, "contacts", `${flow.contact.contactID}/flows/${flow.flowID}`), flow)
  }
  else if(delivery.type === "Return"){
    flowID = `D-R-${delivery.deliveryID}`
    let flow = {
      id: delivery.id,
      type: "Return",
      totalDimensions: delivery.totalDimensions,
      daysOfWeek: delivery.daysOfWeek,
      contractLength: delivery.contractLength,
      totalWeight: delivery.totalWeight,
      contact: delivery.contact,
      totalPrice: delivery.totalPrice,
      financialStatus: delivery.financialStatus,
      createdAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}),
      createdBy: user.email,
      cancelledAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}),
      cancelledBy: delivery.cancelledBy,
      cancelReason: delivery.cancelReason,
      assignedWarehouse: delivery.assignedWarehouse,
      updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}),
      updatedBy:new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}),
      fulfillmentStatus: delivery.fulfillmentStatus,
      lineItems: delivery.lineItems,
      flowID: `D-R-${delivery.deliveryID}`,
      deliveryID: delivery.deliveryID,
      client: delivery.client,
      invoiceStamp: delivery.invoiceStamp,
      deliveryAt: delivery.deliveryAt,
      recipient:delivery.recipient,
      tos: delivery.tos,
      frequency: delivery.frequency,
      seriesID: delivery.seriesID,
      direction: "incoming",
      comments: delivery.comments,
      sms: delivery.sms,
    }
    if(delivery.fulfillmentStatus === "success") handleOrderFlow(delivery,"incomming",user)
    await setDoc(doc(db, "flows", flow.flowID), flow);
    await setDoc(doc(db, "clients", `${flow.client.clientID}/flows/${flow.flowID}`), flow)
    await setDoc(doc(db, "clients", `${flow.client.clientID}/contacts/${flow.contact.contactID}/flows/${flow.flowID}`), flow)
    await setDoc(doc(db, "contacts", `${flow.contact.contactID}/flows/${flow.flowID}`), flow)
  }
  else if(exchange){
    flowID = `D-E-${delivery.deliveryID}`
    let flow = {
      id: delivery.id,
      type: "Exchange",
      totalDimensions: delivery.totalDimensions,
      totalWeight: delivery.totalWeight,
      contact: delivery.contact,
      totalPrice: delivery.totalPrice,
      financialStatus: delivery.financialStatus,
      createdAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}),
      createdBy: user.email,
      assignedWarehouse: delivery.assignedWarehouse,
      updatedAt: new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}),
      updatedBy:new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"}),
      fulfillmentStatus: delivery.fulfillmentStatus,
      lineItems: delivery.lineItems,
      flowID: flowID,
      deliveryID: delivery.deliveryID,
      client: delivery.client,
      invoiceStamp: delivery.invoiceStamp,
      deliveryAt: delivery.deliveryAt,
      recipient:delivery.recipient,
      direction: "incoming",
      comments: delivery.comments,
      sms: delivery.sms,
    }
    handleOrderFlow(delivery,"incoming",user)
    await setDoc(doc(db, "flows", flow.flowID), flow);
    await setDoc(doc(db, "clients", `${flow.client.clientID}/flows/${flow.flowID}`), flow)
    await setDoc(doc(db, "clients", `${flow.client.clientID}/contacts/${flow.contact.contactID}/flows/${flow.flowID}`), flow)
    await setDoc(doc(db, "contacts", `${flow.contact.contactID}/flows/${flow.flowID}`), flow)
  }
  return flowID
}


export const handleSkuForm = async (event, id, name, inputFields) => {
  var auxInputFields = inputFields
  if(event){
    let newInputFields = inputFields["lineItems"].map(i => {
      if(id === i.id) {
        if(name === "quantity"){
          i[event.target.name] = Number(event.target.value.trim())
        }
        else{
          i[name] = event.value
          if(name === "sku"){
            i["skuInt"] = `${event.client.clientID}-${event.value}`
            i["description"] = event.title
            i["dimensions"] = event.dimensions
            i["weight"] = event.weight
            i["price"] = event.price
            i["inventoryID"] = event.inventoryID
            i["title"] = event.title
          }
        }
      }
      return i;
    })
    auxInputFields.lineItems = newInputFields
  }
  return [auxInputFields]
}








  