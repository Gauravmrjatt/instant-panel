import Head from 'next/head';
import HomeHeader from '../components/HomeHeader'
const About = () => {
    return (<>
        <Head>
            <title>
                About
            </title>
        </Head>
        <HomeHeader />
        <div style={{ padding: "20px", paddingTop: "100px" }} className='full-height aboutUs-page'>
            <h2 style={{ marginBottom: "70px" }} className="span">About Us</h2>
            <main style={{ maxWidth: "700px" }}>
                <section>
                    <h2><i className='bx bx-right-arrow-alt'></i>Who <span>We Are</span></h2>
                    <p>
                        At <strong>Earningarea</strong>, we are a team of dedicated professionals passionate about creating innovative solutions that empower businesses and individuals in the digital world. With a mission to streamline payment processes and optimize lead tracking, we offer cutting-edge tools to enhance your online experience.
                    </p>
                </section>
                <section>
                    <h2><i className='bx bx-right-arrow-alt'></i>Our <span>Vision</span></h2>
                    <p>
                        Our vision is to be a leading provider of secure and efficient payment solutions, revolutionizing the way transactions are conducted online. We prioritize user-friendliness and customization, ensuring a seamless experience for both sellers and buyers.
                    </p>
                </section>
                <section>
                    <h2><i className='bx bx-right-arrow-alt'></i>Trust and <span>Security</span></h2>
                    <p>
                        Trust and security are our top priorities. We implement industry-standard encryption and data protection measures to safeguard all transactions and customer information, building lasting relationships with our clients.
                    </p>
                </section>
                <section>
                    <h2><i className='bx bx-right-arrow-alt'></i><span>User-Centric</span> Approach</h2>
                    <p>
                        With a user-centric approach, our platforms are designed to cater to the unique needs of our clients. Whether you&rsquo;re a business owner, campaign maker, or individual, our innovative solutions are tailored to meet your specific requirements.
                    </p>
                </section>
                <section>
                    <h2><i className='bx bx-right-arrow-alt'></i>Dedicated <span>Support</span></h2>
                    <p>
                        Our dedicated support team is always ready to assist you throughout your journey with us. From onboarding to troubleshooting, we provide timely and responsive support to ensure a smooth experience.
                    </p>
                </section>
                <section>
                    <h2><i className='bx bx-right-arrow-alt'></i>Join Us <span>Today</span></h2>
                    <p>
                        Join us on our mission to transform the way you handle payments and track leads. Experience the convenience and efficiency of our Instant Payment Panel and Lead Tracking Service today.
                    </p>
                </section>
            </main>
        </div>
    </>
    );
};

export default About;
