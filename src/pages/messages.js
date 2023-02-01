import db from '../firebase';
import { collection, onSnapshot} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Table from '../components/table';
import MessageForm from '../components/forms/messageForm';
import React from 'react';
import {StateDeliveryField,ContentDeliveryField, DateField, DailyReminderStatus} from '../components/tableCells';



export function Messages() {
  const [data, setData] = useState([]);
  const [dailyReminders, setDailyReminders] = useState([]);
  const [visible, setVisible] = useState(false);
  const [clients, setClients] = useState({"WISAG":{}});
  
  useEffect(() => {
    const colRef1 = collection(db, "clients" )
    const colRef = collection(db, "messages" )
    const colRef2 = collection(db, "reminders" )
    let isMounted = true;
    //real time update
    onSnapshot(colRef, (snapshot) => {
        setData([])
        if (isMounted) {
          snapshot.docs.forEach((doc) => {
            setData((prev) => [ doc.data() , ...prev])
          })
          data.sort(function(a,b){
            return new Date(b["createdAt"]) - new Date(a["createdAt"])
          })
          setData(data)
        }
    })
    onSnapshot(colRef2, (snapshot) => {
      setDailyReminders([])
      if (isMounted) {
        snapshot.docs.forEach((doc) => {
          setDailyReminders((prev) => [ doc.data() , ...prev])
        })
      }
  })
    onSnapshot(colRef1, (snapshot) => {
        setClients([])
        if (isMounted) {
          let clients = {};
          snapshot.docs.forEach((doc) => {
            clients[doc.id] = doc.data()
            setClients(clients)
          })
        }
      })
      
    return () => {
      isMounted = false;
    }; 
  }, [])

  function compareTimeStamp(rowA, rowB, id, desc) {
    let a = rowA.values[id].toDate().toLocaleString("sv", { timeZone: "Europe/Berlin"});
    let b = rowB.values[id].toDate().toLocaleString("sv", { timeZone: "Europe/Berlin"});
    if (!a || a.length < 0) {  // Blanks and non-numeric strings to bottom
        a = desc ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    }
    if (!b || b.length < 0) {  // Blanks and non-numeric strings to bottom
      b = desc ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  }
    if (a > b) return 1; 
    if (a < b) return -1;
    return 0;
}

  const columns = [
    {
        Header: "Client",
        id: "client",
        accessor: "client.name",
    },
    {
      Header: "To",
      accessor: "to",
      id: "to",
    },
    {
      Header: "Content",
      accessor: "content.text",
      id: "content",
      Cell: ContentDeliveryField
    },
    {
      Header: "Delivery Date",
      accessor: "createdAt",
      id: "createdAt",
      Cell: DateField,
      sortType: compareTimeStamp
    },
    {
        Header: "Delivery State",
        accessor: "delivery.state",
        id: "delivery_state",
        Cell: StateDeliveryField
    }
  ]

  const columns1 = [
    {
      Header: "Status",
      id: "status",
      accessor: "createdAt",
      Cell: DailyReminderStatus, // new
    },
    {
      Header: "Sent At",
      accessor: "createdAt",
      id: "createdAt",
      Cell: DateField
    },
    {
      Header: "Client",
      id: "client",
      accessor: "client.name",
    },
    {
      Header: "Contact",
      accessor: "contact.name",
      id: "contact.name",
    },{
      Header: "Contact Number",
      accessor: "contact.number",
      id: "contact.number",
    },
    {
      Header: "Content",
      accessor: "content",
      id: "content",
      Cell: ContentDeliveryField
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
            <span  class="-z-10relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Daily Reminders 📅</span>
          </div>      
        <Table columns={columns1} data={dailyReminders}/>
      </div>
      <div className="mt-5">
        <div className="mb-6">
            <span  class="-1-10 relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Messages 📬</span>
          </div>      
        <Table columns={columns} data={data} button={<AddButton/>}/>
      </div>
      <MessageForm handleVisibility={handleVisibility} visible={visible} clients={clients}/>
    </div>
  );
}
