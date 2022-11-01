import db from '../firebase';
import { collection, onSnapshot} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Table from '../components/table';
import MessageForm from '../components/messageForm';
import React from 'react';
import { DateDeliveryField,StateDeliveryField,ContentDeliveryField } from '../components/tableCells';



export function Messages() {
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [clients, setClients] = useState({"WISAG":{}});
  
  useEffect(() => {
    const colRef1 = collection(db, "clients" )
    const colRef = collection(db, "messages" )
    //real time update
    onSnapshot(colRef, (snapshot) => {
        setData([])
        snapshot.docs.forEach((doc) => {
          setData((prev) => [ doc.data() , ...prev])
        })
    })
    onSnapshot(colRef1, (snapshot) => {
        setClients([])
        let clients = {};
        snapshot.docs.forEach((doc) => {
          clients[doc.id] = doc.data()
          setClients(clients)
        })
      })
    console.log(data)
  }, [])

  const columns = [
    {
        Header: "Client",
        id: "client",
        accessor: "client",
    },
    {
      Header: "To",
      accessor: "to",
      id: "to",
    },
    {
      Header: "Content",
      accessor: "content",
      id: "content",
      Cell: ContentDeliveryField
    },
    {
        Header: "Delivery Date",
        accessor: "delivery",
        id: "delivery_date",
        Cell: DateDeliveryField
      },
    {
        Header: "Delivery State",
        accessor: "delivery",
        id: "delivery_state",
        Cell: StateDeliveryField
    }
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
            <span  class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Messages 📬</span>
          </div>      
        <Table columns={columns} data={data} button={<AddButton/>}/>
      </div>
      <MessageForm handleVisibility={handleVisibility} visible={visible} clients={clients}/>
    </div>
  );
}
