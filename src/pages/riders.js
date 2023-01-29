import db from '../firebase';
import { collection, onSnapshot} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActionRider } from '../components/tableCells';
import Table from '../components/table';
import RiderForm from '../components/forms/riderForm';
import React from 'react';



export function Riders() {
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const colRef = collection(db, "riders" )
    //real time update
    let isMounted = true;
    onSnapshot(colRef, (snapshot) => {
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

  const columns = [
    {
      Header: "Action",
      accessor: "action",
      id: "action",
      Cell: ActionRider
    },
    {
      Header: "Name",
      accessor: "name",
      id: "name",
    },
    {
      Header: "Last Name",
      accessor: "lastName",
      id: "lastName",
    },{
      Header: "Number",
      accessor: "number",
      id: "number",
    },{
      Header: "Email",
      accessor: "email",
      id: "email",
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
            <span  class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Riders 🚴</span>
          </div>      
        <Table columns={columns} data={data} button={<AddButton/>}/>
      </div>
      <RiderForm handleVisibility={handleVisibility} visible={visible}/>
    </div>
  );
}
