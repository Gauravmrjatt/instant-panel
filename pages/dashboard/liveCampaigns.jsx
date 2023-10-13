import Script from 'next/script'
import MyNav from '../../components/Nav'
import Header from '../../components/Header'
import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';
import Table from '../../components/LiveCampaigns'
import { Button } from "@nextui-org/react";
import { useRouter } from 'next/router'
import Link from 'next/link'
export default function AddCampaigns() {
    const router = useRouter()
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
                <title>Live Campaigns</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">

                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4"><Link href='/dashboard' className="text-muted fw-light">Dashboard /</Link> Live Campaigns</h4>
                                <Button onPress={() => router.push("campaigns")} rounded shadow icon={<i className='bx bx-plus-circle'></i>} color='secondary' css={{ display: "block", marginLeft: "auto", marginBottom: "20px" }}>Add Campaigns</Button>
                                <div className="row">
                                    <div className="col-md-12">

                                        <div className="card mb-4">
                                            <h5 className="card-header">Live Campaigns</h5>
                                            <hr className="my-0" />
                                            <Table />

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
                position='top-center'
                reverseOrder={false}
            />

            <Script src="/assets/js/dashboards-analytics.js"></Script>

        </>
    )
}

