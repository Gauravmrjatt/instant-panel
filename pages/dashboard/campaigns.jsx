import Script from 'next/script'
import MyNav from '../../components/Nav'
import Header from '../../components/Header'
import Head from 'next/head'
import { useEffect, useState, } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';
import { Setting, Lock, Filter, InfoCircle } from 'react-iconly'
import { Button, Switch, } from "@nextui-org/react";
import { useRouter } from 'next/router'
import Chip from '@mui/material/Chip';
import copy from 'copy-to-clipboard';
import AddEvent from '../../components/addCamp/addEvent'
import Link from 'next/link'
import AddIP from '../../components/addCamp/addIp'
export default function AddCampaigns() {
    const router = useRouter()
    const [domain, setDomain] = useState('');

    const [switchs, setSwitchs] = useState({
        paytm: false,
        ip: false,
        same: false,
        crDelay: false,
        prevEvent: true,
        userPending: false,
        referPending: false,
    });
    const [events, setEvents] = useState([])
    const [ip, setIp] = useState([])
    const [campaignInfo, setCampaignInfo] = useState({
        name: '',
        offerID: '',
        tracking: '',
        delay: ''
    });
    const [postBack, setPostBack] = useState({
        key: '',
        url: ''
    });
    const handleChange = e => {
        const { name, value } = e.target;
        setCampaignInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const addPromise = () => {
        return new Promise((resolve, reject) => {
            const sendData = { ...campaignInfo, ...switchs, events: [...new Set(events)], ips: [...new Set(ip)] }
            axios.post("/add/campaign", sendData)
                .then((response) => {
                    const data = response.data;
                    if (data.status === true) {
                        setTimeout(() => {
                            router.push("camp/edit/" + data.id)
                        }, 1000);
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

    function AddNewCamp() {
        toast.promise(
            addPromise(),
            {
                loading: 'Adding Campaing',
                success: <b>Campaing Successfully Added!</b>,
                error: (error) => error
            }
        );
    }

    function handelSwith(e, type) {
        setSwitchs(prev => ({
            ...prev,
            [type]: e.target.checked
        }))
    }

    function saveIP(Ip) {
        const eventExists = ip.some(item => item === Ip);
        if (eventExists) {
            return toast.error("IP already exists")
        }
        setIp(prev => ([...prev, Ip]))
    }

    function deleteEvents(event) {
        const updatedItems = events.filter(item => item.name !== event.name);
        setEvents(updatedItems);
    }

    function deleteIP(event) {
        const updatedItems = ip.filter(item => item !== event);
        setIp(updatedItems);
    }
    const saveEvents = (e) => {
        setEvents(lastEvents => ([
            ...lastEvents,
            e
        ]))
    }

    function copytext() {
        copy("{click_id}")
        toast.success("copied!")
    }
    const editEventData = (eventDatas, index) => {
        const newItems = [...events];
        newItems[index] = { ...eventDatas };
        setEvents(newItems);
    }

    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/js/main.js';
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    useEffect(() => {
        setDomain(window.location.protocol + '//' + window.location.host);
    }, []);
    useEffect(() => {
        getKey()
        async function getKey() {
            const data = await axios.get("/get/postback")
            setPostBack({
                url: data.data.url,
                key: data.data.key,
            })
            return () => {
                setPostBack({
                    url: "",
                    key: "",
                })
            }
        }
    }, [])

    return (
        <>
            <Head>
                <title>Add New Campaign</title>
            </Head>

            <div className="layout-wrapper layout-content-navbar">

                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4"><Link href='/dashboard' className="text-muted fw-light">Dashboard /</Link> Add New Campaign</h4>
                                <Button onPress={() => router.push("liveCampaigns")} rounded shadow icon={<i className='bx bx-list-ol'></i>} color='primary' css={{ display: "block", marginLeft: "auto", marginBottom: "20px" }}>Live Campaigns</Button>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="card mb-4">
                                            <h5 className="card-header">Add New Campaign</h5>
                                            <hr className="my-0" />
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="mb-3 col-md-6">
                                                        <label htmlFor="name" className="form-label">Campaign Name</label>
                                                        <input className="form-control" type="text" id="name" placeholder="Enter Campaign Name" name="name" autoFocus="" value={campaignInfo.name} onChange={handleChange} />
                                                    </div>
                                                    <div className="mb-3 col-md-6">
                                                        <label htmlFor="offerid" className="form-label">Offer ID</label>
                                                        <input className="form-control" type='number' placeholder="Enter Offer ID" id="offerid" name="offerID" value={campaignInfo.offerID} onChange={handleChange} />
                                                    </div>
                                                    <label htmlFor="adadsd" className="form-label">Tracking Url</label>
                                                    <textarea className="form-control" id="adadsd" rows="3"
                                                        placeholder="Tracking Url"
                                                        label='Tracking Url'
                                                        name='tracking'
                                                        onPaste={(e) => { handleChange(e) }}
                                                        value={campaignInfo.tracking} onChange={(e) => { handleChange(e); }}
                                                    >

                                                    </textarea>

                                                    <Chip style={{ marginLeft: "auto", maxWidth: "150px", marginTop: "20px" }} variant="outlined" label='{click_id}' deleteIcon={<i className='bx bx-copy'></i>} onClick={copytext} />
                                                    <AddEvent postBack={postBack} events={events} onEventSave={saveEvents} onDeleteEvent={deleteEvents} onEvenEdit={(eventDatas, index) => editEventData(eventDatas, index)} />

                                                    <div className="divider">
                                                        <div className="divider-text">
                                                            <i className="bx bx-star"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                                <AddIP ip={ip} onIPSave={saveIP} ondeleteIP={deleteIP} />
                                                <hr />
                                                {/* <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                    <Switch
                                                        shadow
                                                        checked={switchs.userPending}
                                                        size="md"
                                                        color='success'
                                                        onChange={(e) => handelSwith(e, "userPending")}
                                                        iconOn={<Lock set="bold" primaryColor="blueviolet" />}
                                                        iconOff={<i className='bx bx-infinite'></i>}
                                                    />
                                                    <small style={{ transform: " translateY(5px)" }}>Pending User CashBack</small>

                                                </div>
                                                <hr /> */}
                                                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                    <Switch
                                                        shadow
                                                        checked={switchs.referPending}
                                                        size="md"
                                                        onChange={(e) => handelSwith(e, "referPending")}
                                                        iconOn={<Lock set="bold" primaryColor="blueviolet" />}
                                                        iconOff={<i className='bx bx-infinite'></i>}
                                                    />
                                                    <small style={{ transform: " translateY(5px)" }}>Pending Refer CashBack</small>
                                                </div>
                                                <hr />
                                                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                    <Switch
                                                        shadow
                                                        checked={switchs.paytm}
                                                        size="md"
                                                        onChange={(e) => handelSwith(e, "paytm")}
                                                        iconOn={<Lock set="bold" primaryColor="blueviolet" />}
                                                        iconOff={<i className='bx bx-infinite'></i>}
                                                    />

                                                    <small style={{ transform: " translateY(5px)" }}>One Paytm One Payment</small>
                                                </div>
                                                <hr />
                                                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                    <Switch
                                                        shadow
                                                        checked={switchs.ip}
                                                        size="md"
                                                        onChange={(e) => handelSwith(e, "ip")}
                                                        iconOn={<Lock set="bold" primaryColor="blueviolet" />}
                                                        iconOff={<i className='bx bx-infinite'></i>}
                                                        color='secondary'
                                                    />

                                                    <small style={{ transform: " translateY(5px)" }}>One IP One Payment</small>
                                                </div>
                                                <hr />
                                                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                    <Switch
                                                        shadow
                                                        checked={switchs.prevEvent}
                                                        size="md"
                                                        onChange={(e) => handelSwith(e, "prevEvent")}
                                                        iconOn={<InfoCircle set="bold" primaryColor="red" />}
                                                        iconOff={<i className='bx bx-infinite'></i>}
                                                        color='error'
                                                    />

                                                    <small style={{ transform: " translateY(5px)" }}>Reject if Previous event not found</small>
                                                </div>
                                                <hr />
                                                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                    <Switch
                                                        shadow
                                                        checked={switchs.same}
                                                        size="md"
                                                        onChange={(e) => handelSwith(e, "same")}
                                                        iconOn={<Setting set="bulk" primaryColor="blueviolet" />}
                                                        iconOff={<i className='bx bx-revision'></i>}
                                                        color='error'
                                                    />
                                                    <small style={{ transform: " translateY(5px)" }}>Same Number Refer</small>
                                                </div>
                                                <hr />
                                                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                    <Switch
                                                        shadow
                                                        checked={switchs.crDelay}
                                                        size="md"
                                                        onChange={(e) => {
                                                            handelSwith(e, "crDelay"); setCampaignInfo(prevState => ({
                                                                ...prevState,
                                                                delay: ''
                                                            }));
                                                        }}
                                                        iconOn={<Filter set="bold" primaryColor="blueviolet" />}
                                                        iconOff={<i className='bx bx-infinite'></i>}
                                                        color='warning'
                                                    />
                                                    <small style={{ transform: " translateY(5px)" }}>Click to Conversion Delay</small>
                                                </div>
                                                {switchs.crDelay && (
                                                    <div className="mb-3 mt-4">
                                                        <label htmlFor="name" className="form-label">Conversion Delay</label>
                                                        <input className="form-control" type="number" id="name" placeholder="Enter time in Seconds" name="delay" autoFocus="" value={campaignInfo.delay} onChange={handleChange} />
                                                    </div>
                                                )}
                                                <hr />
                                                <div className="mt-2">
                                                    <button style={{ float: "right" }} onClick={() => AddNewCamp()} className="btn btn-primary me-2">Add New Camgaign</button>
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

