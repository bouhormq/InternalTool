import React, { useEffect } from 'react'
import { useTable, useFilters, useGlobalFilter, useAsyncDebounce, useSortBy, usePagination } from 'react-table'
import { ChevronDoubleLeftIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDoubleRightIcon } from '@heroicons/react/solid'
import { Button, PageButton } from './button'
import { classNames } from './utils'
import { SortIcon, SortUpIcon, SortDownIcon } from './icons'
import { doc, getDoc } from 'firebase/firestore'
import db from '../firebase'
import axios from 'axios'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { setDoc } from 'firebase/firestore'
import { collection, onSnapshot, query, orderBy,where } from 'firebase/firestore';







// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length
  const [value, setValue] = React.useState(globalFilter)
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined)
  }, 200)

  return (
    <label className="flex gap-x-2 items-baseline">
         <div class="relative">
        <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
            <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      <input
        type="text"
        class="block p-2 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
        value={value || ""}
        onChange={e => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
      />
      </div>
    </label>
  )
}



// This is a custom filter UI for selecting
// a unique option from a list
export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id, render },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set()
    preFilteredRows.forEach(row => {
      options.add(row.values[id])
    })
    return [...options.values()]
  }, [id, preFilteredRows])

  // Render a multi-select box
  return (
    <label className="flex gap-x-2 items-baseline">
      <span className="text-gray-700">{render("Header")}: </span>
      <select
        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        name={id}
        id={id}
        value={filterValue}
        onChange={e => {
          setFilter(e.target.value || undefined)
        }}
      >
        <option value="">All</option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}




export function DateField({ value }) {
  return (
    <span>
      {new Date(value.slice(0, 10)).toDateString() + " - " + value.slice(11, 19)} 
    </span>
  );
};

export function ShippingField({ value }) {
  return (
    <span>
      {value.address1 + " " + value.address2 + ", " + value.zip + ", " + value.city + ", " + value.country } 
    </span>
  );
};

export function ItemsField({ value }) {
  let items = ""
  for(let i = 0; i < value.length; ++i){
    items += value[i].sku + ": " + value[i].quantity;
    if(i !== value.length-1){
      items +=  ", "
    }
  }
  return (
    <span>
      {items} 
    </span>
  );
};

async function Fulfil(row) {
  let shop = row.shop
  let order_id = row.id
  let fulfillment_id = row.id
  let appdocRef = doc(db, "app-sessions", "offline_"+shop);
  let appdocSnap = await getDoc(appdocRef);
  if(appdocSnap.exists()){
    const app_session = appdocSnap.data();
    await axios.post(
      `https://0dfc15a9470679b09207ae8ba56a3354:472e3009fef7c56c7e90c596cef543e1@${app_session.shop}/admin/api/2022-04/orders/${order_id}/fulfillments/${fulfillment_id}/complete.json`,
       {
        headers: {
          'X-Shopify-Access-Token': app_session.accessToken,
        },
      }).catch(function (error) {
      console.log(error.response.data);
    });}
}


export   function StatusPillAction({ value }) {
  const status = value ? value.toLowerCase() : "unknown";
  if(status.startsWith("open")){
    return (
      <span
        className={
          classNames(
            "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm bg-green-100 text-green-800",
          )
        }
      >
        {"SET AS FULFILLED"}
      </span>
    );
  };
};

export function Edit({ value }) {
  const status = value ? value.toLowerCase() : "unknown";
    return (
      <span
        className={
          classNames(
            "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm bg-slate-300",
          )
        }
      >
        {"EDIT"}
      </span>
    );
};


export function StatusPill({ value }) {
  const status = value ? value.toLowerCase() : "unknown";

  return (
    <span
      className={
        classNames(
          "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm ",
          status.startsWith("success") ? "bg-green-100 text-green-800" : null,
          status.startsWith("open") ? "bg-sky-100 text-sky-800" : null,
        )
      }
    >
      {status}
    </span>
  );
};


export function StatusPillTotalInventory({ value }) {
  return (
    <span
      className={
        classNames(
          "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm ",
          value > 19 ? "bg-emerald-500	 text-emerald-100" : null,
          10 < value < 20 ? "bg-sky-100 text-sky-800" : null,
          value < 10 ? "bg-red-100 text-red-800" : null,
        )
      }
    >
      {value}
    </span>
  );
};

export function StatusPillInventory({ value }) {
  return (
    <span
      className={
        classNames(
          "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm ",
          value["DE-FFM-NWES"].inventory_quantity > 19 ? "bg-emerald-500	 text-emerald-100" : null,
          10 < value["DE-FFM-NWES"].inventory_quantity < 20 ? "bg-sky-100 text-sky-800" : null,
          value["DE-FFM-NWES"].inventory_quantity < 10 ? "bg-red-100 text-red-800" : null,
        )
      }
    >
      {"DE-FFM-NWES" + "-(" + value["DE-FFM-NWES"].shelf.join('-') + "): " + value["DE-FFM-NWES"].inventory_quantity}
    </span>
  );
};






function ClientsTable({ columns, data }) {
  const [visible, setVisible] = useState(false);
  const [clients, setClients] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  useEffect(() => {
    const colRef = collection(db, "clients" )
    const colRef2 = collection(db, "warehouses" )
    //real time update
    onSnapshot(colRef, (snapshot) => {
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
  
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,

    state,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable({
    columns,
    data,
  },
    useFilters, // useFilters!
    useGlobalFilter,
    useSortBy,
    usePagination,  // new
  )

  // Render the UI for your table
  return (
    <>
      <div className="sm:flex sm:gap-x-2">
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        <button onClick={() => setVisible(true)} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-4 py-2  text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add Client</button>
        {headerGroups.map((headerGroup) =>
          headerGroup.headers.map((column) =>
            column.Filter ? (
              <div className="mt-2 sm:mt-0" key={column.id}>
                {column.render("Filter")}
              </div>
            ) : null
          )
        )}
      </div>
      
      {/* table */}
      <div className="mt-4 flex flex-col">
        <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map(column => (
                        // Add the sorting props to control sorting. For this example
                        // we can add them into the header props
                        <th
                          scope="col"
                          className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                        >
                          <div className="flex items-center justify-between">
                            {column.render('Header')}
                            {/* Add a sort direction indicator */}
                            <span>
                              {column.isSorted
                                ? column.isSortedDesc
                                  ? <SortDownIcon className="w-4 h-4 text-gray-400" />
                                  : <SortUpIcon className="w-4 h-4 text-gray-400" />
                                : (
                                  <SortIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                                )}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody
                  {...getTableBodyProps()}
                  className="bg-white divide-y divide-gray-200"
                >
                  {page.map((row, i) => {  // new
                    prepareRow(row)
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map(cell => {
                          return (
                            <td
                              {...cell.getCellProps()}
                              className="px-6 py-4 whitespace-nowrap"
                              role="cell"
                              onClick={() => {
                                if(cell.column.Header === "Action" && row.original.fulfillment_status === "open" ){
                                  Fulfil(row.original)
                                }
                              }}
                            > 
                              {cell.column.Cell.name === "defaultRenderer"
                                ? <div className="">{cell.render('Cell')}</div>
                                : cell.render('Cell')
                              }
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Pagination */}
      <div className="py-3 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button onClick={() => previousPage()} disabled={!canPreviousPage}>Previous</Button>
          <Button onClick={() => nextPage()} disabled={!canNextPage}>Next</Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div className="flex gap-x-2 items-baseline">
            <span className="text-sm text-gray-700">
              Page <span className="font-medium">{state.pageIndex + 1}</span> of <span className="font-medium">{pageOptions.length}</span>
            </span>
            <label>
              <span className="sr-only">Items Per Page</span>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={state.pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value))
                }}
              >
                {[5, 10, 20].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <PageButton
                className="rounded-l-md"
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">First</span>
                <ChevronDoubleLeftIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </PageButton>
              <PageButton
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </PageButton>
              <PageButton
                onClick={() => nextPage()}
                disabled={!canNextPage
                }>
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </PageButton>
              <PageButton
                className="rounded-r-md"
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
              >
                <span className="sr-only">Last</span>
                <ChevronDoubleRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </PageButton>
            </nav>
          </div>
        </div>
      </div>
      <ClientForm visible={visible}/>
    </>
  )
}

export default ClientsTable;

