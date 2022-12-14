import Table from '../components/table';
import db from '../firebase';
import { collection, onSnapshot, query, orderBy,where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { DateField, StatusPill, ShippingField, ItemsField, StatusPillAction } from '../components/tableCells';
import { OrderForm } from '../components/orderForm';
import plus from "../media/plus-white.png"
import React from 'react';


export function Orders() {
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);

  
  useEffect(() => {
    const colRef = collection(db, "orders" )
    const q = query(colRef, where("fulfillment_status", "in", ["open","in_progress"]));

    let isMounted = true;
    onSnapshot(q, (snapshot) => {
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
    /*{
      Header: "Order Number (Global)",
      accessor: "intOrderNumber",
      id: "intOrderNumber",
    },*/
    {
      Header: "Order Number (Client)",
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
              <span class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Deliveries 🚴‍♂️ 🔜</span>
            </div>
            <Table  columns={columns} data={data}  button={<AddButton/>}/>
        </div>
        <OrderForm handleVisibility={handleVisibility} visible={visible}/>
    </div>
  );
}
