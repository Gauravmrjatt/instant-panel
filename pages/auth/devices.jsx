import Script from "next/script";
import MyNav from "../../components/Nav";
import Header from "../../components/Header";
import Head from "next/head";
import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import myDetails from "../myDetails.json" assert { type: "json" };
import Link from "next/link";
import { useRouter } from "next/router";
import { Card, Grid, Text, Button, Row } from "@nextui-org/react";

export default function LoginSessions() {
    const [logins, setLogins] = useState([]);
    const [getChange, setChange] = useState('');
    const router = useRouter();
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/js/main.js';
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    async function logout(loginToken) {
        toast.promise(
            new Promise((resolve, reject) => {
                axios.get('/logout/' + loginToken + "?devices=true")
                    .then((response) => {
                        const data = response.data;
                        if (data.status === true) {
                            setChange(loginToken)
                            return resolve(data)
                        } else {
                            return reject(data)
                        }
                    })
                    .catch((error) => {
                        return reject('This is an error "' + error + '"!')
                    });
            }),
            {
                loading: 'deteting....',
                success: 'Successfully deleted!',
                error: (error) => error
            }
        );
    }


    useEffect(() => {
        const getData = async () => {
            const loader = toast.loading("getting data");
            try {
                const { data } = await axios.get("/get/logins");
                if (data.status === true) {
                    setLogins(data.logins);
                    toast.dismiss(loader.id);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error("something went wrong");
            }
        };
        getData();
    }, [], [getChange]);

    return (
        <>
            <Head>
                <title>Login Devices</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">
                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4">
                                    <Link href='/dashboard' className="text-muted fw-light">Dashboard /</Link> Login Devices
                                </h4>
                                <Grid.Container gap={3}>
                                    {logins.map((login) => (
                                        <Grid xs={12} sm={6} md={4} key={login._id}>
                                            <Card shadow>

                                                <Card.Header>{login.device.os.name} </Card.Header>
                                                <Card.Body>
                                                    <Text h5>{login.device.client.name}</Text>
                                                    <Text p>
                                                        Device :  {(login.device.device.brand) ? login.device.device.brand + " " + login.device.device.model : "unknown"}
                                                    </Text>
                                                    <Text p>
                                                        IP :  {login.ip}
                                                    </Text>
                                                    <Text p>Login at : {new Date(login.createdAt).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                        hour12: true
                                                    })}</Text>
                                                    <Button onClick={() => logout(login.token)} color='error'>Delete Session</Button>
                                                </Card.Body>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid.Container>
                            </div>
                            <div className="content-backdrop fade"></div>
                        </div>
                    </div>
                </div>

                <div className="layout-overlay layout-menu-toggle"></div>
            </div>
            <Toaster position="bottom-right" reverseOrder={false} />
            <Script src="/assets/js/dashboards-analytics.js" defer></Script>
        </>
    );
}
