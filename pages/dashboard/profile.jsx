
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
import { User } from "@nextui-org/react";

export default function Profile() {
    const [phone, setphone] = useState();
    const [name, setname] = useState();
    const [userName, setuserName] = useState();
    const [userId, setuserId] = useState();
    const [PostbackToken, setPostbackToken] = useState();
    const [email, setemail] = useState();
    const [userType, setuserType] = useState();
    const [userStatus, setuserStatus] = useState();
    const [createdAt, setcreatedAt] = useState();
    const [updatedAt, setupdatedAt] = useState();
    const [premiumExpireDate, setpremiumExpireDate] = useState();
    const [pic, setPic] = useState("/assets/avatars/2fe36341-fe92-4e90-bfe3-d10998e35cf2-rs.png")
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);

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

    useEffect(() => {
        const getData = async () => {
            const loader = toast.loading("getting data")
            try {
                const res = await axios.get("/get/user")
                const data = res.data
                if (data.status === true) {
                    setphone(data.phone)
                    setname(data.name)
                    setuserName(data.userName)
                    setuserId(data.userId)
                    setPostbackToken(data.PostbackToken)
                    setemail(data.email)
                    setuserType(data.userType)
                    setuserStatus(data.userStatus)
                    setPic(data.profileImg)
                    const createdAt = new Date(data.createdAt);
                    const premiumExpireDate = new Date(data.premiumExpireDate);

                    const createdAtString = createdAt.toISOString().slice(0, 16);
                    const premiumExpireDateString = premiumExpireDate.toISOString().slice(0, 16);
                    setcreatedAt(createdAtString)
                    setpremiumExpireDate(premiumExpireDateString)
                } else {
                    toast.error(data.message)
                }
                toast.dismiss(loader.id)

            } catch (error) {
                toast.error("something went wrong")
            }
        }
        getData()
    }, [])


    const handleSubmit = () => {
        const loader = toast.loading("saving...")
        const formData = new FormData();
        formData.append('profileImg', file);
        fetch('/upload/user-profile', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                toast.dismiss(loader.id)
                toast.success("saved")
                if (data.status === true) {
                    setPic(data.profileImg)
                }
            })
            .catch(error => {
                toast.dismiss(loader.id)
                console.error(error);
            });
    };

    function handelNameChange(event) {
        setname(event.target.value)
    }



    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };


    return (
        <>
            <Head>
                <title>Profile</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">

                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">

                            <div className="container-xxl flex-grow-1 container-p-y">
                                <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Dashboard /</span> Profile</h4>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="card mb-4">
                                            <h5 className="card-header">Profile Details</h5>
                                            <div className="card-body">
                                                <div className="d-flex align-items-start align-items-sm-center gap-4">
                                                    <User squared size="xl" src={pic} className="w-px-40 h-auto rounded-circle" />
                                                    <div className="button-wrapper">
                                                        <label htmlFor="upload" className="btn btn-primary me-2 mb-4" tabIndex="0">
                                                            <span className="d-none d-sm-block">Upload new photo</span>
                                                            <i className="bx bx-upload d-block d-sm-none"></i>
                                                            <input ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} type="file" id="upload" className="account-file-input" hidden="" accept="image/png, image/jpeg" />
                                                        </label>
                                                        <button onClick={() => handleSubmit()} type="submit" className="btn btn-outline-secondary account-image-reset mb-4" >
                                                            <i className="bx bx-reset d-block d-sm-none"></i>
                                                            <span className="d-none d-sm-block">Change</span>
                                                        </button>
                                                        <p className="text-muted mb-0">Allowed JPG, GIF or PNG. Max size of 800K</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr className="my-0" />
                                            <div className="card-body">
                                                <form id="formAccountSettings" method="POST" onSubmit="return false">
                                                    <div className="row">
                                                        <div className="mb-3 col-md-6">
                                                            <label htmlFor="firstName" className="form-label">Name</label>
                                                            <input onChange={handelNameChange} className="form-control" type="text" id="firstName" name="firstName" value={name} autoFocus readOnly />
                                                        </div>
                                                        <div className="mb-3 col-md-6">
                                                            <label className="form-label" htmlFor="phoneNumber">Phone</label>
                                                            <div className="input-group input-group-merge">
                                                                <span className="input-group-text">IN (+91)</span>
                                                                <input type="text" id="phoneNumber" name="phoneNumber" className="form-control" placeholder="9876543210" value={phone} readOnly />
                                                            </div>
                                                        </div>
                                                        <div className="mb-3 col-md-6">
                                                            <label htmlFor="lastName" className="form-label">UserName</label>
                                                            <input className="form-control" type="text" name="lastName" id="lastName" value={userName} readOnly />
                                                        </div>
                                                        <div className="mb-3 col-md-6">
                                                            <label htmlFor="email" className="form-label">E-mail</label>
                                                            <input className="form-control" type="text" id="email" name="email" value={email} readOnly />
                                                        </div>
                                                        <div className="mb-3 col-md-6">
                                                            <label htmlFor="postback" className="form-label">PostbackToken</label>
                                                            <input className="form-control" type="text" id="postback" name="postback" value={PostbackToken} readOnly />
                                                        </div>
                                                        <div className="mb-3 col-md-6">
                                                            <label htmlFor="organization" className="form-label">userId</label>
                                                            <input type="text" className="form-control" id="organization" name="organization" value={userId} readOnly />
                                                        </div>
                                                        <div className="mb-3 col-md-6">
                                                            <label htmlFor="address" className="form-label">userType</label>
                                                            <input type="text" className="form-control" id="address" name="address" placeholder="Address" value={userType} readOnly />
                                                        </div>
                                                        <div className="mb-3 col-md-6">
                                                            <label htmlFor="state" className="form-label">userStatus</label>
                                                            <input className="form-control" type="text" id="state" name="state" value={userStatus} placeholder="California" readOnly />
                                                        </div>
                                                        <div className="mb-3 col-md-6">
                                                            <label htmlFor="zipCode" className="form-label">Registred at</label>
                                                            <input type="datetime-local" className="form-control" id="zipCode" name="zipCode" readOnly value={createdAt} />
                                                        </div>

                                                        <div className="mb-3 col-md-6">
                                                            <label htmlFor="premium" className="form-label">premium Expire Date</label>
                                                            <input type="datetime-local" className="form-control" id="premium" name="premium" readOnly value={premiumExpireDate} />
                                                        </div>

                                                    </div>
                                                    {/* <div className="mt-2">
                                                        <button type="submit" className="btn btn-primary me-2" >Save changes</button>
                                                        <button type="reset" className="btn btn-outline-secondary" >Cancel</button>
                                                    </div> */}
                                                </form>
                                            </div>

                                        </div>
                                        {/* <div className="card">
                                            <h5 className="card-header">Delete Account</h5>
                                            <div className="card-body">
                                                <div className="mb-3 col-12 mb-0">
                                                    <div className="alert alert-warning">
                                                        <h6 className="alert-heading fw-bold mb-1">Are you sure you want to delete your account?</h6>
                                                        <p className="mb-0">Once you delete your account, there is no going back. Please be certain.</p>
                                                    </div>
                                                </div>
                                                <form id="formAccountDeactivation" onSubmit="return false">
                                                    <div className="form-check mb-3">
                                                        <input className="form-check-input" type="checkbox" name="accountActivation" id="accountActivation" />
                                                        <label className="form-check-label" htmlFor="accountActivation">I confirm my account deactivation</label>
                                                    </div>
                                                    <button type="submit" className="btn btn-danger deactivate-account" >Deactivate Account</button>
                                                </form>
                                            </div>
                                        </div> */}
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
                position="bottom-right"
                reverseOrder={false}
            />
            <Script src="/assets/js/dashboards-analytics.js"></Script>

        </>
    )
}

