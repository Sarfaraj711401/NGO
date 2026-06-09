// src/pages/AccountSettings.jsx
import React from "react";
import AccountTab from "../components/AccountTab";

const AccountSettings = () => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",   // একটু কমালাম
      width: "100%",
      maxWidth: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      padding: "0px 20px 20px 20px", // 👈 TOP padding কমানো হলো
    },
  };

  return (
    <div style={styles.container}>
      {/* Main Content Area */}
      <AccountTab />
    </div>
  );
};

export default AccountSettings;
