import Script from 'next/script'
import Head from 'next/head'
import myDetails from './myDetails.json' assert {type: 'json'};
import users from '../server/assets/users.json' assert {type: 'json'};
import '@splidejs/splide/css';
import Splide from '@splidejs/splide';
import { useEffect } from 'react';
import Link from 'next/link';
import HomeHeader from "../components/HomeHeader"
import Footer from '../components/Footer'
export default function Pricing() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const splide = new Splide('.splide', {
                type: 'loop',
                focus: 'center',
                autoWidth: true,
                margin: '10px',
                autoScroll: {
                    speed: 1,
                },
            });
            splide.mount();
        }

    }, []);

    return (
        <>
            <Head>
                <title>Pricing</title>
            </Head>
            <HomeHeader />
            <div className='divider-box'></div>
            <h2 id='page-details'>{myDetails.name} Platform Pricing</h2>
            <div className="container pricing-box p-32">
                <div className="row">
                    <div className="col-sm-4  col-md-12 col-lg-4">
                        <div className="pricing_inner pricing_pink_bg px-32 py-24">
                            <div className="row tab-center">
                                <div className="col-sm-12 col-md-8 col-lg-12">
                                    <div className="pricing_content">
                                        <h5 className="semi text-pink">Small</h5>
                                        <p className="text-charcoal700 pricing-text"><b className="d-block pb-8">For Individuals</b></p>
                                    </div>
                                    <div className="price h3 semi mb-8 text1 manual_price" style={{ display: "none" }}><sup className="h6 medium">$</sup></div>
                                    <div className="price h3 semi mb-8 text1 annual_price" style={{ display: 'block' }}><sup className="h6 medium">₹</sup>199</div>
                                    <p className="pricing-text mb-24 pricing-mobile"> <span className="semi "></span>
                                        <ul className='pricinglist' style={{ display: "block" }}>
                                            <li>Valid for 1 month</li>
                                            <li>Unlimited Number of Clicks</li>
                                            <li><strike>Unlimited</strike> 2500 + 50 Leads</li>
                                            <li>24/7 Support</li>
                                            <li>Full Premium Services Unlocked</li>
                                        </ul>
                                    </p>
                                </div>
                                <div className="col-sm-12 col-md-4 col-lg-12">
                                    <Link href="/auth/register?plan=small" className="btn btn-lg btn-outline-blue py-8 pricing-btn" data-hs-event-107968771="1">Get Started</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-4 col-md-12 col-lg-4">
                        <div className="pricing_inner  pricing_yellow_bg px-24 py-24">
                            <div className="row row tab-center">
                                <div className="col-sm-12 col-md-8 col-lg-12">
                                    <div className="pricing_content">
                                        <h5 className="semi text-earth">Pro</h5>
                                        <p className="text-charcoal700  pricing-text mb-8"><b className="d-block pb-8">For Professional</b></p>
                                    </div>
                                    <div className="price h3 semi mb-8 text1 " style={{ display: 'block' }}><sup className="h6 medium">₹</sup>499<span className="h6 decimal"></span></div>
                                    <p className="pricing-text mb-24 pricing-mobile"> <span className="semi "></span>
                                        <ul className='pricinglist' style={{ display: "block" }}>
                                            <li>Valid for 1 month</li>
                                            <li>Unlimited Number of Clicks</li>
                                            <li><strike>Unlimited</strike> 5000 + 100 free Leads</li>
                                            <li>24/7 Support</li>
                                            <li>Full Premium Services Unlocked</li>
                                        </ul>
                                    </p>
                                </div>
                                <div className="col-sm-12 col-md-4 col-lg-12">
                                    <Link href="/auth/register?plan=pro" className="btn btn-lg btn-outline-blue py-8 pricing-btn" data-hs-event-107968771="1">Get Started</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-4 col-md-12 col-lg-4">
                        <div className="pricing_inner pricing_blue_bg px-32 py-24">
                            <div className="row tab-center">
                                <div className="col-sm-12 col-md-8 col-lg-12">
                                    <div className="pricing_content">
                                        <h5 className="semi text-blue enterprice">Ultimate</h5>
                                        <p className="text-charcoal700  pricing-text"><b className="d-block pb-8">For Businesses</b></p>
                                    </div>
                                    <div className="price h3 semi mb-8 text1 " style={{ display: 'block' }}><sup className="h6 medium">₹</sup>999<span className="h6 decimal"></span></div>
                                    <p className="pricing-text mb-24 pricing-mobile"> <span className="semi "></span>
                                        <ul className='pricinglist' style={{ display: "block" }}>
                                            <li>Valid for 1 month</li>
                                            <li>Unlimited Number of Clicks</li>
                                            <li><b>Unlimited</b>  Leads</li>
                                            <li>24/7 Support</li>
                                            <li>Full Premium Services Unlocked</li>
                                        </ul>
                                    </p>
                                </div>
                                <div className="col-sm-12 col-md-4 col-lg-12">
                                    <Link href="/auth/register?plan=ultimate" className="btn btn-lg btn-blue py-8 pricing-btn" style={{ color: "white", background: "#0565ff" }} data-hs-event-107968771="1">Get Started</Link>
                                </div>

                            </div>
                        </div>
                    </div>
                </div >

            </div>
            <h3 style={{ textAlign: "center", marginBlock: "50px", color: "#000" }}>Here&apos; s what customers are saying</h3>
            {/* {JSON.stringify(users)} */}

            <div class="splide" role="group" aria-label="Splide Basic HTML Example">
                <div class="splide__track">
                    <ul class="splide__list">
                        {users.users.map(user => (
                            <li key={user.name} class="splide__slide">
                                <div className="whatusersays">
                                    <div style={{ display: "flex", gap: "10px", alignItems: "center", alignContent: "center", marginInline: "auto", marginBottom: "20px", justifyContent: "center" }} className='logo-container'>
                                        <Link style={{ display: "flex", gap: "10px", alignItems: "center", alignContent: "center", marginInline: "auto", marginBottom: "20px", justifyContent: "center" }} href={user.link}>
                                            <img style={{ height: "30px", width: "30px", borderRadius: "40px" }} src={user.img} />
                                            <h5 style={{ margin: "0px", color: "#000" }}>{user.by}</h5>
                                        </Link>
                                    </div>
                                    <div>
                                        <p>&quot;{user.desc}&quot;</p>
                                        <p style={{ fontWeight: "bolder", textAlign: 'right' }}>- {user.name}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <h3 style={{ color: "#000", "textAlign": "center", marginBlock: "50px" }}>The #1 Trusted Platform  for Campaign</h3>
            <Footer />
            <Script src="/assets/js/dashboards-analytics.js"></Script>
        </>
    )
}

