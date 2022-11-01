import Table from '../components/table';
import db from '../firebase';
import { collection, onSnapshot, query, orderBy,where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { DateField, StatusPill, ShippingField, ItemsField, StatusPillAction } from '../components/tableCells';
import { OrderForm } from '../components/orderForm';
import plus from "../media/plus-white.png"
import React from 'react';

//var distance = require("hpsweb-google-distance");

export function Logs() {
  const [data, setData] = useState([]);
  const [oldData, setoldData] = useState([]);
  
  useEffect(() => {
    const colRef = collection(db, "orders" )
    const colRef1 = collection(db, "returns" )
    const q = query(colRef,where("fulfillment_status", "in", ["success","cancelled","failure"]));
    const oldq = query(colRef1, where("fulfillment_status", "in", ["success","cancelled","failure"]));

    
    onSnapshot(q, (snapshot) => {
        setData([])
        snapshot.docs.forEach((doc) => {
          setData((prev) => [ doc.data() , ...prev])
        })
    })
    onSnapshot(oldq, (snapshot) => {
      setoldData([])
      snapshot.docs.forEach((doc) => {
        setoldData((prev) => [ doc.data() , ...prev])
      })
    })    
  }, [])

  const columns = [
    {
      Header: "Action",
      accessor: "fulfillment_status",
      id: "action",
      Cell: StatusPillAction, // new
    },
    {
      Header: "Fulfillment Status",
      accessor: "fulfillment_status",
      id: "fulfillment_status",
      Cell: StatusPill, // new
    },
    {
      Header: "Client",
      accessor: "client",
      id: "client",
    },
    {
      Header: "Order Number",
      accessor: "order_number",
      id: "order_number",
    },
    {
      Header: "Delivery At",
      accessor: "delivery_at",
      id: "delivery_at",
      Cell: DateField, // new
    },
    {
      Header: "Created At",
      accessor: "created_at",
      id: "created_at",
      Cell: DateField, // new
    },
    {
      Header: "Shipping Address",
      accessor: "shipping_address",
      id: "shipping_address",
      Cell: ShippingField, // new
    },
    {
      Header: "Items",
      accessor: "line_items",
      id: "line_items",
      Cell: ItemsField, // new
    },
  ]

  const oldColumns = [
    {
      Header: "Action",
      accessor: "fulfillment_status",
      id: "action",
      Cell: StatusPillAction, // new
    },
    {
      Header: "Fulfillment Status",
      accessor: "fulfillment_status",
      id: "fulfillment_status",
      Cell: StatusPill, // new
    },
    {
      Header: "Client",
      accessor: "client",
      id: "client",
    },
    {
      Header: "Order Number",
      accessor: "order_number",
      id: "order_number",
    },
    {
      Header: "Return At",
      accessor: "return_at",
      id: "return_at",
      Cell: DateField, // new
    },
    {
      Header: "Created At",
      accessor: "created_at",
      id: "created_at",
      Cell: DateField, // new
    },
    {
      Header: "Shipping Address",
      accessor: "shipping_address",
      id: "shipping_address",
      Cell: ShippingField, // new
    },
    {
      Header: "Items",
      accessor: "line_items",
      id: "line_items",
      Cell: ItemsField, // new
    },
  ]

  
  return (
    <div class="container mx-auto">
        <div className="mt-5">
        <div className="mb-6">
              <span class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Deliveries 📄 🔜</span>
        </div>
        <Table columns={columns} data={data} />
        </div>
        <div className="mb-6">
              <span class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Returns 📄 🔙</span>
        </div>
        <Table columns={oldColumns} data={oldData} />
    </div>
  );
}
