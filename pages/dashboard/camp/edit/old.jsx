
import Script from 'next/script'
import MyNav from '../../../../components/Nav'
import Header from '../../../../components/Header'
import Head from 'next/head'
import { useEffect, useState, } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';
import { Location, Setting } from 'react-iconly'
import { Modal, Input, Button, Text, Badge, Grid, Switch, Radio, Textarea } from "@nextui-org/react";
import { useRouter } from 'next/router'
import LinearProgress from '@mui/material/LinearProgress';
import Button2 from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { EditIcon } from "../../../../icons/EditIcon";
import { DeleteIcon } from "../../../../icons//DeleteIcon";
import IconButton from '@mui/material/IconButton';
import copy from 'copy-to-clipboard';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import myDetails from "../../../myDetails.json" assert { type: "json" };
import Link from 'next/link'
export default function AddCampaigns() {
    const router = useRouter()
    const { id: ID } = router.query
    const [params, setParams] = useState([])
    const [timeSwitch, setTimeSwitch] = useState(false)
    const [timeSwitch2, setTimeSwitch2] = useState(false)
    const [switchs, setSwitchs] = useState({
        paytm: false,
        ip: false,
        same: false,
        caps: "none",
        cap: false,
        timeSwitch: false,
        timeDisplay: "none",
    });

    const [indexx, setIndex] = useState('')
    const [events, setEvents] = useState([])
    const [ip, setIp] = useState([])
    const [getIP, setIP] = useState('')
    const [visible, setVisible] = useState(false);
    const [visible2, setVisible2] = useState(false);
    const [visible3, setVisible3] = useState(false);
    const [campaignInfo, setCampaignInfo] = useState({
        name: '',
        offerID: '',
        tracking: '',
    });
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/js/main.js';
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    const [eventsData, seteventsData] = useState({
        name: '',
        user: '',
        refer: '',
        userComment: '',
        referComment: '',
        caps: '',
        time: '',
        payMode: 'auto'
    });
    const [editSwiches, setEditSwiches] = useState({
        caps: "none",
        cap: false,
        timeSwitch: false,
        timeDisplay: "none",
    });
    const [editeventsData, setediteventsData] = useState({
        name: '',
        user: '',
        refer: '',
        userComment: '',
        referComment: '',
        caps: '',
        time: '',
        payMode: 'auto'
    });

    const handleChange = e => {
        const { name, value } = e.target;
        setCampaignInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    function setEventPayMode(e) {
        seteventsData(prev => ({
            ...prev,
            payMode: e
        }))
    }
    function EditsetEventPayMode(e) {
        setediteventsData(prev => ({
            ...prev,
            payMode: e
        }))
    }
    const handler = () => setVisible(true);
    const closeHandler = () => {
        setVisible(false);
    };
    const handler2 = () => setVisible2(true);
    const handler3 = () => setVisible3(true);
    const closeHandler2 = () => {
        setVisible2(false);
    };
    const closeHandler3 = () => {
        setVisible3(false);
    };

    const addPromise = () => {
        return new Promise((resolve, reject) => {
            const sendData = { _id: ID, data: { ...campaignInfo, ...switchs, events: [...new Set(events)], ips: [...new Set(ip)] } }
            axios.post("/update/campaign", sendData)
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

    function getUrlParams() {
        try {
            const url = new URL(campaignInfo.tracking);
            const params = new URLSearchParams(url.search);
            const paramArray = Array.from(params.entries());
            console.log(paramArray);
            if (setParams) {
                setParams(paramArray);
            }
        } catch (error) {
            console.error(error);
            setParams([]);
        }
    }

    function AddNewCamp() {
        toast.promise(
            addPromise(),
            {
                loading: 'Updating Campaing',
                success: 'Campaing Saved Successfully!',
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
    function saveEvent() {
        const eventExists = events.some(item => item.name === eventsData.name);

        if (eventExists) {
            return toast.error("Event already exists")
        }
        else if (eventsData.name == '') {
            return toast.error("Enter an event name")
        }
        else if (eventsData.user == '') {
            return toast.error("Enter an event user amount")
        }
        else if (eventsData.refer == '') {
            return toast.error("Enter an event refer amount")
        }
        else if (eventsData.userComment == '') {
            return toast.error("Enter an event user comment")
        }
        else if (eventsData.referComment == '') {
            return toast.error("Enter an event refer comment")
        }

        setEvents(prev => ([...prev, eventsData]))
        seteventsData({
            name: '',
            user: '',
            refer: '',
            userComment: '',
            referComment: '',
            caps: '',
            time: '',
            payMode: 'auto'
        })
        setSwitchs({
            paytm: false,
            ip: false,
            same: false,
            caps: "none",
            cap: false,
            timeSwitch: false,
            timeDisplay: "none",
        })
        closeHandler()
    }
    function saveIP() {
        const eventExists = ip.some(item => item === getIP);

        if (eventExists) {
            return toast.error("IP already exists")
        }
        if (getIP == '') {
            return toast.error("Enter a IP")
        }

        setIp(prev => ([...prev, getIP]))
        setIP('')
    }
    const updateEvents = (e, name) => {
        var value = e.target.value;
        seteventsData(prev => ({
            ...prev,
            [name]: value
        }))
    }
    const updateEventsEdit = (e, name) => {
        var value = e.target.value;
        setediteventsData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    function deleteEvents(event, index) {
        const updatedItems = events.filter(item => item.name !== event.name);
        setEvents(updatedItems);
    }

    function editEvents(event, index) {
        setediteventsData(events[index])
        setIndex(index)
        handler3()
        if (events[index].caps != '') {
            setEditSwiches(prev => ({
                ...prev,
                caps: "block",
                cap: true,
            }))
        } else {
            setEditSwiches(prev => ({
                ...prev,
                caps: "none",
                cap: false,
            }))
        }
        if (events[index].time != '') {
            setTimeSwitch2(true)
            setEditSwiches(prev => ({
                ...prev,
                timeSwitch: true,
                timeDisplay: "block",
            }))
        } else {
            setTimeSwitch2(false)
            setEditSwiches(prev => ({
                ...prev,
                timeSwitch: false,
                timeDisplay: "none",
            }))
        }
        // setEditSwiches()
        // const updatedItems = events.filter(item => item.name !== event.name);
        // setEvents(updatedItems);
    }

    function deleteIP(event) {
        const updatedItems = ip.filter(item => item !== event);
        setIp(updatedItems);
    }

    function handelCaps(e, type) {
        seteventsData(prev => ({
            ...prev,
            caps: ""
        }))
        if (e.target.checked === true) {
            setSwitchs(prev => ({
                ...prev,
                caps: "block",
                cap: true
            }))
        } else {
            setSwitchs(prev => ({
                ...prev,
                caps: "none",
                cap: false
            }))
        }
    }

    function updateSwichEdit(e, type) {
        if (type == 'cap') {
            setediteventsData(prev => ({
                ...prev,
                caps: ""
            }))
            if (e.target.checked === true) {

                setEditSwiches(prev => ({
                    ...prev,
                    caps: "block",
                    cap: true
                }))
            } else {

                setEditSwiches(prev => ({

                    ...prev,
                    caps: "none",
                    cap: false
                }))
            }
        }
        if (type == 'time') {
            setediteventsData(prev => ({
                ...prev,
                time: ""
            }))
            if (e.target.checked === true) {
                setTimeSwitch2(e.target.checked)
                setEditSwiches(prev => ({
                    ...prev,
                    timeDisplay: "block",
                    timeSwitch: true
                }))
            } else {
                setTimeSwitch2(e.target.checked)
                setEditSwiches(prev => ({

                    ...prev,
                    timeDisplay: "none",
                    timeSwitch: false
                }))
            }
        }

    }
    function handelTime(e, type) {
        setTimeSwitch(e.target.checked)
        seteventsData(prev => ({
            ...prev,
            time: ""
        }))
        if (e.target.checked === true) {
            setSwitchs(prev => ({
                ...prev,
                timeDisplay: "block",
                time: true
            }))
        } else {
            setSwitchs(prev => ({
                ...prev,
                timeDisplay: "none",
                time: false
            }))
        }


    }
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        if (ID) {
            async function getData() {
                try {
                    const { data } = await axios.get("/get/campaign/" + ID);
                    setEvents(data.data.events);
                    setIp(data.data.ips);
                    setCampaignInfo({
                        name: data.data.name,
                        offerID: data.data.offerID,
                        tracking: data.data.tracking,

                    });


                    setSwitchs((prev) => ({
                        ...prev,
                        paytm: data.data.paytm,
                        ip: data.data.ip,
                        same: data.data.same,
                    }));
                    setLoading(false);
                } catch (error) {
                    console.log(error);
                }
            }
            getData();
        }
    }, [ID]);

    useEffect(() => {
        getUrlParams()
    }, [campaignInfo.tracking])

    function EditEvent(i) {
        const index = events.findIndex(item => item.name)
        if (index !== -1) {
            const newItems = [...events];
            newItems[indexx] = { ...editeventsData };
            setEvents(newItems);
            closeHandler3()
        }
    }
    function copytext() {
        copy("{click_id}")
        toast.success("copied!")
    }

    function copyLink() {
        copy(domain + "/api/v1/click/" + ID + `?aff_click_id={user_number}&sub_aff_id={refer_number}&userIp={ip}&device={user_agent}`)
        toast.success("copied!")
    }
    const [domain, setDomain] = useState('');
    useEffect(() => {
        setDomain(window.location.protocol + '//' + window.location.host);
    }, []);
    return (
        <>
            <Head>
                <title>Edit Campaign</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">
                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4">
                                    <Link href='/dashboard' className="text-muted fw-light">Dashboard /</Link> <Link href='/dashboard/liveCampaigns' className="text-muted fw-light">Camp /</Link> Edit</h4>
                                <Button onPress={() => router.push("/dashboard/liveCampaigns")} rounded shadow icon={<i className='bx bx-list-ol'></i>} color='primary' css={{ display: "block", marginLeft: "auto", marginBottom: "20px" }}>Live Campaigns</Button>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="card mb-4">
                                            <h5 className="card-header">Edit Campaign</h5>
                                            <hr className="my-0" />
                                            {isLoading ? (
                                                <>
                                                    <LinearProgress style={{ position: "absolute", top: '65px', left: "0", right: "0" }} />
                                                </>
                                            ) : (<></>)}
                                            <div className="card-body" style={{ position: "relative", overflow: "hidden" }}>
                                                <h5>
                                                    Click Url
                                                </h5>
                                                <Paper variant="outlined" sx={{ padding: "10px" }} >
                                                    {domain + "/api/v1/click/" + ID ?? ''}?aff_click_id={'{user_number}'}&sub_aff_id={'{refer_number}'}&userIp={'{ip}'}&device={'{user_agent}'}<span style={{ float: "right" }}> <IconButton onClick={() => copyLink()} aria-label="delete"><i className='bx bx-copy'></i></IconButton></span>
                                                </Paper>
                                                <div>
                                                    <Button2 onClick={() => router.push("/info/how-to-use")} sx={{ marginBottom: "20px", marginLeft: "auto", display: "block", transform: "translateX(55px)" }}>How to use?</Button2>
                                                </div>
                                                {isLoading ? (
                                                    <>
                                                        <Backdrop
                                                            sx={{ color: '#fff', zIndex: 1, position: 'absolute', background: 'rgb(255 255 255 / 50%)' }}
                                                            open={true}
                                                        >
                                                            <CircularProgress color="inherit" />
                                                        </Backdrop>
                                                    </>
                                                ) : (<></>)}

                                                <div className="row">
                                                    <div className="mb-3 col-md-6">
                                                        <label htmlFor="name" className="form-label">Campaign Name</label>
                                                        <input className="form-control" type="text" id="name" placeholder="Enter Campaign Name" name="name" autoFocus="" value={campaignInfo.name} onChange={handleChange} />
                                                    </div>
                                                    <div className="mb-3 col-md-6">
                                                        <label htmlFor="offerid" className="form-label">Offer ID</label>
                                                        <input className="form-control" type='number' placeholder="Enter Offer ID" id="offerid" name="offerID" value={campaignInfo.offerID} onChange={handleChange} />
                                                    </div>
                                                    <Textarea
                                                        css={{ width: "100%" }}
                                                        status="primarary"
                                                        helperColor="error"
                                                        initialValue=""
                                                        helperText="Replace clickId with {click_id}"
                                                        placeholder="Url"
                                                        label='Tracking Url'
                                                        name='tracking'

                                                        onPaste={(e) => { handleChange(e); getUrlParams() }}
                                                        value={campaignInfo.tracking} onChange={(e) => { handleChange(e); getUrlParams() }}
                                                    />
                                                    <Chip style={{ marginLeft: "auto", maxWidth: "150px", marginTop: "20px" }} variant="outlined" label='{click_id}' deleteIcon={<i className='bx bx-copy'></i>} onClick={copytext} />
                                                    <div className="divider">
                                                        <div className="divider-text">
                                                            <i className="bx bx-star"></i>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h5>
                                                            Add Events
                                                        </h5>
                                                        <List sx={{ width: '100%', maxWidth: 360, display: "block", marginInline: 'auto', bgcolor: 'background.paper' }}>
                                                            {[...new Set(events)].map((event, index) => (
                                                                // <Grid key={event.name}>
                                                                //     <Badge key={event.name + "bag"} css={{ margin: "1px", display: "inline-block" }} enableShadow disableOutline color='secondary'>
                                                                //         {event.name}
                                                                //         <i onClick={() => deleteEvents(event)} style={{ marginLeft: "10px" }} className='bx bxs-x-circle'></i>
                                                                //     </Badge>
                                                                // </Grid>
                                                                <ListItem
                                                                    key={event.name}
                                                                    disableGutters
                                                                    secondaryAction={
                                                                        <IconButton onClick={() => deleteEvents(event, index)} aria-label="delete">
                                                                            <DeleteIcon size={20} fill="#FF0080" />
                                                                        </IconButton>
                                                                    }
                                                                >
                                                                    <ListItemText primary={`${event.name}`} />
                                                                    <IconButton onClick={() => editEvents(event, index)} aria-label="edit">
                                                                        <EditIcon size={20} fill="#7828C8" />
                                                                    </IconButton>
                                                                </ListItem>
                                                            ))}
                                                        </List>


                                                        <Button style={{ marginBlock: "20px", marginLeft: "auto" }} auto onPress={() => handler()} rounded shadow color='secondary'>Add Events</Button>
                                                    </div>
                                                    <div>
                                                        <h5>
                                                            Add IP (OPTIONAL)
                                                        </h5>
                                                        <Grid.Container gap={2}>
                                                            {[...new Set(ip)].map((event) => (
                                                                <Grid key={event}>
                                                                    <Badge key={event + "bag"} css={{ margin: "1px", display: "inline-block" }} enableShadow disableOutline color='warning'>
                                                                        {event}
                                                                        <i onClick={() => deleteIP(event)} style={{ marginLeft: "10px" }} className='bx bxs-x-circle'></i>
                                                                    </Badge>
                                                                </Grid>
                                                            ))}
                                                        </Grid.Container>

                                                        <Button style={{ marginLeft: "auto" }} auto onPress={() => handler2()} rounded shadow color='warning'>Add IP</Button>
                                                    </div>
                                                    <Modal
                                                        closeButton
                                                        blur
                                                        aria-labelledby="Add-Events"
                                                        open={visible}
                                                        onClose={closeHandler}
                                                    >
                                                        <Modal.Header>
                                                            <Text id="Add-Events" size={18}>
                                                                Add
                                                                <Text b css={{ marginLeft: "5px" }} size={18}>
                                                                    Event
                                                                </Text>
                                                            </Text>
                                                        </Modal.Header>
                                                        <Modal.Body>
                                                            <Input
                                                                clearable
                                                                bordered
                                                                fullWidth
                                                                color="primary"
                                                                size="lg"
                                                                placeholder="Event Name"
                                                                value={eventsData.name}
                                                                aria-label='name'
                                                                key='1'
                                                                onChange={(e) => updateEvents(e, "name")}
                                                                contentLeft={<i className='bx bx-rename'></i>}
                                                            />
                                                            <Input
                                                                clearable
                                                                bordered
                                                                fullWidth
                                                                color="primary"
                                                                size="lg"
                                                                placeholder="User Amount"
                                                                type='number'
                                                                aria-label='user'
                                                                value={eventsData.user}
                                                                key='2'
                                                                onChange={(e) => updateEvents(e, "user")}
                                                                contentLeft={<i className='bx bxs-user'></i>}
                                                            />
                                                            <Input
                                                                clearable
                                                                bordered
                                                                fullWidth
                                                                color="primary"
                                                                size="lg"
                                                                placeholder="Refer Amount"
                                                                type='number'
                                                                aria-label='refer'
                                                                value={eventsData.refer}
                                                                key='3'
                                                                onChange={(e) => updateEvents(e, "refer")}
                                                                contentLeft={<i className='bx bx-rupee'></i>}
                                                            />
                                                            <Input
                                                                clearable
                                                                bordered
                                                                fullWidth
                                                                color="primary"
                                                                size="lg"
                                                                placeholder="User Comment"
                                                                aria-label='ucomment'
                                                                key='4'
                                                                value={eventsData.userComment}
                                                                onChange={(e) => updateEvents(e, "userComment")}
                                                                contentLeft={<i className='bx bxs-comment-check'></i>}
                                                            />
                                                            <Input
                                                                clearable
                                                                bordered
                                                                fullWidth
                                                                color="primary"
                                                                size="lg"
                                                                aria-label='rcomment'
                                                                placeholder="Refer Comment"
                                                                value={eventsData.referComment}
                                                                key='5'
                                                                onChange={(e) => updateEvents(e, "referComment")}
                                                                contentLeft={<i className='bx bxs-message-square-dots'></i>}
                                                            />
                                                            <hr />
                                                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                                <Switch
                                                                    shadow
                                                                    checked={switchs.cap}
                                                                    size="md"
                                                                    onChange={(e) => handelCaps(e, "cap")}
                                                                    iconOn={<Location set="curved" primaryColor="blueviolet" />}
                                                                    iconOff={<i className='bx bx-infinite'></i>}
                                                                    color='warning'
                                                                    aria-label='cap'
                                                                />
                                                                <small style={{ transform: " translateY(5px)" }}>Limit leads (Caps)</small>
                                                            </div>
                                                            <Input
                                                                css={{ display: switchs.caps }}
                                                                size='lg'
                                                                bordered
                                                                clearable
                                                                contentLeft={<i className='bx bxs-pencil'></i>}
                                                                placeholder="Stop After"
                                                                color='primary'
                                                                value={eventsData.caps}
                                                                type='number'
                                                                onChange={(e) => updateEvents(e, "caps")}
                                                            />
                                                            <hr />
                                                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                                <Switch
                                                                    shadow
                                                                    checked={timeSwitch}
                                                                    size="md"
                                                                    onChange={(e) => handelTime(e, "time")}
                                                                    iconOn={<i className='bx bx-timer'></i>}
                                                                    iconOff={<i className='bx bx-infinite'></i>}
                                                                    color='error'
                                                                    aria-label='time'
                                                                />
                                                                <small style={{ transform: " translateY(5px)" }}>Track Event After Given Time</small>
                                                            </div>
                                                            <Input
                                                                css={{ display: switchs.timeDisplay }}
                                                                size='lg'
                                                                bordered
                                                                clearable
                                                                contentLeft={<i className='bx bxs-time-five'></i>}
                                                                placeholder="Minutes"
                                                                color='primary'
                                                                value={eventsData.time}
                                                                type='number'
                                                                onChange={(e) => updateEvents(e, "time")}
                                                            />
                                                            <hr />
                                                            <Radio.Group value={eventsData.payMode} onChange={(value) => setEventPayMode(value)} color='error' size="sm" label="Payouts" defaultValue="1" orientation="horizontal">
                                                                <Radio color='success' size="sm" value="auto" description="Pay Instantly on lead received.">
                                                                    Auto Approval
                                                                </Radio>
                                                                <Radio size="sm" value="manual" description="Pay when i approve lead">
                                                                    Manual Approval
                                                                </Radio>
                                                            </Radio.Group>
                                                            <hr />
                                                        </Modal.Body>
                                                        <Modal.Footer>
                                                            <Button auto flat color="error" onPress={closeHandler}>
                                                                Close
                                                            </Button>
                                                            <Button auto onPress={saveEvent}>
                                                                Add
                                                            </Button>
                                                        </Modal.Footer>
                                                        <Toaster
                                                            position='top-center'
                                                            reverseOrder={false}
                                                        />
                                                    </Modal>
                                                    <Modal
                                                        closeButton
                                                        blur
                                                        aria-labelledby="Add-Events"
                                                        open={visible2}
                                                        onClose={closeHandler2}
                                                    >
                                                        <Modal.Header>
                                                            <Text id="Add-Events" size={18}>
                                                                Add
                                                                <Text b css={{ marginLeft: "5px" }} size={18}>
                                                                    IP ADDRESS
                                                                </Text>
                                                            </Text>
                                                        </Modal.Header>
                                                        <Modal.Body>
                                                            <Input
                                                                clearable
                                                                bordered
                                                                fullWidth
                                                                color="primary"
                                                                size="lg"
                                                                placeholder="IP Address"
                                                                value={getIP}
                                                                aria-label='name'
                                                                key='1'
                                                                onChange={(e) => setIP(e.target.value)}
                                                                contentLeft={<i className='bx bx-trip'></i>}
                                                            />
                                                        </Modal.Body>
                                                        <Modal.Footer>
                                                            <Button auto flat color="error" onPress={closeHandler2}>
                                                                Close
                                                            </Button>
                                                            <Button auto onPress={saveIP}>
                                                                Add
                                                            </Button>
                                                        </Modal.Footer>
                                                        <Toaster
                                                            position='top-center'
                                                            reverseOrder={false}
                                                        />

                                                    </Modal>
                                                    <div className="divider">
                                                        <div className="divider-text">
                                                            <i className="bx bx-star"></i>
                                                        </div>
                                                    </div>
                                                </div>

                                                <hr />
                                                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                    <Switch
                                                        shadow
                                                        checked={switchs.paytm}
                                                        size="md"
                                                        onChange={(e) => handelSwith(e, "paytm")}
                                                        iconOn={<i className='bx bxs-hand'></i>}
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
                                                        iconOn={<i className='bx bxs-megaphone'></i>}
                                                        iconOff={<i className='bx bx-infinite'></i>}
                                                        color='secondary'
                                                    />

                                                    <small style={{ transform: " translateY(5px)" }}>One IP One Payment</small>
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

                                                <div className="mt-2">
                                                    <button onClick={() => AddNewCamp()} className="btn btn-primary me-2">Save</button>
                                                </div>
                                                <Modal
                                                    closeButton
                                                    blur
                                                    aria-labelledby="Add-Events"
                                                    aria-label="name"
                                                    open={visible3}
                                                    onClose={closeHandler3}
                                                >
                                                    <Modal.Header>
                                                        <Text id="Add-Events" size={18}>
                                                            Add
                                                            <Text b css={{ marginLeft: "5px" }} size={18}>
                                                                Event
                                                            </Text>
                                                        </Text>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <Input
                                                            clearable
                                                            bordered
                                                            fullWidth
                                                            color="primary"
                                                            size="lg"
                                                            placeholder="Event Name"
                                                            value={editeventsData.name}
                                                            aria-label='name'
                                                            key='1'
                                                            onChange={(e) => updateEventsEdit(e, "name")}
                                                            contentLeft={<i className='bx bx-rename'></i>}

                                                        />
                                                        <Input
                                                            clearable
                                                            bordered
                                                            fullWidth
                                                            color="primary"
                                                            size="lg"
                                                            placeholder="User Amount"
                                                            type='number'
                                                            aria-label='user'
                                                            value={editeventsData.user}
                                                            key='2'
                                                            onChange={(e) => updateEventsEdit(e, "user")}
                                                            contentLeft={<i className='bx bxs-user'></i>}
                                                        />
                                                        <Input
                                                            clearable
                                                            bordered
                                                            fullWidth
                                                            color="primary"
                                                            size="lg"
                                                            placeholder="Refer Amount"
                                                            type='number'
                                                            aria-label='refer'
                                                            value={editeventsData.refer}
                                                            key='3'
                                                            onChange={(e) => updateEventsEdit(e, "refer")}
                                                            contentLeft={<i className='bx bx-rupee'></i>}
                                                        />
                                                        <Input
                                                            clearable
                                                            bordered
                                                            fullWidth
                                                            color="primary"
                                                            size="lg"
                                                            placeholder="User Comment"
                                                            aria-label='ucomment'
                                                            key='4'
                                                            value={editeventsData.userComment}
                                                            onChange={(e) => updateEventsEdit(e, "userComment")}
                                                            contentLeft={<i className='bx bxs-comment-check'></i>}
                                                        />
                                                        <Input
                                                            clearable
                                                            bordered
                                                            fullWidth
                                                            color="primary"
                                                            size="lg"
                                                            aria-label='rcomment'
                                                            placeholder="Refer Comment"
                                                            value={editeventsData.referComment}
                                                            key='5'
                                                            onChange={(e) => updateEventsEdit(e, "referComment")}
                                                            contentLeft={<i className='bx bxs-message-square-dots'></i>}
                                                        />
                                                        <hr />
                                                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                            <Switch
                                                                shadow
                                                                checked={editSwiches.cap}
                                                                size="md"
                                                                onChange={(e) => updateSwichEdit(e, "cap")}
                                                                iconOn={<Location set="curved" primaryColor="blueviolet" />}
                                                                iconOff={<i className='bx bx-infinite'></i>}
                                                                color='warning'
                                                                aria-label='cap'
                                                            />
                                                            <small style={{ transform: " translateY(5px)" }}>Limit leads (Caps)</small>
                                                        </div>
                                                        <Input
                                                            css={{ display: editSwiches.caps }}
                                                            size='lg'
                                                            bordered
                                                            clearable
                                                            contentLeft={<i className='bx bxs-pencil'></i>}
                                                            placeholder="Stop After"
                                                            color='primary'
                                                            value={editeventsData.caps}
                                                            type='number'
                                                            onChange={(e) => updateEventsEdit(e, "caps")}
                                                        />
                                                        <hr />


                                                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                            <Switch
                                                                shadow
                                                                checked={timeSwitch2}
                                                                size="md"
                                                                onChange={(e) => updateSwichEdit(e, "time")}
                                                                iconOn={<i className='bx bx-timer'></i>}
                                                                iconOff={<i className='bx bx-infinite'></i>}
                                                                color='error'
                                                                aria-label='time'
                                                            />
                                                            <small style={{ transform: " translateY(5px)" }}>Track Event After Given Time</small>
                                                        </div>
                                                        <Input
                                                            css={{ display: editSwiches.timeDisplay }}
                                                            size='lg'
                                                            bordered
                                                            clearable
                                                            contentLeft={<i className='bx bxs-time-five'></i>}
                                                            placeholder="Minutes"
                                                            color='primary'
                                                            value={editeventsData.time}
                                                            type='number'
                                                            onChange={(e) => updateEventsEdit(e, "time")}
                                                        />
                                                        <hr />
                                                        <Radio.Group value={editeventsData.payMode} onChange={(value) => EditsetEventPayMode(value)} color='error' size="sm" label="Payouts" defaultValue="1" orientation="horizontal">
                                                            <Radio color='success' size="sm" value="auto" description="Pay Instantly on lead received.">
                                                                Auto Approval
                                                            </Radio>
                                                            <Radio size="sm" value="manual" description="Pay when i approve lead">
                                                                Manual Approval
                                                            </Radio>
                                                        </Radio.Group>
                                                        <hr />
                                                    </Modal.Body>
                                                    <Modal.Footer>
                                                        <Button auto flat color="error" onPress={closeHandler3}>
                                                            Close
                                                        </Button>
                                                        <Button auto onPress={() => EditEvent(indexx)}>
                                                            Update
                                                        </Button>
                                                    </Modal.Footer>
                                                    <Toaster
                                                        position='top-center'
                                                        reverseOrder={false}
                                                    />
                                                </Modal>
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
                position='top-center'
                reverseOrder={false}
            />

            <Script src="/assets/js/dashboards-analytics.js"></Script>

        </>
    )
}

