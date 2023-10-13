<?php
/*
    How to use EarningArea Instant Payment Panel Tracking Link
*/

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

$url = 'http://localhost:3000/api/v1/click/64588f17ca5418b2744aa629?aff_click_id={user_number}&sub_aff_id={refer_number}&userIp={ip}&device={user_agent}'; // Pass click URL from your database

$userNumber = "0000000000"; // Pass user number {aff_click_id}
$referNumber = "0000000000"; // Pass refer number {sub_aff_id}

$replacedUrl = str_replace(
    array('{user_number}', '{refer_number}', '{ip}', '{user_agent}'),
    array($userNumber, $referNumber, urlencode(get_client_ip()), urlencode($_SERVER['HTTP_USER_AGENT'])),
    $url
);
echo $replacedUrl;
try {
    $response = get($replacedUrl);
    $json = json_decode($response);

    if ($json->status === true) {
        header("Location:" . $json->url);
        exit();
    } else {
        echo $response;
    }
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}

/*
  Author: Gaurav Chaudhary
*/
