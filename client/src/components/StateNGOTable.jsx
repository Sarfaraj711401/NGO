// src/components/tables/StateNGOTable.jsx

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { API_BASE_URL, styles } from "../config/constants";
import { handleViewPdf } from "./AccountSharedUtils";

const StateNGOTable = ({ refreshTrigger }) => {
  const [loading, setLoading] = useState(false);
  const [stateNgoData, setStateNgoData] = useState([]);
  const [globalSearch, setGlobalSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/statengo`);

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();

      setStateNgoData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load State NGO data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const filteredData = useMemo(() => {
    if (!globalSearch) return stateNgoData;

    const searchText = globalSearch.toLowerCase();

    return stateNgoData.filter((row) =>
      Object.values(row).some(
        (value) =>
          value &&
          String(value).toLowerCase().includes(searchText)
      )
    );
  }, [stateNgoData, globalSearch]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / rowsPerPage)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;

  const currentTableData = filteredData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div style={{ ...styles.card, overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 24px 0 24px",
        }}
      >
        <h5 style={styles.cardHeader}>State NGO List</h5>

        <button
          onClick={loadData}
          style={styles.btnOutline}
        >
          Refresh Data
        </button>
      </div>

      <div style={styles.cardBody}>
        {/* Search */}
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

        {/* Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={styles.tableContainer}>
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
                {currentTableData.length > 0 ? (
                  currentTableData.map((row, index) => (
                    <tr key={row.StateNGORegId || index}>
                      <td style={styles.td}>
                        {indexOfFirstItem + index + 1}
                      </td>

                      <td style={styles.td}>
                        {row.AcctName}
                      </td>

                      <td style={styles.td}>
                        {row.RegNo}
                      </td>

                      <td style={styles.td}>
                        {row.PanNo}
                      </td>

                      <td style={styles.td}>
                        {row.MailId}
                      </td>

                      <td style={styles.td}>
                        {row.ContactNo}
                      </td>

                      <td style={styles.td}>
                        {row.StateName}
                      </td>

                      <td style={styles.td}>
                        {row.ConPer}
                      </td>

                      <td style={styles.td}>
                        {row.ConPerContactNo}
                      </td>

                      <td style={styles.td}>
                        {row.SignupEmail}
                      </td>

                      <td style={styles.td}>
                        {row.RecCertificate ? (
                          <button
                            style={styles.btnOutline}
                            onClick={() =>
                              handleViewPdf(
                                row.RecCertificate
                              )
                            }
                          >
                            View
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td style={styles.td}>
                        {row.PanPic ? (
                          <button
                            style={styles.btnOutline}
                            onClick={() =>
                              handleViewPdf(
                                row.PanPic
                              )
                            }
                          >
                            View
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td style={styles.td}>
                        {row.DarpanPic ? (
                          <button
                            style={styles.btnOutline}
                            onClick={() =>
                              handleViewPdf(
                                row.DarpanPic
                              )
                            }
                          >
                            View
                          </button>
                        ) : (
                          "-"
                        )}
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

        {/* Pagination */}
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
                  setRowsPerPage(
                    Number(e.target.value)
                  );
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) => prev - 1)
                }
                style={styles.btnOutline}
              >
                Prev
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => prev + 1)
                }
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