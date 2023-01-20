import db from '../firebase';
import { collection, onSnapshot} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Table from '../components/table';
import React from 'react';
import { RecipientForm } from '../components/forms/recipientForm';
import { ShippingField, ActionRecipients} from '../components/tableCells';



export function Recipients() {
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);


  
  useEffect(() => {
    const colRef2 = collection(db, "recipients" )
    let isMounted = true;
    onSnapshot(colRef2, (snapshot) => {
      setData([])
      if (isMounted) {
        snapshot.docs.forEach((doc) => {
          setData((prev) => [ doc.data() , ...prev])
        })
      }
    })
    return () => {
      isMounted = false;
    };
  }, [])


  const Warehouses = ({ values }) => {
    return (
      <>
        <span>[</span>
        {values.map((warehouse, idx) => {
          if(idx !== values.length-1){
            return (
              <span key={idx} className="badge">
                {warehouse + ", "}
              </span>
            );
          }
          else{
            return (
              <span key={idx} className="badge">
                {warehouse}
              </span>
            );
          }
        })}
        <span>]</span>
      </>
    );
  };

  const Contact = ({ values }) => {
    return (
      <>
        <span>[</span>
        {values.map((contact, idx) => {
          if(idx !== values.length-1){
            return (
              <span key={idx} className="badge">
                {contact.name + ", "}
              </span>
            );
          }
          else{
            return (
              <span key={idx} className="badge">
                {contact.name}
              </span>
            );
          }
        })}
        <span>]</span>
      </>
    );
  };


  const columns = [
    {
      Header: "Action",
      accessor: "action",
      id: "action",
      Cell: ActionRecipients
    },
    {
      Header: "Name",
      accessor: "name",
      id: "name",
    },{
      Header: "Client",
      accessor: "client.name",
      id: "client",
    },
    {
      Header: "Contacts",
      accessor: "contacts",
      id: "contacts",
      Cell: ({ cell: { value } }) => <Contact values={value} />
    },
    {
      Header: "Address",
      accessor: "shippingAddress",
      id: "shippingAddress",
      Cell: ShippingField 
    },{
      Header: "Warehouses",
      accessor: "availableWarehouses",
      id: "warehouses",
      Cell: ({ cell: { value } }) => <Warehouses values={value} />
    },
  ]

  const handleVisibility = visibility => {
    // 👇️ take parameter passed from Child component
    setVisible(visibility);
  };
  const AddButton = () => {
    return(
     <button onClick={() => handleVisibility(true)} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-4 py-2  text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
         Add
     </button>
    )
   }

  return (
    <div class="container mx-auto">
      <div className="mt-5">
        <div className="mb-6">
            <span class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Recipients 🏪</span>
        </div>      
        <Table columns={columns} data={data} button={<AddButton/>}/>
      </div>
      <RecipientForm handleVisibility={handleVisibility} visible={visible} edit={false} />
    </div>
  );
}
