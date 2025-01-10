import Script from "next/script";
import MyNav from "../../../../components/Nav";
import Header from "../../../../components/Header";
import Head from "next/head";
import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Setting, Lock, Filter, InfoCircle, ShieldDone } from "react-iconly";
import { Button, Switch } from "@nextui-org/react";
import { useRouter } from "next/router";
import Chip from "@mui/material/Chip";
import copy from "copy-to-clipboard";
import AddEvent from "../../../../components/addCamp/addEvent";
import Link from "next/link";
import AddIP from "../../../../components/addCamp/addIp";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Button2 from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { trTR } from "@mui/x-data-grid";
import Divider from "@mui/material/Divider";

export default function AddCampaigns() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [isLoading2, setLoading2] = useState(true);
  const [report, setReport] = useState({
    leadsCount: 0,
    clicksCount: 0,
    totalAmount: 0,
    cr: 0,
  });
  const { id: ID } = router.query;
  const [switchs, setSwitchs] = useState({
    paytm: false,
    ip: false,
    same: false,
    crDelay: false,
    prevEvent: true,
    campStatus: false,
    userPending: false,
    referPending: false,
  });
  const [events, setEvents] = useState([]);
  const [ip, setIp] = useState([]);
  const [campaignInfo, setCampaignInfo] = useState({
    name: "",
    offerID: "",
    tracking: "",
    crDelay: "",
  });
  const [postBack, setPostBack] = useState({
    key: "",
    url: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCampaignInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const addPromise = () => {
    return new Promise((resolve, reject) => {
      const sendData = {
        _id: ID,
        data: {
          ...campaignInfo,
          ...switchs,
          events: [...new Set(events)],
          ips: [...new Set(ip)],
        },
      };
      axios
        .post("/update/campaign", sendData)
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
  function AddNewCamp() {
    toast.promise(addPromise(), {
      loading: "Updating Campaign...",
      success: <b>Campaing Successfully Saved!</b>,
      error: (error) => error,
    });
  }

  function handelSwith(e, type) {
    setSwitchs((prev) => ({
      ...prev,
      [type]: e.target.checked,
    }));
  }

  function saveIP(Ip) {
    const eventExists = ip.some((item) => item === Ip);
    if (eventExists) {
      return toast.error("IP already exists");
    }
    setIp((prev) => [...prev, Ip]);
  }

  function deleteEvents(event) {
    const updatedItems = events.filter((item) => item.name !== event.name);
    setEvents(updatedItems);
  }

  function deleteIP(event) {
    const updatedItems = ip.filter((item) => item !== event);
    setIp(updatedItems);
  }
  const saveEvents = (e) => {
    setEvents((lastEvents) => [...lastEvents, e]);
  };

  function copytext() {
    copy("{click_id}");
    toast.success("copied!");
  }
  const editEventData = (eventDatas, index) => {
    const newItems = [...events];
    newItems[index] = { ...eventDatas };
    setEvents(newItems);
  };
  function copyLink() {
    copy(
      domain +
        "/api/v1/click/" +
        ID +
        `?aff_click_id={user_number}&sub_aff_id={refer_number}&userIp={ip}&device={user_agent}&number={number}`
    );
    toast.success("copied!");
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/assets/js/main.js";
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  useEffect(() => {
    setDomain(window.location.protocol + "//" + window.location.host);
  }, []);
  useEffect(() => {
    getKey();
    async function getKey() {
      const data = await axios.get("/get/postback");
      setPostBack({
        url: data.data.url,
        key: data.data.key,
      });
      return () => {
        setPostBack({
          url: "",
          key: "",
        });
      };
    }
  }, []);

  useEffect(() => {
    if (ID) {
      async function getData() {
        try {
          const { data } = await axios.get("/get/campaign/" + ID);
          setEvents(data.data.events);
          setIp(data.data.ips);
          setCampaignInfo({
            name: data.data.name,
            offerID: data.data.offerID,
            tracking: data.data.tracking,
            delay: data.data.delay ?? "",
          });
          setSwitchs((prev) => ({
            ...prev,
            paytm: data.data.paytm,
            ip: data.data.ip,
            same: data.data.same,
            crDelay: data.data.crDelay ?? false,
            prevEvent: data.data.prevEvent ?? true,
            userPending: data.data.userPending ?? false,
            referPending: data.data.referPending ?? false,
            campStatus: data.data.campStatus ?? true,
          }));
          setLoading(false);
        } catch (error) {
          console.log(error);
        }
      }
      async function getReport() {
        try {
          const { data } = await axios.get("/get/new/reports/" + ID);
          console.log(ID);
          setReport({ ...data.data });
        } catch (error) {
          console.log(error);
        } finally {
          setLoading2(false);
        }
      }
      getData();
      getReport();
    }
  }, [ID]);

  const handelOnOff = (state) => {
    const campStatus = state.target.checked;
    if (campStatus === true) {
      toast.success("Campaign Resumed  click save to update");
    } else {
      toast.error("Campaign Paused click save to update");
    }
  };
  return (
    <>
      <Head>
        <title>Edit Campaign</title>
      </Head>

      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          <MyNav />
          <div className="layout-page">
            <Header />
            <div className="content-wrapper">
              <div className="container-xxl flex-grow-1 container-p-y">
                <h4 className="fw-bold py-3 mb-4">
                  <Link href="/dashboard" className="text-muted fw-light">
                    Dashboard /
                  </Link>{" "}
                  <Link
                    href="/dashboard/liveCampaigns"
                    className="text-muted fw-light"
                  >
                    Camp /
                  </Link>{" "}
                  Edit
                </h4>
                <Button
                  onPress={() => router.push("/dashboard/liveCampaigns")}
                  rounded
                  icon={<i className="bx bx-list-ol"></i>}
                  color="secondary"
                  css={{
                    display: "block",
                    marginLeft: "auto",
                    marginBottom: "20px",
                  }}
                >
                  Live Campaigns
                </Button>
                <div className="row">
                  <div class="col-xl">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="card mb-4">
                          <h5 className="card-header">
                            Edit Campaign{" "}
                            <Switch
                              checked={switchs.campStatus}
                              onChange={(e) => {
                                handelSwith(e, "campStatus");
                                handelOnOff(e);
                              }}
                              color="success"
                              shadow
                              iconOn={
                                <ShieldDone set="bold" primaryColor="#17c964" />
                              }
                              iconOff={<Lock set="bold" primaryColor="red" />}
                              css={{
                                position: "absolute",
                                right: "20px",
                                top: "20px",
                              }}
                            />
                          </h5>
                          <hr className="my-0" />
                          {isLoading ? (
                            <>
                              <LinearProgress
                                style={{
                                  position: "absolute",
                                  top: "65px",
                                  left: "0",
                                  right: "0",
                                }}
                              />
                            </>
                          ) : (
                            <></>
                          )}
                          <div className="card-body">
                            <Paper
                              variant="outlined"
                              sx={{ padding: "10px", marginBottom: "20px" }}
                            >
                              {domain + "/api/v1/click/" + ID ?? ""}
                              ?aff_click_id=
                              {"{user_number}"}&sub_aff_id={"{refer_number}"}
                              &userIp={"{ip}"}&device=
                              {"{user_agent}&number={number}"}
                              <span style={{ float: "right" }}>
                                {" "}
                                <IconButton
                                  onClick={() => copyLink()}
                                  aria-label="delete"
                                >
                                  <i className="bx bx-copy"></i>
                                </IconButton>
                              </span>
                            </Paper>
                            <div>
                              <Button2
                                onClick={() => router.push("/info/how-to-use")}
                                sx={{
                                  marginBottom: "20px",
                                  marginLeft: "auto",
                                  display: "block",
                                }}
                              >
                                How to use?
                              </Button2>
                            </div>
                            <div className="row">
                              {isLoading ? (
                                <>
                                  <Backdrop
                                    sx={{
                                      color: "#fff",
                                      zIndex: 1,
                                      position: "absolute",
                                      background: "rgb(255 255 255 / 50%)",
                                      top: "70px",
                                    }}
                                    open={true}
                                  >
                                    <CircularProgress color="inherit" />
                                  </Backdrop>
                                </>
                              ) : (
                                <></>
                              )}
                              <div className="mb-3 col-md-6">
                                <label htmlFor="name" className="form-label">
                                  Campaign Name
                                </label>
                                <input
                                  className="form-control"
                                  type="text"
                                  id="name"
                                  placeholder="Enter Campaign Name"
                                  name="name"
                                  autoFocus=""
                                  value={campaignInfo.name}
                                  onChange={handleChange}
                                />
                              </div>
                              <div className="mb-3 col-md-6">
                                <label htmlFor="offerid" className="form-label">
                                  Offer ID
                                </label>
                                <input
                                  className="form-control"
                                  type="number"
                                  placeholder="Enter Offer ID"
                                  id="offerid"
                                  name="offerID"
                                  value={campaignInfo.offerID}
                                  onChange={handleChange}
                                />
                              </div>
                              <label htmlFor="adadsd" className="form-label">
                                Tracking Url
                              </label>
                              <textarea
                                className="form-control"
                                id="adadsd"
                                rows="3"
                                placeholder="Tracking Url"
                                label="Tracking Url"
                                name="tracking"
                                onPaste={(e) => {
                                  handleChange(e);
                                }}
                                value={campaignInfo.tracking}
                                onChange={(e) => {
                                  handleChange(e);
                                }}
                              ></textarea>

                              <Chip
                                style={{
                                  marginLeft: "auto",
                                  maxWidth: "150px",
                                  marginTop: "20px",
                                }}
                                variant="outlined"
                                label="{click_id}"
                                deleteIcon={<i className="bx bx-copy"></i>}
                                onClick={copytext}
                              />
                              <AddEvent
                                postBack={postBack}
                                events={events}
                                onEventSave={saveEvents}
                                onDeleteEvent={deleteEvents}
                                onEvenEdit={(eventDatas, index) =>
                                  editEventData(eventDatas, index)
                                }
                              />
                              <div className="divider">
                                <div className="divider-text">
                                  <i className="bx bx-star"></i>
                                </div>
                              </div>
                            </div>
                            <AddIP
                              ip={ip}
                              onIPSave={saveIP}
                              ondeleteIP={deleteIP}
                            />
                            <hr />
                            <Button2
                              onClick={() =>
                                router.push("/dashboard/pending/" + ID)
                              }
                              sx={{
                                marginBottom: "20px",
                                marginLeft: "auto",
                                display: "block",
                              }}
                            >
                              Pending Payments?
                            </Button2>

                            {/* <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                    <Switch
                                                        shadow
                                                        checked={switchs.userPending}
                                                        size="md"
                                                        color='success'
                                                        onChange={(e) => handelSwith(e, "userPending")}
                                                        iconOn={<Lock set="bold" primaryColor="blueviolet" />}
                                                        iconOff={<i className='bx bx-infinite'></i>}
                                                    />
                                                    <small style={{ transform: " translateY(5px)" }}>Pending User CashBack</small>

                                                </div>
                                                <hr /> */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                              }}
                            >
                              <Switch
                                shadow
                                checked={switchs.referPending}
                                size="md"
                                onChange={(e) => handelSwith(e, "referPending")}
                                iconOn={
                                  <Lock set="bold" primaryColor="blueviolet" />
                                }
                                iconOff={<i className="bx bx-infinite"></i>}
                              />
                              <small style={{ transform: " translateY(5px)" }}>
                                Pending Refer CashBack
                              </small>
                            </div>
                            <hr />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                              }}
                            >
                              <Switch
                                shadow
                                checked={switchs.paytm}
                                size="md"
                                onChange={(e) => handelSwith(e, "paytm")}
                                iconOn={
                                  <Lock set="bold" primaryColor="blueviolet" />
                                }
                                iconOff={<i className="bx bx-infinite"></i>}
                              />
                              <small style={{ transform: " translateY(5px)" }}>
                                One Paytm One Payment
                              </small>
                            </div>
                            <hr />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                              }}
                            >
                              <Switch
                                shadow
                                checked={switchs.ip}
                                size="md"
                                onChange={(e) => handelSwith(e, "ip")}
                                iconOn={
                                  <Lock set="bold" primaryColor="blueviolet" />
                                }
                                iconOff={<i className="bx bx-infinite"></i>}
                                color="secondary"
                              />

                              <small style={{ transform: " translateY(5px)" }}>
                                One IP One Payment
                              </small>
                            </div>
                            <hr />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                              }}
                            >
                              <Switch
                                shadow
                                checked={switchs.prevEvent}
                                size="md"
                                onChange={(e) => handelSwith(e, "prevEvent")}
                                iconOn={
                                  <InfoCircle set="bold" primaryColor="red" />
                                }
                                iconOff={<i className="bx bx-infinite"></i>}
                                color="error"
                              />

                              <small style={{ transform: " translateY(5px)" }}>
                                Reject if Previous event not found
                              </small>
                            </div>
                            <hr />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                              }}
                            >
                              <Switch
                                shadow
                                checked={switchs.same}
                                size="md"
                                onChange={(e) => handelSwith(e, "same")}
                                iconOn={
                                  <Setting
                                    set="bulk"
                                    primaryColor="blueviolet"
                                  />
                                }
                                iconOff={<i className="bx bx-revision"></i>}
                                color="error"
                              />
                              <small style={{ transform: " translateY(5px)" }}>
                                Same Number Refer
                              </small>
                            </div>
                            <hr />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                              }}
                            >
                              <Switch
                                shadow
                                checked={switchs.crDelay}
                                size="md"
                                onChange={(e) => {
                                  handelSwith(e, "crDelay");
                                  setCampaignInfo((prevState) => ({
                                    ...prevState,
                                    delay: "",
                                  }));
                                }}
                                iconOn={
                                  <Filter
                                    set="bold"
                                    primaryColor="blueviolet"
                                  />
                                }
                                iconOff={<i className="bx bx-infinite"></i>}
                                color="warning"
                              />
                              <small style={{ transform: " translateY(5px)" }}>
                                Click to Conversion Delay
                              </small>
                            </div>
                            {switchs.crDelay && (
                              <div className="mb-3 mt-4">
                                <label htmlFor="name" className="form-label">
                                  Conversion Delay
                                </label>
                                <input
                                  className="form-control"
                                  type="number"
                                  id="name"
                                  placeholder="Enter time in Seconds"
                                  name="delay"
                                  autoFocus=""
                                  value={campaignInfo.delay}
                                  onChange={handleChange}
                                />
                              </div>
                            )}
                            <hr />
                            <div className="mt-2">
                              <button
                                style={{ float: "right" }}
                                onClick={() => AddNewCamp()}
                                className="btn btn-primary me-2"
                              >
                                Save Updates
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl">
                    <div className="card mb-4">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Campaign Reports</h5>
                      </div>
                      <hr className="my-0" />
                      <div className="card-body">
                        {isLoading2 ? (
                          <>
                            <LinearProgress
                              style={{
                                position: "absolute",
                                top: "65px",
                                left: "0",
                                right: "0",
                              }}
                            />
                          </>
                        ) : (
                          <></>
                        )}
                        <div style={{ marginBottom: "10px" }}>
                          Total Leads :{" "}
                          <span style={{ float: "right" }}>
                            <b>{report.leadsCount}</b>
                          </span>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                          Total Clicks :{" "}
                          <span style={{ float: "right" }}>
                            <b>{report.clicksCount}</b>
                          </span>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                          Total Payment :{" "}
                          <span style={{ float: "right" }}>
                            <b>₹{report.totalAmount}</b>
                          </span>
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                          CR :{" "}
                          <span style={{ float: "right" }}>
                            <b>{report.cr}</b>%
                          </span>
                        </div>

                        <div className="card-header d-flex justify-content-between align-items-center">
                          <Divider component="li" />
                          <h5 className="mb-0">Export</h5>
                          <Divider component="li" />
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                          <span>
                            <Button
                              onPress={() => {
                                router.push("/export/leads/" + ID);
                              }}
                              style={{ width: "100%" }}
                              color="primary"
                              variant="faded"
                            >
                              {" "}
                              Export Leads
                            </Button>
                          </span>
                        </div>
                        <div
                          style={{ marginBottom: "20px", marginTop: "20px" }}
                        >
                          <span>
                            <Button
                              onPress={() => {
                                router.push("/export/click/" + ID);
                              }}
                              style={{ width: "100%" }}
                              color="secondary"
                              variant="shadow"
                            >
                              {" "}
                              Export Clicks
                            </Button>
                          </span>
                        </div>
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
