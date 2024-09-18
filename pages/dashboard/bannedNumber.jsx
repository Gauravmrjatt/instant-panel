import Script from 'next/script'
import MyNav from '../../components/Nav'
import Header from '../../components/Header'
import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';
import myDetails from '../myDetails.json' assert {type: 'json'}
import Table from '../../components/bannedTable'
export default function BennedUserNumbers() {
    const [number, setNumber] = useState();

    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/js/main.js';
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
   

    return (
        <>
            <Head>
                <title>Banned Upi</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">

                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Dashboard /</span> Banned Upi</h4>
                                <div className="row">
                                    <div className="col-xl">
                                        <div className="card mb-5">
                                            <h5 className="card-header">Banned Upi</h5>
                                            <hr className="my-0" />
                                            <Table />
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
                                                <ul>
                                                    <li>
                                                        click on delete icon or select to delete
                                                    </li>

                                                </ul>
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

