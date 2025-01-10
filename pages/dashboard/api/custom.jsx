import Script from "next/script";
import MyNav from "../../../components/Nav";
import Header from "../../../components/Header";
import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import Prism from "prismjs";
import IconButton from "@mui/material/IconButton";
const code = `
// Request body

{
  "name": "", // campaign name
  "camp": "",// offer id 
  "event": "",// event name
  "number": "", // vpa 
  "referAmount": "", 
  "userAmount": "",
  "referComment": "",
  "userComment": "",
  "referInstant" : true // for refer payment instant false for pending
}


// Api Response 

    // Valid request 
       {
        "status": true,
        "msg": "Custom details updated successfully",
        "id": "edit id"
       }

    // Invalid Request 
        {
            "status" : false,
            "msg" : "Error Details",
        }
`;
export default function UserApi() {
  const [PostbackUrl, setPostbackUrl] = useState("loading...");
  const [PostbackKey, setPostbackKey] = useState("loading...");
  const [isChecked, setIsChecked] = useState(false);
  const textAreaRef = useRef(null);
  const [highlightedCode, setHighlightedCode] = useState("");

  useEffect(() => {
    const html = Prism.highlight(code, Prism.languages.javascript, "json");
    setHighlightedCode(html);
  }, []);
  function copyToClipboard(e) {
    e.preventDefault();
    textAreaRef.current.select();
    document.execCommand("copy");
    e.target.focus();
    toast.success("Link Copied!");
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/assets/js/main.js";
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  useEffect(() => {
    getKey();
    async function getKey() {
      const data = await axios.get("/get/postback");
      const newUrl = replaceAllPlaceholders(data.data.url, {
        "/api/v1/postback/": "/api/v1/update/custom/",
        "{eventname}?": "",
        "click={click_id}": "",
        "&p1={pass extra params}": "",
        "{number}?": "",
      });
      setPostbackUrl(newUrl.slice(0, -1));
      setPostbackKey(data.data.key);
      return () => {
        setPostbackUrl("loading...");
        setPostbackKey("loading...");
      };
    }
  }, []);

  function replaceAllPlaceholders(str, replacements) {
    for (const placeholder in replacements) {
      const replaceValue = replacements[placeholder];
      str = str?.replace(new RegExp(placeholder, "g"), replaceValue);
    }
    return str;
  }

  return (
    <>
      <Head>
        <title>Custom Amount api</title>
      </Head>
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          <MyNav />
          <div className="layout-page">
            <Header />
            <div className="content-wrapper">
              <div className="container-xxl flex-grow-1 container-p-y">
                <h4 className="fw-bold py-3 mb-4">
                  <Link href="/dashboard" className="text-muted fw-light">
                    Dashboard / Api /
                  </Link>{" "}
                  Custom Amount{" "}
                </h4>

                <div className="row">
                  <div className="col-md-12">
                    <div className="card mb-4">
                      <h5 className="card-header">Custom Api</h5>

                      <hr className="my-0" />
                      <div className="card-body">
                        <form id="formAccountSettings">
                          <div className="row">
                            <div className="mb-3 col-md-6">
                              <label
                                htmlFor="postback-url"
                                className="form-label"
                              >
                                Api
                              </label>
                              <input
                                ref={textAreaRef}
                                readOnly
                                className="form-control"
                                type="text"
                                id="postback-url"
                                name="firstName"
                                value={PostbackUrl}
                                autoFocus=""
                              />
                            </div>
                            <div className="mb-3 col-md-6">
                              <label
                                htmlFor="postback-key"
                                className="form-label"
                              >
                                Request Method
                              </label>
                              <input
                                readOnly
                                className="form-control"
                                type="text"
                                id="postback-key"
                                name="firstName"
                                value="POST"
                              />
                            </div>
                            <div className="mb-3 col-md-6">
                              <label
                                htmlFor="postback-key"
                                className="form-label"
                              >
                                Api Key
                              </label>
                              <input
                                readOnly
                                className="form-control"
                                type="text"
                                id="postback-key"
                                name="firstName"
                                value={PostbackKey}
                              />
                            </div>
                          </div>

                          <div className="mt-2">
                            <button
                              onClick={copyToClipboard}
                              className="btn btn-primary me-2"
                            >
                              Copy
                            </button>
                            <button
                              type="reset"
                              className="btn btn-outline-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                    <div className="card mb-5">
                      <h5 className="card-header">Response</h5>
                      <div
                        style={{
                          background: "#302c34",
                          borderRadius: "10px",
                          paddingTop: "15px",
                        }}
                        className="card-body"
                      >
                        <div
                          style={{
                            background: "#302c34",
                            borderRadius: "10px",
                          }}
                          className="mb-3 col-12 mb-0"
                        >
                          <pre
                            style={{
                              background: "#302c34",
                              borderRadius: "10px",
                            }}
                          >
                            <code
                              className="language-javascript"
                              dangerouslySetInnerHTML={{
                                __html: highlightedCode,
                              }}
                            />
                          </pre>
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <h5 className="card-header">Reset Api Key</h5>
                      <div className="card-body">
                        <div className="mb-3 col-12 mb-0">
                          <div className="alert alert-warning">
                            <h6 className="alert-heading fw-bold mb-1">
                              I want to change my api key?
                            </h6>
                            <p className="mb-0">
                              Your PostBack key is your Api key please change
                              your postback key to change api key
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-backdrop fade"></div>
            </div>
          </div>
        </div>
        <div className="layout-overlay layout-menu-toggle"></div>
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
      <Script src="/assets/js/dashboards-analytics.js"></Script>
    </>
  );
}
