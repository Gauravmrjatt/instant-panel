import myDetails from '../pages/myDetails.json' assert {type: 'json'};
import Link from "next/link";
import { useRouter } from "next/router";

const MyFoter = () => {
    const router = useRouter();
    const isActive = route => {
        return (router.asPath === route || router.asPath === route) ? `menu-item active` : `menu-item`
    }
    return (
        <>
            <footer style={{ marginTop: "50px", padding: "10px", background: "#000" }} className="content-footer footer bg-footer-theme">
                <div className="container-xxl d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column">
                    <div className="mb-2 mb-md-0">
                        <a href="https://earningarea.in?source=panel" target="_blank" className="footer-link fw-bolder">By Earningarea</a>
                    </div>
                    <div>
                        <a href="#" className="footer-link me-4" target="_blank">License</a>
                        <a href="https://telegram.dog/Earning_Area11" target="_blank" className="footer-link me-4">Channel</a>

                        <a
                            href="https://telegram.dog/ToolsAdda_support"
                            target="_blank"
                            className="footer-link me-4"
                        >Report issue</a
                        >

                        <a
                            href="https://telegram.dog/ToolsAdda_support"
                            target="_blank"
                            className="footer-link me-4"
                        >Support</a
                        >
                    </div>
                </div>
            </footer>

        </>
    )
}


export default MyFoter;