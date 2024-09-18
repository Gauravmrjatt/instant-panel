import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import MyNav from '../../../../components/Nav'
import Header from '../../../../components/Header'
import Link from 'next/link'
import { Button, Switch, } from "@nextui-org/react";
import LinearProgress from '@mui/material/LinearProgress';
import toast, { Toaster } from 'react-hot-toast';
import Script from 'next/script'
import axios from "axios";


export default function Reports() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const { id: ID } = router.query;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/assets/js/main.js";
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

   useEffect(() => {
        if (ID) {
            async function getData() {
                try {
                  const { data } = await axios.get("/get/new/reports" + ID);
                 
                } catch (error) {
                    console.log(error);
              }
                finally {
                   setLoading(false)
              }
            }
            getData();
        }
   }, [ID]);
  
  return (
    <>
      <Head>
        <title>Campaign Reports</title>
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
                  Reports
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
                  <div className="col-md-12">
                    <div className="card mb-4">
                      <h5 className="card-header">
                        Campaign Reports{" "}
                     
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
                      <div className="card-body"></div>
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
