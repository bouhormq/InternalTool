import Table from '../components/table';
import db from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import  {StatusPillTotalInventory,StatusPillInventory ,DateField, ActionInventory} from '../components/tableCells';
import plus from "../media/plus-white.png"
import { InventoryForm } from '../components/forms/inventoryForm';
import React from 'react';
import { UserAuth } from '../context/authContex';



export function Inventory() {
    const [data, setData] = useState([]);
    const [visible, setVisible] = useState(false);
    const { warehouses} = UserAuth();

    


    useEffect(() => {
      const colRef = collection(db, "inventory" )
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
          Cell: ActionInventory, // new
        },
        {
          Header: "Client",
          accessor: "client.name",
          id: "client",
        },
        {
          Header: "SKU (External)",
          accessor: "sku",
          id: "sku",
        },
        {
          Header: "Title",
          accessor: "title",
          id: "title",
        },
        {
          Header: "Total Inventory Stock",
          accessor: "inventoryTotalStock",
          id: "inventoryTotalStock",
          Cell: StatusPillTotalInventory, // new
        },
        /*{
          Header: "Inventory per Warehouse",
          accessor: "inventory",
          id: "inventory",
          Cell: ({ cell: { value } }) => <StatusPillInventory value={value} warehouses={warehouses} />   
        },*/
        {
          Header: "Created At",
          accessor: "createdAt",
          id: "createdAt",
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
        <InventoryForm handleVisibility={handleVisibility} visible={visible} edit={false}/>
    </div>
  );
}
