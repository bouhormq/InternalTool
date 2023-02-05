/* eslint-disable jsx-a11y/alt-text */
import Table from '../components/table';
import db from '../firebase';
import { collection, onSnapshot, query, orderBy,where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { DateField, ItemsField, ActionFlow,StatusPill } from '../components/tableCells';
import React from 'react';


export function FLogs() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  
  useEffect(() => {
    const colRef1 = collection(db, "flows" )
    const q1 = query(colRef1, where("direction", "==", "outgoing"), where("fulfillmentStatus", "in", ["cancelled","success","failure"]), orderBy("deliveryAt"));
    const q2 = query(colRef1, where("direction", "==", "incoming"), where("fulfillmentStatus", "in", ["cancelled","success","failure"]), orderBy("deliveryAt"));

    let isMounted = true;
    onSnapshot(q1, (snapshot) => {
      setOutgoing([])
      if (isMounted) {
        snapshot.docs.forEach((doc) => {
          setOutgoing((prev) => [ doc.data() , ...prev])
        })
      }
    })
    onSnapshot(q2, (snapshot) => {
      setIncoming([])
      if (isMounted) {
        snapshot.docs.forEach((doc) => {
          setIncoming((prev) => [ doc.data() , ...prev])
        })
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
    },{
      Header: "Recipient",
      accessor: "recipient.name",
      id: "recipient",
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
      Header: "Cancel Reason",
      accessor: "cancelReason",
      id: "cancelReason",
    },{
      Header: "Invoice Stamp",
      accessor: "invoiceStamp",
      id: "invoiceStamp",
      Cell: DateField, // new
    }
  ]


  
  return (
    <div class="container mx-auto">
        <div className="mt-5">
          <div className="mb-6">
                <span class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700 -z-10">Outgoing 🚚 🔜</span>
              </div>
          <div className="mt-5">
            <Table columns={columns} data={outgoing} />
          </div>
          </div>
          <div className="mb-6">
            <span  class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700 -z-10">Incoming 🚚 🔙</span>
          </div>
          <div className="mt-5">
            <Table  columns={columns} data={incoming} />
          </div>
        </div>  
  );
}
