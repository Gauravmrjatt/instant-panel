import Link from 'next/link'
import Head from 'next/head'
import myDetails from '../myDetails.json' assert {type: 'json'};
import { useState } from 'react';
import axios from 'axios'
import NProgress from 'nprogress';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router'
import Script from "next/script";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };
    const router = useRouter()

    async function handleSubmit(event) {
        event.preventDefault();
        const handleLogin = () => {
            return new Promise((resolve, reject) => {
                NProgress.start();
                axios.post('/auth/login', { email, password })
                    .then((response) => {
                        NProgress.done();
                        const data = response.data;
                        if (data.status === true) {
                            setTimeout(() => { router.push("/dashboard") }, 500)

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
            handleLogin(),
            {
                loading: 'Logging in...',
                success: 'Successfully logged in!',
                error: (error) => error
            }
        );

    }


    return (
        <>
            <Head>
                <title>{`Login - ${myDetails.name}`}</title>
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
                                <h4 className="mb-2">Welcome to {myDetails.name}</h4>
                                <p className="mb-4">Please sign-in to your account and start the adventure</p>

                                <form onSubmit={handleSubmit} id="formAuthentication" className="mb-3" method="POST">
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email or Username</label>
                                        <input
                                            required
                                            className="form-control"
                                            id="email"
                                            name="email-username"
                                            placeholder="Enter your email or username"
                                            autoFocus
                                            type="email" value={email} onChange={handleEmailChange}
                                        />
                                    </div>
                                    <div className="mb-3 form-password-toggle">
                                        <div className="d-flex justify-content-between">
                                            <label className="form-label" htmlFor="password">Password</label>
                                            <Link href='forget'>
                                                <small>Forgot Password?</small>
                                            </Link>
                                        </div>
                                        <div className="input-group input-group-merge">
                                            <input
                                                id="password"
                                                className="form-control"
                                                name="password"
                                                placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                                                aria-describedby="password"
                                                required
                                                type="password" value={password} onChange={handlePasswordChange}
                                            />
                                            <span className="input-group-text cursor-pointer"><i className="bx bx-hide"></i></span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="remember-me" />
                                            <label className="form-check-label" htmlFor="remember-me"> Remember Me </label>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <button className="btn btn-primary d-grid w-100" type="submit">Sign in</button>
                                    </div>
                                </form>

                                <p className="text-center">
                                    <span>New on our platform?</span>
                                    <Link href="register">
                                        <span> Create an account</span>
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