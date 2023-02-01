import React from 'react'
import { doc } from 'firebase/firestore'
import db from '../../firebase'
import { useEffect, useState } from 'react'
import { setDoc, getCountFromServer, query, collection, where } from 'firebase/firestore'
import { UserAuth } from '../../context/authContex'
const orderid = require('order-id')('key');




export default function RiderForm({ visible, handleVisibility,edit,rider }) {
  const {user} = UserAuth();
  const [disabled, setDisabled] = useState(false);
  const [beforeEdit, setBeforeEdit] = useState([{ 
    name: "",
    lastName: "",
    number: ""
  }]);

  const [inputFieldsGlobal, setInputFieldsGlobal] = useState([{ 
    riderID: "" ,
    name: "",
    id: "",
    createdAt: "",
    createdBy: user.email,
    updatedAt: "",
    updatedBy: user.email,
    lastName: "",
    number: "",
    email: "",
  }]);
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    if(edit){
      setInputFieldsGlobal([rider])
      setDisabled(edit);
      setBeforeEdit({
      name: rider.name,
      lastName: rider.lastName,
      number: rider.number})
    }
  }, [visible])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkEmptyValues(inputFieldsGlobal[0] && inputFieldsGlobal[0].number.match('^[\+][(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$'))) {
      if(!edit){
        inputFieldsGlobal[0].id = orderid.generate()
        inputFieldsGlobal[0].riderID = `${inputFieldsGlobal[0].email}-${inputFieldsGlobal[0].id}`
        inputFieldsGlobal[0].createdAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin" })
        inputFieldsGlobal[0].createdBy = user.email
      }
      inputFieldsGlobal[0].updatedAt = new Date().toLocaleString("sv", { timeZone: "Europe/Berlin" })
      inputFieldsGlobal[0].updatedBy = user.email
      const snap = await getCountFromServer(query(
        collection(db, 'riders'), where("name", '==', inputFieldsGlobal[0].name), where("lastName", '==', inputFieldsGlobal[0].lastName),where("number", '==', inputFieldsGlobal[0].number)
      ))
      if(snap.data().count > 0 && (!edit || (edit && ((beforeEdit.number !== inputFieldsGlobal[0].number)||((beforeEdit.lastName !== inputFieldsGlobal[0].lastName) && (beforeEdit.name !== inputFieldsGlobal[0].name)))))){
        setAlertVisible(true)
      }
      else{
        await setDoc(doc(db, "riders", inputFieldsGlobal[0].riderID), inputFieldsGlobal[0])
        handleVisibility(false)
        setAlertVisible(false)
        clearRiderForm()
      }      
    }
    else {
      setAlertVisible(true)
    }
  };


  const clearRiderForm = () => {
    handleVisibility(false)
    setInputFieldsGlobal([{ 
        riderID: "" ,
        name: "",
        id: "",
        createdAt: "",
        createdBy: user.email,
        updatedAt: "",
        updatedBy: user.email,
        lastName: "",
        number: "",
        email: "",
    }])
    setAlertVisible(false)
  }

  const handleChangeInput = (event) =>{
    const newInputFields = inputFieldsGlobal.map( i => {     
        i[event.target.name] = event.target.value.trim()
        return i;
    })
    setInputFieldsGlobal(newInputFields);
}


const checkEmptyValues = (item) => {
    if (
        inputFieldsGlobal[0].name.length === 0 ||
        inputFieldsGlobal[0].number.length === 0 ||
        inputFieldsGlobal[0].email.length === 0 ||
        inputFieldsGlobal[0].lastName.length === 0 
    ) {
      return false
    }
    else {
      return true;
    }
  };


  if (!visible) return null;
  else {
    return (
      <div className="overflow-y-auto fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="p-5 m-10 max-h-xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
          {alertVisible &&
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong class="block font-bold">🧙‍♂️ Hello traveler... Double check that:</strong>
              <span class="block">- All the fields are not empty.</span>
              <span class="block">- There is no other Rider that has the same phone number or name and last name.</span>
              <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg onClick={() => setAlertVisible(false)} class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
              </span>
            </div>
          }
          <form onSubmit={handleSubmit}>
            <div class="grid gap-6 mb-6 md:grid-cols-1">
              <div >
                <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Name</label>
                <input type="text" value={inputFieldsGlobal[0].name} onChange={event => handleChangeInput(event)} name="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Salim" required="" />
              </div>
              <div >
                <label for="lastName" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Last Name</label>
                <input type="text" value={inputFieldsGlobal[0].lastName} onChange={event => handleChangeInput(event)} name="lastName" id="lastName" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Bouhorma Mouffak" required="" />
              </div>
              <div >
                <label for="number" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Number</label>
                <input type="text" value={inputFieldsGlobal[0].number} onChange={event => handleChangeInput(event)} name="number" id="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="+34640801500" required="" />
              </div>
              {!disabled &&
              <div >
                <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email</label>
                <input type="text" value={inputFieldsGlobal[0].email} onChange={event => handleChangeInput(event)} name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="salim@onespot.de" required="" />
              </div>
              }
            </div>
            <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
            <button type="button" onClick={() => clearRiderForm()} class="ml-5 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
          </form>
        </div>
      </div>
    );
  }
}