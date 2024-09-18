import Script from "next/script";
import MyNav from "../../components/Nav";
import Header from "../../components/Header";
import Head from "next/head";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Setting, Lock, Filter, InfoCircle } from "react-iconly";
import { Button, Switch } from "@nextui-org/react";
import { useRouter } from "next/router";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

export default function AddCampaigns() {
    const [loading, setLoading] = useState(true);
    const [user,setUser] = useState(null)
  useEffect(() => {
    axios
      .get("/get/billing")
        .then((result) => {
            setLoading(false)
            setUser(result.data)
            if (result.data.status === false) {
              
          }
      })
        .catch(error => {
          setLoading(false)
      });
  }, []);
  return (
    <>
      <Head>
        <title>Billing</title>
      </Head>

      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          <MyNav />
          <div className="layout-page">
            <Header />
          </div>
        </div>
        {loading ? (
          <>
            <Backdrop
              sx={{
                color: "#000",
                zIndex: 1000,
                position: "absolute",
                background: "rgb(255 255 255 / 50%)",
              }}
              open={true}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          </>
        ) : (
                      <>
       
                      </>
        )}
        <div className="layout-overlay layout-menu-toggle"></div>
      </div>

      <Script src="/assets/js/dashboards-analytics.js"></Script>
    </>
  );
}
