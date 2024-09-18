import HomeHeader from "../components/HomeHeader"
import { Badge, Grid, Collapse, Text } from "@nextui-org/react";
import users from '../server/assets/users.json' assert {type: 'json'};
import '@splidejs/splide/css';
import Splide from '@splidejs/splide';
import { useEffect } from 'react';
import Link from 'next/link';
import Head from "next/head";
import 'dotenv/config'
export default function Home() {
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

  return (<>
    <Head>
      <title>
        Home
      </title>
    </Head>
    <HomeHeader />
    {/* main */}
    <div className="full-height">
      <h1 style={{ color: "#000", textAlign: "center", margin: "auto" }}>
        The only enterprise platform built <br />
        <span class="d-block hero-title blue-pink-txt-gradient medium span"> for  Campaign Makers</span>
        <div className="col-sm-12 col-md-4 col-lg-12 home-button">
          <Link href="/auth/login" className="btn btn-lg btn-blue py-8 pricing-btn" style={{ color: "white", background: "#0565ff" }} >Get Started</Link>
        </div>
        <h4 style={{ marginTop: "50px", fontWeight: "lighter" }}>Trusted by customers in India </h4>
      </h1>
    </div>

    {/* features  */}
    <div style={{ background: "#000", display: "flex", flexDirection: "column", paddingBottom: "100px" }} className="full-height">
      <h3 className="span" style={{ marginTop: "30px", color: "#ccdaff", fontWeight: "100" }}><span style={{ fontWeight: "100" }}>Features you love</span></h3>
      <div class="container">
        <div class="home-row">
          <div class="flex-box">
            <div style={{ background: "rgb(18, 18, 18)", padding: "10px" }} class="card">
              <Badge color="success" variant="flat">
                Secure
              </Badge>
              <h3 style={{ color: "#fff", marginTop: "20px" }}>Seamless and Secure Experience</h3>
              <h5>
                Leading security solutions for total peace of mind. Protect your data now.
              </h5>
            </div>
          </div>
          <div class="flex-box">
            <div style={{ background: "rgb(18, 18, 18)", padding: "10px" }} class="card">
              <Badge color="primary" variant="flat">
                Features
              </Badge>
              <h3 style={{ color: "#fff", marginTop: "20px" }}>Feature Rich Solutions</h3>
              <h5>
                Sophisticated. High-performance. Proven. Dynamic. Agile. Intuitive. Optimized. Secure. Feature-packed. Futuristic              </h5>
            </div>
          </div>
          <div class="flex-box">
            <div style={{ background: "rgb(18, 18, 18)", padding: "10px" }} class="card">
              <Badge color='secondary' variant="flat">
                Support
              </Badge>
              <h3 style={{ color: "#fff", marginTop: "20px" }}>Customer Support</h3>
              <h5>
                Our dedicated support team is here to assist you every step of the way. Reach out for prompt and reliable help with any inquiries or issues. Your satisfaction is our priority.</h5>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* FnQ */}
    <h3 className="span" style={{ background: "#fff", marginBottom: "0", paddingTop: "30px", textAlign: 'center' }}>Frequently Asked Questions</h3>
    <div style={{ display: 'flex', flexDirection: "row", justifyContent: "space-evenly", gap: "15px", padding: "20px" }} className="full-height" id="faq">

      <div className="serprator">
        <Collapse
          css={{ backgroundColor: "#fffff" }}
          bordered
          expanded
          shadow
          title="What is the Instant Payment Panel?"
        >
          <Text>
            The Instant Payment Panel is a user-friendly platform that facilitates quick and secure payment processing. It empowers campaign makers to receive instant payments for their products, services, or campaigns, ensuring a seamless and efficient payment experience.
          </Text>
        </Collapse>
        <Collapse
          css={{ backgroundColor: "#fffff" }}
          bordered
          shadow
          title="Is the Instant Payment Panel secure?"
        >
          <Text>
            Absolutely! We take security seriously and implement robust encryption and data protection measures. Our platform complies with industry standards to ensure that all payment transactions are secure and safeguarded against unauthorized access.          </Text>
        </Collapse>
        <Collapse
          css={{ backgroundColor: "#fffff" }}
          bordered
          shadow
          title="Is the Instant Payment Panel secure?"
        >
          <Text>
            Absolutely! We take security seriously and implement robust encryption and data protection measures. Our platform complies with industry standards to ensure that all payment transactions are secure and safeguarded against unauthorized access.          </Text>
        </Collapse>
      </div>
      <div className="serprator">
        <Collapse
          bordered
          shadow
          title="How do I integrate the Instant Payment Panel with my website or campaign?"
        >
          <Text>
            Integrating the Instant Payment Panel with your website or campaign is a straightforward process. We provide clear documentation and APIs to guide you through the integration. Additionally, our support team is available to assist you if needed.
          </Text>
        </Collapse>
        <Collapse
          bordered
          shadow
          title="What kind of reporting and analytics are available with the Instant Payment Panel?"
        >
          <Text>
            We offer comprehensive reporting and analytics tools that provide valuable insights into your payment data. You can track transaction history, monitor sales performance, and generate reports to make data-driven decisions.          </Text>
        </Collapse>
        <Collapse
          bordered
          shadow
          expanded
          title="Are there any setup fees or hidden costs associated with the Instant Payment Panel?"
        >
          <Text>
            We believe in transparent pricing. There are no hidden costs, and our pricing structure is straightforward. You can find detailed information on our pricing plans on our website.          </Text>
        </Collapse>
      </div>

    </div>

    {/* contact us */}
    <h3 id="contact-us-nav" style={{ background: "#fff", marginBottom: "0", paddingTop: "30px", textAlign: 'center' }}>Contact Us</h3>
    <div style={{ display: "flex", flexDirection: "row", gap: "20px", padding: "20px" }} className="full-height contact-us">
      <div style={{ background: "#eee", textAlign: "center", padding: "30px", borderRadius: "20px", width: "100%" }} className="flex-box">
        <i style={{ fontSize: "50px" }} className='bx bxs-envelope'></i>
        <h3 className="email-icon">Email Us</h3>
        <h5>{ process.env.help_mail}</h5>
      </div>
      <div style={{ background: "#eee", textAlign: "center", padding: "30px", borderRadius: "20px", width: "100%" }} className="flex-box">
        <i style={{ fontSize: "50px" }} className='bx bxl-telegram'></i>
        <h3 className="telegarm-icon">Telegram</h3>
        <h5>@toolsadda_support</h5>
      </div>
    </div>


    {/* users */}
    <div className="fill-height">
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
    </div>
  </>)
}
