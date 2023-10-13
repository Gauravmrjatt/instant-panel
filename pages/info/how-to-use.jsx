import Prism from 'prismjs';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import MyNav from '../../components/Nav'
import Header from '../../components/Header'
import copy from 'copy-to-clipboard';
import toast, { Toaster } from 'react-hot-toast';
import IconButton from '@mui/material/IconButton';
import Script from 'next/script';

const code = `<?php
/*
    How to use EarningArea Instant Payment Panel Tracking Link
*/
$url = ''; // Pass click URL from your database

$userNumber = "0000000000"; // Pass user number {aff_click_id}
$referNumber = "0000000000"; // Pass refer number {sub_aff_id}

$replacedUrl = str_replace(
    array('{user_number}', '{refer_number}', '{ip}', '{user_agent}'),
    array($userNumber, $referNumber, get_client_ip(), $_SERVER['HTTP_USER_AGENT']),
    $url
);

$response = get($replacedUrl);
$json = json_decode($response);

if ($json->status === true) {
    header("Location:" . $json->url);
    exit();
} else {
    echo $response;
}

function get_client_ip()
{
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED'])) {
        $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
    } elseif (!empty($_SERVER['HTTP_FORWARDED_FOR'])) {
        $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
    } elseif (!empty($_SERVER['HTTP_FORWARDED'])) {
        $ipaddress = $_SERVER['HTTP_FORWARDED'];
    } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
        $ipaddress = $_SERVER['REMOTE_ADDR'];
    } else {
        $ipaddress = 'UNKNOWN';
    }
    return $ipaddress;
}

function get($url)
{
    $curl = curl_init();

    curl_setopt_array($curl, array(
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPGET => true,
    ));

    $response = curl_exec($curl);
    if (curl_errno($curl)) {
        $error = curl_error($curl);
        curl_close($curl);
        throw new Exception('cURL Error: ' . $error);
    }
    curl_close($curl);
    return $response;
}

/*
  Author: Gaurav Chaudhary
*/
?>
`;
export default function Code() {

    function copyCode() {
        copy(code)
        toast.success("copied!")
    }
    const [highlightedCode, setHighlightedCode] = useState('');

    useEffect(() => {
        const html = Prism.highlight(code, Prism.languages.javascript, 'php');
        setHighlightedCode(html);
    }, []);
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/js/main.js';
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    return (
        <>
            <Head>
                <title>How to Use?</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">
                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="content-wrapper">

                            <div className="container-xxl flex-grow-1 container-p-y">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="card mb-4">
                                            <h5 className="card-header">How to use</h5>
                                            <hr className="my-0" />
                                            <pre style={{ background: "#302c34", borderRadius: "10px" }}>
                                                <span style={{ float: "right", color: "white" }}> <IconButton onClick={() => copyCode()} aria-label="delete"><i style={{ color: "white" }} className='bx bx-copy'></i></IconButton></span>
                                                <code className="language-javascript" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                                            </pre>
                                            <h5 style={{ margin: "10px" }}> how to use Click Url?</h5>
                                            <p style={{ margin: "10px" }}>    In your campaign panel use our click url as tracking link</p>
                                            <h5 style={{ margin: "10px" }}> how to use PHP?</h5>
                                            <p style={{ margin: "10px" }}>   when user submit form pass your panel Tracking Url in $url variable and pass user number, refer number as given variable
                                            </p>  </div>

                                    </div>
                                </div>
                            </div>
                            <div className="content-backdrop fade"></div>
                        </div>
                    </div>

                </div>

                <div className="layout-overlay layout-menu-toggle"></div>
            </div>
            <Toaster
                position='top-center'
                reverseOrder={false}
            />

            <Script src="/assets/js/dashboards-analytics.js"></Script>

        </>
    );
}
