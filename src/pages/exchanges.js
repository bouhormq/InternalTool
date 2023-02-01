import Table from '../components/table';
import db from '../firebase';
import { collection, onSnapshot, query, orderBy,where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { DateField, StatusPill, ShippingField, ItemsField, StatusPillAction, PostalCodes } from '../components/tableCells';
import { DeliveryForm } from '../components/forms/deliveryForm';
import React from 'react';


export function Exchanges() {
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);

  
  useEffect(() => {
    const colRef = collection(db, "exchanges" )
    const q = query(colRef);

    let isMounted = true;
    onSnapshot(q, (snapshot) => {
        setData([])
        if (isMounted) {
          snapshot.docs.forEach((doc) => {
            setData((prev) => [ doc.data() , ...prev])
          })
          data.sort(function(a,b){
            return new Date(b["deliveryAt"]) - new Date(a["deliveryAt"])
          })
          setData(data)
        }
    })  
    return () => {
      isMounted = false;
    }; 
  }, [])

  

  const columns = [
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
      Header: "Comments",
      accessor: "comments",
      id: "comments",
    },{
      Header: "Created At",
      accessor: "createdAt",
      id: "createdAt",
      Cell: DateField, // new
    }
  ]

  const handleVisibility = visibility => {
    // 👇️ take parameter passed from Child component
    setVisible(visibility);
  };

  
  return (
    <div class="container mx-auto">
        <div className="mt-5">
        <div className="mb-6">
              <span class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Exchanges 🚴‍♂️ 🔙</span>
            </div>
            <Table  columns={columns} data={data}  />
        </div>
        <DeliveryForm handleVisibility={handleVisibility} visible={visible} type={"Order"}/>
    </div>
  );
}
