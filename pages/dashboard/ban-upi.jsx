import Script from 'next/script'
import MyNav from '../../components/Nav'
import Header from '../../components/Header'
import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';
import myDetails from '../myDetails.json' assert {type: 'json'}
import Link from 'next/link'
import { Router, useRouter } from 'next/router'

export default function BanUserNumber() {
    const [number, setNumber] = useState();
    const router = useRouter()
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
                loading: 'saving....',
                success: 'Successfully saved!',
                error: (error) => error
            }
        );
    }


    return (
        <>
            <Head>
                <title>Ban Upi</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">

                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Dashboard /</span> Ban Upi</h4>
                                <div className="row">
                                    <div className="col-xl">
                                        <div className="card mb-5">
                                            <h5 className="card-header">Ban Upi</h5>
                                            <hr className="my-0" />
                                            <div style={{ textAlign: "right", marginRight: "25px" }} className="float-end mt-3 mr-1">
                                                <div className="btn-group" id="dropdown-icon-demo">
                                                    <button onClick={() => router.push("bannedNumber")} type="button" className="btn rounded-pill btn-outline-primary" fdprocessedid="dtrhg">
                                                        View banned   &nbsp; <span className="tf-icons bx bx-list-ul"></span>
                                                    </button>

                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ maxWidth: "500px", marginInline: "auto" }} className="mb-4">
                                                    <h5 className="card-header">Upi</h5>
                                                    <div className="card-body">
                                                        <div className="form-floating">
                                                            <input type='text' onChange={handleNumberdChange} value={number} className="form-control" id="floatingInput" placeholder="https://earningarea.in" aria-describedby="floatingInputHelp" fdprocessedid="badxh9" />
                                                            <label htmlFor="floatingInput">Upi</label>
                                                            <div id="floatingInputHelp" className="form-text">
                                                                Enter UPI to ban
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: "right" }}>
                                                            <button type="button" onClick={banNumber} className="btn rounded-pill btn-danger mt-3" >Ban</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl">
                                        <div className="card mb-4">
                                            <div className="card-header d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">How to Ban?</h5>
                                                <small className="text-muted float-end"></small>
                                            </div>
                                            <hr />
                                            <div className="card-body">
                                                <ul>
                                                    <li>
                                                        Enter upi to ban
                                                    </li>
                                                    <li>
                                                        click ban
                                                    </li>
                                                    <li>
                                                        Upi will not be able to get payment
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

