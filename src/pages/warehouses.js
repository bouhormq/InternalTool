import db from '../firebase';
import { collection, onSnapshot} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Table from '../components/table';
import plus from "../media/plus-white.png"
import React from 'react';
import { WarehouseForm } from '../components/warehouseForm';


export function Warehouses() {
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [inventory, setInvetory] = useState({});


  
  useEffect(() => {
    const colRef1 = collection(db, "inventory" )
    const colRef2 = collection(db, "warehouses" )
    onSnapshot(colRef2, (snapshot) => {
      setData([])
      snapshot.docs.forEach((doc) => {
        setData((prev) => [ doc.data() , ...prev])
      })
    })
    onSnapshot(colRef1, (snapshot) => {
      setInvetory([])
      snapshot.docs.forEach((doc) => {
        setInvetory((prev) => [...prev, doc.data()])
      })
  })
  }, [])

  const PostalCodes = ({ values }) => {
    // Loop through the array and create a badge-like component instead of a comma-separated string
    return (
      <>
        {values.map((postal_code, idx) => {
          return (
            <span key={idx} className="badge">
              {postal_code+" "}
            </span>
          );
        })}
      </>
    );
  };

  const columns = [
    {
      Header: "Name",
      accessor: "id",
      id: "id",
    },
    {
      Header: "Address",
      accessor: "address",
      id: "address",
    },
    {
      Header: "Delivers To",
      accessor: "delivers_to",
      id: "delivers_to",
      Cell: ({ cell: { value } }) => <PostalCodes values={value} />
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
            <span class="relative top-1.5 ml-3 inline-block align-baseline text-5xl font-bold text-gray-700">Warehouses 🏢</span>
        </div>      
        <Table columns={columns} data={data} button={<AddButton/>}/>
      </div>
      <WarehouseForm handleVisibility={handleVisibility} visible={visible} inventory={inventory}/>
    </div>
  );
}
