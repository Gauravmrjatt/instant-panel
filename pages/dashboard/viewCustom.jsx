import Script from 'next/script'
import MyNav from '../../components/Nav'
import Header from '../../components/Header'
import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';
import Table from '../../components/ViewCustom'
import Link from 'next/link'

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
    const handleNumberdChange = (event) => {
        setNumber(event.target.value);
    };



    const fun = () => {
        return new Promise((resolve, reject) => {
            if (!number) {
                return reject("Invalid number")
            }
            if (number.length != 10) {
                return reject("Number length should be 10 digits")
            }
            axios.post('/ban/number', { number })
                .then((response) => {
                    const data = response.data;
                    if (data.status === true) {
                        return resolve(data.msg)
                    } else {
                        return reject(data.msg)
                    }
                })
                .catch((error) => {
                    return reject('This is an error "' + error + '"!')
                });
        })
    }
    const banNumber = (e) => {
        e.preventDefault();
        toast.promise(
            fun(),
            {
                loading: 'Changing Gateway Settings....',
                success: 'Successfully changed!',
                error: (error) => error
            }
        );
    }


    return (
        <>
            <Head>
                <title>View Custom</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">

                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4"><Link href="/dashboard" className="text-muted fw-light">Dashboard /</Link> View Custom</h4>
                                <div className="row">
                                    <div className="col-xl">
                                        <div className="card mb-5">
                                            <h5 className="card-header">View Custom</h5>
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
                position="bottom-right"
                reverseOrder={false}
            />
            <Script src="/assets/js/dashboards-analytics.js"></Script>

        </>
    )
}

