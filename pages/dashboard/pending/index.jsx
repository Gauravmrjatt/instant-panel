import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, styled } from '@mui/material/styles';
import Script from 'next/script';
import MyNav from '../../../components/Nav';
import Header from '../../../components/Header';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function CustomAmount() {
    const router = useRouter()
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const loading = open && options.length === 0;
    const [customDetails, setCustomDetails] = useState({
        name: '',
        camp: '',
        event: '',
        number: '',
        referAmount: '',
        userAmount: '',
        referComment: '',
        userComment: ''
    })
    useEffect(() => {
        let active = true;

        if (!loading) {
            return undefined;
        }

        (async () => {
            if (active) {
                try {
                    const { data } = await axios.get('/get/campaign');
                    setOptions(data.data);
                } catch (error) {
                    console.error(error);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, [loading]);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/js/main.js';
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const CssTextField = styled(TextField)({
        '& label.Mui-focused': {
            color: '#A0AAB4',
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: '#8a2bdf',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#E0E3E7',
                borderRadius: "10px",
                border: '2px solid #E0E3E7'
            },
            '&:hover fieldset': {
                borderColor: '#B2BAC2',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#6F7E8C',
            },
        },
    });
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
                                    <span className="text-muted fw-light">Dashboard /</span> Pending Amount
                                </h4>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="card mb-4">
                                            <h5 className="card-header">Pending Amount</h5>
                                            <hr className="my-0" />
                                            <div className="card-body">
                                                <form id="formAccountSettings">
                                                    <div style={{ marginBottom: '30px' }} className="row">
                                                        <div className="">
                                                            <label htmlFor="postback-url" className="form-label">
                                                                SELECT CAMPAIGN
                                                            </label>
                                                            <Autocomplete
                                                                id="asynchronous-camp"
                                                                open={open}
                                                                onOpen={() => setOpen(true)}
                                                                onClose={() => setOpen(false)}
                                                                onChange={(event, newValue) => {
                                                                    router.push("/dashboard/pending/" + newValue._id)
                                                                }}
                                                                isOptionEqualToValue={(option, value) => option.name === value.name}
                                                                getOptionLabel={(option) => option.name}
                                                                options={options}
                                                                loading={loading}
                                                                renderInput={(params) => (
                                                                    <CssTextField
                                                                        sx={{ marginTop: '10px' }}
                                                                        color="secondary"
                                                                        {...params}
                                                                        value={customDetails.name}
                                                                        label="Campaign Name"
                                                                        InputProps={{
                                                                            ...params.InputProps,
                                                                            endAdornment: (
                                                                                <>
                                                                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                                                    {params.InputProps.endAdornment}
                                                                                </>
                                                                            ),
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </form>
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
