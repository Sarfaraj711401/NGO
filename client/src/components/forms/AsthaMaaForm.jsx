import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Select from "react-select";
import { toast } from "react-toastify";

// Import your new CSS file
import "./AsthaMaaForm.css";

import {
  API_BASE_URL,
  DUMMY_AVATAR,
  indianZipRegex,
  indianPhoneRegex,
  styles, // Keeping this ONLY if react-select uses styles.selectStyles internally
  FormInput,
} from "../../config/constants";
import {
  getSafeUser,
  PasswordInput,
  validateUniqueFields,
} from "../AccountSharedUtils";

export const asthaMaaSchema = z.object({
  joiningAmount: z.string().min(1, "Joining Amount is required"),

  walletBalance: z.string().optional(),

  fullName: z
    .string()
    .min(2, "Minimum 2 characters required")
    .max(50, "Maximum 50 characters allowed")
    .regex(/^[A-Za-z\s]+$/, "Only letters are allowed"),

  sdwOf: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Za-z\s]+$/.test(val),
      "Only letters are allowed"
    ),

  dob: z.string().min(1, "Date of Birth is required"),

  guardianContactNo: z
    .string()
    .min(10, "Must be 10 digits")
    .max(10, "Must be 10 digits")
    .regex(/^[0-9]+$/, "Only digits allowed"),

  state: z
    .object({
      value: z.any(),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "State is required",
    }),

  district: z
    .object({
      value: z.any(),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "District is required",
    }),

  city: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Za-z\s]+$/.test(val),
      "Only letters are allowed"
    ),

  block: z
    .string()
    .min(1, "Block is required")
    .regex(/^[A-Za-z\s]+$/, "Only letters are allowed"),

  postOffice: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Za-z\s]+$/.test(val),
      "Only letters are allowed"
    ),

  policeStation: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Za-z\s]+$/.test(val),
      "Only letters are allowed"
    ),

  gramPanchayet: z
    .string()
    .min(1, "Gram Panchayet is required")
    .regex(/^[A-Za-z\s]+$/, "Only letters are allowed"),

  village: z
    .string()
    .min(1, "Village is required")
    .regex(/^[A-Za-z\s]+$/, "Only letters are allowed"),

  pinCode: z
    .string()
    .min(1, "Pin Code is required")
    .regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits"),

  mobileNo: z
    .string()
    .min(10, "Mobile number must be 10 digits")
    .max(10, "Mobile number must be 10 digits")
    .regex(/^[6-9][0-9]{9}$/, "Enter valid Indian mobile number"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(100, "Maximum 100 characters allowed"),

  userName: z.string().min(1, "Username is required"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  bankName: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Za-z\s]+$/.test(val),
      "Only letters are allowed"
    ),

  branchName: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Za-z\s]+$/.test(val),
      "Only letters are allowed"
    ),

  accountNo: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]+$/.test(val),
      "Only digits allowed"
    ),

  ifsCode: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val.toUpperCase()),
      "Invalid IFSC code"
    ),

  panNo: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val.toUpperCase()),
      "Invalid PAN Number"
    ),

  aadharNo: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) =>
        !val ||
        val.trim() === "" ||
        /^[0-9]{12}$/.test(val.trim()),
      "Aadhaar must be exactly 12 digits"
    ),
});

const AsthaMaaForm = ({ onSuccess, externalFilters }) => {
  const {
    filterMotherNgo,
    filterState,
    filterDistrict,
    filterSupervisor,
    filterAsthaDidi,
  } = externalFilters || {};
  const [dbStates, setDbStates] = useState([]);
  const [dbDistricts, setDbDistricts] = useState([]);
  const [profileImage, setProfileImage] = useState(DUMMY_AVATAR);
  const fileInputRef = useRef(null);

  // ✅ FIXED: Using inclusive hierarchy validation
  const [isFormAllowed, setIsFormAllowed] = useState(false);
  const [isStrictAsthaDidi, setIsStrictAsthaDidi] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(asthaMaaSchema),
    mode: "onChange",
    defaultValues: {
      joiningAmount: "105",
      walletBalance: "0",
      fullName: "",
      sdwOf: "",
      dob: "",
      guardianContactNo: "",
      state: null,
      district: null,
      city: "",
      block: "",
      postOffice: "",
      policeStation: "",
      gramPanchayet: "",
      village: "",
      pinCode: "",
      mobileNo: "",
      email: "",
      userName: "",
      password: "",
      bankName: "",
      branchName: "",
      accountNo: "",
      ifsCode: "",
      panNo: "",
      aadharNo: "",
    },
  });

  const selectedState = watch("state");
  const fullNameValue = watch("fullName");

  useEffect(() => {
    const loggedInUser = getSafeUser ? getSafeUser() : null;
    if (loggedInUser) {
      const role = (
        loggedInUser?.role ||
        loggedInUser?.UserSignUpRole ||
        ""
      ).toLowerCase();

      setIsStrictAsthaDidi(role === "astha didi");

      // ✅ FIXED: Allow State Super Admin and all intermediate roles
      setIsFormAllowed(
        role === "astha didi" ||
        role === "supervisor" ||
        role === "district administrator" ||
        role === "state super administrator" ||
        role === "developer",
      );
    }
  }, []);

  useEffect(() => {
    setValue("userName", fullNameValue || "", { shouldValidate: true });
  }, [fullNameValue, setValue]);

  useEffect(() => {
    if (filterState) {
      setDbStates([filterState]);
      setValue("state", filterState, { shouldValidate: true });
    } else {
      fetch(`${API_BASE_URL}/states`)
        .then((res) => res.json())
        .then((data) =>
          setDbStates(
            data.map((s) => ({ value: s.StateId, label: s.StateName })),
          ),
        );
    }
  }, [filterState, setValue]);

  useEffect(() => {
    if (filterDistrict) {
      setDbDistricts([filterDistrict]);
      setValue("district", filterDistrict, { shouldValidate: true });
    } else if (selectedState && selectedState.value && !filterState) {
      fetch(`${API_BASE_URL}/districts/${selectedState.value}`)
        .then((res) => res.json())
        .then((data) =>
          setDbDistricts(
            data.map((d) => ({ value: d.DistId, label: d.DistName })),
          ),
        );
    } else {
      setDbDistricts([]);
    }
  }, [filterDistrict, selectedState, filterState, setValue]);

  const handleUploadClick = () => fileInputRef.current.click();
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 800000) return toast.warning("Image size exceeds 800K.");
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    setProfileImage(DUMMY_AVATAR);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancelAsthaMaa = () => {
    reset();
    handleResetImage();
  };

  const onSubmitAsthaMaa = async (data) => {
    if (!isFormAllowed) {
      toast.error(
        "Access Denied: You do not have permission to submit this form.",
      );
      return;
    }

    // ✅ FIXED: Checks only Email ID and Contact Number for duplicates
    const checks = [
      {
        table: "asthama_reg",
        column: "AsthaMaMailId",
        value: data.email,
        label: "Email ID",
      },
      {
        table: "asthama_reg",
        column: "AsthaMaContactNo",
        value: data.mobileNo,
        label: "Contact Number",
      },
    ];

    if (!(await validateUniqueFields(checks))) return;

    const stateName = data.state ? data.state.label : "";
    const districtName = data.district ? data.district.label : "";
    const loggedInUser = getSafeUser ? getSafeUser() : null;
    const currentUserId = loggedInUser
      ? loggedInUser.UserSignUpId || loggedInUser.id
      : null;

    const dbPayload = {
      AsthaMaProfileImage: profileImage === DUMMY_AVATAR ? null : profileImage,
      AsthaMaUserName: data.fullName,
      AsthaMaGuardianName: data.sdwOf || "",
      AsthaMaDOB: data.dob,
      AsthaMaGuardianContactNo: data.guardianContactNo || "",
      AsthaMaStateName: stateName,
      AsthaMaDistName: districtName,
      AsthaMaCity: data.city || "",
      AsthaMaBlockName: data.block || "",
      AsthaMaPO: data.postOffice || "",
      AsthaMaPS: data.policeStation || "",
      AsthaMaGramPanchayet: data.gramPanchayet || "",
      AsthaMaVillage: data.village || "",
      AsthaMaPincode: parseInt(data.pinCode),
      AsthaMaContactNo: data.mobileNo,
      AsthaMaMailId: data.email,
      AsthaMaSignupUserName: data.userName,
      AsthaMaSignupEmail: data.email,
      AsthaMaSignupPassword: data.password,
      AsthaMaCreatedByAuthRegId: currentUserId,
      AsthaMaBankName: data.bankName || "",
      AsthaMaBranchName: data.branchName || "",
      AsthaMaBankAcctNo: data.accountNo || "0",
      AsthaMaIFSCode: data.ifsCode || "",
      AsthaMaPanNo: data.panNo || "",
      AsthaMaAadharNo: data.aadharNo || "",
      AsthaMaJoiningAmt: parseInt(data.joiningAmount) || 105,
      AsthaMaWalletBalance: parseInt(data.walletBalance) || 0,
      StateNGORegId: null,
      DistNGORegId: filterMotherNgo ? filterMotherNgo.value : null,
      SupRegId: filterSupervisor ? filterSupervisor.value : null,
      AsthaDidiRegId:
        isStrictAsthaDidi && loggedInUser?.ProfileRegId
          ? loggedInUser.ProfileRegId
          : filterAsthaDidi
            ? filterAsthaDidi.value
            : null,
      AsthaMaIsActive: 1,
      AsthaMaAprovedBy: null,
      AsthaMaAprovalDate: null,
      AsthaMaRegNo: null,
    };

    try {
      toast.loading("Saving...", { toastId: "savingMaa" });
      const response = await fetch(`${API_BASE_URL}/asthamaa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbPayload),
      });
      toast.dismiss("savingMaa");
      if (response.ok) {
        toast.success("Saved successfully!");
        handleCancelAsthaMaa();
        if (onSuccess) onSuccess();
      } else {
        toast.error("Failed to save.");
      }
    } catch (error) {
      toast.dismiss("savingMaa");
      toast.error("Network error.");
    }
  };

  const onErrorAsthaMaa = () => {
    toast.error("Error: Please check the required red fields.");
  };

  const isFormEnabled =
    isFormAllowed && (isStrictAsthaDidi ? true : !!filterAsthaDidi);

  return (
    <div className="card">
      <div className="card-header">
        <h5>Astha Maa Registration</h5>
      </div>

      {!isFormAllowed && (
        <div className="alert-danger">
          <strong>Access Denied:</strong> Only a user with the correct
          Administrative role can submit this form. Your current role does not
          permit this action.
        </div>
      )}

      {isFormAllowed && !isStrictAsthaDidi && !filterAsthaDidi && (
        <div className="alert-warning">
          <strong>Notice:</strong> Please select an <strong>ASTHA DIDI</strong>{" "}
          from the top filters before filling out this registration form.
        </div>
      )}

      <div className={`card-body ${!isFormEnabled ? "disabled-body" : ""}`}>
        <div className="profile-section">
          <img src={profileImage} alt="Profile Avatar" className="avatar" />
          <div>
            <div className="button-group">
              <button
                type="button"
                className="btn-outline"
                onClick={handleUploadClick}
              >
                Upload new photo
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={handleResetImage}
              >
                Reset
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif"
                style={{ display: "none" }}
              />
            </div>
            <p className="hint-text">
              Allowed JPG, GIF or PNG. Max size of 800K
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmitAsthaMaa, onErrorAsthaMaa)}
          autoComplete="off"
        >
          <h6 className="section-header">Astha Maa Information</h6>
          <div className="form-grid">
            <Controller
              name="joiningAmount"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Joining Amount <span className="required-asterisk">*</span>
                    </>
                  }
                  id="joiningAmount"
                  error={errors.joiningAmount}
                  placeholder="Enter Amount"
                  type="number"
                  readOnly
                  disabled={true}
                  {...field}
                />
              )}
            />
            <Controller
              name="walletBalance"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Wallet Balance <span className="required-asterisk">*</span>
                    </>
                  }
                  id="walletBalance"
                  error={errors.walletBalance}
                  placeholder="Wallet Balance"
                  type="number"
                  readOnly
                  disabled={true}
                  {...field}
                />
              )}
            />
          </div>

          <h6 className="section-header">Personal Details</h6>

          <div className="personal-details-grid">
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Full Name <span className="required-asterisk">*</span>
                    </>
                  }
                  id="fullName"
                  error={errors.fullName}
                  placeholder="Applicant Name"
                  type="text"
                  maxLength={50}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/[^A-Za-z\s]/g, "")
                    )
                  }
                />
              )}
            />
            <Controller
              name="sdwOf"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="S/D/W of"
                  id="sdwOf"
                  error={errors.sdwOf}
                  placeholder="S/D/W of"
                  type="text"
                  maxLength={50}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/[^A-Za-z\s]/g, "")
                    )
                  }
                />
              )}
            />
            <Controller
              name="dob"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Date of Birth <span className="required-asterisk">*</span>
                    </>
                  }
                  id="dob"
                  error={errors.dob}
                  placeholder="DD/MM/YYYY"
                  type="date"
                  {...field}
                />
              )}
            />
            <Controller
              name="guardianContactNo"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Guardian Contact no{" "}
                      <span className="required-asterisk">*</span>
                    </>
                  }
                  id="guardianContactNo"
                  error={errors.guardianContactNo}
                  placeholder="Guardian Contact no"
                  type="text"
                  maxLength={50}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                />
              )}
            />
          </div>

          <h6 className="section-header">Postal Address Information</h6>
          <div className="form-grid">
            <div className="input-group">
              <label className="label">Select State</label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={dbStates}
                    styles={styles.selectStyles && styles.selectStyles(!!errors.state)}
                    placeholder="Select State"
                    isDisabled={!!filterState}
                  />
                )}
              />
              {errors.state && (
                <p className="error-text">{errors.state.message}</p>
              )}
            </div>
            <div className="input-group">
              <label className="label">District</label>
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={dbDistricts}
                    styles={styles.selectStyles && styles.selectStyles(!!errors.district)}
                    placeholder="Select District"
                    isDisabled={!!filterDistrict || !selectedState}
                  />
                )}
              />
              {errors.district && (
                <p className="error-text">{errors.district.message}</p>
              )}
            </div>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="City"
                  id="city"
                  error={errors.city}
                  placeholder="City"
                  type="text"
                  maxLength={50}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/[^A-Za-z\s]/g, "")
                    )
                  }
                />
              )}
            />
            <Controller
              name="block"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Block <span className="required-asterisk">*</span>
                    </>
                  }
                  id="block"
                  error={errors.block}
                  placeholder="Block"
                  type="text"
                  maxLength={50}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/[^A-Za-z\s]/g, "")
                    )
                  }
                />
              )}
            />
            <Controller
              name="postOffice"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Post Office"
                  id="postOffice"
                  error={errors.postOffice}
                  placeholder="Post Office"
                  type="text"
                  maxLength={50}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/[^A-Za-z\s]/g, "")
                    )
                  }
                />
              )}
            />
            <Controller
              name="policeStation"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Police Station"
                  id="policeStation"
                  error={errors.policeStation}
                  placeholder="Police Station"
                  type="text"
                  maxLength={50}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/[^A-Za-z\s]/g, "")
                    )
                  }
                />
              )}
            />
            <Controller
              name="gramPanchayet"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Gram Panchayet <span className="required-asterisk">*</span>
                    </>
                  }
                  id="gramPanchayet"
                  error={errors.gramPanchayet}
                  placeholder="Gram Panchayet"
                  type="text"
                  maxLength={50}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/[^A-Za-z\s]/g, "")
                    )
                  }
                />
              )}
            />
            <Controller
              name="village"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Village <span className="required-asterisk">*</span>
                    </>
                  }
                  id="village"
                  error={errors.village}
                  placeholder="Village"
                  type="text"
                  maxLength={50}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/[^A-Za-z\s]/g, "")
                    )
                  }
                />
              )}
            />
            <Controller
              name="pinCode"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Pin Code <span className="required-asterisk">*</span>
                    </>
                  }
                  id="pinCode"
                  error={errors.pinCode}
                  placeholder="Pincode"
                  type="text"
                  maxLength={6}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                />
              )}
            />
            <Controller
              name="mobileNo"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Contact Number <span className="required-asterisk">*</span>
                    </>
                  }
                  id="mobileNo"
                  error={errors.mobileNo}
                  placeholder="Mobile No."
                  type="tel"
                  maxLength={10}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                />
              )}
            />
          </div>

          <h6 className="section-header">Login & Account Setup</h6>
          <div className="form-grid">
            <Controller
              name="userName"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      User Name <span className="required-asterisk">*</span>
                    </>
                  }
                  id="userName"
                  error={errors.userName}
                  type="text"
                  readOnly
                  disabled
                  {...field}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Email ID (For Login){" "}
                      <span className="required-asterisk">*</span>
                    </>
                  }
                  id="email"
                  error={errors.email}
                  placeholder="Email ID"
                  type="email"
                  maxLength={100}
                  autoComplete="off"
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value.trim())
                  }
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  label={
                    <>
                      Set New Password{" "}
                      <span className="required-asterisk">
                        * (Don't forget it!)
                      </span>
                    </>
                  }
                  id="password"
                  error={errors.password}
                  autoComplete="new-password"
                  {...field}
                />
              )}
            />
          </div>

          {/* ✅ SECURELY COMMENTED OUT: Banking & Payment Details Section */}
          {/* <h6 className="section-header">Banking & Payment Details</h6>
          <div className="form-grid">
            <Controller
              name="bankName"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Bank Name"
                  id="bankName"
                  error={errors.bankName}
                  placeholder="Bank Name"
                  type="text"
                  maxLength={100}
                  {...field}
                />
              )}
            />
            <Controller
              name="branchName"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Branch Name"
                  id="branchName"
                  error={errors.branchName}
                  placeholder="Bank Branch Name"
                  type="text"
                  maxLength={100}
                  {...field}
                />
              )}
            />
            <Controller
              name="accountNo"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Account No"
                  id="accountNo"
                  error={errors.accountNo}
                  placeholder="Account No"
                  type="text"
                  maxLength={30}
                  {...field}
                />
              )}
            />
            <Controller
              name="ifsCode"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="IFS Code"
                  id="ifsCode"
                  error={errors.ifsCode}
                  placeholder="IFS Code"
                  type="text"
                  maxLength={20}
                  {...field}
                />
              )}
            />
            <Controller
              name="panNo"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="PAN No"
                  id="panNo"
                  error={errors.panNo}
                  placeholder="Pan No"
                  type="text"
                  maxLength={10}
                  {...field}
                />
              )}
            />
            <Controller
              name="aadharNo"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={<>Aadhar No.</>}
                  id="aadharNo"
                  error={errors.aadharNo}
                  placeholder="Aadhar No"
                  type="text"
                  maxLength={12}
                  {...field}
                />
              )}
            />
          </div> */}

          <div className="form-actions">
            <button
              type="button"
              className={`btn-primary ${!isFormEnabled ? "btn-disabled" : ""}`}
              onClick={handleCancelAsthaMaa}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-primary ${!isFormEnabled ? "btn-disabled" : ""}`}
              disabled={!isFormEnabled || !isValid}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AsthaMaaForm;