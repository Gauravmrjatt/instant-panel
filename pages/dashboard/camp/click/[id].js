
import Script from 'next/script'
import MyNav from '../../../../components/Nav'
import Header from '../../../../components/Header'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Skeleton from '@mui/material/Skeleton';
import { Badge, Tooltip, Dropdown, Button, Loading } from "@nextui-org/react";
import Grid from '@mui/material/Grid';
import { useTheme, useMediaQuery } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Image from 'next/image'
import Button2 from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import copy from 'copy-to-clipboard';
import Link from 'next/link'
export default function Leads() {
    const [loading, setloading] = useState(false);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const router = useRouter()
    const { id: ID, event: getEvent } = router.query
    const [details, setDetails] = useState({})
    const [isLoading, setisLoading] = useState(true)
    const [leadStatus, setLeadStatus] = useState();
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClickOpen2 = () => {
        setOpen2(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const handleClose2 = () => {
        setOpen2(false);
    };
    const payNow = () => {
        setloading(true)
        async function getData() {
            try {
                const { data } = await axios.post("/update/payment", { getEvent, ID })
                setisLoading(false)
                if (data.status === true) {
                    setloading(false)
                    toast.success("Request SuccessFully")
                    setloading(false)
                    router.reload();
                }
            } catch (error) {
                router.replace(router.asPath);
                console.log(error);
            }
        }
        getData()
    }

    useEffect(() => {
        if (leadStatus) {
            setisLoading(true)
            handelLeadStatus()
        }
    }, [leadStatus])
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/js/main.js';
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    useEffect(() => {
        if (ID) {
            async function getData() {
                try {
                    const { data } = await axios.get("/get/click/" + ID + "/?event=" + getEvent);
                    setDetails(data);
                    setisLoading(false)
                } catch (error) {
                    setisLoading(false)
                    console.log(error);
                }
            }
            getData();
        }
    }, [ID]);
    function toDateTime(time) {
        const date = new Date(time);
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        };
        return date.toLocaleString(undefined, options);
    }
    function getLeadCard(value) {
        let chipColor;
        if (value === 'Approved') {
            chipColor = 'success';
        } else if (value === 'Pending') {
            chipColor = 'warning';
        }
        else if (value === 'Rejected') {
            chipColor = 'error';
        }
        return chipColor
    }
    function getPaymnetCard(value) {
        let chipColor = 'default';
        if (value === 'ACCEPTED') {
            chipColor = 'success';
        } else if (value === 'PENDING') {
            chipColor = 'warning';
        } else if (value === 'fail' || value === 'FAILURE') {
            chipColor = 'error';
        }
        return chipColor
    }
    function showJson(myObject) {
        return JSON.stringify(myObject, null, 2);
    }
    const handelLeadStatus = async () => {
        toast.promise(
            new Promise((resolve, reject) => {
                axios.post('/update/leadStatus', { leadStatus, ID, })
                    .then((response) => {
                        const data = response.data;
                        if (data.status === true) {
                            setDetails(data);
                            setisLoading(false)
                            return resolve(data)
                        } else {
                            setisLoading(false)
                            return reject(data)
                        }
                    })
                    .catch((error) => {
                        setisLoading(false)
                        return reject('This is an error "' + error + '"!')
                    });
            }),
            {
                loading: <b>Updating Status..</b>,
                success: <b>Updated!</b>,
                error: (error) => error
            }
        );
    }
    if (details?.status === false) {
        return (<>
            <div className="layout-wrapper layout-content-navbar">
                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <Card sx={{ maxWidth: 500, width: "90%", marginTop: "100px", marginInline: "auto", background: "#ffffff00", boxShadow: 0, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                {/* <img src='/assets/img/icons/opps.png' /> */}
                                <Image height='300' width='300' src='/assets/img/icons/opps.png' />
                                <h5>{details?.msg}</h5>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <Script src="/assets/js/dashboards-analytics.js"></Script>
        </>)
    }
    function copyId(param) {
        copy(param)
        toast.success("copied!")

    }
    return (
        <>
            <Head>
                <title>Leads Details</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">
                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4">
                                    <Link href='/dashboard' className="text-muted fw-light">Dashboard /</Link> <Link href='/dashboard/liveCampaigns' className="text-muted fw-light">Camp /</Link> View
                                </h4>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="card mb-4">


                                            {/* <button onClick={() => console.log(details)}></button> */}
                                            <h5 className='card-header' component="div" key='h5' variant='h5'>
                                                {isLoading ? <Skeleton sx={{ maxWidth: "300px", fontSize: "1.125rem" }} /> : "Lead Details"}
                                            </h5>
                                            <hr className="my-0" />
                                            <div style={{ width: '100%' }}>
                                                <List
                                                    sx={{ width: 'calc(100% - 10px)', bgcolor: 'background.paper' }}
                                                    subheader={isLoading ? <Skeleton sx={{ fontSize: "1.125rem", marginLeft: "10px", marginTop: "7px", maxWidth: 100 }} /> : <ListSubheader>Click Id</ListSubheader>}
                                                >
                                                    {isLoading ? <Skeleton sx={{ fontSize: "3.125rem", marginLeft: "10px" }} /> :
                                                        <>
                                                            <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px", }}>
                                                                <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary={details?.leadData?.clickId.click} />
                                                                <IconButton onClick={() => copyId(details?.leadData?.clickId.click)} aria-label="delete"><i className='bx bx-copy'></i></IconButton>
                                                            </ListItem>
                                                        </>}
                                                </List>
                                                {
                                                    /*
                                                    lead status
                                                     */
                                                }

                                                <List
                                                    sx={{ width: 'calc(100% - 10px)', bgcolor: 'background.paper' }}
                                                    subheader={isLoading ? <Skeleton sx={{ fontSize: "1.125rem", marginLeft: "10px", marginTop: "7px", maxWidth: 100 }} /> : <ListSubheader>Lead Status</ListSubheader>}
                                                >
                                                    {isLoading ? <Skeleton sx={{ fontSize: "3.125rem", marginLeft: "10px" }} /> :
                                                        <>
                                                            <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px", }}>
                                                                <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary={details?.leadData?.message} />
                                                                {/* <Badge enableShadow disableOutline color={getLeadCard(details?.leadData?.status)}>
                                                                    {details?.leadData?.status}
                                                                </Badge> */}
                                                                <Dropdown>
                                                                    <Dropdown.Button shadow color={getLeadCard(details?.leadData?.status)}>
                                                                        {details?.leadData?.status}
                                                                    </Dropdown.Button>
                                                                    <Dropdown.Menu onAction={(e) => setLeadStatus(e)} color="secondary" aria-label="Actions" css={{ $$dropdownMenuWidth: "280px" }}>
                                                                        <Dropdown.Item
                                                                            key="Approved"
                                                                            command="⌘A"
                                                                            color="success"
                                                                            description="set to approved"
                                                                        >
                                                                            Approved
                                                                        </Dropdown.Item>
                                                                        <Dropdown.Item
                                                                            key="Pending"
                                                                            color="warning"
                                                                            command="⌘P"
                                                                            description="set to pending"

                                                                        >
                                                                            Pending
                                                                        </Dropdown.Item>

                                                                        <Dropdown.Item
                                                                            withDivider
                                                                            key="Rejected"
                                                                            color="error"
                                                                            command="⌘⇧E"
                                                                            description="set to rejected"

                                                                        >
                                                                            Rejected
                                                                        </Dropdown.Item>
                                                                    </Dropdown.Menu>
                                                                </Dropdown>
                                                            </ListItem>
                                                        </>}
                                                </List>
                                                {
                                                    /*
                                                    if payments exist
                                                     */
                                                }

                                                {details?.payments?.status ? (
                                                    <List
                                                        sx={{ width: 'calc(100% - 10px)', bgcolor: 'background.paper' }}
                                                        subheader={isLoading ? <Skeleton sx={{ fontSize: "1.125rem", marginLeft: "10px", marginTop: "7px", maxWidth: 100 }} /> : <ListSubheader>Payment status</ListSubheader>}
                                                    >
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} sm={isSmallScreen ? 12 : 6}>
                                                                {isLoading ? <Skeleton sx={{ fontSize: "3.125rem", marginLeft: "10px" }} /> :
                                                                    <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                        <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary="User :" />
                                                                        <Badge enableShadow disableOutline color="primary">
                                                                            {details?.leadData?.clickId.user}
                                                                        </Badge>
                                                                    </ListItem>}
                                                                {isLoading ? <Skeleton sx={{ fontSize: "3.125rem", marginLeft: "10px" }} /> :
                                                                    <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                        <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary="Response" />
                                                                        <div>
                                                                            <Button2 variant="outlined" onClick={handleClickOpen}>
                                                                                view
                                                                            </Button2>
                                                                            <Dialog
                                                                                open={open}
                                                                                onClose={handleClose}
                                                                                scroll='paper'
                                                                                aria-labelledby="scroll-dialog-title"
                                                                                aria-describedby="scroll-dialog-description"
                                                                            >
                                                                                <DialogTitle id="alert-dialog-title">
                                                                                    {"User Payment Response"}
                                                                                </DialogTitle>
                                                                                <DialogContent>
                                                                                    <DialogContentText id="alert-dialog-description">
                                                                                        <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                                            <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary="Gateway Type" />
                                                                                            <Badge enableShadow disableOutline color="primary">
                                                                                                {details?.payments?.data[0]?.type}
                                                                                            </Badge>
                                                                                        </ListItem>
                                                                                        <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                                            <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary="Time" />
                                                                                            <Badge enableShadow disableOutline color='warning'>
                                                                                                {toDateTime(details?.payments?.data[0]?.createdAt)}
                                                                                            </Badge>
                                                                                        </ListItem>
                                                                                        <List

                                                                                            subheader={isLoading ? <Skeleton sx={{ fontSize: "1.125rem", marginLeft: "10px", marginTop: "7px", maxWidth: 100 }} /> : <ListSubheader>Url</ListSubheader>}
                                                                                        >
                                                                                            <pre>
                                                                                                {details?.payments?.data[0]?.payUrl}
                                                                                            </pre>
                                                                                        </List>
                                                                                        <List

                                                                                            subheader={isLoading ? <Skeleton sx={{ fontSize: "1.125rem", marginLeft: "10px", marginTop: "7px", maxWidth: 100 }} /> : <ListSubheader>Response</ListSubheader>}
                                                                                        >
                                                                                            <pre>
                                                                                                {
                                                                                                    showJson(details?.payments?.data[0]?.response)
                                                                                                }
                                                                                            </pre>
                                                                                        </List>

                                                                                    </DialogContentText>
                                                                                </DialogContent>
                                                                                <DialogActions>
                                                                                    <Button2 onClick={handleClose} autoFocus>
                                                                                        Close
                                                                                    </Button2>
                                                                                </DialogActions>
                                                                            </Dialog>
                                                                        </div>
                                                                    </ListItem>}

                                                            </Grid>
                                                            <Grid item xs={12} sm={isSmallScreen ? 12 : 6}>

                                                                {isLoading ? <Skeleton sx={{ fontSize: "3.125rem", marginLeft: "10px" }} /> :
                                                                    <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                        <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary="Refer :" />
                                                                        <Badge enableShadow disableOutline color="primary">
                                                                            {details?.leadData?.clickId.refer}
                                                                        </Badge>
                                                                    </ListItem>}
                                                                {isLoading ? <Skeleton sx={{ fontSize: "3.125rem", marginLeft: "10px" }} /> :
                                                                    <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                        <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary="Response" />
                                                                        <div>
                                                                            <Button2 variant="outlined" onClick={handleClickOpen2}>
                                                                                view
                                                                            </Button2>
                                                                            <Dialog
                                                                                open={open2}
                                                                                onClose={handleClose2}
                                                                                scroll='paper'
                                                                                aria-labelledby="scroll-dialog-title"
                                                                                aria-describedby="scroll-dialog-description"
                                                                            >
                                                                                <DialogTitle id="alert-dialog-title">
                                                                                    {"Refer Payment Response"}
                                                                                </DialogTitle>
                                                                                <DialogContent>
                                                                                    <DialogContentText id="alert-dialog-description">
                                                                                        <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                                            <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary="Gateway Type" />
                                                                                            <Badge enableShadow disableOutline color="primary">
                                                                                                {details?.payments?.data[1]?.type}
                                                                                            </Badge>
                                                                                        </ListItem>
                                                                                        <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                                            <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary="Time" />
                                                                                            <Badge enableShadow disableOutline color='warning'>
                                                                                                {toDateTime(details?.payments?.data[1]?.createdAt)}
                                                                                            </Badge>
                                                                                        </ListItem>
                                                                                        <List
                                                                                            subheader={isLoading ? <Skeleton sx={{ fontSize: "1.125rem", marginLeft: "10px", marginTop: "7px", maxWidth: 100 }} /> : <ListSubheader>Url</ListSubheader>}
                                                                                        >
                                                                                            <pre>
                                                                                                {details?.payments?.data[1]?.payUrl}
                                                                                            </pre>
                                                                                        </List>
                                                                                        <List

                                                                                            subheader={isLoading ? <Skeleton sx={{ fontSize: "1.125rem", marginLeft: "10px", marginTop: "7px", maxWidth: 100 }} /> : <ListSubheader>Response</ListSubheader>}
                                                                                        >
                                                                                            <pre>
                                                                                                {
                                                                                                    showJson(details?.payments?.data[1]?.response)
                                                                                                }
                                                                                            </pre>
                                                                                        </List>

                                                                                    </DialogContentText>
                                                                                </DialogContent>
                                                                                <DialogActions>
                                                                                    <Button2 onClick={handleClose2} autoFocus>
                                                                                        Close
                                                                                    </Button2>
                                                                                </DialogActions>
                                                                            </Dialog>
                                                                        </div>
                                                                    </ListItem>}

                                                            </Grid>
                                                        </Grid>
                                                    </List>
                                                ) : (
                                                    <List
                                                        sx={{ width: 'calc(100% - 10px)', bgcolor: 'background.paper' }}
                                                        subheader={isLoading ? <Skeleton sx={{ fontSize: "1.125rem", marginLeft: "10px", marginTop: "7px", maxWidth: 100 }} /> : <ListSubheader>Payment Status</ListSubheader>}
                                                    >
                                                        {isLoading ? <Skeleton sx={{ fontSize: "3.125rem", marginLeft: "10px" }} /> :
                                                            <><ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px", }}>
                                                                <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary={details?.leadData?.payMessage} />
                                                                <Badge enableShadow disableOutline color={getPaymnetCard(details?.leadData?.paymentStatus)}>
                                                                    {details?.leadData?.paymentStatus}
                                                                </Badge>
                                                                <hr />
                                                            </ListItem>
                                                                <ListItem sx={{ background: "#F31260", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px", background: "#F31260", color: "white", boxShadow: "0 4px 14px 0 #f3126099" }}>
                                                                    <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary='Pay Manual' />
                                                                    <Button disabled={loading} onPress={() => payNow()} style={{ marginBlock: "20px", marginLeft: "auto" }} color="success" auto >
                                                                        {loading ? (<Loading type="points" color="currentColor" size="sm" />) : ("Pay Now ")}
                                                                    </Button>
                                                                    <hr />
                                                                </ListItem>

                                                            </>
                                                        }
                                                    </List>
                                                )}

                                                {
                                                    /*
                                                   extra details
                                                     */
                                                }
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={isSmallScreen ? 12 : 4}>
                                                        <List
                                                            sx={{ width: 'calc(100% - 10px)', bgcolor: 'background.paper' }}
                                                            subheader={isLoading ? <Skeleton sx={{ fontSize: "1.125rem", marginLeft: "10px", marginTop: "7px", maxWidth: 100 }} /> : <ListSubheader>Details</ListSubheader>}
                                                        >
                                                            {isLoading ? <Skeleton sx={{ fontSize: "3.125rem", marginLeft: "10px" }} /> :
                                                                <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                    <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary="User :" />

                                                                    <Badge enableShadow disableOutline color="primary">
                                                                        {details?.leadData?.clickId.user}
                                                                    </Badge>
                                                                </ListItem>}
                                                            {isLoading ? <Skeleton sx={{ fontSize: "3.125rem", marginLeft: "10px", }} /> :
                                                                <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                    <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary="Refer" />

                                                                    <Badge enableShadow disableOutline color="secondary">
                                                                        {details?.leadData?.clickId.refer}
                                                                    </Badge>
                                                                </ListItem>}
                                                            {isLoading ? <Skeleton sx={{ fontSize: "3.125rem", marginLeft: "10px", }} /> :
                                                                <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                    <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary="IP" />

                                                                    <Badge enableShadow disableOutline color="success">
                                                                        {details?.leadData?.clickId.ip}
                                                                    </Badge>
                                                                </ListItem>}
                                                            {isLoading ? <Skeleton sx={{ fontSize: "3.125rem", marginLeft: "10px", }} /> :
                                                                <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                    <ListItemText sx={{ marginBlock: "15px", fontSize: "2.125rem" }} primary="Time" />

                                                                    <Badge enableShadow disableOutline color="warning">
                                                                        {toDateTime(details?.leadData?.clickId.createdAt)}
                                                                    </Badge>
                                                                </ListItem>}


                                                        </List>
                                                    </Grid>
                                                    <Grid item xs={12} sm={isSmallScreen ? 12 : 4}>
                                                        <List
                                                            sx={{ width: 'calc(100% - 10px)', bgcolor: 'background.paper' }}
                                                            subheader={isLoading ? <Skeleton sx={{ fontSize: "1.125rem", marginLeft: "10px", marginTop: "7px", maxWidth: 100 }} /> : <ListSubheader>Params</ListSubheader>}
                                                        >
                                                            {isLoading ? (
                                                                <>
                                                                    <Skeleton sx={{ fontSize: '3.125rem', marginLeft: '10px' }} />
                                                                    <Skeleton sx={{ fontSize: '3.125rem', marginLeft: '10px' }} />
                                                                    <Skeleton sx={{ fontSize: '3.125rem', marginLeft: '10px' }} />
                                                                </>

                                                            ) : (
                                                                Object.entries(details?.leadData.clickId.params).map(([key, value]) => (
                                                                    <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }} key={key}>
                                                                        <ListItemText sx={{ marginBlock: '15px', fontSize: '2.125rem' }} primary={key} />
                                                                        <Badge enableShadow disableOutline color="primary">
                                                                            {value}
                                                                        </Badge>
                                                                    </ListItem>
                                                                ))
                                                            )}
                                                        </List>
                                                    </Grid>
                                                    <Grid item xs={12} sm={isSmallScreen ? 12 : 4}>
                                                        <List
                                                            sx={{ width: 'calc(100% - 10px)', bgcolor: 'background.paper' }}
                                                            subheader={isLoading ? <Skeleton sx={{ fontSize: "1.125rem", marginLeft: "10px", marginTop: "7px", maxWidth: 100 }} /> : <ListSubheader>Client</ListSubheader>}

                                                        >
                                                            {isLoading ? (
                                                                <>
                                                                    <Skeleton sx={{ fontSize: '3.125rem', marginLeft: '10px' }} />
                                                                    <Skeleton sx={{ fontSize: '3.125rem', marginLeft: '10px' }} />
                                                                    <Skeleton sx={{ fontSize: '3.125rem', marginLeft: '10px' }} />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                        <ListItemText sx={{ marginBlock: '15px', fontSize: '2.125rem' }} primary="OS Name" />

                                                                        <Badge enableShadow disableOutline color="primary">
                                                                            {details?.leadData.clickId.device?.os?.name}
                                                                        </Badge>

                                                                    </ListItem>
                                                                    <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                        <ListItemText sx={{ marginBlock: '15px', fontSize: '2.125rem' }} primary="Browser Name" />
                                                                        <Badge enableShadow disableOutline color='secondary'>
                                                                            {details?.leadData.clickId.device?.client?.name}
                                                                        </Badge>
                                                                    </ListItem>
                                                                    <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                        <ListItemText sx={{ marginBlock: '15px', fontSize: '2.125rem' }} primary="Device Type" />
                                                                        <Badge enableShadow disableOutline color="error">
                                                                            {details?.leadData.clickId.device?.device?.type}
                                                                        </Badge>
                                                                    </ListItem>
                                                                    <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                        <ListItemText sx={{ marginBlock: '15px', fontSize: '2.125rem' }} primary="Device" />
                                                                        <Badge enableShadow disableOutline color="warning">
                                                                            {details?.leadData.clickId.device?.device?.brand}  {details?.leadData.clickId.device?.device?.model}
                                                                        </Badge>
                                                                    </ListItem>

                                                                    <ListItem sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}>
                                                                        <Accordion sx={{ margin: "0px", boxShadow: 0 }}>
                                                                            <AccordionSummary
                                                                                expandIcon={<i className='bx bx-code-alt'></i>}
                                                                                aria-controls="panel1a-content"
                                                                                id="panel1a-header"
                                                                            >
                                                                                <Typography>View full details</Typography>
                                                                            </AccordionSummary>
                                                                            <AccordionDetails>
                                                                                <pre>
                                                                                    {showJson(details?.leadData.clickId.device)}
                                                                                </pre>
                                                                            </AccordionDetails>
                                                                        </Accordion>
                                                                    </ListItem>

                                                                </>
                                                            )}
                                                        </List>
                                                    </Grid>
                                                </Grid>
                                                <button onClick={() => setloading(!loading)}>
                                                    sfsf
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="content-backdrop fade"></div>
                        </div >
                    </div >
                </div >
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
