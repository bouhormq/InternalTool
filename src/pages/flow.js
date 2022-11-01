/* eslint-disable jsx-a11y/alt-text */
import Table from '../components/table';
import db from '../firebase';
import { collection, onSnapshot, query, orderBy,where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { DateField, ItemsField, ActionFlow } from '../components/tableCells';
import plus from "../media/plus-white.png"
import { FlowForm } from '../components/flowForm';
import React from 'react';


export function Flow() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [type, setType] = useState();
  const [visible, setVisible] = useState(false);
  const [clients, setClients] = useState({});
  const [warehouses, setWarehouses] = useState(
    {"DE-FFM-NWES": {address: "Finkenhofstraße 12, 60322 Frankfurt am Main, Germany", city: "Frankfurt am Main", country: "Germany",country_code: "DE", delivers_to: ['60306', '60308', '60310', '60311', '60312', '60313', '60314', '60315', '60316', '60318', '60320', '60322', '60323', '60325', '60329', '60385', '60487', '60594', '60596'], postal_code: "60322", province: "Hesse"}},
  );
  
  useEffect(() => {
    const colRef1 = collection(db, "flow" )
    const q1 = query(colRef1, where("direction", "==", "outgoing"));
    const q2 = query(colRef1, where("direction", "==", "incoming"));

    
    onSnapshot(q1, (snapshot) => {
      setOutgoing([])
        snapshot.docs.forEach((doc) => {
          setOutgoing((prev) => [ doc.data() , ...prev])
        })
    })
    onSnapshot(q2, (snapshot) => {
      setIncoming([])
        snapshot.docs.forEach((doc) => {
          setIncoming((prev) => [ doc.data() , ...prev])
        })
    })  

  }, [])

  const columns = [
    {
      Header: "Action",
      id: "action",
      Cell: ActionFlow, // new
    },
    {
      Header: "Warehouse",
      accessor: "warehouse",
      id: "warehouse",
    },
    {
      Header: "Items",
      accessor: "line_items",
      id: "line_items",
      Cell: ItemsField, // new
    },
    {
      Header: "Recorded At",
      accessor: "created_at",
      id: "created_at",
      Cell: DateField, // new
    },
    {
      Header: "Client",
      accessor: "client",
      id: "client",
    },
    {
      Header: "Type",
      accessor: "type",
      id: "type",
    }
  ]
  const handleVisibility = (visibility,newtype) => {
    // 👇️ take parameter passed from Child component
    setType(newtype)
    setVisible(visibility);
  };

  const AddButton = ({newtype}) => {
   return(
    <button onClick={() => handleVisibility(true,newtype)} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-4 py-2  text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        Add
    </button>
   )
  }
  
  return (
    <div class="container mx-auto">
        <div className="mt-5">
          <div className="mb-6">
                <span class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Outgoing 🚚 🔜</span>
              </div>
          <div className="mt-5">
            <Table columns={columns} data={outgoing} button={<AddButton newtype="outgoing"/>} />
          </div>
          </div>
          <div className="mb-6">
            <span  class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Incoming 🚚 🔙</span>
          </div>
          <div className="mt-5">
            <Table  columns={columns} data={incoming} button={<AddButton newtype="incoming"/>}/>
          </div>
          <FlowForm handleVisibility={handleVisibility} visible={visible} type={type}/>
        </div>  
  );
}
