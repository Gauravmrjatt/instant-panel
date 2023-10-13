import Link from 'next/link'
import myDetails from '../../myDetails.json' assert {type: 'json'};
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios'
import Script from 'next/script'

export default function Reset(props) {
    console.log(props);
    const isValid = props.data.isVal.status
    const whyInvalid = props.data.isVal.msg
    const router = useRouter()
    const id = router.query.id;
    const [password, setPassword] = useState('');
    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };
    async function handleSubmit(event) {
        event.preventDefault();
        const handleReset = () => {
            return new Promise((resolve, reject) => {
                axios.post('/auth/reset/' + id, { password })
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
        toast.promise(
            handleReset(),
            {
                loading: 'Reseting password...',
                success: 'Password reset successfully',
                error: (error) => error
            }
        );

    }

    return (
        <>
            <Head>
                <title>{`Reset Password - ${myDetails.name}`}</title>
            </Head>
            <div className="container-xxl">
                {isValid ? (<div className="authentication-wrapper authentication-basic container-p-y">
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
                                <h4 className="mb-2">Reset Password? 🔒</h4>
                                <p className="mb-4">Enter your new password to reset your password</p>
                                <form onSubmit={handleSubmit} id="formAuthentication" className="mb-3" method="POST">
                                    <div className="mb-3 form-password-toggle">
                                        <div className="d-flex justify-content-between">
                                            <label className="form-label" htmlFor="password">Password</label>
                                            <Link href='/auth/forget'>
                                                <small>Try Again?</small>
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
                                    <button className="btn btn-primary d-grid w-100">Reset Password</button>
                                </form>
                                <div className="text-center">
                                    <Link href="/auth/login" className="d-flex align-items-center justify-content-center">
                                        <i className="bx bx-chevron-left scaleX-n1-rtl bx-sm"></i>
                                        Back to login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Script
                        src="/js/password.js"
                        onReady={() => initPasswordToggle()}
                    />
                    <Toaster
                        position="bottom-right"
                        reverseOrder={false}
                    />
                </div>

                ) : (<div className="authentication-wrapper authentication-basic container-p-y">
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
                                <center> <i
                                    className="bx bxs-error-circle mb-3"
                                    style={{ fontSize: "102px", color: "red", marginInline: "auto" }}
                                ></i>
                                    <h4 className="mb-2">{whyInvalid}</h4>
                                </center>

                                <button onClick={() => router.push("/auth/forget")} className="btn btn-primary d-grid w-100 mb-5 mt-5">Try again</button>

                                <div className="text-center mt-2">
                                    <Link href="/auth/login" className="d-flex align-items-center justify-content-center">
                                        <i className="bx bx-chevron-left scaleX-n1-rtl bx-sm"></i>
                                        Back to login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>)}
            </div>

        </>
    );
}

export async function getServerSideProps(ctx) {
    const { id } = ctx.query
    const url = `https://nextpower.cashinmedia.in/auth/reset/check/${id}`;
    const res = await axios.get(url)
    const isVal = res.data;
    return {
        props: {
            data: { isVal }
        }
    }
}
