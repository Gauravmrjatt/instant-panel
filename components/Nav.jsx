import myDetails from "../pages/myDetails.json" assert { type: "json" };
import Link from "next/link";
import { useRouter } from "next/router";
import {
  TimeCircle,
  ShieldDone,
  PaperPlus,
  Paper,
  Chart,
  Activity,
  Setting,
  People,
  Send,
  Filter,
  Work,
  MoreCircle,
  Upload,
  User,
  Search,
  Discount,
  Show,
} from "react-iconly";
const MyNav = () => {
  const router = useRouter();
  const isActive = (route) => {
    return router.asPath === route || router.asPath === route
      ? `menu-item active`
      : `layout-menu-toggle menu-item`;
  };
  return (
    <>
      <div>
        <aside
          id="layout-menu"
          className="layout-menu menu-vertical menu bg-menu-theme"
        >
          <div className="app-brand demo">
            <Link href="/dashboard" className="app-brand-link">
              <span className="app-brand-logo demo"></span>
              <span className="app-brand-text demo menu-text fw-bolder ms-2">
                {myDetails.name}
              </span>
            </Link>
            <a className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">
              <i className="bx bx-chevron-left bx-sm align-middle"></i>
            </a>
          </div>

          <div className="menu-inner-shadow"></div>

          <ul className="menu-inner py-1">
            <li className={isActive("/dashboard")}>
              <Link href="/dashboard" className="menu-link">
                <Work
                  set="bulk"
                  className="menu-icon"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Analytics">Dashboard</div>
              </Link>
            </li>

            <li className="menu-item">
              <a className="menu-link menu-toggle">
                <MoreCircle
                  set="bulk"
                  className="menu-icon"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Layouts">More</div>
              </a>

              <ul className="menu-sub">
                <li className="menu-item">
                  <Link
                    href="https://earningarea.in/Create"
                    className="menu-link"
                  >
                    <div data-i18n="Without menu">Create Lifafa</div>
                  </Link>
                </li>
                <li className="menu-item">
                  <Link
                    href="https://earningarea.in/Create-Scratch"
                    className="menu-link"
                  >
                    <div data-i18n="Without navbar">Create Scratch Card</div>
                  </Link>
                </li>
                <li className="menu-item">
                  <Link
                    href="https://earningarea.in/bulk"
                    className="menu-link"
                  >
                    <div data-i18n="Container">Bulk Payments</div>
                  </Link>
                </li>
                <li className="menu-item">
                  <Link
                    href="https://earningarea.in/Youtube/index.php"
                    className="menu-link"
                  >
                    <div data-i18n="Fluid">Yt Comments picker</div>
                  </Link>
                </li>
                <li className="menu-item">
                  <Link href="https://earningarea.in/" className="menu-link">
                    <div data-i18n="Blank">More</div>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">Campaigns</span>
            </li>
            <li className={isActive("/dashboard/campaigns")}>
              <Link href="/dashboard/campaigns" className="menu-link">
                <PaperPlus
                  className="menu-icon"
                  set="bulk"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Campaigns">Add Campaign</div>
              </Link>
            </li>
            <li className={isActive("/dashboard/liveCampaigns")}>
              <Link href="/dashboard/liveCampaigns" className="menu-link">
                {/* <i className="menu-icon tf-icons bx bxs-crown"></i> */}
                <Paper
                  className="menu-icon"
                  set="bulk"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Campaigns">Campaigns</div>
              </Link>
            </li>
            <li className={isActive("/dashboard/reports")}>
              <Link href="/dashboard/reports" className="menu-link">
                {/* <i className="menu-icon tf-icons bx bxs-crown"></i> */}
                <Chart
                  className="menu-icon"
                  set="bulk"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Campaigns">Reports</div>
              </Link>
            </li>
            <li className={isActive("/dashboard/clicks")}>
              <Link href="/dashboard/clicks" className="menu-link">
                {/* <i className="menu-icon tf-icons bx bxs-crown"></i> */}
                <Search
                  className="menu-icon"
                  set="bulk"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Campaigns">Click Details</div>
              </Link>
            </li>
            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">Webhooks</span>
            </li>
            <li className={isActive("/dashboard/postBack")}>
              <Link href="/dashboard/postBack" className="menu-link">
                <Activity
                  className="menu-icon"
                  set="bulk"
                  secondaryColor="blueviolet"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Campaigns">Postback</div>
              </Link>
            </li>
            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">Payouts</span>
            </li>
            <li className={isActive("/dashboard/pay-to-user")}>
              <Link href="/dashboard/pay-to-user" className="menu-link">
                <User
                  className="menu-icon"
                  set="bulk"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Boxicons">Pay to User</div>
              </Link>
            </li>

            <li className={isActive("/dashboard/clickPay")}>
              <Link href="/dashboard/clickPay" className="menu-link">
                <People
                  className="menu-icon"
                  set="bulk"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Boxicons">Pay ClickId </div>
              </Link>
            </li>

            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">Payouts Settings</span>
            </li>
            <li className={isActive("/dashboard/geteway-settings")}>
              <Link href="/dashboard/geteway-settings" className="menu-link">
                <Setting
                  className="menu-icon"
                  set="bulk"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Basic">Gateway Settings</div>
              </Link>
            </li>
            <li className={isActive("/dashboard/getGateway")}>
              <Link
                href="https://earningarea.in/Withdraw-api.php"
                className="menu-link"
              >
                <Upload
                  set="bulk"
                  className="menu-icon"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Boxicons">Get Gateway</div>
              </Link>
            </li>
            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">History</span>
            </li>
            <li className={isActive("/dashboard/pending")}>
              <Link href="/dashboard/pending" className="menu-link">
                <TimeCircle
                  className="menu-icon"
                  set="bulk"
                  secondaryColor="blueviolet"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Campaigns">Pending Payments</div>
              </Link>
            </li>
            <li className={isActive("/dashboard/payments")}>
              <Link href="/dashboard/payments" className="menu-link">
                <TimeCircle
                  className="menu-icon"
                  set="bulk"
                  secondaryColor="blueviolet"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Campaigns">Payments</div>
              </Link>
            </li>
            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">Api</span>
            </li>
            <li className="menu-item">
              <li className={isActive("/dashboard/api/checkRefer")}>
                <Link href="/dashboard/api/checkRefer" className="menu-link">
                  <ShieldDone
                    className="menu-icon"
                    set="bulk"
                    secondaryColor="blueviolet"
                    primaryColor="blueviolet"
                  />
                  <div data-i18n="Campaigns">Refer Check</div>
                </Link>
              </li>
              <li className={isActive("/dashboard/api/user")}>
                <Link href="/dashboard/api/user" className="menu-link">
                  <ShieldDone
                    className="menu-icon"
                    set="bulk"
                    secondaryColor="blueviolet"
                    primaryColor="blueviolet"
                  />
                  <div data-i18n="Campaigns">User Check</div>
                </Link>
              </li>
              <li className={isActive("/dashboard/api/custom")}>
                <Link href="/dashboard/api/custom" className="menu-link">
                  <ShieldDone
                    className="menu-icon"
                    set="bulk"
                    secondaryColor="blueviolet"
                    primaryColor="blueviolet"
                  />
                  <div data-i18n="Campaigns">Custom Amount</div>
                </Link>
              </li>
              <li className={isActive("/dashboard/api/get-custom")}>
                <Link href="/dashboard/api/get-custom" className="menu-link">
                  <ShieldDone
                    className="menu-icon"
                    set="bulk"
                    secondaryColor="blueviolet"
                    primaryColor="blueviolet"
                  />
                  <div data-i18n="Campaigns">Get Custom Amount</div>
                </Link>
              </li>
              <li className={isActive("/dashboard/api/camp")}>
                <Link href="/dashboard/api/camp" className="menu-link">
                  <ShieldDone
                    className="menu-icon"
                    set="bulk"
                    secondaryColor="blueviolet"
                    primaryColor="blueviolet"
                  />
                  <div data-i18n="Campaigns">Camp Details</div>
                </Link>
              </li>
              <li className={isActive("/dashboard/api/pendingCheck")}>
                <Link href="/dashboard/api/pendingCheck" className="menu-link">
                  <ShieldDone
                    className="menu-icon"
                    set="bulk"
                    secondaryColor="blueviolet"
                    primaryColor="blueviolet"
                  />
                  <div data-i18n="Campaigns">Check Pending</div>
                </Link>
              </li>
              <li className={isActive("/dashboard/api/releasePending")}>
                <Link
                  href="/dashboard/api/releasePending"
                  className="menu-link"
                >
                  <ShieldDone
                    className="menu-icon"
                    set="bulk"
                    secondaryColor="blueviolet"
                    primaryColor="blueviolet"
                  />
                  <div data-i18n="Campaigns">Release Pending</div>
                </Link>
              </li>
            </li>

            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">Extra</span>
            </li>
            <li className={isActive("/dashboard/customAmount")}>
              <Link href="/dashboard/customAmount" className="menu-link">
                <Discount
                  className="menu-icon"
                  set="bulk"
                  secondaryColor="blueviolet"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Campaigns">Custom Amount</div>
              </Link>
            </li>
            <li className={isActive("/dashboard/viewCustom")}>
              <Link href="/dashboard/viewCustom" className="menu-link">
                <Show
                  className="menu-icon"
                  set="bulk"
                  secondaryColor="blueviolet"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Campaigns">View Custom Amount</div>
              </Link>
            </li>

            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">Security &amp; Alerts</span>
            </li>
            <li className={isActive("/dashboard/ban-upi")}>
              <Link className="menu-link" href="/dashboard/ban-upi">
                <Filter
                  className="menu-icon"
                  set="bulk"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Form Elements">Ban Upi</div>
              </Link>
            </li>

            <li className={isActive("/dashboard/telegram-alerts")}>
              <Link href="/dashboard/telegram-alerts" className="menu-link">
                <Send
                  className="menu-icon"
                  set="bulk"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Tables">Telegram Alerts</div>
              </Link>
            </li>

            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">Misc</span>
            </li>
            <li className="menu-item">
              <Link
                href="https://telegram.dog/Earning_Area11"
                target="_blank"
                className="menu-link"
              >
                <Send
                  className="menu-icon"
                  set="bold"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Support">Telegram Channel</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link
                href="https://telegram.dog/Gauravmrjatt"
                target="_blank"
                className="menu-link"
              >
                <User
                  set="bold"
                  className="menu-icon"
                  primaryColor="blueviolet"
                />
                <div data-i18n="Documentation">Developer</div>
              </Link>
            </li>
          </ul>
        </aside>
      </div>
    </>
  );
};

export default MyNav;
