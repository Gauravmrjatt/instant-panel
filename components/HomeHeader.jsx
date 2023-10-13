import { useEffect } from "react"
import myDetails from '../pages/myDetails.json' assert {type: 'json'};
import Link from "next/link";
export default function Header() {
    useEffect(() => {
        const button = document.getElementById("nav-bar-icon")
        const navContainer = document.getElementById("nav-links-container")
        button.addEventListener("click", () => {
            if (navContainer.classList.contains("nav-showing")) {
                return navContainer.classList.remove("nav-showing")
            }
            navContainer.classList.add("nav-showing")
        })
    })
    return (<>
        <div id="home-header">
            <div className='nav-bar' style={{ padding: "17px", display: 'flex', alignItems: "center", justifyContent: "space-between" }}>
                <div><h4>{myDetails.name}</h4></div>
                <div className="main-links-container">
                    <Link href="/" className="links-main">
                        Home
                    </Link>
                    <Link href="/about" className="links-main">
                        About
                    </Link>
                    <Link href="/#contact-us-nav" className="links-main">
                        Contact Us
                    </Link>
                    <Link href='/pricing' className="links-main">
                        Pricing
                    </Link>
                    <div className="links-main">
                        <div className="col-sm-12 col-md-4 col-lg-12">
                            <Link href='/auth/register' className="btn btn-lg btn-blue py-8 pricing-btn" style={{ color: "white", background: "#0565ff" }} data-hs-event-107968771="1">Get Started</Link>
                        </div>
                    </div>
                </div>
                <div id='nav-bar-icon'> <h4 ><i style={{ fontSize: '30px' }} class='bx bx-menu-alt-right'></i></h4></div>
            </div>
            <div className="nav-links-container" id='nav-links-container'>
                <Link href="/" style={{ display: "block" }} className="links">
                    Home
                </Link>
                <Link style={{ display: "block" }} href="/about" className="links">
                    About Us
                </Link>
                <Link style={{ display: "block" }} href="/#contact-us-nav" className="links">
                    Contact Us
                </Link>
                <Link style={{ display: "block" }} href='/pricing' className="links">
                    Pricing
                </Link>
                <div className="links">
                    <div className="col-sm-12 col-md-4 col-lg-12">
                        <Link href='/auth/register' className="btn btn-lg btn-blue py-8 pricing-btn" style={{ color: "white", background: "#0565ff" }} >Get Started</Link>
                    </div>
                </div>
            </div>
        </div>
    </>)
}