import Table from '../components/table';
import db from '../firebase';
import { collection, onSnapshot, query, orderBy,where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { DateField, StatusPill, ShippingField, ItemsField, StatusPillAction } from '../components/tableCells';
import { DeliveryForm } from '../components/forms/deliveryForm';
import plus from "../media/plus-white.png"
import React from 'react';
import { PostalCodes } from '../components/tableCells';

//var distance = require("hpsweb-google-distance");

export function DLogs() {
  const [data, setData] = useState([]);
  const [oldData, setoldData] = useState([]);
  
  useEffect(() => {
    const colRef = collection(db, "orders" )
    const colRef1 = collection(db, "returns" )
    const q = query(colRef,where("fulfillmentStatus", "in", ["success","cancelled","failure"]),orderBy("deliveryAt"));
    const oldq = query(colRef1, where("fulfillmentStatus", "in", ["success","cancelled","failure"]),orderBy("deliveryAt"));

    let isMounted = true;
    onSnapshot(q, (snapshot) => {
        setData([])
        if (isMounted) {
          snapshot.docs.forEach((doc) => {
            setData((prev) => [ doc.data() , ...prev])
          })
        }
    })
    onSnapshot(oldq, (snapshot) => {
      setoldData([])
      if (isMounted) {
        snapshot.docs.forEach((doc) => {
          setoldData((prev) => [ doc.data() , ...prev])
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
      accessor: "fulfillmentStatus",
      id: "action",
      Cell: StatusPillAction, // new
    },{
      Header: "ID",
      accessor: "id",
      id: "id",
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
      Header: "Availabe Warehouses",
      accessor: "availableWarehouses",
      id: "availableWarehouses",
      Cell: ({ cell: { value } }) => <PostalCodes values={value} />
    },
    {
      Header: "Assigned Warehouse",
      accessor: "assignedWarehouse",
      id: "assignedWarehouse",
    },
    {
      Header: "Client",
      accessor: "client.name",
      id: "client",
    },{
      Header: "Contact",
      accessor: "contact.name",
      id: "contact",
    },{
      Header: "Recipient",
      accessor: "recipient.name",
      id: "recipient",
    },{
      Header: "Line Items",
      accessor: "lineItems",
      id: "lineItems",
      Cell: ItemsField, // new
    },
    {
      Header: "Shipping Address",
      accessor: "shippingAddress",
      id: "shippingAddress",
      Cell: ShippingField, // new
    },{
      Header: "Created At",
      accessor: "createdAt",
      id: "createdAt",
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
              <span class="-z-10 relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Deliveries 📄 🔜</span>
        </div>
        <Table columns={columns} data={data} />
        </div>
        <div className="mb-6">
              <span class="-z-10 relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Returns 📄 🔙</span>
        </div>
        <Table columns={columns} data={oldData} />
    </div>
  );
}
