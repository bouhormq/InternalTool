import { v4 as uuidv4 } from 'uuid';
import { collection, getDocs,query } from 'firebase/firestore';
import db from '../firebase'



export const handleChangeCheckbox = (event, daysOfWeek) => {
    var daysOfWeekArray = daysOfWeek
      if(event.target.checked === true) {
        daysOfWeekArray.push(event.target.value)
      }
      if(event.target.checked === false) {
        var index = daysOfWeekArray.indexOf(event.target.value);
        if (index !== -1) {
          daysOfWeekArray.splice(index, 1);
        }
      }
  }

export const handleRemoveFields = async (id,inputFields) => {
    const values  = [...inputFields];
    values.splice(values.findIndex(value => value.id === id), 1);
    return values
  }

 export const handleAddFields = async (inputFields,products,selectedClient) => {
    return [...inputFields, { id: uuidv4(), quantity: '', sku: Object.keys(products)[0], skuInt: `${selectedClient}-${Object.keys(products)[0]}`, description: ''}]
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


  