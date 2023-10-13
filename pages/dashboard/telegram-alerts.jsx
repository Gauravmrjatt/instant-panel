import Script from 'next/script'
import MyNav from '../../components/Nav'
import Header from '../../components/Header'
import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';
import myDetails from '../myDetails.json' assert {type: 'json'}
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function TelegramAlert() {

    const [input, setInput] = useState({
        contact: '',
        username: '',
        chatId: '',
        label: ''
    })
    const router = useRouter()
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/js/main.js';
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    // const handleChatIdChange = (event) => {
    //     setChatID(event.target.value);
    // };
    // const handleContactChange = (event) => {
    //     setContact(event.target.value);
    // };
    const handelChanges = (e) => {
        setInput((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }
    useEffect(() => {
        getKey()
        async function getKey() {
            const data = await axios.get("/get/telegram-alert")
            setInput({
                ...data.data
            })
        }
    }, [])

    const update = () => {
        return new Promise((resolve, reject) => {
            axios.post('/update/telegram-alert', { ...input })
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
    const updateChatId = (e) => {
        e.preventDefault();
        toast.promise(
            update(),
            {
                loading: 'Changing Settings....',
                success: 'Successfully changed!',
                error: (error) => error
            }
        );
    }


    return (
        <>
            <Head>
                <title>Telegram Alerts</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">

                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Dashboard /</span> Telegram Alerts</h4>
                                <div className="row">
                                    <div className="col-xl">
                                        <div className="card mb-5">
                                            <h5 className="card-header">Telegram Alerts</h5>
                                            <hr className="my-0" />
                                            <div style={{ textAlign: "right", marginRight: "25px" }} className="float-end mt-3 mr-1">
                                                <div className="btn-group" id="dropdown-icon-demo">
                                                    <button onClick={() => router.push(myDetails.bot)} type="button" className="btn rounded-pill btn-outline-primary" fdprocessedid="dtrhg">
                                                        <span className="tf-icons bx bxs-bot"></span>&nbsp; Start Bot
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ maxWidth: "500px", marginInline: "auto" }} >
                                                    <h5 className="card-header">Bot Alert</h5>
                                                    <div className="card-body">
                                                        <div className="form-floating">
                                                            <input type='text' name='chatId' onChange={handelChanges} value={input.chatId} className="form-control" id="floatingInput" placeholder="12345678" aria-describedby="floatingInputHelp" fdprocessedid="badxh9" />
                                                            <label htmlFor="floatingInput">ChatID</label>
                                                            <div id="floatingInputHelp" className="form-text">
                                                                Enter your telegram chatId
                                                            </div>
                                                        </div>
                                                        <div className="form-floating mt-3">
                                                            <input onChange={handelChanges} name='contact' value={input.contact} className="form-control" id="floatingInput" placeholder="@toolsadda_support" aria-describedby="floatingInputHelp" fdprocessedid="badxh9" />
                                                            <label htmlFor="floatingInput">Contact</label>
                                                            <div id="floatingInputHelp" className="form-text">
                                                                Enter your telegram username
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ maxWidth: "500px", marginInline: "auto" }} className="mb-4">
                                                    <h5 className="card-header">Channel Alert</h5>
                                                    <div className="card-body">
                                                        <div className="form-floating">
                                                            <input type='text' onChange={handelChanges} value={input.username} name='username' className="form-control" id="floatingInput" placeholder="@Earningarea_Payouts" aria-describedby="floatingInputHelp" fdprocessedid="badxh9" />
                                                            <label htmlFor="floatingInput">Username</label>
                                                            <div id="floatingInputHelp" className="form-text">
                                                                Enter your telegram channel username with <b>@</b>
                                                            </div>
                                                        </div>

                                                        <div className="form-floating mt-3">
                                                            <input onChange={handelChanges} value={input.label} name='label' className="form-control" id="floatingInput" placeholder="Power By @YourChannel" aria-describedby="floatingInputHelp" fdprocessedid="badxh9" />
                                                            <label htmlFor="floatingInput">Label</label>
                                                            <div id="floatingInputHelp" className="form-text">
                                                                Enter your Label
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: "right" }}>
                                                            <button type="button" onClick={updateChatId} className="btn rounded-pill btn-primary mt-3" >Update</button>
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
                                                        Start our bot
                                                    </li>
                                                    <li>
                                                        Get your chatID
                                                    </li>
                                                    <li>
                                                        paste it in chatID input field
                                                    </li>
                                                    <li>enter your username in contact field</li>
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

