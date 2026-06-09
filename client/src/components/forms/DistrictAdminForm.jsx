import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Select from "react-select";
import { toast } from "react-toastify";

// Import your newly separated CSS file
import "./DistrictAdminForm.css";

import {
  API_BASE_URL,
  indianPhoneRegex,
  styles, // Retained solely for react-select usage
  FormInput,
  fileToBase64,
} from "../../config/constants";
import { getSafeUser, handleViewPdf, validateUniqueFields } from "../AccountSharedUtils";

export const ngoSchema = z.object({
  ngoName: z.string().min(2, "NGO Name is required"),
  ngoRegistrationDate: z.string().min(1, "Date is required"),
  ngoRegistrationNo: z.string().min(1, "Registration No is required"),
  ngoPanNo: z.string().min(1, "PAN No is required"),
  ngoDarpanId: z.string().optional().or(z.literal("")),
  generalNgoEmail: z.string().email("Valid email required").optional(),
  ngoMobile: z.string().regex(indianPhoneRegex, "Valid Indian phone required"),
  ngoRegAddress: z.string().min(5, "Address is required"),
  ngoWorkingAddress: z.string().min(5, "Address is required"),
  state: z.object({ value: z.any(), label: z.string() }).nullable(),
  district: z.object({ value: z.any(), label: z.string() }).nullable(),
  blockName: z.string().min(1, "Block Name is required"),
  sdpName: z.string().min(2, "Name is required"),
  secretaryEmail: z.string().email("Valid email required"),
  secretaryMobile: z.string().regex(indianPhoneRegex, "Valid phone required"),
  secretaryAadhar: z
    .string()
    .length(12, "Must be exactly 12 digits")
    .regex(/^\d+$/, "Numbers only"),

  // Made Banking fields optional
  bankAccountHolderName: z.string().optional().or(z.literal("")),
  bankName: z.string().optional().or(z.literal("")),
  accountNo: z.string().optional().or(z.literal("")),
  ifsCode: z.string().optional().or(z.literal("")),
  bankAddress: z.string().optional().or(z.literal("")),

  userName: z.string().min(1, "User Name is required"),
  ngoEmail: z.string().email("Valid login email required"),
  password: z.string().min(1, "Password is required"),
});

const PasswordInput = ({
  label,
  id,
  error,
  placeholder,
  disabled,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="input-group">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="password-wrapper">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          className={`password-input ${disabled ? "disabled" : ""} ${error ? "error" : ""}`}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="password-toggle-btn"
        >
          {showPassword ? "👁️‍🗨️" : "👁️"}
        </button>
      </div>
      {error && <p className="error-text">{error.message}</p>}
    </div>
  );
};

const DistrictAdminForm = ({ onSuccess, defaultState, defaultDistrict }) => {
  const [dbStates, setDbStates] = useState([]);
  const [dbDistricts, setDbDistricts] = useState([]);

  const [regCertPdf, setRegCertPdf] = useState(null);
  const [panPdf, setPanPdf] = useState(null);
  const [darpanPdf, setDarpanPdf] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ngoSchema),
    mode: "onChange",
    defaultValues: {
      ngoName: "",
      ngoRegistrationDate: "",
      ngoRegistrationNo: "",
      ngoPanNo: "",
      ngoDarpanId: "",
      generalNgoEmail: "",
      ngoMobile: "",
      ngoRegAddress: "",
      ngoWorkingAddress: "",
      state: null,
      district: null,
      blockName: "",
      sdpName: "",
      secretaryEmail: "",
      secretaryMobile: "",
      secretaryAadhar: "",
      bankAccountHolderName: "",
      bankName: "",
      accountNo: "",
      ifsCode: "",
      bankAddress: "",
      userName: "",
      ngoEmail: "",
      password: "",
    },
  });

  const selectedState = watch("state");
  const ngoNameValue = watch("ngoName");

  // Pre-fill Logic
  useEffect(() => {
    if (defaultState) setValue("state", defaultState, { shouldValidate: true });
    if (defaultDistrict)
      setValue("district", defaultDistrict, { shouldValidate: true });
  }, [defaultState, defaultDistrict, setValue]);

  useEffect(() => {
    setValue("userName", ngoNameValue || "", { shouldValidate: true });
  }, [ngoNameValue, setValue]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/states`)
      .then((res) => res.json())
      .then((data) =>
        setDbStates(
          data.map((s) => ({ value: s.StateId, label: s.StateName })),
        ),
      );
  }, []);

  useEffect(() => {
    if (selectedState && selectedState.value) {
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
  }, [selectedState]);

  const handlePdfUpload = async (event, setPdfState) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "application/pdf")
        return toast.warning("Only PDF files are allowed.");
      if (file.size > 5000000)
        return toast.warning("File size exceeds the 5MB limit.");
      try {
        const b64 = await fileToBase64(file);
        setPdfState(b64);
      } catch (err) {
        toast.error("Error reading the file.");
      }
    }
  };

  const handleCancel = () => {
    reset();
    setRegCertPdf(null);
    setPanPdf(null);
    setDarpanPdf(null);
  };

  const onSubmitDistrictAdmin = async (data) => {
    if (!regCertPdf || !panPdf) {
      toast.error(
        "Required: Please upload the mandatory documents (Reg Cert and PAN) before submitting.",
        { position: "top-right" },
      );
      return;
    }
    const checks = [
      {
        table: "dist_ngo_reg",
        column: "DistNGOMailId",
        value: data.generalNgoEmail,
        label: "Email ID",
      },
      {
        table: "dist_ngo_reg",
        column: "DistNGOSignupUserName",
        value: data.userName,
        label: "Username",
      },
    ];
    if (!(await validateUniqueFields(checks))) return;

    const loggedInUser = getSafeUser ? getSafeUser() : null;
    const currentUserId = loggedInUser
      ? loggedInUser.UserSignUpId || loggedInUser.id
      : null;

    const dbPayload = {
      DistNGOName: data.ngoName,
      DistNGORegDate: data.ngoRegistrationDate,
      DistNGORegNo: data.ngoRegistrationNo,
      DistNGOPanNo: data.ngoPanNo,
      DistNGODarpanId: data.ngoDarpanId,
      DistNGOMailId: data.generalNgoEmail,
      DistNGOPhoneNo: data.ngoMobile,
      DistNGORegAddress: data.ngoRegAddress,
      DistNGOWorkingAddress: data.ngoWorkingAddress,
      DistNGOStateName: data.state ? data.state.label : "",
      DistNGODistName: data.district ? data.district.label : "",
      DistNGOBlockName: data.blockName,
      DistNGOSDPName: data.sdpName,
      DistNGOSDPMailId: data.secretaryEmail,
      DistNGOSDPPhoneNo: data.secretaryMobile,
      DistNGOSDPAadhaarNo: data.secretaryAadhar,
      DistNGOBankAcctHolderName: data.bankAccountHolderName,
      DistNGOBankName: data.bankName,
      DistNGOAcctNo: data.accountNo,
      DistNGOIFSCode: data.ifsCode,
      DistNGOBankAdd: data.bankAddress,
      DistNGORecCertificate: regCertPdf,
      DistNGOPanPic: panPdf,
      DistNGODarpanPic: darpanPdf,
      DistNGOSignupUserName: data.userName,
      DistNGOSignupEmail: data.ngoEmail,
      DistNGOSignupPassword: data.password,
      DistNGOCreatedByAuthRegId: currentUserId,
      DistNGOIsActive: 1,
      StateNGORegId: null,
      DistNGOAprovedBy: null,
      DistNGOAprovedDate: null,
      DistNGOGenRegNo: null,
    };

    try {
      toast.loading("Saving District Admin data...", {
        toastId: "savingAdmin",
      });
      const response = await fetch(`${API_BASE_URL}/districtadmin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbPayload),
      });
      toast.dismiss("savingAdmin");
      if (response.ok) {
        toast.success("Success: Data saved to Database!", {
          position: "top-right",
        });
        handleCancel();
        if (onSuccess) onSuccess();
      } else {
        toast.error("Failed to save data. Check backend logs.", {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.dismiss("savingAdmin");
      toast.error("Network error. Could not reach server.", {
        position: "top-right",
      });
    }
  };

  const onError = () =>
    toast.error("Form Error: Please check the highlighted fields.", {
      position: "top-right",
    });

  return (
    <div className="card">
      <div className="card-header">
        <h5>District Administrator Registration</h5>
      </div>
      <div className="card-body">
        <form
          onSubmit={handleSubmit(onSubmitDistrictAdmin, onError)}
          autoComplete="off"
        >
          <h6 className="section-header">NGO Details</h6>
          <div className="form-grid">
            <Controller
              name="ngoName"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      NGO Full Name <span className="required-asterisk">*</span>
                    </>
                  }
                  id="ngoName"
                  error={errors.ngoName}
                  type="text"
                  {...field}
                />
              )}
            />
            <Controller
              name="ngoRegistrationDate"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Date of NGO/ Trustee Registration{" "}
                      <span className="required-asterisk">*</span>
                    </>
                  }
                  id="ngoRegistrationDate"
                  error={errors.ngoRegistrationDate}
                  type="date"
                  {...field}
                />
              )}
            />
            <Controller
              name="ngoRegistrationNo"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      NGO Registration No/ CIN / Trustee Deed No{" "}
                      <span className="required-asterisk">*</span>
                    </>
                  }
                  id="ngoRegistrationNo"
                  error={errors.ngoRegistrationNo}
                  type="text"
                  {...field}
                />
              )}
            />
            <Controller
              name="ngoPanNo"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      NGO PAN No <span className="required-asterisk">*</span>
                    </>
                  }
                  id="ngoPanNo"
                  error={errors.ngoPanNo}
                  type="text"
                  {...field}
                />
              )}
            />
            <Controller
              name="ngoDarpanId"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="NGO Darpan ID"
                  id="ngoDarpanId"
                  error={errors.ngoDarpanId}
                  type="text"
                  {...field}
                />
              )}
            />
            <Controller
              name="generalNgoEmail"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="NGO General Email ID"
                  id="generalNgoEmail"
                  error={errors.generalNgoEmail}
                  type="email"
                  placeholder="Optional general contact email"
                  {...field}
                />
              )}
            />
            <Controller
              name="ngoMobile"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      NGO Mobile No <span className="required-asterisk">*</span>
                    </>
                  }
                  id="ngoMobile"
                  error={errors.ngoMobile}
                  type="tel"
                  {...field}
                />
              )}
            />
          </div>

          <h6 className="section-header">Address Details</h6>
          <div className="form-grid">
            <div className="input-group">
              <label className="label">
                Willing to work State Name{" "}
                <span className="required-asterisk">*</span>
              </label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={dbStates}
                    classNamePrefix="react-select"
                    styles={styles.selectStyles && styles.selectStyles(!!errors.state)}
                    placeholder="Select State"
                    isDisabled={!!defaultState}
                  />
                )}
              />
            </div>
            <div className="input-group">
              <label className="label">
                Willing to work which district Name{" "}
                <span className="required-asterisk">*</span>
              </label>
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={dbDistricts}
                    classNamePrefix="react-select"
                    styles={styles.selectStyles && styles.selectStyles(!!errors.district)}
                    placeholder="Select District"
                    isDisabled={!selectedState || !!defaultDistrict}
                  />
                )}
              />
            </div>
            <Controller
              name="blockName"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Working Block Name{" "}
                      <span className="required-asterisk">
                        * (Can type multiple)
                      </span>
                    </>
                  }
                  id="blockName"
                  error={errors.blockName}
                  type="text"
                  {...field}
                />
              )}
            />
            <Controller
              name="ngoRegAddress"
              control={control}
              render={({ field }) => (
                <div className="input-group full-width">
                  <label htmlFor="ngoRegAddress" className="label">
                    NGO Register Address{" "}
                    <span className="required-asterisk">*</span>
                  </label>
                  <textarea
                    id="ngoRegAddress"
                    className={`textarea-input ${errors.ngoRegAddress ? "error" : ""}`}
                    {...field}
                  />
                  {errors.ngoRegAddress && (
                    <p className="error-text">
                      {errors.ngoRegAddress.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="ngoWorkingAddress"
              control={control}
              render={({ field }) => (
                <div className="input-group full-width">
                  <label htmlFor="ngoWorkingAddress" className="label">
                    NGO Working office full address{" "}
                    <span className="required-asterisk">*</span>
                  </label>
                  <textarea
                    id="ngoWorkingAddress"
                    className={`textarea-input ${errors.ngoWorkingAddress ? "error" : ""}`}
                    {...field}
                  />
                  {errors.ngoWorkingAddress && (
                    <p className="error-text">
                      {errors.ngoWorkingAddress.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <h6 className="section-header">Secretary Details</h6>
          <div className="form-grid">
            <Controller
              name="sdpName"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Secretary/ Director/ President Full Name{" "}
                      <span className="required-asterisk">*</span>
                    </>
                  }
                  id="sdpName"
                  error={errors.sdpName}
                  type="text"
                  {...field}
                />
              )}
            />
            <Controller
              name="secretaryEmail"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Secretary/ Director/ President Email ID{" "}
                      <span className="required-asterisk">*</span>
                    </>
                  }
                  id="secretaryEmail"
                  error={errors.secretaryEmail}
                  type="email"
                  {...field}
                />
              )}
            />
            <Controller
              name="secretaryMobile"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Secretary/ Director/ President Mobile No{" "}
                      <span className="required-asterisk">*</span>
                    </>
                  }
                  id="secretaryMobile"
                  error={errors.secretaryMobile}
                  type="tel"
                  {...field}
                />
              )}
            />
            <Controller
              name="secretaryAadhar"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Secretary/ Director Aadhaar Card Number{" "}
                      <span className="required-asterisk">*</span>
                    </>
                  }
                  id="secretaryAadhar"
                  error={errors.secretaryAadhar}
                  type="text"
                  maxLength={12}
                  {...field}
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
                  disabled={true}
                  {...field}
                />
              )}
            />
            <Controller
              name="ngoEmail"
              control={control}
              render={({ field }) => (
                <FormInput
                  label={
                    <>
                      Email ID (For Login){" "}
                      <span className="required-asterisk">*</span>
                    </>
                  }
                  id="ngoEmail"
                  error={errors.ngoEmail}
                  type="email"
                  autoComplete="off"
                  {...field}
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

          <h6 className="section-header">Banking & Account Setup</h6>
          <div className="form-grid">
            <Controller
              name="bankAccountHolderName"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Account Holder Name"
                  id="bankAccountHolderName"
                  error={errors.bankAccountHolderName}
                  type="text"
                  {...field}
                />
              )}
            />
            <Controller
              name="bankName"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Bank Name"
                  id="bankName"
                  error={errors.bankName}
                  type="text"
                  {...field}
                />
              )}
            />
            <Controller
              name="accountNo"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Account Number"
                  id="accountNo"
                  error={errors.accountNo}
                  type="text"
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
                  type="text"
                  {...field}
                />
              )}
            />
            <Controller
              name="bankAddress"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Bank Address"
                  id="bankAddress"
                  error={errors.bankAddress}
                  type="text"
                  {...field}
                />
              )}
            />
          </div>

          <h6 className="section-header">Documents</h6>
          <div className="form-grid">
            <div className="input-group">
              <label className="label">
                Reg Cert PDF <span className="required-asterisk">*</span>
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handlePdfUpload(e, setRegCertPdf)}
                className="file-input"
              />
              {regCertPdf && (
                <div className="pdf-preview-row">
                  <button
                    type="button"
                    onClick={() => handleViewPdf(regCertPdf)}
                    className="btn-outline pdf-preview-btn"
                  >
                    👁️ Preview PDF
                  </button>
                  <span className="pdf-ready-text">✅ Ready</span>
                </div>
              )}
            </div>
            <div className="input-group">
              <label className="label">
                NGO PAN PDF <span className="required-asterisk">*</span>
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handlePdfUpload(e, setPanPdf)}
                className="file-input"
              />
              {panPdf && (
                <div className="pdf-preview-row">
                  <button
                    type="button"
                    onClick={() => handleViewPdf(panPdf)}
                    className="btn-outline pdf-preview-btn"
                  >
                    👁️ Preview PDF
                  </button>
                  <span className="pdf-ready-text">✅ Ready</span>
                </div>
              )}
            </div>
            <div className="input-group">
              <label className="label">Darpan PDF</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handlePdfUpload(e, setDarpanPdf)}
                className="file-input"
              />
              {darpanPdf && (
                <div className="pdf-preview-row">
                  <button
                    type="button"
                    onClick={() => handleViewPdf(darpanPdf)}
                    className="btn-outline pdf-preview-btn"
                  >
                    👁️ Preview PDF
                  </button>
                  <span className="pdf-ready-text">✅ Ready</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DistrictAdminForm;