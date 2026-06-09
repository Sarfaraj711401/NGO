// src/layouts/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaUserShield,
  FaUserTie,
  FaChalkboardTeacher,
  FaFemale
} from "react-icons/fa";


const Sidebar = () => {
  const location = useLocation();
  const activeRole = new URLSearchParams(location.search).get("role");
  // State for toggling menus
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(true);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  // Fetch the logged-in user's role from local storage
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("loggedInUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        // ✅ Ensure we capture the role securely, checking both possible keys
        setUserRole(user.role || user.UserSignUpRole || "");
      }
    } catch (error) {
      console.error("Error parsing user data from local storage", error);
    }
  }, []);

  // Check roles (case-insensitive for safety)
  const role = userRole.toLowerCase();
  const [isDistrictMenuOpen, setIsDistrictMenuOpen] = useState(false);
  const [isSupervisorMenuOpen, setIsSupervisorMenuOpen] = useState(false);
  const [isAsthaDidiMenuOpen, setIsAsthaDidiMenuOpen] = useState(false);
  const [isAsthaMaaMenuOpen, setIsAsthaMaaMenuOpen] = useState(false);

  const isStateSuperAdmin =
    role === "state super administrator";

  const isDistrictAdmin =
    role === "district administrator";

  const isSupervisor =
    role === "supervisor";

  const isAsthaDidi =
    role === "astha didi";

  const isAsthaMaa =
    role === "astha maa";

  const isDeveloper =
    role === "developer";

  const styles = {
    sidebar: {
      width: "260px",
      minWidth: "260px",
      flexShrink: 0,
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 2px 6px 0 rgba(67, 89, 113, 0.12)",
      zIndex: 10,
    },
    brandWrapper: {
      padding: "20px 24px 5px 24px",
      display: "flex",
      alignItems: "center",
      fontSize: "22px",
      fontWeight: "bold",
      color: "#566a7f",
      letterSpacing: "-0.5px",
      textDecoration: "none",
    },
    brandLogo: { width: "100px", height: "auto", marginRight: "10px" },
    menuList: {
      listStyle: "none",
      padding: "0",
      margin: "0",
      flex: 1,
      overflowY: "auto",
    },
    link: { textDecoration: "none", display: "block" },

    sectionHeader: {
      fontSize: "12px",
      textTransform: "uppercase",
      color: "#005bb5",
      backgroundColor: "#e8f3fc",
      padding: "8px 12px",
      borderRadius: "6px",
      margin: "10px 24px 16px 24px",
      letterSpacing: "0.5px",
      fontWeight: "900",
      borderLeft: "4px solid #009a44",
    },

    menuItem: (isActive) => ({
      margin: "0 16px 8px 16px",
      padding: "10px 16px",
      backgroundColor: "transparent",
      color: "#697a8d",
      borderRadius: "6px",
      fontWeight: "400",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      transition: "all 0.2s",
    }),
    menuItemLeft: { display: "flex", alignItems: "center" },

    subMenuContainer: (isOpen) => ({
      overflow: "hidden",
      transition: "max-height 0.3s ease-in-out",
      maxHeight: isOpen ? "250px" : "0px",
    }),
    subMenuItem: (isActive) => ({
      padding: "8px 16px 8px 48px",
      fontSize: "15px",
      color: isActive ? "#696cff" : "#6b7280",
      fontWeight: isActive ? "600" : "500",
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      transition: "all 0.2s ease",
      borderRadius: "6px",
    }),
    subMenuDot: (isActive) => ({
      width: "5px",
      height: "5px",
      borderRadius: "50%",
      marginRight: "8px",
      backgroundColor: isActive ? "#696cff" : "#cbd5e1",
    }),
    chevron: (isOpen) => ({
      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
      transition: "transform 0.3s ease",
      fontSize: "12px",
    }),
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brandWrapper}>
        <img src="/logo.png" alt="SHEVA ASHARM Logo" style={styles.brandLogo} />{" "}
        SHEVA ASHARM
      </div>

      <ul style={styles.menuList}>
        <li style={styles.sectionHeader}>Astha Didi Project</li>


        {isStateSuperAdmin && (
          <>
            {/* --- 1. PROFILE MEGA MENU --- */}
            <li
              style={styles.menuItem(false)}
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            >
              <div style={styles.menuItemLeft}>
                <span style={{ marginRight: "10px" }}>👤</span> State NGO
              </div>
              <span style={styles.chevron(isAccountMenuOpen)}>▶</span>
            </li>

            <div style={styles.subMenuContainer(isAccountMenuOpen)}>
              {/* <NavLink to="/account-settings/account" style={styles.link}>
                {({ isActive }) => (
                  <li
                    style={styles.subMenuItem(
                      location.pathname === "/account-settings/account" &&
                      !activeRole
                    )}
                  >
                    <div
                      style={styles.subMenuDot(
                        location.pathname === "/account-settings/account" &&
                        !activeRole
                      )}
                    ></div>
                    State NGO Profile
                  </li>
                )}
              </NavLink> */}
              <NavLink to="/state-ngo-registration" style={styles.link}>
                {({ isActive }) => (
                  <li
                    style={styles.subMenuItem(
                      location.pathname === "/state-ngo-registration" &&
                      !activeRole
                    )}
                  >
                    <div
                      style={styles.subMenuDot(
                        location.pathname === "/state-ngo-registration" &&
                        !activeRole
                      )}
                    ></div>
                    State NGO Profile
                  </li>
                )}
              </NavLink>

              {/* DISTRICT ADMIN */}
              {isStateSuperAdmin && (
                <NavLink
                  to="/account-settings/account?role=District Administrator"
                  style={styles.link}
                >
                  {({ isActive }) => (
                    <li
                      style={styles.subMenuItem(
                        activeRole === "District Administrator"
                      )}
                    >
                      <div
                        style={styles.subMenuDot(
                          activeRole === "District Administrator"
                        )}
                      ></div>
                      District NGO Profile
                    </li>
                  )}
                </NavLink>
              )}

              {/* SUPERVISOR */}
              {(isStateSuperAdmin || isDistrictAdmin) && (
                <NavLink
                  to="/account-settings/account?role=Supervisor"
                  style={styles.link}
                >
                  {({ isActive }) => (
                    <li
                      style={styles.subMenuItem(
                        activeRole === "Supervisor"
                      )}
                    >
                      <div
                        style={styles.subMenuDot(
                          activeRole === "Supervisor"
                        )}
                      ></div>
                      Supervisor Profile
                    </li>
                  )}
                </NavLink>
              )}

              {/* ASTHA DIDI */}
              {(isStateSuperAdmin || isDistrictAdmin || isSupervisor) && (
                <NavLink
                  to="/account-settings/account?role=Astha Didi"
                  style={styles.link}
                >
                  {({ isActive }) => (
                    <li
                      style={styles.subMenuItem(
                        activeRole === "Astha Didi"
                      )}
                    >
                      <div
                        style={styles.subMenuDot(
                          activeRole === "Astha Didi"
                        )}
                      ></div>
                      Astha Didi Profile
                    </li>
                  )}
                </NavLink>
              )}

              {/* ASTHA MAA */}
              {(isStateSuperAdmin ||
                isDistrictAdmin ||
                isSupervisor ||
                isAsthaDidi) && (
                  <NavLink
                    to="/account-settings/account?role=Astha Maa"
                    style={styles.link}
                  >
                    {({ isActive }) => (
                      <li
                        style={styles.subMenuItem(
                          activeRole === "Astha Maa"
                        )}
                      >
                        <div
                          style={styles.subMenuDot(
                            activeRole === "Astha Maa"
                          )}
                        ></div>
                        Astha Maa Profile
                      </li>
                    )}
                  </NavLink>
                )}

              {/* PRODUCT DISTRIBUTION */}
              {!isAsthaMaa && (
                <NavLink to="/product-distribution" style={styles.link}>
                  {({ isActive }) => (
                    <li style={styles.subMenuItem(isActive)}>
                      <div style={styles.subMenuDot(isActive)}></div>
                      Product Distribution
                    </li>
                  )}
                </NavLink>
              )}

            </div>

          </>
        )}

        {/* ......................... State Complete........................... */}

        {/* --- DISTRICT MODULE MAIN MENU --- */}
        {(isStateSuperAdmin || isDistrictAdmin) && (
          <>
            <li
              style={styles.menuItem(false)}
              onClick={() => setIsDistrictMenuOpen(!isDistrictMenuOpen)}
            >
              <div style={styles.menuItemLeft}>
                <span style={{ marginRight: "10px" }}>🏛️</span> District Ngo
              </div>
              <span style={styles.chevron(isDistrictMenuOpen)}>▶</span>
            </li>

            <div style={styles.subMenuContainer(isDistrictMenuOpen)}>

              {/* <NavLink to="/account-settings/account" style={styles.link}>
            {({ isActive }) => (
              <li
                style={styles.subMenuItem(
                  location.pathname === "/account-settings/account" &&
                  !activeRole
                )}
              >
                <div
                  style={styles.subMenuDot(
                    location.pathname === "/account-settings/account" &&
                    !activeRole
                  )}
                ></div>
                District NGO Profile
              </li>
            )}
          </NavLink> */}

              {/* SUPERVISOR */}
              {(isStateSuperAdmin || isDistrictAdmin) && (
                <NavLink
                  to="/account-settings/account?role=Supervisor"
                  style={styles.link}
                >
                  {({ isActive }) => (
                    <li
                      style={styles.subMenuItem(
                        activeRole === "Supervisor"
                      )}
                    >
                      <div
                        style={styles.subMenuDot(
                          activeRole === "Supervisor"
                        )}
                      ></div>
                      Supervisor Profile
                    </li>
                  )}
                </NavLink>
              )}

              {/* ASTHA DIDI */}
              {(isStateSuperAdmin || isDistrictAdmin || isSupervisor) && (
                <NavLink
                  to="/account-settings/account?role=Astha Didi"
                  style={styles.link}
                >
                  {({ isActive }) => (
                    <li
                      style={styles.subMenuItem(
                        activeRole === "Astha Didi"
                      )}
                    >
                      <div
                        style={styles.subMenuDot(
                          activeRole === "Astha Didi"
                        )}
                      ></div>
                      Astha Didi Profile
                    </li>
                  )}
                </NavLink>
              )}

              {/* ASTHA MAA */}
              {(isStateSuperAdmin ||
                isDistrictAdmin ||
                isSupervisor ||
                isAsthaDidi) && (
                  <NavLink
                    to="/account-settings/account?role=Astha Maa"
                    style={styles.link}
                  >
                    {({ isActive }) => (
                      <li
                        style={styles.subMenuItem(
                          activeRole === "Astha Maa"
                        )}
                      >
                        <div
                          style={styles.subMenuDot(
                            activeRole === "Astha Maa"
                          )}
                        ></div>
                        Astha Maa Profile
                      </li>
                    )}
                  </NavLink>
                )}

              {/* PRODUCT DISTRIBUTION */}
              {!isAsthaMaa && (
                <NavLink to="/product-distribution" style={styles.link}>
                  {({ isActive }) => (
                    <li style={styles.subMenuItem(isActive)}>
                      <div style={styles.subMenuDot(isActive)}></div>
                      Product Distribution
                    </li>
                  )}
                </NavLink>
              )}

            </div>
          </>
        )}

        {/* ..........................District Complete..................... */}

        {/* --- SUPERVISOR MODULE MAIN MENU --- */}

        {(isStateSuperAdmin || isDistrictAdmin || isSupervisor) && (
          <>
            <li
              style={styles.menuItem(false)}
              onClick={() => setIsSupervisorMenuOpen(!isSupervisorMenuOpen)}
            >
              <div style={styles.menuItemLeft}>
                <span style={{ marginRight: "10px" }}>🧑‍💼</span> Supervisor Profile
              </div>
              <span style={styles.chevron(isSupervisorMenuOpen)}>▶</span>
            </li>

            <div style={styles.subMenuContainer(isSupervisorMenuOpen)}>

              {/* <NavLink to="/account-settings/account" style={styles.link}>
            {({ isActive }) => (
              <li
                style={styles.subMenuItem(
                  location.pathname === "/account-settings/account" &&
                  !activeRole
                )}
              >
                <div
                  style={styles.subMenuDot(
                    location.pathname === "/account-settings/account" &&
                    !activeRole
                  )}
                ></div>
                Supervisor Profile
              </li>
            )}
          </NavLink> */}

              {/* ASTHA DIDI */}
              {(isStateSuperAdmin || isDistrictAdmin || isSupervisor) && (
                <NavLink
                  to="/account-settings/account?role=Astha Didi"
                  style={styles.link}
                >
                  {({ isActive }) => (
                    <li
                      style={styles.subMenuItem(
                        activeRole === "Astha Didi"
                      )}
                    >
                      <div
                        style={styles.subMenuDot(
                          activeRole === "Astha Didi"
                        )}
                      ></div>
                      Astha Didi Profile
                    </li>
                  )}
                </NavLink>
              )}

              {/* ASTHA MAA */}
              {(isStateSuperAdmin ||
                isDistrictAdmin ||
                isSupervisor ||
                isAsthaDidi) && (
                  <NavLink
                    to="/account-settings/account?role=Astha Maa"
                    style={styles.link}
                  >
                    {({ isActive }) => (
                      <li
                        style={styles.subMenuItem(
                          activeRole === "Astha Maa"
                        )}
                      >
                        <div
                          style={styles.subMenuDot(
                            activeRole === "Astha Maa"
                          )}
                        ></div>
                        Astha Maa Profile
                      </li>
                    )}
                  </NavLink>
                )}

              {/* PRODUCT DISTRIBUTION */}
              {!isAsthaMaa && (
                <NavLink to="/product-distribution" style={styles.link}>
                  {({ isActive }) => (
                    <li style={styles.subMenuItem(isActive)}>
                      <div style={styles.subMenuDot(isActive)}></div>
                      Product Distribution
                    </li>
                  )}
                </NavLink>
              )}

            </div>
          </>
        )}
        {/* .....................Supervisor Complete................... */}

        {/* --- ASTHA DIDI MODULE MAIN MENU --- */}
        {(
          isStateSuperAdmin ||
          isDistrictAdmin ||
          isSupervisor ||
          isAsthaDidi
        ) && (
            <>
              <li
                style={styles.menuItem(false)}
                onClick={() => setIsAsthaDidiMenuOpen(!isAsthaDidiMenuOpen)}
              >
                <div style={styles.menuItemLeft}>
                  <span style={{ marginRight: "10px" }}>👩‍🏫</span> Astha Didi Profile
                </div>
                <span style={styles.chevron(isAsthaDidiMenuOpen)}>▶</span>
              </li>

              <div style={styles.subMenuContainer(isAsthaDidiMenuOpen)}>

                {/* <NavLink to="/account-settings/account" style={styles.link}>
            {({ isActive }) => (
              <li
                style={styles.subMenuItem(
                  location.pathname === "/account-settings/account" &&
                  !activeRole
                )}
              >
                <div
                  style={styles.subMenuDot(
                    location.pathname === "/account-settings/account" &&
                    !activeRole
                  )}
                ></div>
                Astha Didi Profile
              </li>
            )}
          </NavLink> */}

                {/* ASTHA MAA */}
                {(isStateSuperAdmin ||
                  isDistrictAdmin ||
                  isSupervisor ||
                  isAsthaDidi) && (
                    <NavLink
                      to="/account-settings/account?role=Astha Maa"
                      style={styles.link}
                    >
                      {({ isActive }) => (
                        <li
                          style={styles.subMenuItem(
                            activeRole === "Astha Maa"
                          )}
                        >
                          <div
                            style={styles.subMenuDot(
                              activeRole === "Astha Maa"
                            )}
                          ></div>
                          Astha Maa Profile
                        </li>
                      )}
                    </NavLink>
                  )}

                {/* PRODUCT DISTRIBUTION */}
                {!isAsthaMaa && (
                  <NavLink to="/product-distribution" style={styles.link}>
                    {({ isActive }) => (
                      <li style={styles.subMenuItem(isActive)}>
                        <div style={styles.subMenuDot(isActive)}></div>
                        Product Distribution
                      </li>
                    )}
                  </NavLink>
                )}

              </div>
            </>
          )}
        {/* ..................................Astha Didi Complete........................... */}

        {/* --- ASTHA MAA MODULE MAIN MENU --- */}
        {(
          isStateSuperAdmin ||
          isDistrictAdmin ||
          isSupervisor ||
          isAsthaDidi ||
          isAsthaMaa
        ) && (
            <>
              <li
                style={styles.menuItem(false)}
                onClick={() => setIsAsthaMaaMenuOpen(!isAsthaMaaMenuOpen)}
              >
                <div style={styles.menuItemLeft}>
                  <span style={{ marginRight: "10px" }}>🤱</span> Astha Maa Profile
                </div>
                <span style={styles.chevron(isAsthaMaaMenuOpen)}>▶</span>
              </li>

              <div style={styles.subMenuContainer(isAsthaMaaMenuOpen)}>

                {/* <NavLink to="/account-settings/account" style={styles.link}>
            {({ isActive }) => (
              <li
                style={styles.subMenuItem(
                  location.pathname === "/account-settings/account" &&
                  !activeRole
                )}
              >
                <div
                  style={styles.subMenuDot(
                    location.pathname === "/account-settings/account" &&
                    !activeRole
                  )}
                ></div>
                Astha Maa Profile
              </li>
            )}
          </NavLink> */}

                {/* PRODUCT DISTRIBUTION */}
                {!isAsthaMaa && (
                  <NavLink to="/product-distribution" style={styles.link}>
                    {({ isActive }) => (
                      <li style={styles.subMenuItem(isActive)}>
                        <div style={styles.subMenuDot(isActive)}></div>
                        Product Distribution
                      </li>
                    )}
                  </NavLink>
                )}

              </div>
            </>
          )}
        {/* ...........................Astha Maa Complete...................... */}

        {/* --- 2. PRODUCT DISTRIBUTION (MAIN MENU) --- */}
        {/* ✅ FIXED: Hide this menu item entirely if the user is an Astha Maa */}
        {/* {!isAsthaMaa && (
          <NavLink to="/product-distribution" style={styles.link}>
            {({ isActive }) => (
              <li style={styles.menuItem(isActive)}>
                <div style={styles.menuItemLeft}>
                  <span style={{ marginRight: "10px" }}>📦</span> Product
                  Distribution
                </div>
              </li>
            )}
          </NavLink>
        )} */}

        {/* --- 3. SETTINGS MENU --- */}
        {isDeveloper && (
          <>
            <li
              style={styles.menuItem(false)}
              onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
            >
              <div style={styles.menuItemLeft}>
                <span style={{ marginRight: "10px" }}>⚙️</span> Settings
              </div>
              <span style={styles.chevron(isSettingsMenuOpen)}>▶</span>
            </li>

            <div style={styles.subMenuContainer(isSettingsMenuOpen)}>
              <NavLink to="/settings/role-management" style={styles.link}>
                {({ isActive }) => (
                  <li style={styles.subMenuItem(isActive)}>
                    <div style={styles.subMenuDot(isActive)}></div> Role
                    Management
                  </li>
                )}
              </NavLink>

              <NavLink to="/settings/access-management" style={styles.link}>
                {({ isActive }) => (
                  <li style={styles.subMenuItem(isActive)}>
                    <div style={styles.subMenuDot(isActive)}></div> Access
                    Management
                  </li>
                )}
              </NavLink>

              <NavLink to="/settings/user-management" style={styles.link}>
                {({ isActive }) => (
                  <li style={styles.subMenuItem(isActive)}>
                    <div style={styles.subMenuDot(isActive)}></div> User
                    Management
                  </li>
                )}
              </NavLink>
            </div>
          </>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
