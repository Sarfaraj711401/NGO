// src/components/forms/StateNGOForm.jsx

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Select from "react-select";
import { toast } from "react-toastify";
import StateNGOTable from "../StateNGOTable";

import "./StateNGOForm.css";

import {
    API_BASE_URL,
    indianPhoneRegex,
    styles,
    FormInput,
    fileToBase64,
} from "../../config/constants";

import {
    getSafeUser,
    handleViewPdf,
    validateUniqueFields,
} from "../AccountSharedUtils";

/* =====================================================
   SCHEMA
===================================================== */

export const stateNgoSchema = z.object({
    acctName: z.string().min(2, "State NGO Name is required"),

    regDate: z.string().min(1, "Registration Date is required"),

    regNo: z.string().min(1, "Registration Number is required"),

    panNo: z
        .string()
        .regex(
            /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            "Invalid PAN Number"
        ),

    darpanId: z.string().optional().or(z.literal("")),

    mailId: z.string().email("Valid Email Required"),


    contactNo: z
        .string()
        .regex(indianPhoneRegex, "Valid Mobile Number Required"),

    state: z
        .object({
            value: z.any(),
            label: z.string(),
        })
        .nullable()
        .refine((v) => v !== null, {
            message: "State is required",
        }),

    regAddress: z.string().min(5, "Registration Address Required"),

    workingAddress: z.string().min(5, "Working Address Required"),

    conPer: z.string().min(2, "Contact Person Name Required"),

    conPerMailId: z.string().email("Valid Contact Person Email Required"),

    conPerContactNo: z
        .string()
        .regex(indianPhoneRegex, "Valid Contact Number Required"),

    bankName: z.string().optional().or(z.literal("")),

    brName: z.string().optional().or(z.literal("")),

    bankAcctNo: z.string().optional().or(z.literal("")),

    ifsCode: z.string().optional().or(z.literal("")),

    acctHolderName: z.string().optional().or(z.literal("")),

    signupEmail: z.string().email("Login Email Required"),

    signupPassword: z.string().min(1, "Password Required"),
});

/* =====================================================
   PASSWORD COMPONENT
===================================================== */

const PasswordInput = ({
    label,
    id,
    error,
    placeholder,
    disabled,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);


    return (
        <div className="state-ngo-input-group">
            <label htmlFor={id} className="state-ngo-label">
                {label}
            </label>

            <div className="state-ngo-password-wrapper">
                <input
                    id={id}
                    type={showPassword ? "text" : "password"}
                    className={`state-ngo-password-input ${error ? "state-ngo-error" : ""
                        }`}
                    placeholder={placeholder}
                    disabled={disabled}
                    {...props}
                />

                <button
                    type="button"
                    className="state-ngo-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
            </div>

            {error && (
                <p className="state-ngo-error-text">{error.message}</p>
            )}
        </div>
    );
};

/* =====================================================
   MAIN COMPONENT
===================================================== */

const StateNGOForm = ({ onSuccess }) => {
    const [dbStates, setDbStates] = useState([]);
    const [refreshTable, setRefreshTable] = useState(0);

    const [regCertPdf, setRegCertPdf] = useState(null);
    const [panPdf, setPanPdf] = useState(null);
    const [darpanPdf, setDarpanPdf] = useState(null);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(stateNgoSchema),
        mode: "onChange",

        defaultValues: {
            acctName: "",
            regDate: "",
            regNo: "",
            panNo: "",
            darpanId: "",
            mailId: "",
            contactNo: "",
            state: null,
            regAddress: "",
            workingAddress: "",
            conPer: "",
            conPerMailId: "",
            conPerContactNo: "",
            bankName: "",
            brName: "",
            bankAcctNo: "",
            ifsCode: "",
            acctHolderName: "",
            signupEmail: "",
            signupPassword: "",
        },
    });

    /* =====================================================
       LOAD STATES
    ===================================================== */

    useEffect(() => {
        fetch(`${API_BASE_URL}/states`)
            .then((res) => res.json())
            .then((data) =>
                setDbStates(
                    data.map((s) => ({
                        value: s.StateId,
                        label: s.StateName,
                    }))
                )
            )
            .catch(console.error);
    }, []);

    /* =====================================================
       PDF UPLOAD
    ===================================================== */

    const handlePdfUpload = async (event, setPdfState) => {
        const file = event.target.files[0];

        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.warning("Only PDF files are allowed");
            return;
        }

        if (file.size > 5000000) {
            toast.warning("PDF must be under 5 MB");
            return;
        }

        try {
            const base64 = await fileToBase64(file);
            setPdfState(base64);
        } catch {
            toast.error("Unable to read PDF");
        }
    };

    /* =====================================================
       RESET
    ===================================================== */

    const handleCancel = () => {
        reset();

        setRegCertPdf(null);
        setPanPdf(null);
        setDarpanPdf(null);
    };
    /* =====================================================
       SUBMIT
    ===================================================== */

    const onSubmitStateNgo = async (data) => {
        if (!regCertPdf || !panPdf) {
            toast.error(
                "Registration Certificate PDF and PAN PDF are mandatory."
            );
            return;
        }

        const checks = [
            {
                table: "state_ngo_reg",
                column: "SignupEmail",
                value: data.signupEmail,
                label: "Login Email",
            },
            {
                table: "state_ngo_reg",
                column: "MailId",
                value: data.mailId,
                label: "NGO Email",
            },
        ];

        if (!(await validateUniqueFields(checks))) return;

        const loggedInUser = getSafeUser();

        const currentUserId = loggedInUser
            ? loggedInUser.UserSignUpId || loggedInUser.id
            : null;

        const payload = {
            AcctName: data.acctName,
            RegDate: data.regDate,
            RegNo: data.regNo,
            PanNo: data.panNo,
            DarpanId: data.darpanId,

            MailId: data.mailId,
            ContactNo: data.contactNo,

            StateName: data.state?.label || "",

            RegAddress: data.regAddress,
            WorkingAddress: data.workingAddress,

            ConPer: data.conPer,
            ConPerMailId: data.conPerMailId,
            ConPerContactNo: data.conPerContactNo,

            BankName: data.bankName,
            BrName: data.brName,
            BankAcctNo: data.bankAcctNo,
            IFSCode: data.ifsCode,
            AcctHolderName: data.acctHolderName,

            SignupEmail: data.signupEmail,
            SignupPassword: data.signupPassword,

            RecCertificate: regCertPdf,
            PanPic: panPdf,
            DarpanPic: darpanPdf,

            CreatedByAuthRegId: currentUserId,
            IsActive: 1,
        };

        try {
            toast.loading("Saving State NGO...", {
                toastId: "stateNgoSaving",
            });

            const response = await fetch(
                `${API_BASE_URL}/statengo`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            toast.dismiss("stateNgoSaving");

            if (response.ok) {
                toast.success("State NGO Saved Successfully");

                handleCancel();
                setRefreshTable((prev) => prev + 1);

                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error("Failed to Save State NGO");
            }
        } catch (error) {
            toast.dismiss("stateNgoSaving");
            toast.error("Server Connection Failed");
        }
    };

    const onError = () => {
        toast.error(
            "Please fill all required fields properly."
        );
    };

    /* =====================================================
       JSX
    ===================================================== */

    return (
        <div className="state-ngo-card">
            <div className="state-ngo-header">
                <h5>State NGO Registration</h5>
            </div>

            <div className="state-ngo-body">
                <form
                    autoComplete="off"
                    onSubmit={handleSubmit(
                        onSubmitStateNgo,
                        onError
                    )}
                >
                    {/* NGO DETAILS */}

                    <h6 className="state-ngo-section">
                        NGO Details
                    </h6>

                    <div className="state-ngo-grid">

                        <Controller
                            name="acctName"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    label="State NGO Name *"
                                    error={errors.acctName}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="regDate"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    type="date"
                                    label="Registration Date *"
                                    error={errors.regDate}
                                    max={
                                        new Date()
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="regNo"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    label="Registration Number *"
                                    error={errors.regNo}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="panNo"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    label="PAN Number *"
                                    error={errors.panNo}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="darpanId"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    label="NGO Darpan ID"
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="mailId"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    label="NGO Email *"
                                    error={errors.mailId}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="contactNo"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    label="Mobile Number *"
                                    error={errors.contactNo}
                                    {...field}
                                />
                            )}
                        />

                        <div className="state-ngo-input-group">
                            <label className="state-ngo-label">
                                State *
                            </label>

                            <Controller
                                name="state"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={dbStates}
                                        styles={styles.selectStyles(!!errors.state)}
                                    />
                                )}
                            />

                            {errors.state && (
                                <p className="state-ngo-error-text">
                                    {errors.state.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ADDRESS */}

                    <h6 className="state-ngo-section">
                        Address Details
                    </h6>

                    <div className="state-ngo-grid">

                        <Controller
                            name="regAddress"
                            control={control}
                            render={({ field }) => (
                                <div className="state-ngo-input-group state-ngo-full">
                                    <label className="state-ngo-label">
                                        Registration Address *
                                    </label>

                                    <textarea
                                        className="state-ngo-textarea"
                                        {...field}
                                    />

                                    {errors.regAddress && (
                                        <p className="state-ngo-error-text">
                                            {errors.regAddress.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        <Controller
                            name="workingAddress"
                            control={control}
                            render={({ field }) => (
                                <div className="state-ngo-input-group state-ngo-full">
                                    <label className="state-ngo-label">
                                        Working Address *
                                    </label>

                                    <textarea
                                        className="state-ngo-textarea"
                                        {...field}
                                    />

                                    {errors.workingAddress && (
                                        <p className="state-ngo-error-text">
                                            {errors.workingAddress.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    {/* CONTACT PERSON */}

                    <h6 className="state-ngo-section">
                        Contact Person
                    </h6>

                    <div className="state-ngo-grid">

                        <Controller
                            name="conPer"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    label="Contact Person Name *"
                                    error={errors.conPer}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="conPerMailId"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    label="Contact Person Email *"
                                    error={errors.conPerMailId}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="conPerContactNo"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    label="Contact Person Mobile *"
                                    error={errors.conPerContactNo}
                                    {...field}
                                />
                            )}
                        />
                    </div>

                    {/* BANK */}

                    <h6 className="state-ngo-section">
                        Banking Details
                    </h6>

                    <div className="state-ngo-grid">

                        <Controller
                            name="bankName"
                            control={control}
                            render={({ field }) => (
                                <FormInput label="Bank Name" {...field} />
                            )}
                        />

                        <Controller
                            name="brName"
                            control={control}
                            render={({ field }) => (
                                <FormInput label="Branch Name" {...field} />
                            )}
                        />

                        <Controller
                            name="bankAcctNo"
                            control={control}
                            render={({ field }) => (
                                <FormInput label="Account Number" {...field} />
                            )}
                        />

                        <Controller
                            name="ifsCode"
                            control={control}
                            render={({ field }) => (
                                <FormInput label="IFS Code" {...field} />
                            )}
                        />

                        <Controller
                            name="acctHolderName"
                            control={control}
                            render={({ field }) => (
                                <FormInput label="Account Holder Name" {...field} />
                            )}
                        />
                    </div>

                    {/* LOGIN */}

                    <h6 className="state-ngo-section">
                        Login Details
                    </h6>

                    <div className="state-ngo-grid">

                        <Controller
                            name="signupEmail"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    label="Login Email *"
                                    error={errors.signupEmail}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="signupPassword"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    label="Password *"
                                    error={errors.signupPassword}
                                    {...field}
                                />
                            )}
                        />
                    </div>

                    {/* DOCUMENTS */}

                    <h6 className="state-ngo-section">
                        Documents
                    </h6>

                    <div className="state-ngo-grid">

                        <div className="state-ngo-input-group">
                            <label className="state-ngo-label">
                                Registration Certificate PDF *
                            </label>

                            <input
                                type="file"
                                accept="application/pdf"
                                className="state-ngo-file-input"
                                onChange={(e) =>
                                    handlePdfUpload(
                                        e,
                                        setRegCertPdf
                                    )
                                }
                            />
                        </div>

                        <div className="state-ngo-input-group">
                            <label className="state-ngo-label">
                                PAN PDF *
                            </label>

                            <input
                                type="file"
                                accept="application/pdf"
                                className="state-ngo-file-input"
                                onChange={(e) =>
                                    handlePdfUpload(
                                        e,
                                        setPanPdf
                                    )
                                }
                            />
                        </div>

                        <div className="state-ngo-input-group">
                            <label className="state-ngo-label">
                                Darpan PDF
                            </label>

                            <input
                                type="file"
                                accept="application/pdf"
                                className="state-ngo-file-input"
                                onChange={(e) =>
                                    handlePdfUpload(
                                        e,
                                        setDarpanPdf
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="state-ngo-actions">


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
            <StateNGOTable
                refreshTrigger={refreshTable}
            />
        </div>

    );
};

export default StateNGOForm;