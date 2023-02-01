/* eslint-disable jsx-a11y/alt-text */
import Table from '../components/table';
import db from '../firebase';
import { collection, onSnapshot, query, orderBy,where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { DateField, ItemsField, ActionFlow,StatusPill } from '../components/tableCells';
import plus from "../media/plus-white.png"
import { FlowsForm } from '../components/forms/flowsForm';
import React from 'react';


export function Flows() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [type, setType] = useState();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const colRef1 = collection(db, "flows" )
    const q1 = query(colRef1, where("direction", "==", "outgoing"));
    const q2 = query(colRef1, where("direction", "==", "incoming"));

    let isMounted = true;
    onSnapshot(q1, (snapshot) => {
      setOutgoing([])
      if (isMounted) {
        snapshot.docs.forEach((doc) => {
          setOutgoing((prev) => [ doc.data() , ...prev])
        })
        outgoing.sort(function(a,b){
          return new Date(b["deliveryAt"]) - new Date(a["deliveryAt"])
        })
        setOutgoing(outgoing)
      }
    })
    onSnapshot(q2, (snapshot) => {
      setIncoming([])
      if (isMounted) {
        snapshot.docs.forEach((doc) => {
          setIncoming((prev) => [ doc.data() , ...prev])
        })
        incoming.sort(function(a,b){
          return new Date(b["deliveryAt"]) - new Date(a["deliveryAt"])
        })
        setIncoming(outgoing)
      }
      return () => {
        isMounted = false;
      };
    })  

  }, [])

  const columns = [
    {
      Header: "Action",
      id: "action",
      Cell: ActionFlow, // new
    },
    {
      Header: "ID",
      id: "id",
      accessor: "id", // new
    },
    {
      Header: "Warehouse",
      accessor: "assignedWarehouse",
      id: "assignedWarehouse",
    },
    {
      Header: "Fulfillment Status",
      accessor: "fulfillmentStatus",
      id: "fulfillmentStatus",
      Cell: StatusPill, // new
    },{
      Header: "Delivery At",
      accessor: "deliveryAt",
      id: "deliveryAt",
      Cell: DateField, // new
    },
    {
      Header: "Line Items",
      accessor: "lineItems",
      id: "lineItems",
      Cell: ItemsField, // new
    },
    {
      Header: "Client",
      accessor: "client.name",
      id: "client",
    },{
      Header: "Type",
      accessor: "type",
      id: "type",
    },{
      Header: "Contact",
      accessor: "contact.name",
      id: "contact",
    },{
      Header: "Created At",
      accessor: "createdAt",
      id: "createdAt",
      Cell: DateField, // new
    },
    {
      Header: "Updated At",
      accessor: "updatedAt",
      id: "updatedAt",
      Cell: DateField, // new
    },{
      Header: "Comments",
      accessor: "comments",
      id: "comments",
    },{
      Header: "Invoice Stamp",
      accessor: "invoiceStamp",
      id: "invoiceStamp",
      Cell: DateField, // new
    }
  ]
  const handleVisibility = async (visibility,newtype) => {
    // 👇️ take parameter passed from Child component
     await setType(newtype)
     await setVisible(visibility);
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
                <span class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700 -z-10">Outgoing 🚚 🔜</span>
              </div>
          <div className="mt-5">
            <Table columns={columns} data={outgoing} button={<AddButton newtype="outgoing"/>} />
          </div>
          </div>
          <div className="mb-6">
            <span  class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700 -z-10">Incoming 🚚 🔙</span>
          </div>
          <div className="mt-5">
            <Table  columns={columns} data={incoming} button={<AddButton newtype="incoming"/>}/>
          </div>
          <FlowsForm handleVisibility={handleVisibility} visible={visible} direction={type} key={type} edit={false}/>
        </div>  
  );
}
