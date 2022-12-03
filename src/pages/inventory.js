import Table from '../components/table';
import db from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import  {StatusPillTotalInventory,StatusPillInventory ,DateField,DeleteInventory} from '../components/tableCells';
import plus from "../media/plus-white.png"
import { InventoryForm } from '../components/inventoryForm';
import React from 'react';


export function Inventory() {
    const [data, setData] = useState([]);
    const [visible, setVisible] = useState(false);
    const [warehouses, setWarehouses] = useState(
      {"DE-FFM-NWES": {address: "Finkenhofstraße 12, 60322 Frankfurt am Main, Germany", city: "Frankfurt am Main", country: "Germany",country_code: "DE", delivers_to: ['60306', '60308', '60310', '60311', '60312', '60313', '60314', '60315', '60316', '60318', '60320', '60322', '60323', '60325', '60329', '60385', '60487', '60594', '60596'], postal_code: "60322", province: "Hesse"}},
    );
    const [clients, setClients] = useState({"WISAG":{}});


    useEffect(() => {
      const colRef = collection(db, "inventory" )
      const colRef2 = collection(db, "warehouses" )
      const colRef1 = collection(db, "clients" )
      //real time update
      let isMounted = true;
      onSnapshot(colRef, (snapshot) => {
        setData([])
        if (isMounted) {
          snapshot.docs.forEach((doc) => {
            setData((prev) => [...prev, doc.data()])
          })
        }
    })
    
    onSnapshot(colRef1, (snapshot) => {
      setClients([])
      if (isMounted) {
        let clients = {};
        snapshot.docs.forEach((doc) => {
          clients[doc.id] = doc.data()
          setClients(clients)
        })
      }
    })
    onSnapshot(colRef2, (snapshot) => {
      setWarehouses([])
      if (isMounted) {
        let warehouse = {};
        snapshot.docs.forEach((doc) => {
          warehouse[doc.id] = doc.data()
          setWarehouses(warehouse)
        })
      }
    })
    return () => {
      isMounted = false;
    };  
      }, [])

      const handleVisibility = visibility => {
        // 👇️ take parameter passed from Child component
        setVisible(visibility);
      };
  
      const columns = [
        {
          Header: "Action",
          accessor: "skuInt",
          id: "action",
          Cell: DeleteInventory, // new
        },
        {
          Header: "Client",
          accessor: "client",
          id: "client",
        },
        {
          Header: "SKU (External)",
          accessor: "sku",
          id: "sku",
        },
        {
          Header: "SKU (Internal)",
          accessor: "skuInt",
          id: "skuInt",
        },
        {
          Header: "Title",
          accessor: "title",
          id: "title",
        },
        {
          Header: "Total Inventory Stock",
          accessor: "inventory_total_stock",
          id: "inventory_total_stock",
          Cell: StatusPillTotalInventory, // new
        },
        {
          Header: "Inventory per Warehouse",
          accessor: "inventory",
          id: "inventory",
          Cell: ({ cell: { value } }) => <StatusPillInventory value={value} warehouses={warehouses} />   
        },
        {
          Header: "Created At",
          accessor: "created_at",
          id: "created_at",
          Cell: DateField, // new
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
              <span class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Inventory 🧸</span>
            </div>
            <Table  columns={columns} data={data}  button={<AddButton/>}/>
        </div>
        <InventoryForm handleVisibility={handleVisibility} visible={visible} warehouses={warehouses} clients={clients}/>
    </div>
  );
}