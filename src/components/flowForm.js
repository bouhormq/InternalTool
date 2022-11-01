import React, { useEffect } from 'react'
import db from '../firebase'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { collection, onSnapshot, getDocs,query,setDoc,doc,getDoc,docSnap } from 'firebase/firestore';
import { handleChangeCheckbox, handleRemoveFields, handleAddFields, getClientProducts } from './handleForm';
import { UserAuth } from '../context/authContex';


export function FlowForm({visible,handleVisibility, type}) {
  const {numberFlows,warehouses,clients} = UserAuth();
  const [numberClientFlows, setClientNumberFlows] = useState();
  const [products, setProducts] = useState([]);
  const [selectedClient, setselectedClient] = useState();
  const [inputFieldsGlobal, setInputFieldsGlobal] = useState([
    { total_weight:'',
      address: '',
      city: '',
      zip: '',
      total_price:'',
      delivery_at:'',
      shipping_address: {},
      total_dimensions:'',
      created_at:'',
      contact_email:'',
      updated_at:'',
      line_items: [],
      client: undefined,
      invoiceStamp: '', 
      contactNumber: '', 
      warehouse: Object.keys(warehouses)[0],
      flowNumber: `${numberFlows}`,
      clientFlowNumber: `${numberClientFlows}`,
      flowID:`${selectedClient}-${numberFlows}-${type}-${"WM"}`,
      type: "Warehouse Managment",
      direction: `${type}`,
    }]);
  const [inputFields, setInputFields] = useState([
    { id: uuidv4(), quantity: '', sku: '', skuInt: '', description: ''},
  ]);


  const getProducts = async (client) => {
    const colRefProducts = collection(db, `clients/${client}/inventory` )
    const colRefFlow = collection(db, `clients/${selectedClient}/flow` )
    const querySnapshot1 = await getDocs(query(colRefProducts));
    let newproducts = {};
    setProducts([])
    querySnapshot1.forEach((doc) => {
      newproducts[doc.id] = doc.data()
      setProducts(newproducts)
    });
    let selectedsku = Object.keys(newproducts)[0]
    setInputFields([{ id: uuidv4(), quantity: '', sku: `${selectedsku}`, skuInt: `${client}-${selectedsku}`, description: ''},])
    inputFieldsGlobal[0].line_items = [
      { id: uuidv4(), quantity: '', sku: `${selectedsku}`, skuInt: `${client}-${selectedsku}`, description: ''},
    ]
    onSnapshot(colRefFlow, (snapshot) => {
      setClientNumberFlows(snapshot.size)
      inputFieldsGlobal[0].clientFlowNumber = `${snapshot.size}`
    })
    inputFieldsGlobal[0].flowNumber = `${numberFlows}`
    inputFieldsGlobal[0].flowID = `${client}-${numberFlows}-${type}-${"WM"}`
    inputFieldsGlobal[0].flowNumber = `${numberFlows}`
    inputFieldsGlobal[0].direction = `${type}`
  }


 
  useEffect(  () => {
      if(inputFieldsGlobal[0].client === undefined){
        setselectedClient(Object.keys(clients)[0])
        inputFieldsGlobal[0].client = Object.keys(clients)[0]
        getProducts(Object.keys(clients)[0])
      }
    })


    useEffect(  () => {
      if(Object.keys(clients)[0] !== undefined && inputFieldsGlobal[0].client === undefined){
        getProducts(Object.keys(clients)[0])
      }
      else if(inputFieldsGlobal[0].client !== undefined){
        getProducts(inputFieldsGlobal[0].client)
      }
    }, [Object.keys(clients)[0],inputFieldsGlobal[0].client,type])

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("presubmit",inputFieldsGlobal[0])
    inputFieldsGlobal[0].created_at = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin"})
    let shipping_address = {
      address: inputFieldsGlobal[0].address,
      zip: inputFieldsGlobal[0].zip,
      city: inputFieldsGlobal[0].city,
      country: "Germany"
    }
    inputFieldsGlobal[0].shipping_address = shipping_address
    delete inputFieldsGlobal[0].address
    delete inputFieldsGlobal[0].zip
    delete inputFieldsGlobal[0].city
    for(let i = 0; i < inputFieldsGlobal[0].line_items.length; ++i ){
      inputFieldsGlobal[0].line_items[i].quantity = Number(inputFieldsGlobal[0].line_items[i].quantity)
      const docRef = doc(db, "inventory", inputFieldsGlobal[0].line_items[i].skuInt);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        let product = docSnap.data()
        if(inputFieldsGlobal[0].direction === "incoming"){
          product.inventory[inputFieldsGlobal[0].warehouse].inventory_quantity = product.inventory[inputFieldsGlobal[0].warehouse].inventory_quantity+inputFieldsGlobal[0].line_items[i].quantity
          product.inventory_total_stock = product.inventory_total_stock+inputFieldsGlobal[0].line_items[i].quantity
        }
        else if (inputFieldsGlobal[0].direction === "outgoing"){
          product.inventory[inputFieldsGlobal[0].warehouse].inventory_quantity = product.inventory[inputFieldsGlobal[0].warehouse].inventory_quantity-inputFieldsGlobal[0].line_items[i].quantity
          product.inventory_total_stock = product.inventory_total_stock-inputFieldsGlobal[0].line_items[i].quantity
        }
        await setDoc(doc(db, "inventory", inputFieldsGlobal[0].line_items[i].skuInt), product)
        await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client}/inventory/${inputFieldsGlobal[0].line_items[i].sku}`), product)
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }
    console.log("submit",inputFieldsGlobal[0])
    await setDoc(doc(db, "flow", inputFieldsGlobal[0].flowID), inputFieldsGlobal[0]);
    await setDoc(doc(db, "clients", `${inputFieldsGlobal[0].client}/flow/${inputFieldsGlobal[0].flowID}`), inputFieldsGlobal[0]);
    clearForm()
    handleVisibility(false)
  };

  const clearForm = () => {
    let selectedsku = Object.keys(products)[0]
    setInputFields([{ id: uuidv4(), quantity: '', sku: selectedsku, skuInt: `${selectedClient}-${selectedsku}`, description: ''},])
    setInputFieldsGlobal([
      {total_weight:'',
      total_price:'',
      address: '',
      city: '',
      zip: '',
      total_dimensions:'',
      shipping_address: {},
      created_at:'',
      contact_email:'',
      delivery_at:'',
      updated_at:'',
      line_items: [
        { id: uuidv4(), quantity: '', sku: selectedsku, skuInt: `${selectedClient}-${selectedsku}`, description: ''},
      ],
      client: undefined,
      invoiceStamp: '', 
      contactNumber: '', 
      warehouse: Object.keys(warehouses)[0],
      flowNumber: `${numberFlows}`,
      clientFlowNumber: `${numberClientFlows}`,
      flowID:  `${selectedClient}-${numberFlows}-${type}-${"WM"}`,
      direction: `${type}`,
      type:'Warehouse Managment'
    },
    ])
  }

  const handleChangeInputFieldsGlobal = async (event) => { 
    const newInputFieldsGlobal = inputFieldsGlobal.map(i => {
      i[event.target.name] = event.target.value
      return i;
    })
    setInputFieldsGlobal(newInputFieldsGlobal)
    if(event.target.name === "client"){
      inputFieldsGlobal[0].client = event.target.value
      setselectedClient(event.target.value)
      let newproducts = await getClientProducts(event.target.value)
      var selectedsku = Object.keys(newproducts)[0]
      setInputFields([{ id: uuidv4(), quantity: '', sku: selectedsku, skuInt: `${event.target.value}-${selectedsku}`, description: ''}])
      inputFieldsGlobal[0].line_items = [{ id: uuidv4(), quantity: '', sku: selectedsku, skuInt: `${event.target.value}-${selectedsku}`, description: ''}]
    } 
    console.log("input: ", inputFieldsGlobal[0])
  }

  const handleChangeInputFields = async (id, event) => {
    let newInputFields = inputFields.map(i => {
      if(id === i.id) {
        i[event.target.name] = event.target.value
        if(event.target.name === "sku"){
          i["skuInt"] = `${selectedClient}-${event.target.value}`
        }
      }
      return i;
    })
    inputFieldsGlobal[0].line_items = newInputFields
    setInputFields(newInputFields);
  }


  if(!visible) return null;
  else{
      return (
          <div className="overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
              <form onSubmit={handleSubmit}>
                  <div class="grid gap-6 mb-6 md:grid-cols-4">
                      <div>
                          <label for="client" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Client</label>
                          <select id='client' name="client" onChange={event => handleChangeInputFieldsGlobal(event)} value={inputFieldsGlobal[0].client}  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                            {Object.keys(clients).map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                      </div>
                      <div>
                        <label for="contactNumber" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Contact Number</label>
                        <input type="text" value={inputFieldsGlobal[0].contactNumber} onChange={event => handleChangeInputFieldsGlobal(event)} name="contactNumber" id="contactNumber" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="+49 · · · · · · · · ·" required=""/>
                      </div>
                      <div>
                          <label for="invoiceStamp" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Invoice Stamp</label>
                          <input  name="invoiceStamp" type="datetime-local" value={inputFieldsGlobal[0].invoiceStamp} onChange={event => handleChangeInputFieldsGlobal(event)} id="orderStamp" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Select date"/>
                      </div>
                      { type === "outgoing" ? <div>
                          <label for="delivery_at" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Delivery At</label>
                          <input  name="delivery_at" type="datetime-local" value={inputFieldsGlobal[0].delivery_at} onChange={event => handleChangeInputFieldsGlobal(event)} id="delivery_at" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Select date"/>
                      </div> : <div>
                          <label for="return_at" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Return At</label>
                          <input  name="return_at" type="datetime-local" value={inputFieldsGlobal[0].return_at} onChange={event => handleChangeInputFieldsGlobal(event)} id="return_at" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Select date"/>
                      </div> }
                      <div >
                        <label for="address" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Address</label>
                        <input name="address" value={inputFieldsGlobal[0].address} onChange={event =>  handleChangeInputFieldsGlobal(event)} type="text" id="address" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Finkenhofstraße 12, 60322 Frankfurt am Main, Germany" required=""/>
                      </div>
                      <div >
                        <label for="city" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">City</label>
                        <input name="city" value={inputFieldsGlobal[0].city} onChange={event =>  handleChangeInputFieldsGlobal(event)} type="text" id="city" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Frankfurt am Main" required=""/>
                      </div>
                      <div >
                        <label for="zip" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Zip</label>
                        <input name="zip" value={inputFieldsGlobal[0].zip} onChange={event =>  handleChangeInputFieldsGlobal(event)} type="text" id="zip" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="60322" required=""/>
                      </div>
                      <div>
                        <label for="warehouse" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Warehouse</label>
                        <select name="warehouse" onChange={event => handleChangeInputFieldsGlobal(event)} value={inputFieldsGlobal[0].warehouse}  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                            {Object.keys(warehouses).map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                        </select>
                      </div> 
                      { inputFields.map(inputField => (
                        <div key={inputField.id} style={{gridColumn: "1 / -1"}}> 
                          <div class="grid gap-6 mb-6 md:grid-cols-4"> 
                            <div>
                              <label for="quantity" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Quantity</label>
                              <input name="quantity" value={inputField.quantity} onChange={event => handleChangeInputFields(inputField.id, event)} type="number" id="quantity" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="1" required=""/>
                            </div>
                            <div>
                              <label for="sku" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">SKU</label>
                                <select id='sku' name="sku" onChange={event => handleChangeInputFields(inputField.id, event)} value={inputField.sku}  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                                  {Object.keys(products).map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                            </div>
                            <div >
                              <label for="description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Description</label>
                              <input name="description" value={inputField.description} onChange={event => handleChangeInputFields(inputField.id, event)} type="text" id="description" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="description" required=""/>
                            </div> 
                            <div>
                              <button type="button" onClick={() => handleAddFields(inputFields,products,selectedClient).then(function(value){setInputFields(value); inputFieldsGlobal[0].line_items = value})} class="mt-7 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">+</button>
                              <button type="button" disabled={inputFields.length === 1} onClick={() => handleRemoveFields(inputField.id, inputFields).then(function(value){setInputFields(value);inputFieldsGlobal[0].line_items=value})}  class="mt-7 ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">-</button>
                            </div>
                          </div>
                        </div>
                      )) }
                    </div>
                  <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                  <button type="button" onClick={() => {handleVisibility(false); clearForm()}} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
              </form>
            </div>
          </div>
        );
  }
  }