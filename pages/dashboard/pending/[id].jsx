import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import MyNav from '../../../components/Nav';
import Header from '../../../components/Header';
import Head from 'next/head';
import Link from 'next/link';
import List from '@/components/pendingPayments/List'
async function getInitialProps({ req, query }) {
    const res = await axios({
        url: `http://localhost:3000/get/pendingPayments/` + query.id,
        headers: req ? { cookie: req.headers.cookie } : undefined,
    });
    return { data: res.data, query };
}

PendingAmount.getInitialProps = getInitialProps;

export default function PendingAmount({ query, data }) {
    const [id, setid] = useState(query.id)
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
                <title>Pending Amount</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">
                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4">
                                    <Link href={'/dashboard'} className="text-muted fw-light">Dashboard /</Link> Pending Amount
                                </h4>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="card mb-4">
                                            <h5 className="card-header">Pending Amount</h5>
                                            <hr className="my-0" />
                                            <div className="card-body">
                                                <List Campid={{ id }} iist={{ ...data }} />
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
