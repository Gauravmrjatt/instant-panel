import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import { alpha, styled } from "@mui/material/styles";
import { Button, Input } from "@nextui-org/react";
import Script from "next/script";
import MyNav from "../../components/Nav";
import Header from "../../components/Header";
import Head from "next/head";
import { previewData } from "next/dist/client/components/headers";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

export default function CustomAmount() {
  const [alignment, setAlignment] = useState("instant");
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const loading = open && options.length === 0;
  const [open2, setOpen2] = useState(false);
  const [options2, setOptions2] = useState([]);
  const loading2 = open2 && options2.length === 0;
  const [customDetails, setCustomDetails] = useState({
    name: "",
    camp: "",
    event: "",
    number: "",
    referAmount: "",
    userAmount: "",
    referComment: "",
    userComment: "",
    referPayment: alignment,
  });
  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      if (active) {
        try {
          const { data } = await axios.get("/get/campaign");
          setOptions(data.data);
        } catch (error) {
          console.error(error);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/assets/js/main.js";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const CssTextField = styled(TextField)({
    "& label.Mui-focused": {
      color: "#A0AAB4",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#8a2bdf",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#E0E3E7",
        borderRadius: "10px",
        border: "2px solid #E0E3E7",
      },
      "&:hover fieldset": {
        borderColor: "#B2BAC2",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#6F7E8C",
      },
    },
  });
  const addCustom = () => {
    return new Promise((resolve, reject) => {
      axios
        .post("/api/v1/custom", { ...customDetails })
        .then((response) => {
          const data = response.data;
          if (data.status === true) {
            return resolve(data.msg);
          } else {
            return reject(data.msg);
          }
        })
        .catch((error) => {
          return reject('This is an error "' + error + '"!');
        });
    });
  };
  const handleChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
      setCustomDetails((prev) => ({
        ...prev,
        referPayment: newAlignment,
      }));
    }
  };

  const submitCustom = (e) => {
    e.preventDefault();
    if (customDetails.name == "") {
      return toast.error("select a sampaign");
    } else if (customDetails.event == "") {
      return toast.error("select a event");
    } else if (customDetails.name == "") {
      return toast.error("select a event");
    } else if (customDetails.number == "") {
      return toast.error("enter number");
    } else if (customDetails.referAmount == "") {
      return toast.error("enter refer amount");
    }
    toast.promise(addCustom(), {
      loading: "Saving Details....",
      success: "Successfully Saved!",
      error: (error) => error,
    });
  };
  return (
    <>
      <Head>
        <title>Custom Amount</title>
      </Head>
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          <MyNav />
          <div className="layout-page">
            <Header />
            <div className="content-wrapper">
              <div className="container-xxl flex-grow-1 container-p-y">
                <h4 className="fw-bold py-3 mb-4">
                  <span className="text-muted fw-light">Dashboard /</span>{" "}
                  Custom Amount
                </h4>
                <div className="row">
                  <div className="col-md-12">
                    <div className="card mb-4">
                      <h5 className="card-header">Custom Amount</h5>
                      <hr className="my-0" />
                      <div className="card-body">
                        <form id="formAccountSettings">
                          <div style={{ marginBottom: "30px" }} className="row">
                            <div className="mb-3 col-md-6">
                              <label
                                htmlFor="postback-url"
                                className="form-label"
                              >
                                SELECT CAMPAIGN
                              </label>
                              <Autocomplete
                                id="asynchronous-camp"
                                open={open}
                                onOpen={() => setOpen(true)}
                                onClose={() => setOpen(false)}
                                onChange={(event, newValue) => {
                                  if (newValue && newValue.events) {
                                    setOptions2(newValue.events);
                                    setCustomDetails((prev) => ({
                                      ...prev,
                                      camp: newValue._id,
                                      name: newValue.name,
                                      event: "",
                                    }));
                                  }
                                }}
                                isOptionEqualToValue={(option, value) =>
                                  option.name === value.name
                                }
                                getOptionLabel={(option) => option.name}
                                options={options}
                                loading={loading}
                                renderInput={(params) => (
                                  <CssTextField
                                    sx={{ marginTop: "10px" }}
                                    color="secondary"
                                    {...params}
                                    value={customDetails.name}
                                    label="Campaign Name"
                                    InputProps={{
                                      ...params.InputProps,
                                      endAdornment: (
                                        <>
                                          {loading ? (
                                            <CircularProgress
                                              color="inherit"
                                              size={20}
                                            />
                                          ) : null}
                                          {params.InputProps.endAdornment}
                                        </>
                                      ),
                                    }}
                                  />
                                )}
                              />
                            </div>
                            <div className="mb-3 col-md-6">
                              <label
                                htmlFor="postback-key"
                                className="form-label"
                              >
                                SELECT EVENT
                              </label>
                              <Autocomplete
                                id="asynchronous-event"
                                open={open2}
                                onOpen={() => setOpen2(true)}
                                onClose={() => setOpen2(false)}
                                onChange={(event, newValue) => {
                                  setCustomDetails((prev) => ({
                                    ...prev,
                                    event: newValue.name,
                                  }));
                                }}
                                isOptionEqualToValue={(option, value) =>
                                  option.name === value.name
                                }
                                getOptionLabel={(option) => option.name}
                                options={options2}
                                loading={loading2}
                                renderInput={(params) => (
                                  <>
                                    <CssTextField
                                      sx={{ marginTop: "10px" }}
                                      color="secondary"
                                      {...params}
                                      value={customDetails.event}
                                      label="Event"
                                      InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                          <>
                                            {loading ? (
                                              <CircularProgress
                                                color="inherit"
                                                size={20}
                                              />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                          </>
                                        ),
                                      }}
                                    />
                                  </>
                                )}
                              />
                            </div>
                          </div>
                          <label htmlFor="postback-url" className="form-label">
                            ENTER REFERER UPI
                          </label>
                          <Input
                            aria-labelledby="UPI"
                            clearable
                            bordered
                            fullWidth
                            color="primary"
                            type="text"
                            size="lg"
                            placeholder="UPI"
                            onChange={(e) => {
                              var value = e.target.value;
                              setCustomDetails((prev) => ({
                                ...prev,
                                number: value,
                              }));
                            }}
                            max={10}
                            min={10}
                            contentLeft={<i class="bx bxs-user-circle"></i>}
                          />
                          <div style={{ marginTop: "50px" }} className="row">
                            <div className="mb-3 col-md-6">
                              <label
                                htmlFor="postback-url"
                                className="form-label"
                              >
                                REFER AMOUNT
                              </label>
                              <Input
                                clearable
                                bordered
                                aria-labelledby="Refer"
                                fullWidth
                                color="primary"
                                type="number"
                                size="lg"
                                onChange={(e) => {
                                  var value = e.target.value;
                                  setCustomDetails((prev) => ({
                                    ...prev,
                                    referAmount: value,
                                  }));
                                }}
                                placeholder="Amount for Per Refer"
                                contentLeft={<i class="bx bx-rupee"></i>}
                              />
                            </div>
                            <div className="mb-3 col-md-6">
                              <label
                                htmlFor="postback-key"
                                className="form-label"
                              >
                                USER AMOUNT (optional)
                              </label>
                              <Input
                                aria-labelledby="User"
                                clearable
                                bordered
                                type="number"
                                fullWidth
                                color="primary"
                                size="lg"
                                onChange={(e) => {
                                  var value = e.target.value;
                                  setCustomDetails((prev) => ({
                                    ...prev,
                                    userAmount: value,
                                  }));
                                }}
                                placeholder="User Amount to Event Complete (optional)"
                                contentLeft={<i class="bx bx-rupee"></i>}
                              />
                            </div>
                          </div>
                          <div style={{ marginTop: "50px" }} className="row">
                            <div className="mb-3 col-md-6">
                              <label
                                htmlFor="postback-url"
                                className="form-label"
                              >
                                REFER COMMENT (optional)
                              </label>
                              <Input
                                clearable
                                bordered
                                aria-labelledby="Refer"
                                fullWidth
                                color="primary"
                                type="text"
                                size="lg"
                                onChange={(e) => {
                                  var value = e.target.value;
                                  setCustomDetails((prev) => ({
                                    ...prev,
                                    referComment: value,
                                  }));
                                }}
                                placeholder="Custom Comment for refer (optional)"
                                contentLeft={<i class="bx bxs-comment"></i>}
                              />
                            </div>
                            <div className="mb-3 col-md-6">
                              <label
                                htmlFor="postback-key"
                                className="form-label"
                              >
                                USER COMMENT (optional)
                              </label>
                              <Input
                                aria-labelledby="Usercomment"
                                clearable
                                bordered
                                type="text"
                                fullWidth
                                color="primary"
                                size="lg"
                                onChange={(e) => {
                                  var value = e.target.value;
                                  setCustomDetails((prev) => ({
                                    ...prev,
                                    userComment: value,
                                  }));
                                }}
                                placeholder="Custom comment for user (optional)"
                                contentLeft={
                                  <i class="bx bxs-comment-edit"></i>
                                }
                              />
                            </div>
                          </div>
                          <label htmlFor="postback-key" className="form-label">
                            Refer Payment
                          </label>{" "}
                          <br />
                          <ToggleButtonGroup
                            color="primary"
                            value={alignment}
                            exclusive
                            onChange={handleChange}
                            aria-label="Refer Payment"
                            className="mb-3"
                          >
                            <ToggleButton value="instant">Instant</ToggleButton>
                            <ToggleButton value="pending">Pending</ToggleButton>
                          </ToggleButtonGroup>
                          <div className="mt-2">
                            <button
                              onClick={submitCustom}
                              className="btn btn-primary me-2"
                            >
                              Add
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-backdrop fade"></div>
            </div>
          </div>
        </div>
        <div className="layout-overlay layout-menu-toggle"></div>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
      <Script src="/assets/js/dashboards-analytics.js"></Script>
    </>
  );
}
