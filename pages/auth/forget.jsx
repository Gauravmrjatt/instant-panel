import Link from 'next/link'
import myDetails from '../myDetails.json' assert {type: 'json'};
import Head from 'next/head'
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios'
export default function Forget() {
    const [email, setEmail] = useState('');

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };
    async function handleSubmit(event) {
        event.preventDefault();
        const handleForget = () => {
            return new Promise((resolve, reject) => {

                axios.post(`/auth/forget`, { email })
                    .then((response) => {

                        const data = response.data;
                        if (data.status === true) {
                            return resolve(data.msg)
                        } else {
                            return reject(data.msg)
                        }
                    })
                    .catch((error) => {

                        return reject(`This is an error "` + error + `"!`)
                    });
            })

        }
        toast.promise(
            handleForget(),
            {
                loading: `Sending mail...`,
                success: `Successfully sent!`,
                error: (error) => error
            }
        );

    }


    return (
        <>
            <Head>
                <title>{`Forget Password - ${myDetails.name}`}</title>
            </Head>
            <div className="container-xxl">
                <div className="authentication-wrapper authentication-basic container-p-y">
                    <div className="authentication-inner py-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="app-brand justify-content-center">
                                    <Link href="/" className="app-brand-link gap-2">
                                        <span className="app-brand-logo demo">

                                        </span>
                                        <span className="app-brand-text demo text-body fw-bolder">{myDetails.name}</span>
                                    </Link>
                                </div>
                                <h4 className="mb-2">Forgot Password? 🔒</h4>
                                <p className="mb-4">Enter your email and we&apos;ll send you instructions to reset your password</p>
                                <form onSubmit={handleSubmit} id="formAuthentication" className="mb-3" method="POST">
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            autoFocus
                                            required
                                            value={email}
                                            onChange={handleEmailChange}
                                        />
                                    </div>
                                    <button className="btn btn-primary d-grid w-100">Send Reset Link</button>
                                </form>
                                <div className="text-center">
                                    <Link href="login" className="d-flex align-items-center justify-content-center">
                                        <i className="bx bx-chevron-left scaleX-n1-rtl bx-sm"></i>
                                        Back to login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster
                reverseOrder={false}
            />
        </>
    );
}