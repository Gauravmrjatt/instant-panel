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
import { Button, Loading } from "@nextui-org/react";
export default function PayToUser() {
    const [pay, setPay] = useState({
        amount: '',
        user: '',
        comment: '',
        loading: false,
        response: ''
    });
    const router = useRouter()
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/js/main.js';
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    const handelChanges = (event) => {
        setPay(prev => ({ ...prev, [event.target.name]: event.target.value }))
    };
    const payUserHanled = (e) => {
        toast.promise(
            payUser(),
            {
                loading: 'Paying...',
                success: 'Successfully',
                error: (error) => error
            }
        );
    }

    const payUser = () => {
        return new Promise((resolve, reject) => {
            if (!pay.user) {
                return reject("Invalid number")
            }
            if (pay.user.length != 10) {
                return reject("Number length should be 10 digits")
            }
            if (!pay.amount) {
                return reject("Enter amount to pay")
            }
            setPay({
                amount: '',
                user: '',
                comment: '',
                loading: true,
                response: ''
            })
            axios.post('/pay/user', { pay })
                .then((response) => {
                    const data = response.data;
                    if (data.status === true) {
                        setPay(prev => ({ ...prev, loading: false, response: data.data }))
                        return resolve(data.msg)
                    } else {
                        setPay(prev => ({ ...prev, loading: false }))
                        return reject(data.msg)
                    }
                })
                .catch((error) => {
                    setPay(prev => ({ ...prev, loading: false }))
                    return reject('This is an error "' + error + '"!')
                });
        });
    }
    return (
        <>
            <Head>
                <title>Pay Users</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">

                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Dashboard /</span> Pay Users</h4>
                                <div className="row">
                                    <div className="col-xl">
                                        <div className="card mb-5">
                                            <h5 className="card-header">Pay Users</h5>
                                            <hr className="my-0" />
                                            <div style={{ textAlign: "right", marginRight: "25px" }} className="float-end mt-3 mr-1">
                                                <div className="btn-group" id="dropdown-icon-demo">
                                                    <button onClick={() => router.push("geteway-settings")} type="button" className="btn rounded-pill btn-outline-primary" fdprocessedid="dtrhg">
                                                        Gateway Settings   &nbsp; <span className="tf-icons bx bx-cog"></span>
                                                    </button>

                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ maxWidth: "500px", marginInline: "auto" }} className="mb-4">
                                                    <div className="card-body">
                                                        <pre>
                                                            <code>
                                                                {JSON.stringify(pay.response)}
                                                            </code>
                                                        </pre>
                                                        <div className="form-floating">
                                                            <input type='number' onChange={handelChanges} name='user' value={pay.user} className="form-control" id="number" placeholder="0000000000" aria-describedby="floatingInputHelp" fdprocessedid="badxh9" />
                                                            <label htmlFor="number">Number</label>
                                                            <div id="numbere" className="form-text">
                                                                Enter a 10 digits number to pay
                                                            </div>
                                                        </div>
                                                        <div className="form-floating">
                                                            <input type='number' onChange={handelChanges} name='amount' value={pay.amount} className="form-control" id="amount" placeholder="1" aria-describedby="floatingInputHelp" fdprocessedid="badxh9" />
                                                            <label htmlFor="amount">Amount</label>
                                                            <div id="amountt" className="form-text">
                                                                Enter amount to pay
                                                            </div>
                                                        </div>
                                                        <div className="form-floating">
                                                            <input type='text' onChange={handelChanges} name='comment' value={pay.comment} className="form-control" id="comment" placeholder="camp payment" aria-describedby="floatingInput" fdprocessedid="badxh9" />
                                                            <label htmlFor="comment">Comment</label>
                                                            <div id="commentt" className="form-text">
                                                                Enter payment comment
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: "right" }}>
                                                            <Button disabled={pay.loading} onPress={(e) => payUserHanled(e)} style={{ marginBlock: "20px", marginLeft: "auto" }} color="success" auto >
                                                                {pay.loading ? (<Loading type="points" color="currentColor" size="sm" />) : ("Pay Now ")}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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
                                                        Enter Number, Amount , Comment to pay
                                                    </li>
                                                    <li>
                                                        Click Pay
                                                    </li>
                                                    <li>
                                                        wait for request to finish
                                                    </li>
                                                    <li>You will payment response in JSON formate</li>
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

