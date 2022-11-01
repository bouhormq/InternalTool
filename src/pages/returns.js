import Table from '../components/table';
import db from '../firebase';
import { collection, onSnapshot, query, orderBy,where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { DateField, StatusPill, ShippingField, ItemsField, StatusPillAction } from '../components/tableCells';
import { ReturnForm } from '../components/returnForm';
import plus from "../media/plus-white.png"
import React from 'react';




export function Returns() {
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [clients, setClients] = useState({});
  const [warehouses, setWarehouses] = useState(
    {"DE-FFM-NWES": {address: "Finkenhofstraße 12, 60322 Frankfurt am Main, Germany", city: "Frankfurt am Main", country: "Germany",country_code: "DE", delivers_to: ['60306', '60308', '60310', '60311', '60312', '60313', '60314', '60315', '60316', '60318', '60320', '60322', '60323', '60325', '60329', '60385', '60487', '60594', '60596'], postal_code: "60322", province: "Hesse"}},
  );

  const handleVisibility = visibility => {
    // 👇️ take parameter passed from Child component
    setVisible(visibility);
  };

  useEffect(() => {
    const colRef = collection(db, "returns" )
    const colRef1 = collection(db, "clients" )
    const colRef2 = collection(db, "warehouses" )
    const q = query(colRef,where("fulfillment_status", "in", ["open","in_progress"]));
    onSnapshot(q, (snapshot) => {
        setData([])
        snapshot.docs.forEach((doc) => {
          setData((prev) => [ doc.data() , ...prev])
        })
    })   
    onSnapshot(colRef1, (snapshot) => {
      setClients([])
      let clients = {};
      snapshot.docs.forEach((doc) => {
        clients[doc.id] = doc.data()
        setClients(clients)
      })
    })
    onSnapshot(colRef2, (snapshot) => {
      setWarehouses([])
      let warehouse = {};
      snapshot.docs.forEach((doc) => {
        warehouse[doc.id] = doc.data()
        setWarehouses(warehouse)
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
      Header: "Return Number (Global)",
      accessor: "intReturnNumber",
      id: "intReturnNumber",
    },
    {
      Header: "Return Number (Client)",
      accessor: "return_number",
      id: "return_number",
    },
    {
      Header: "Order Number",
      accessor: "order_number",
      id: "order_number",
    },
    {
      Header: "Delivery At",
      accessor: "return_at",
      id: "return_at",
      Cell: DateField, 
    },
    {
      Header: "Created At",
      accessor: "created_at",
      id: "created_at",
      Cell: DateField, 
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
              <span class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Returns 🚴‍♂️ 🔙</span>
            </div>
          <Table  class="mt-10" columns={columns} data={data} button={<AddButton/>} />
        </div>
        <ReturnForm handleVisibility={handleVisibility} visible={visible}  warehouses={warehouses} clients={clients}/>
    </div>
  );
}
