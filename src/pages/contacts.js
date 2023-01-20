import db from '../firebase';
import { collection, onSnapshot} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Table from '../components/table';
import plus from "../media/plus-white.png"
import React from 'react';
import { ContactForm } from '../components/forms/contactForm';
import Toggle, {ActionContacts} from '../components/tableCells'


export function Contacts() {
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);


  
  useEffect(() => {
    const colRef2 = collection(db, "contacts" )
    let isMounted = true;
    onSnapshot(colRef2, (snapshot) => {
      setData([])
      if (isMounted) {
        snapshot.docs.forEach((doc) => {
          setData((prev) => [ doc.data() , ...prev])
        })
      }
    })
  }, [])

  const Recipients = ({ values }) => {
    // Loop through the array and create a badge-like component instead of a comma-separated string
    return (
      <>
      <span>[</span>
        {values.map((recipient, idx) => {
          if(idx !== values.length-1){
            return (
              <span key={idx} className="badge">
                {recipient.name + ", "}
              </span>
            );
          }
          else{
            return (
              <span key={idx} className="badge">
                {recipient.name}
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
      Cell: ActionContacts
    },
    {
      Header: "Available",
      accessor: "available",
      id: "available",
      Cell: Toggle
    },
    {
      Header: "Name",
      accessor: "name",
      id: "name",
    },
    {
      Header: "Client",
      accessor: "client.name",
      id: "client",
    },
    {
      Header: "Number",
      accessor: "number",
      id: "number",
    },
    {
      Header: "Email",
      accessor: "email",
      id: "email",
    },{
      Header: "Recipients",
      accessor: "recipients",
      id: "recipients",
      Cell: ({ cell: { value } }) => <Recipients values={value} />
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
            <span class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Contacts 👷</span>
        </div>      
        <Table columns={columns} data={data} button={<AddButton/>}/>
      </div>
      <ContactForm handleVisibility={handleVisibility} visible={visible} edit={false}/>
    </div>
  );
}
