import Script from 'next/script'
import MyNav from '../../components/Nav'
import Header from '../../components/Header'
import Head from 'next/head'
import { useEffect, useState, } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link'
import { Progress } from "@nextui-org/react";
import Lottie from "lottie-react";
import Success from '../../animation/success.json'
import Error from '../../animation/error.json'
import Countdown from "react-countdown";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
function Complete() {
    return (<>
        hi
    </>)
}

export default function AddCampaigns() {
    const [data, setData] = useState({
        status: true,
        user: {
            premium: false,
            createdAt: "Loading...",
            premiumExpireDate: "Loading..."
        },
        PLAN: "Loading Plan...",
        PURCHASED_AT: "Loading...",
        EXPIRE_AT: "Loading...",
        PURCHASED_AMOUNT: "Loading..."
    })
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/js/main.js';
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    useEffect(() => {
        axios.get('/get/billing').then(res => {
            setData({ ...res.data })
        })
    }, [])
    return (
        <>
            <Head>
                <title>Billing</title>
            </Head>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, backdropFilter: "blur(20px)" }}
                open={true}
            // onClick={handleClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <div className="layout-wrapper layout-content-navbar">

                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4"><Link href='/dashboard' className="text-muted fw-light">Dashboard /</Link> Billing</h4>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="card mb-4">
                                            <h5 className="card-header">Billing  <div className="countdown">
                                                <Countdown date={Date.now() + 500000}>
                                                    <Complete />
                                                </Countdown>
                                            </div></h5>
                                            <hr className="my-0" />
                                            <div className="card-body">
                                                {(data.user.premium === true) ? (<>
                                                    <Lottie style={{ marginTop: "-70px", maxWidth: "300px", display: "block", textAlign: "center", marginInline: "auto" }} animationData={Success} loop={false} />
                                                </>) : (<>
                                                    <Lottie style={{ maxWidth: "170px", display: "block", textAlign: "center", marginInline: "auto" }} animationData={Error} loop={false} />
                                                </>)}
                                                <div className="row">
                                                    <div className="mb-3 col-md-6">
                                                        <label htmlFor="firstName" className="form-label">Plan</label>
                                                        <input className="form-control" value={data.PLAN} type="text" id="firstName" name="firstName" autoFocus readOnly />
                                                    </div>
                                                    <div className="mb-3 col-md-6">
                                                        <label className="form-label" htmlFor="phoneNumber">Purchased at</label>
                                                        <div className="input-group input-group-merge">
                                                            <input type="text" value={data.PURCHASED_AT} id="phoneNumber" name="phoneNumber" className="form-control" placeholder="9876543210" readOnly />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="mb-3 col-md-6">
                                                        <label htmlFor="firstName" className="form-label">Expire at</label>
                                                        <input className="form-control" value={data.EXPIRE_AT} type="text" id="firstName" name="firstName" autoFocus readOnly />
                                                    </div>
                                                    <div className="mb-3 col-md-6">
                                                        <label className="form-label" htmlFor="phoneNumber">PURCHASED AMOUNT</label>
                                                        <div className="input-group input-group-merge">
                                                            <input type="text" id="phoneNumber" value={data.PURCHASED_AMOUNT} name="phoneNumber" className="form-control" placeholder="9876543210" readOnly />
                                                        </div>
                                                    </div>
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
            </div >
            <Toaster
                position='top-center'
                reverseOrder={false}
            />
            <Script src="/assets/js/dashboards-analytics.js"></Script>

        </>
    )
}

