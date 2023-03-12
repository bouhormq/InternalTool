import Table from '../components/table';
import db from '../firebase';
import { collection, onSnapshot, query, orderBy,where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { DateField, StatusPill, ShippingField, ItemsField, StatusPillAction, PostalCodes } from '../components/tableCells';
import { DeliveryForm } from '../components/forms/deliveryForm';
import React from 'react';
export function Orders() {
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  


  

  
  useEffect(() => {
    const colRef = collection(db, "orders" )
    const q = query(colRef, where("fulfillmentStatus", "in", ["open","inProgress"]), orderBy("deliveryAt", "desc"));

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
      accessor: "fulfillmentStatus",
      id: "action",
      Cell: StatusPillAction, // new
    },
    {
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
    },{
      Header: "TOS",
      accessor: "tos",
      id: "tos",
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
      Header: "Rider",
      accessor: "rider.name",
      id: "rider",
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
      Header: "Updated At",
      accessor: "updatedAt",
      id: "updatedAt",
      Cell: DateField, // new
    },{
      Header: "Recipient Comments",
      accessor: "recipientComments",
      id: "recipientComments",
    },{
      Header: "Invoice Stamp",
      accessor: "invoiceStamp",
      id: "invoiceStamp",
      Cell: DateField, // new
    },
  ]

  const handleVisibility = visibility => {
    // 👇️ take parameter passed from Child component
    console.log(data)
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
              <span class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Orders 🚴‍♂️ 🔜</span>
            </div>
            <Table  columns={columns} data={data}  button={<AddButton/>}/>
        </div>
        <DeliveryForm handleVisibility={handleVisibility} visible={visible} type={"Order"}/>
    </div>
  );
}
