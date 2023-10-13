import Script from 'next/script'
import MyNav from '../../components/Nav'
import Header from '../../components/Header'
import { GatewayCustom, GatewayEa } from '../../components/GatewaySettings'
import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';
import myDetails from '../myDetails.json' assert {type: 'json'}
import Link from 'next/link'
import { Tooltip } from "@nextui-org/react";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import copy from 'copy-to-clipboard';
import Chip from '@mui/material/Chip';

export default function GatewaySettings() {
    const [GatewayType, setGatewayType] = useState("Loading");
    const [isLoading, setLoading] = useState(true);



    const [toShow, setToShow] = useState(<GatewayEa guid='' />);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/js/main.js';
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        getKey()
        async function getKey() {
            setLoading(true)
            const data = await axios.get("/get/gateway-settings")
            if (GatewayType == "Earning Area") {
                setToShow(<GatewayEa guid={data.data.guid} />)
            } else {
                setToShow(<GatewayCustom url={data.data.url} />)
            }
            setLoading(false)
        }
    }, [GatewayType])
    useEffect(() => {
        getKey()
        async function getKey() {
            setLoading(true)
            const data = await axios.get("/get/gateway-settings")
            setGatewayType(data.data.type)
        }
    }, [])
    function copytext(text) {
        try {
            copy(text)
            toast.success(<b>Copied!</b>)
        } catch (error) {

        }
    }


    return (
        <>
            <Head>
                <title>Gateway Settings</title>
            </Head>

            <div className="layout-wrapper layout-content-navbar">

                <div className="layout-container">
                    {isLoading ? (
                        <>
                            <Backdrop
                                sx={{ color: '#000', zIndex: 1000, position: 'absolute', background: 'rgb(255 255 255 / 50%)' }}
                                open={true}
                            >
                                <CircularProgress color="inherit" />
                            </Backdrop>
                        </>
                    ) : (<></>)}
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Dashboard /</span> Gateway Settings</h4>
                                <div className="row">
                                    <div className="col-xl">

                                        <div className="card mb-5">
                                            <h5 className="card-header">Gateway Settings <small className='float-end text-muted'> SELECT TYPE</small></h5>
                                            <hr className="my-0" />
                                            <div style={{ textAlign: "right", marginRight: "25px" }} className="float-end mt-3 mr-1">
                                                <div className="btn-group" id="dropdown-icon-demo">
                                                    <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown"
                                                        aria-expanded="false" fdprocessedid="ovyo0i">
                                                        <i className="bx bx-cog"></i> {GatewayType}
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li onClick={() => setGatewayType("Earning Area")}>
                                                            <a className="dropdown-item d-flex align-items-center"><i
                                                                className="bx bx-chevron-right scaleX-n1-rtl"></i>Earning Area</a>
                                                        </li>
                                                        <li onClick={() => setGatewayType("Custom")}>
                                                            <a className="dropdown-item d-flex align-items-center"><i
                                                                className="bx bx-chevron-right scaleX-n1-rtl"></i>Custom</a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            {toShow}
                                        </div>

                                    </div>
                                    <div className="col-xl">
                                        <div className="card mb-4">
                                            <div className="card-header d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">How to set?</h5>
                                                <small className="text-muted float-end"></small>
                                            </div>
                                            <hr />
                                            <div className="card-body">
                                                <p>Select your gateway type enter your details you all set</p>
                                                <p>  <Tooltip
                                                    content={"Yes, select custom gateway type"}
                                                    trigger="hover"
                                                    color="secondary"
                                                >
                                                    <p>
                                                        <b>Q: </b>can i use any type of gateway?
                                                    </p>

                                                </Tooltip></p>
                                                <p>  <Tooltip
                                                    content={"it will be easy to use and paytment status will be clear"}
                                                    trigger="hover"
                                                    color="secondary"
                                                >
                                                    <p>
                                                        <b>Q: </b>why to use Earningarea gateway
                                                    </p>

                                                </Tooltip></p>
                                            </div>
                                        </div>

                                        <div className="card accordion-item  mb-4">
                                            <h2 className="accordion-header" id="headingOne">
                                                <button type="button" className="accordion-button" data-bs-toggle="collapse" data-bs-target="#accordionOne" aria-expanded="true" aria-controls="accordionOne">
                                                    Earning Area
                                                </button>
                                            </h2>
                                            <div id="accordionOne" className="accordion-collapse collapse show" data-bs-parent="#accordionExample" >
                                                <hr />
                                                <div className="accordion-body">
                                                    <div className='mb-3'> Earning Area is set as default gateway but you can change it as per your need</div>
                                                    <div className='mb-2'>How to get GUID?</div>
                                                    <ul>
                                                        <li>   Go to <Link href="https://earningarea.in/Withdraw-api.php" >earningarea.in</Link>  and log in to your account.</li>
                                                        <li>       Click on the <span className="badge bg-label-primary">generate new guid</span> button.</li>
                                                        <li>      A new GUID will be generated for you. Copy this GUID.</li>
                                                        <li>      Go to your payment gateway settings and paste the GUID in the designated area.</li>
                                                        <li>    This will ensure easy and secure payments to your account.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card accordion-item">
                                            <h2 className="accordion-header" id="headingTwo">

                                                <button type="button" className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#accordionTwo" aria-expanded="false" aria-controls="accordionTwo">
                                                    Custom
                                                </button>
                                            </h2>
                                            <div id="accordionTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                                                <hr />
                                                <div className="accordion-body">
                                                    <p>  To use custom payout URL, please ensure that it includes the variables
                                                        <Chip style={{ margin: "2px" }} color="primary" icon={<i className='bx bx-copy' ></i>} label='{payout_number}' onClick={() => copytext(`{payout_number}`)} />,
                                                        <Chip style={{ margin: "2px" }} color="secondary" icon={<i className='bx bx-copy' ></i>} label='{payout_amount}' onClick={() => copytext(`{payout_amount}`)} />,
                                                        <Chip style={{ margin: "2px" }} color="success" icon={<i className='bx bx-copy' ></i>} label='{comment}' onClick={() => copytext(`{comment}`)} />, and
                                                        <Chip style={{ margin: "2px" }} color="warning" icon={<i className='bx bx-copy' ></i>} label='{order_id}' onClick={() => copytext(`{order_id}`)} />
                                                        optional in the same format. This will allow our system to process your payout requests correctly.
                                                    </p>
                                                    <p>
                                                        Eg :- https://fastxpay.co/payments/api/walletpay/?number=<span className="badge bg-label-primary">{"{"}payout_number{"}"}</span>&amount=<span className="badge bg-label-primary">{"{"}payout_amount{"}"}</span>&comment=<span className="badge bg-label-primary">{"{"}comment{"}"} </span>&guid={"{"}guid{"}"}&orderid=<span className="badge bg-label-primary">{"{"}order_id{"}"} </span>
                                                    </p>
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
            <Toaster
                position="bottom-right"
                reverseOrder={false}
            />
            <Script src="/assets/js/dashboards-analytics.js"></Script>

        </>
    )
}

