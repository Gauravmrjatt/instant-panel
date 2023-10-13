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
import Results from '../../components/clickIdList/SearchResult'
export default function Clicks() {
    const [rows, setRows] = useState([])
    const [pay, setPay] = useState({
        user: '',
        loading: false,
        paying: false,
        value: '',
        isPaying: false,
        button: false,
    });
    const [clickId, setClickID] = useState([]);
    const router = useRouter()
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/js/main.js';
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const payUserHanled = (e) => {
        if (clickId.length == 0) {
            toast.error("Enter a Click Id")
            return
        }
        setPay(prev => ({
            ...prev,
            loading: true,
        }))
        axios.post("/get/click/search", { data: clickId }).then((res) => {
            setPay(prev => ({
                ...prev,
                paying: true,
            }))
            setRows(res.data.clickData.map((row) => ({ ...row, id: row._id })));
        }).catch((error) => {
            // toast.error(error)
        })
    }

    function explode(str, delimiters) {
        var ready = str;
        for (var i = 0; i < delimiters.length; i++) {
            ready = ready.split(delimiters[i]).join(delimiters[0]);
        }
        var launch = ready.split(delimiters[0]);
        var uniqueArray = launch.filter(function (value, index, self) {
            return value !== "" && self.indexOf(value) === index;
        });
        return uniqueArray;
    }
    const ids = useRef()
    function updateAll() {
        var exploded = explode(ids.current.value, [",", ".", "|", ":", "\r\n", "\n"]);
        setClickID(exploded)
        setPay(prev => ({
            ...prev,
            value: ids.current.value
        }))
    }
    function goBack() {
        setPay(prev => ({
            ...prev,
            paying: false,
            loading: false
        }))

    }
    const isDisabled = useRef(false)
    return (
        <>
            <Head>
                <title>Click Details</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">

                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4"><Link href="/dashboard"><span className="text-muted fw-light">Dashboard /</span></Link> Click Details</h4>
                                {pay.paying ? (<>
                                    <Results onBack={goBack} rows={rows} />
                                </>) : (<>
                                    <div className="row">
                                        <div className="col-xl">
                                            <div className="card mb-5">
                                                <h5 className="card-header">Click Details</h5>
                                                <hr className="my-0" />
                                                <div>
                                                    <div style={{ maxWidth: "500px", marginInline: "auto" }} className="mb-4">
                                                        <div className="card-body">
                                                            <pre>
                                                            </pre>
                                                            <div style={{ marginTop: "20px" }}>
                                                                <label for="exampleFormControlTextarea1" className="form-label">Click ID </label>
                                                                <textarea onPaste={updateAll} defaultValue={pay.value} ref={ids} onChange={updateAll} className="form-control" id="exampleFormControlTextarea1" rows='5'
                                                                ></textarea>
                                                            </div>
                                                            <div style={{ margin: '10px', textAlign: 'end' }}>
                                                                <small>Total ClickId : <b>{clickId.length}</b></small>
                                                            </div>
                                                            <div style={{ textAlign: "right" }}>
                                                                <Button disabled={pay.loading} onPress={(e) => payUserHanled(e)} style={{ marginBlock: "20px", marginLeft: "auto" }} color="success" auto >
                                                                    {pay.loading ? (<Loading type="points" color="currentColor" size="sm" />) : ("Continue")}
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
                                                </div>
                                                <hr />
                                                <div className="card-body">
                                                    <ul>
                                                        <li>
                                                            Enter  click ID.
                                                        </li>
                                                        <li>
                                                            You can enter multiple click IDs by separating them with a comma {`(,)`} , period {`(.)`} , colon {`(:)`} , vertical bar {`(|)`} , or by putting each ID on a new line.
                                                        </li>
                                                        <li>
                                                            Please wait for the request to finish processing.
                                                        </li>
                                                        {/* <li>
                                                        You can monitor the progress of your request.
                                                    </li> */}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>)}


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

