import Link from 'next/link'
import myDetails from '../myDetails.json' assert {type: 'json'};
import Head from 'next/head'
import { useState } from 'react';
import { useRouter } from 'next/router'
import axios from 'axios'
import NProgress from 'nprogress';
import toast, { Toaster } from 'react-hot-toast';
import Script from "next/script";

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [passwordConfirm, setpasswordConfirm] = useState('');

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };
    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };
    const handlePasswordConfirmChange = (event) => {
        setpasswordConfirm(event.target.value);
    };
    const handleUserNameChange = (event) => {
        setUsername(event.target.value);
    };
    const handlePhoneChange = (event) => {
        setPhone(event.target.value);
    };

    const router = useRouter()

    async function handleSubmit(event) {
        event.preventDefault();
        if (password != passwordConfirm) {
            return toast.error("Password doesn't match")
        }
        if (!email || !password || !userName || !phone) {
            return toast.error("All fealds are required")
        }
        if (/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
        } else {
            return toast.error("Enter Gmail only")
        }
        if (phone.length != 10) {
            return toast.error("Invalid Phone Number")
        }

        const handleRegister = () => {
            return new Promise((resolve, reject) => {
                NProgress.start();
                axios.post('/auth/register', { email, password, username: userName, phone })
                    .then((response) => {
                        NProgress.done();
                        const data = response.data;
                        if (data.status === true) {
                            setTimeout(() => { router.push("/dashboard") }, 3000)

                            return resolve(data.msg)

                        } else {
                            return reject(data.msg)
                        }
                    })
                    .catch((error) => {
                        NProgress.done();
                        return reject('This is an error "' + error + '"!')
                    });
            })

        }
        toast.promise(
            handleRegister(),
            {
                loading: 'Creating account...',
                success: 'Successfully logged in!',
                error: (error) => error
            }
        );

    }

    return (
        <>

            <Head>
                <title>{`Register - ${myDetails.name}`}</title>
            </Head>
            <div className="container-xxl">
                <div className="authentication-wrapper authentication-basic container-p-y">
                    <div className="authentication-inner">
                        <div className="card">
                            <div className="card-body">
                                <div className="app-brand justify-content-center">
                                    <Link href="/" className="app-brand-link gap-2">
                                        <span className="app-brand-logo demo">
                                        </span>
                                        <span className="app-brand-text demo text-body fw-bolder">{myDetails.name}</span>
                                    </Link>
                                </div>
                                <h4 className="mb-2">Adventure starts here 🚀</h4>
                                <p className="mb-4">Make your tracking management easy and fun!</p>

                                <form onSubmit={handleSubmit} id="formAuthentication" className="mb-3" method="POST">
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            name="username"
                                            placeholder="Enter your username"
                                            autoFocus
                                            onChange={handleUserNameChange}
                                            value={userName}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            onChange={handleEmailChange}
                                            type="text"
                                            className="form-control"
                                            id="email" name="email"
                                            placeholder="Enter your email"
                                            value={email}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="phone" className="form-label">Phone</label>
                                        <input
                                            onChange={handlePhoneChange}
                                            type="number"
                                            className="form-control"
                                            id="phone" name="email"
                                            placeholder="Phone number"
                                            value={phone}
                                        />
                                    </div>
                                    <div className="mb-3 form-password-toggle">
                                        <label className="form-label" htmlFor="password">Password</label>
                                        <div className="input-group input-group-merge">
                                            <input
                                                type="password"
                                                id="password"
                                                className="form-control"
                                                name="password"
                                                placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                                                aria-describedby="password"
                                                onChange={handlePasswordChange}
                                                value={password}
                                            />
                                            <span id="show-password-btn" className="input-group-text cursor-pointer"><i className="bx bx-hide"></i></span>
                                        </div>
                                    </div>
                                    <div className="mb-3 form-password-toggle">
                                        <label className="form-label" htmlFor="password-confirm">Password</label>
                                        <div className="input-group input-group-merge">
                                            <input
                                                type="password"
                                                id="password-confirm"
                                                className="form-control"
                                                name="password"
                                                placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                                                aria-describedby="password"
                                                onChange={handlePasswordConfirmChange}
                                                value={passwordConfirm}
                                            />
                                            <span id="show-password-btn" className="input-group-text cursor-pointer"><i className="bx bx-hide"></i></span>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="terms-conditions" name="terms" />
                                            <label className="form-check-label" htmlFor="terms-conditions">
                                                I agree to
                                                <Link href=""> privacy policy & terms</Link>
                                            </label>
                                        </div>
                                    </div>
                                    <button id='submit-btn' className="btn btn-primary d-grid w-100">Sign up</button>
                                </form>

                                <p className="text-center">
                                    <span>Already have an account?</span>
                                    <Link href="login">
                                        <span> Sign in instead</span>
                                    </Link>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <Toaster
                position="bottom-right"
                reverseOrder={false}
            />
            <Script
                src="/js/password.js"
                onReady={() => initPasswordToggle()}
            />
        </>
    )
}