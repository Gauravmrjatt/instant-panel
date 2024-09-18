import { useEffect, useRef, useState } from "react";
import cookies from "js-cookie";
import jwt from "jsonwebtoken";
import { useRouter } from "next/router";
import Link from "next/link";
import { User } from "@nextui-org/react";
import axios from "axios";
import { IconButton } from "../icons/IconButton";
import { EyeIcon } from "../icons/EyeIcon";
import { EditIcon } from "../icons/EditIcon";
import { DeleteIcon } from "../icons/DeleteIcon";
import Backdrop from "@mui/material/Backdrop";
const Header = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [userPic, setPic] = useState("../assets/img/avatars/1.png");
  const [searches, setSearches] = useState([]);
  const [text, setText] = useState("");
  const search = useRef();
  useEffect(() => {
    const jwtToken = cookies.get("jwt_token");
    if (jwtToken) {
      const decodedToken = jwt.decode(jwtToken);
      setUserData(decodedToken);
      setPic(decodedToken.profileImg);
    }
  }, []);
  useEffect(() => {
    if (text) {
      axios.get("/get/search?text=" + text).then((r) => {
        if (r.data.status === true && r.data.data.length > 0) {
          setSearches(r.data.data);
        } else {
          setSearches([]);
        }
      });
    }
  }, [text]);
  return (
    <>
      {" "}
      <nav
        className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
        id="layout-navbar"
      >
        <div
          id="menuDEk"
          className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none"
        >
          <a className="nav-item nav-link px-0 me-xl-4">
            <i className="bx bx-menu bx-sm"></i>
          </a>
        </div>

        <div
          className="navbar-nav-right d-flex align-items-center"
          id="navbar-collapse"
        >
          <div className="navbar-nav align-items-center">
            <div ref={search} className="nav-item d-flex align-items-center">
              <i className="bx bx-search fs-4 lh-0"></i>
              <input
                type="text"
                className="form-control border-0 shadow-none"
                placeholder="Search..."
                aria-label="Search..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => (search.current.style.display = "block")}
              />
            </div>
          </div>

          <ul className="navbar-nav flex-row align-items-center ms-auto">
            <li className="nav-item navbar-dropdown dropdown-user dropdown">
              <a
                className="nav-link dropdown-toggle hide-arrow"
                data-bs-toggle="dropdown"
              >
                <div className="avatar avatar-online">
                  {/* <img alt='profile' src={userPic} className="w-px-40 h-auto rounded-circle" /> */}
                  <User
                    src={userPic}
                    className="w-px-40 h-auto rounded-circle"
                  />
                </div>
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" href="/dashboard/profile">
                    <div className="d-flex">
                      <div className="flex-shrink-0 me-3">
                        <div className="avatar avatar-online">
                          <User
                            src={userPic}
                            className="w-px-40 h-auto rounded-circle"
                          />
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <span className="fw-semibold d-block">
                          {userData?.name}
                        </span>
                        <small className="text-muted">Admin</small>
                      </div>
                    </div>
                  </Link>
                </li>
                <li>
                  <div className="dropdown-divider"></div>
                </li>
                <li>
                  <Link className="dropdown-item" href="/dashboard/profile">
                    <i className="bx bx-user me-2"></i>
                    <span className="align-middle">My Profile</span>
                  </Link>
                </li>
                <li>
                  <Link href="/auth/devices" className="dropdown-item">
                    <i className="bx bxs-devices me-2"></i>
                    <span className="align-middle">Login Devices</span>
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/dashboard/billing">
                    <span className="d-flex align-items-center align-middle">
                      <i className="flex-shrink-0 bx bx-credit-card me-2"></i>
                      <span className="flex-grow-1 align-middle">Billing</span>
                      <span className="flex-shrink-0 badge badge-center rounded-pill bg-danger w-px-20 h-px-20">
                        4
                      </span>
                    </span>
                  </Link>
                </li>
                <li>
                  <div className="dropdown-divider"></div>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    onClick={() =>
                      router.push("/logout/" + userData.loginToken)
                    }
                  >
                    <i className="bx bx-power-off me-2"></i>
                    <span className="align-middle">Log Out</span>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
      <div
        ref={search}
        className="searchBartop"
        style={{ boxShadow: "0px 2px 50px -20px" }}
      >
        <IconButton
          css={{ marginLeft: "auto", marginRight: "10px" }}
          onClick={() => (search.current.style.display = "none")}
        >
          close
        </IconButton>
        {searches.map((item) => (
          <div
            style={{
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            key={item._id}
          >
            {item.name}

            <span style={{ display: "flex" }}>
              <IconButton
                style={{ padding: "10px" }}
                onClick={() => router.push("/dashboard/camp/view/" + item._id)}
              >
                <EyeIcon size={20} fill="#979797" />
              </IconButton>
              <IconButton
                style={{ padding: "10px" }}
                onClick={() => router.push("/dashboard/camp/edit/" + item._id)}
              >
                <EditIcon size={20} fill="#979797" />
              </IconButton>
            </span>
          </div>
        ))}
      </div>
    </>
  );
};
Header.getInitialProps = async () => {
  const jwtToken = cookies.get("jwt_token");
  const userData = jwt.decode(jwtToken);
  return { userData };
};

export default Header;
