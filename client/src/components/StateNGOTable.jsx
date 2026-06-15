import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { API_BASE_URL, styles } from "../config/constants";
import { handleViewPdf } from "./AccountSharedUtils";

const StateNGOTable = ({ refreshTrigger }) => {
  const [loading, setLoading] = useState(false);
  const [stateNgoData, setStateNgoData] = useState([]);
  const [globalSearch, setGlobalSearch] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/statengo`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      console.log("STATE NGO DATA =", data);

      setStateNgoData(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load State NGO data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  // search filter
  const filteredData = useMemo(() => {
    if (!globalSearch) return stateNgoData;

    const search = globalSearch.toLowerCase();

    return stateNgoData.filter((row) =>
      Object.values(row).some(
        (val) =>
          val && String(val).toLowerCase().includes(search)
      )
    );
  }, [stateNgoData, globalSearch]);

  // pagination logic
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / rowsPerPage)
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  return (
    <div style={{ ...styles.card, overflow: "hidden" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 24px 0 24px",
        }}
      >
        <h5 style={styles.cardHeader}>State NGO List</h5>

        <button onClick={loadData} style={styles.btnOutline}>
          Refresh Data
        </button>
      </div>

      <div
        style={{
          ...styles.cardBody,
          display: "flex",
          flexDirection: "column",
          maxHeight: "80vh",
          overflow: "hidden",
        }}
      >
        {/* SEARCH */}
        <div
          style={{
            marginBottom: "20px",
            paddingBottom: "20px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              ...styles.input(false),
              width: "100%",
              padding: "8px 12px",
            }}
          />
        </div>

        {/* TABLE */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div
            style={{
              ...styles.tableContainer,
              maxHeight: "55vh",
              overflowY: "auto",
              overflowX: "auto",
              border: "1px solid #eee",
              borderRadius: "6px",
            }}
          >
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>SL</th>
                  <th style={styles.th}>NGO Name</th>
                  <th style={styles.th}>Reg No</th>
                  <th style={styles.th}>PAN No</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Mobile</th>
                  <th style={styles.th}>State</th>
                  <th style={styles.th}>Contact Person</th>
                  <th style={styles.th}>Contact Mobile</th>
                  <th style={styles.th}>Login Email</th>
                  <th style={styles.th}>Reg Cert</th>
                  <th style={styles.th}>PAN PDF</th>
                  <th style={styles.th}>Darpan PDF</th>
                </tr>
              </thead>

              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((row, index) => (
                    <tr key={row.StateNGORegId}>
                      <td style={styles.td}>{indexOfFirst + index + 1}</td>

                      <td style={styles.td}>{row.StateNGOName}</td>

                      <td style={styles.td}>{row.StateNGORegNo}</td>

                      <td style={styles.td}>{row.StateNGOPanNo}</td>

                      <td style={styles.td}>{row.StateNGOMailId}</td>

                      <td style={styles.td}>{row.StateNGOPhoneNo}</td>

                      <td style={styles.td}>{row.StateName}</td>

                      <td style={styles.td}>{row.StateNGOConPer}</td>

                      <td style={styles.td}>
                        {row.StateNGOConPerContactNo}
                      </td>

                      <td style={styles.td}>
                        {row.StateNGOSignupEmail}
                      </td>

                      <td style={styles.td}>
                        {row.StateNGORecCertificate ? (
                          <button
                            style={styles.btnOutline}
                            onClick={() =>
                              handleViewPdf(row.StateNGORecCertificate)
                            }
                          >
                            View
                          </button>
                        ) : "-"}
                      </td>

                      <td style={styles.td}>
                        {row.StateNGOPanPic ? (
                          <button
                            style={styles.btnOutline}
                            onClick={() =>
                              handleViewPdf(row.StateNGOPanPic)
                            }
                          >
                            View
                          </button>
                        ) : "-"}
                      </td>

                      <td style={styles.td}>
                        {row.StateNGODarpanPic ? (
                          <button
                            style={styles.btnOutline}
                            onClick={() =>
                              handleViewPdf(row.StateNGODarpanPic)
                            }
                          >
                            View
                          </button>
                        ) : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="13"
                      style={{
                        textAlign: "center",
                        padding: "20px",
                      }}
                    >
                      No Data Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {filteredData.length > 0 && (
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <label>Rows: </label>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                style={styles.btnOutline}
              >
                Prev
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                style={styles.btnOutline}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StateNGOTable;