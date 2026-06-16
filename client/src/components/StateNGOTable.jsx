import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { API_BASE_URL } from "../config/constants";
import { handleViewPdf } from "./AccountSharedUtils";


const StateNGOTable = ({ refreshTrigger }) => {


  const [loading, setLoading] = useState(false);

  const [stateNgoData, setStateNgoData] = useState([]);

  const [globalSearch, setGlobalSearch] = useState("");



  const [currentPage, setCurrentPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(10);


  // ==========================
  // LOAD DATA
  // ==========================


  const loadData = async () => {

    try {


      setLoading(true);


      const res = await fetch(
        `${API_BASE_URL}/statengo`
      );


      if (!res.ok)
        throw new Error();



      const data = await res.json();


      console.log(
        "STATE NGO DATA =",
        data
      );



      setStateNgoData(
        Array.isArray(data)
          ?
          data
          :
          []
      );



    }
    catch (err) {


      toast.error(
        "Failed to load State NGO data"
      );


    }
    finally {

      setLoading(false);

    }

  };





  useEffect(() => {

    loadData();

  }, [refreshTrigger]);







  // ==========================
  // SEARCH
  // ==========================


  const filteredData = useMemo(() => {


    if (!globalSearch)

      return stateNgoData;



    const search =
      globalSearch.toLowerCase();



    return stateNgoData.filter(row =>


      Object.values(row).some(val =>


        val &&

        String(val)
          .toLowerCase()
          .includes(search)


      )


    );


  }, [
    stateNgoData,
    globalSearch
  ]);









  // ==========================
  // PAGINATION
  // ==========================


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredData.length /
        rowsPerPage
      )
    );




  useEffect(() => {


    if (currentPage > totalPages)

      setCurrentPage(1);


  }, [
    currentPage,
    totalPages
  ]);





  const indexOfLast =
    currentPage * rowsPerPage;



  const indexOfFirst =
    indexOfLast - rowsPerPage;




  const currentData =
    filteredData.slice(
      indexOfFirst,
      indexOfLast
    );









  // ==========================
  // WHITE UI STYLE
  // ==========================



  const tableStyles = {


    wrapper: {


      background: "#ffffff",

      borderRadius: "16px",

      boxShadow:
        "0 4px 18px rgba(0,0,0,0.08)",

      overflow: "hidden"


    },




    header: {


      padding: "22px 26px",


      display: "flex",


      justifyContent:
        "space-between",


      alignItems: "center",


      background: "#ffffff",


      borderBottom:
        "1px solid #e5e7eb"


    },





    title: {


      margin: 0,


      color: "#1f2937",


      fontSize: "21px",


      fontWeight: "700"


    },





    refreshBtn: {


      background: "#ffffff",


      color: "#374151",


      border:
        "1px solid #d1d5db",


      padding:
        "9px 18px",


      borderRadius: "10px",


      cursor: "pointer",


      fontWeight: "600",


      display: "flex",


      gap: "8px",


      alignItems: "center"


    },





    searchArea: {


      padding: "20px",


      background: "#fafafa",


      borderBottom:
        "1px solid #e5e7eb"


    },





    input: {


      width: "100%",


      padding:
        "12px 16px",


      borderRadius: "10px",


      border:
        "1px solid #d1d5db",


      fontSize: "14px",


      outline: "none"


    },





    tableBox: {


      maxHeight: "55vh",


      overflowY: "auto",


      overflowX: "auto"


    },





    table: {


      width: "100%",


      borderCollapse:
        "separate",


      borderSpacing: 0


    },





    th: {


      position: "sticky",


      top: 0,


      background: "#ffffff",


      padding: "14px",


      color: "#374151",


      fontWeight: "700",


      fontSize: "14px",


      whiteSpace: "nowrap",


      borderBottom:
        "2px solid #e5e7eb"


    },





    td: {


      padding: "13px",


      color: "#4b5563",


      fontSize: "14px",


      whiteSpace: "nowrap",


      borderBottom:
        "1px solid #f1f5f9"


    },





    viewBtn: {


      background: "#ffffff",


      color: "#374151",


      border:
        "1px solid #d1d5db",


      padding:
        "6px 14px",


      borderRadius: "8px",


      cursor: "pointer",


      fontSize: "13px",


      fontWeight: "600",


      display: "inline-flex",


      alignItems: "center",


      gap: "6px"


    }



  };






  return (

    <div style={tableStyles.wrapper}>



      <div style={tableStyles.header}>


        <h5 style={tableStyles.title}>

          📋 State NGO List

        </h5>



        <button

          onClick={loadData}

          style={tableStyles.refreshBtn}

        >

          🔄 Refresh


        </button>



      </div>





      <div style={tableStyles.searchArea}>


        <input


          type="text"


          placeholder="🔍 Search NGO..."


          value={globalSearch}


          onChange={(e) => {

            setGlobalSearch(
              e.target.value
            );

            setCurrentPage(1);

          }}


          style={tableStyles.input}


        />


      </div>





      {
        loading

          ?

          <p style={{ padding: "30px" }}>
            Loading...
          </p>

          :

          <div style={tableStyles.tableBox}>


            <table style={tableStyles.table}>


              <thead>


                <tr>


                  <th style={tableStyles.th}>
                    #️⃣ SL
                  </th>


                  <th style={tableStyles.th}>
                    🏢 NGO Name
                  </th>


                  <th style={tableStyles.th}>
                    📄 Reg No
                  </th>


                  <th style={tableStyles.th}>
                    🪪 PAN No
                  </th>


                  <th style={tableStyles.th}>
                    📧 Email
                  </th>


                  <th style={tableStyles.th}>
                    📱 Mobile
                  </th>


                  <th style={tableStyles.th}>
                    📍 State
                  </th>


                  <th style={tableStyles.th}>
                    👤 Contact Person
                  </th>


                  <th style={tableStyles.th}>
                    📞 Contact Mobile
                  </th>


                  <th style={tableStyles.th}>
                    📨 Login Email
                  </th>


                  <th style={tableStyles.th}>
                    📜 Certificate
                  </th>


                  <th style={tableStyles.th}>
                    🪪 PAN PDF
                  </th>


                  <th style={tableStyles.th}>
                    📑 Darpan PDF
                  </th>


                </tr>


              </thead>
              <tbody>


                {
                  currentData.length > 0 ?


                    currentData.map((row, index) => (


                      <tr


                        key={row.StateNGORegId}



                        onMouseEnter={(e) => {

                          e.currentTarget.style.background =
                            "#fafafa";

                        }}



                        onMouseLeave={(e) => {

                          e.currentTarget.style.background =
                            "";

                        }}



                      >


                        <td style={tableStyles.td}>

                          {
                            indexOfFirst + index + 1
                          }

                        </td>




                        <td style={tableStyles.td}>

                          {
                            row.StateNGOName
                          }

                        </td>




                        <td style={tableStyles.td}>

                          {
                            row.StateNGORegNo
                          }

                        </td>




                        <td style={tableStyles.td}>

                          {
                            row.StateNGOPanNo
                          }

                        </td>




                        <td style={tableStyles.td}>

                          {
                            row.StateNGOMailId
                          }

                        </td>




                        <td style={tableStyles.td}>

                          {
                            row.StateNGOPhoneNo
                          }

                        </td>




                        <td style={tableStyles.td}>

                          {
                            row.StateName
                          }

                        </td>




                        <td style={tableStyles.td}>

                          {
                            row.StateNGOConPer
                          }

                        </td>




                        <td style={tableStyles.td}>

                          {
                            row.StateNGOConPerContactNo
                          }

                        </td>




                        <td style={tableStyles.td}>

                          {
                            row.StateNGOSignupEmail
                          }

                        </td>





                        {/* Registration Certificate */}

                        <td style={tableStyles.td}>


                          {

                            row.StateNGORecCertificate ?


                              <button

                                style={tableStyles.viewBtn}


                                onClick={() =>


                                  handleViewPdf(
                                    row.StateNGORecCertificate
                                  )


                                }

                              >


                                👁 View


                              </button>


                              :

                              "-"


                          }


                        </td>







                        {/* PAN PDF */}


                        <td style={tableStyles.td}>


                          {


                            row.StateNGOPanPic ?



                              <button

                                style={tableStyles.viewBtn}


                                onClick={() =>


                                  handleViewPdf(
                                    row.StateNGOPanPic
                                  )


                                }


                              >


                                👁 View


                              </button>



                              :

                              "-"



                          }


                        </td>







                        {/* DARPAN PDF */}



                        <td style={tableStyles.td}>


                          {


                            row.StateNGODarpanPic ?



                              <button

                                style={tableStyles.viewBtn}


                                onClick={() =>


                                  handleViewPdf(
                                    row.StateNGODarpanPic
                                  )


                                }


                              >


                                👁 View


                              </button>



                              :

                              "-"



                          }


                        </td>






                      </tr>



                    ))



                    :



                    <tr>


                      <td

                        colSpan="13"


                        style={{

                          textAlign: "center",

                          padding: "30px",

                          color: "#6b7280",

                          fontWeight: "600"

                        }}


                      >


                        📂 No Data Found


                      </td>



                    </tr>



                }



              </tbody>



            </table>


          </div>


      }





      {/* ==========================
        PAGINATION
========================== */}



      {

        filteredData.length > 0 &&


        <div


          style={{


            padding: "20px",


            display: "flex",


            justifyContent:
              "space-between",


            alignItems: "center",


            borderTop:
              "1px solid #e5e7eb"



          }}



        >




          <div>


            <label

              style={{

                fontWeight: "600",

                marginRight: "10px",

                color: "#374151"

              }}

            >

              📌 Rows:


            </label>



            <select


              value={rowsPerPage}


              onChange={(e) => {


                setRowsPerPage(
                  Number(e.target.value)
                );


                setCurrentPage(1);


              }}



              style={{


                padding: "8px 12px",


                borderRadius: "8px",


                border:
                  "1px solid #d1d5db",


                background: "#fff"


              }}



            >


              <option value={5}>
                5
              </option>


              <option value={10}>
                10
              </option>


              <option value={20}>
                20
              </option>


              <option value={50}>
                50
              </option>



            </select>



          </div>







          <div


            style={{


              display: "flex",


              alignItems: "center",


              gap: "12px"


            }}



          >



            <button


              disabled={
                currentPage === 1
              }



              onClick={() =>


                setCurrentPage(
                  p => p - 1
                )


              }



              style={{


                ...tableStyles.viewBtn,


                opacity:
                  currentPage === 1
                    ?
                    0.5
                    :
                    1



              }}



            >


              ⬅ Prev


            </button>






            <span


              style={{


                fontWeight: "600",

                color: "#374151"


              }}



            >


              Page {currentPage}

              &nbsp; of &nbsp;

              {totalPages}



            </span>







            <button


              disabled={
                currentPage === totalPages
              }



              onClick={() =>


                setCurrentPage(
                  p => p + 1
                )


              }



              style={{


                ...tableStyles.viewBtn,


                opacity:
                  currentPage === totalPages
                    ?
                    0.5
                    :
                    1



              }}



            >


              Next ➡


            </button>




          </div>





        </div>



      }





    </div>


  );


};



export default StateNGOTable;