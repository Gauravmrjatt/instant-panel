import Script from 'next/script'
import MyNav from '../../components/Nav'
import Header from '../../components/Header'
import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';


export default function PostBack() {
    const [PostbackUrl, setPostbackUrl] = useState('loading...');
    const [PostbackKey, setPostbackKey] = useState('loading...');
    const [isChecked, setIsChecked] = useState(false);
    const textAreaRef = useRef(null);

    function copyToClipboard(e) {
        e.preventDefault();
        textAreaRef.current.select();
        document.execCommand('copy');
        e.target.focus();
        toast.success("Link Copied!")
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/js/main.js';
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    useEffect(() => {
        getKey()
        async function getKey() {
            const data = await axios.get("/get/postback")
            setPostbackUrl(data.data.url)
            setPostbackKey(data.data.key)
            return () => {
                setPostbackUrl("loading...")
                setPostbackKey("loading...")
            }
        }
    }, [])

    const updateKey = () => {
        return new Promise((resolve, reject) => {

            axios.post('/update/postback')
                .then((response) => {
                    const data = response.data;
                    if (data.status === true) {
                        setPostbackUrl(data.url)
                        setPostbackKey(data.key)
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

    const resetPostKey = (e) => {
        e.preventDefault();
        if (!isChecked) {
            return toast.error("Please check the checkbox")
        }
        toast.promise(
            updateKey(),
            {
                loading: 'Changing key....',
                success: 'Successfully changed!',
                error: (error) => error
            }
        );
    }
    return (
        <>
            <Head>
                <title>PostBack</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">

                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Dashboard /</span> PostBack</h4>

                                <div className="row">
                                    <div className="col-md-12">

                                        <div className="card mb-4">
                                            <h5 className="card-header">PostBack</h5>


                                            <hr className="my-0" />
                                            <div className="card-body">
                                                <form id="formAccountSettings" >
                                                    <div className="row">
                                                        <div className="mb-3 col-md-6">
                                                            <label htmlFor="postback-url" className="form-label">Postback Url</label>
                                                            <input ref={textAreaRef} readOnly className="form-control" type="text" id="postback-url" name="firstName" value={PostbackUrl} autoFocus="" />
                                                        </div>
                                                        <div className="mb-3 col-md-6">
                                                            <label htmlFor="postback-key" className="form-label">Postback Key</label>
                                                            <input readOnly className="form-control" type="text" id="postback-key" name="firstName" value={PostbackKey} />
                                                        </div>
                                                    </div>

                                                    <div className="mt-2">
                                                        <button onClick={copyToClipboard} className="btn btn-primary me-2">Copy</button>
                                                        <button type="reset" className="btn btn-outline-secondary">Cancel</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                        <div className="card">
                                            <h5 className="card-header">Reset Postback Key</h5>
                                            <div className="card-body">
                                                <div className="mb-3 col-12 mb-0">
                                                    <div className="alert alert-warning">
                                                        <h6 className="alert-heading fw-bold mb-1">Are you sure you want to change your postback key?</h6>
                                                        <p className="mb-0">Once you change your postback key, you need to update your url in your panel</p>
                                                    </div>
                                                </div>
                                                <form id="formAccountDeactivation">
                                                    <div className="form-check mb-3">
                                                        <input className="form-check-input" type="checkbox" name="accountActivation" defaultChecked={isChecked} onClick={() => setIsChecked(!isChecked)} id="accountActivation" />
                                                        <label className="form-check-label" htmlFor="accountActivation" >I confirm change my account postback key</label>
                                                    </div>
                                                    <button onClick={resetPostKey} className="btn btn-danger deactivate-account">Reset Postback Key</button>
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
            <Toaster
                position="bottom-right"
                reverseOrder={false}
            />
            <Script src="/assets/js/dashboards-analytics.js"></Script>

        </>
    )
}

