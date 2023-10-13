const express = require("express")
const router = express.Router()
const myDetails = require('../../../pages/myDetails.json');
const User = require("../../models/Users")
const nodemailer = require('nodemailer');
const ResetPassword = require('../../models/ResetPassword');
const { v4: uuidv4 } = require('uuid')

router.post("/", async (req, res) => {

	const { email } = req.body;
	if (email) {
		const user = await User.findOne({ email });
		if (!user) {
			return res.json({ status: false, msg: 'Invalid email, no account found ' });
		}
		const forgetID = uuidv4()
		const resetPassword = new ResetPassword({
			userId: user._id,
			token: forgetID,
			expires: Date.now() + 3600000
		});
		resetPassword.save();
		const transporter = nodemailer.createTransport({
			host: "smtpout.secureserver.net",
			port: 587,
			secure: false,
			auth: {
				user: "support@toolsadda.in",
				pass: "Nikhil@7357"
			}
		});

		let mailOptions = {
			from: 'support@toolsadda.in',
			to: user.email,
			subject: myDetails.name + " reset passowrd",
			text: myDetails.name,
			html: `
            <!DOCTYPE html>

<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<title></title>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
<!--[if !mso]><!-->
<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Abril+Fatface" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Merriweather" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Bitter" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Permanent+Marker" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Roboto+Slab" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Cabin" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Oxygen" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Oswald" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Droid+Serif" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Playfair+Display" rel="stylesheet" type="text/css"/>
<link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet" type="text/css"/>
<!--<![endif]-->
<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit
		}

		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}

		@media (max-width:700px) {
			.desktop_hide table.icons-inner {
				display: inline-block !important;
			}

			.icons-inner {
				text-align: center;
			}

			.icons-inner td {
				margin: 0 auto;
			}

			.row-content {
				width: 100% !important;
			}

			.mobile_hide {
				display: none;
			}

			.stack .column {
				width: 100%;
				display: block;
			}

			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}

			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}

			.row-4 .column-1 .block-1.paragraph_block td.pad {
				padding: 5px 30px !important;
			}

			.row-3 .column-1 .block-2.heading_block td.pad {
				padding: 20px !important;
			}

			.row-2 .column-1 .block-2.heading_block h1 {
				text-align: center !important;
				font-size: 33px !important;
			}

			.row-2 .column-1 .block-2.heading_block td.pad {
				padding: 10px 60px 30px !important;
			}

			.row-5 .column-1 .block-2.heading_block h2,
			.row-7 .column-1 .block-1.heading_block h2 {
				font-size: 20px !important;
			}

			.row-5 .column-1 .block-1.heading_block h3 {
				font-size: 26px !important;
			}

			.row-4 .column-1 .block-2.button_block td.pad {
				padding: 15px !important;
			}

			.row-4 .column-1 .block-2.button_block a span,
			.row-4 .column-1 .block-2.button_block div span {
				line-height: 1.2 !important;
			}
		}
	</style>
</head>
<body style="margin: 0; background-color: #1a30eb; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
<table border="0" cellpadding="0" cellspacing="0" className="nl-container" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1a30eb;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row row-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row-content" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1a30eb; color: #000000; width: 680px;" width="680">
<tbody>
<tr>
<td className="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 20px; padding-bottom: 10px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" className="heading_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td className="pad" style="width:100%;text-align:center;">
<h1 style="margin: 0; color: #ffffff; font-size: 23px; font-family: Poppins, Arial, Helvetica, sans-serif; line-height: 120%; text-align: center; direction: ltr; font-weight: 700; letter-spacing: normal; margin-top: 0; margin-bottom: 0;"><span className="tinyMce-placeholder">${myDetails.name}</span></h1>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row row-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-size: auto; background-color: #ffffff; color: #000000; border-bottom: 0 solid #FFFFFF; border-left: 0 solid #FFFFFF; border-radius: 30px 30px 0 0; border-right: 0px solid #FFFFFF; border-top: 0 solid #FFFFFF; width: 680px;" width="680">
<tbody>
<tr>
<td className="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" className="heading_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td className="pad" style="padding-bottom:30px;padding-left:60px;padding-right:60px;padding-top:70px;text-align:center;width:100%;">
<h2 style="margin: 0; color: #020b22; direction: ltr; font-family: Poppins, Arial, Helvetica, sans-serif; font-size: 40px; font-weight: 700; letter-spacing: normal; line-height: 150%; text-align: center; margin-top: 0; margin-bottom: 0;"><span className="tinyMce-placeholder">Reset you password</span></h2>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row row-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;" width="680">
<tbody>
<tr>
<td className="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" className="image_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td className="pad" style="width:100%;padding-right:0px;padding-left:0px;">
<div align="center" className="alignment" style="line-height:10px"><img alt="Social profile" src="https://cdn.templates.unlayer.com/assets/1636374086763-hero.png" style="display: block; height: auto; border: 0; width: 272px; max-width: 100%;" title="Social profile" width="272"/></div>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" className="heading_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td className="pad" style="width:100%;text-align:center;">
<h1 style="margin: 0; color: #555555; font-size: 23px; font-family: Poppins, Arial, Helvetica, sans-serif; line-height: 120%; text-align: center; direction: ltr; font-weight: 700; letter-spacing: normal; margin-top: 0; margin-bottom: 0;"><span className="tinyMce-placeholder">${email}</span></h1>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row row-4" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;" width="680">
<tbody>
<tr>
<td className="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 60px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" className="paragraph_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
<tr>
<td className="pad" style="padding-bottom:5px;padding-left:60px;padding-right:60px;padding-top:5px;">
<div style="color:#878787;direction:ltr;font-family:Poppins, Arial, Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:center;mso-line-height-alt:19.2px;">
<p style="margin: 0;">To reset your password, please click on the button below.</p>
</div>
</td>
</tr>
</table>
<table border="0" cellpadding="30" cellspacing="0" className="button_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td className="pad">
<div align="center" className="alignment">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${myDetails.domain}/auth/reset/${forgetID}" style="height:40px;width:265px;v-text-anchor:middle;" arcsize="38%" strokeweight="1.5pt" strokecolor="#18B5FE" fillcolor="#3AAEE0"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:14px"><![endif]--><a href="${myDetails.domain}/auth/reset/${forgetID}" style="text-decoration:none;display:block;color:#ffffff;background-color:#1a30eb;border-radius:15px;width:90%; width:calc(90% - 4px);border-top:2px dotted #18B5FE;font-weight:700;border-right:2px dotted #18B5FE;border-bottom:2px dotted #18B5FE;border-left:2px dotted #18B5FE;padding-top:10px;padding-bottom:10px;font-family:Poppins, Arial, Helvetica, sans-serif;text-align:center;mso-border-alt:none;word-break:keep-all;" target="_blank"><span style="padding-left:45px;padding-right:45px;font-size:14px;display:inline-block;letter-spacing:2px;"><span dir="ltr" style="word-break: break-word; line-height: 16.8px;">Reset Password</span></span></a>
<!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
</div>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row row-5" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;" width="680">
<tbody>
<tr>
<td className="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-left: 50px; padding-right: 50px; vertical-align: top; padding-top: 0px; padding-bottom: 40px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" className="heading_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td className="pad" style="padding-bottom:5px;padding-top:5px;text-align:center;width:100%;">
<h3 style="margin: 0; color: #1a30eb; direction: ltr; font-family: Poppins, Arial, Helvetica, sans-serif; font-size: 30px; font-weight: 400; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;"><span className="tinyMce-placeholder">Connect with us</span></h3>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" className="heading_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td className="pad" style="padding-bottom:10px;padding-top:5px;text-align:center;width:100%;">
<h2 style="margin: 0; color: #878787; direction: ltr; font-family: Poppins, Arial, Helvetica, sans-serif; font-size: 26px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;"><span className="tinyMce-placeholder">You can Contact us on Telegram or via mail </span></h2>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row row-6" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;" width="680">
<tbody>
<tr>
<td className="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-left: 50px; padding-right: 50px; vertical-align: top; padding-top: 40px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" className="text_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
<tr>
<td className="pad" style="padding-bottom:15px;padding-left:30px;padding-right:30px;padding-top:10px;">
<div style="font-family: sans-serif">
<div className="txtTinyMce-wrapper" style="font-size: 12px; mso-line-height-alt: 14.399999999999999px; color: #888888; line-height: 1.2; font-family: Poppins, Arial, Helvetica, sans-serif;">
<p style="margin: 0; font-size: 14px; text-align: center;"><span style="font-size:20px;">Search for our Telegram</span></p>
</div>
</div>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" className="heading_block block-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td className="pad" style="padding-bottom:15px;padding-top:15px;text-align:center;width:100%;">
<h3 style="margin: 0; color: #020b22; direction: ltr; font-family: Poppins, Arial, Helvetica, sans-serif; font-size: 24px; font-weight: 400; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;"><strong><span className="tinyMce-placeholder"><span id="05276ec3-3f46-45fb-8f44-d2df8fd334b8"><span id="65c82665-ed28-4485-aba7-60211061d6c9">@toolsadda_support</span></span></span></strong></h3>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" className="text_block block-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
<tr>
<td className="pad" style="padding-bottom:15px;padding-left:5px;padding-right:30px;padding-top:10px;">
<div style="font-family: sans-serif">

</div>
</td>
</tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" className="image_block block-4" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td className="pad" style="width:100%;padding-right:0px;padding-left:0px;">
<div align="center" className="alignment" style="line-height:10px"><img alt="Likes" src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/7311/social-media.gif" style="display: block; height: auto; border: 0; width: 170px; max-width: 100%;" title="Likes" width="170"/></div>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row row-7" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f2f5ff; border-radius: 0 0 30px 30px; color: #000000; width: 680px;" width="680">
<tbody>
<tr>
<td className="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 15px; padding-bottom: 15px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" className="heading_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td className="pad" style="padding-bottom:20px;padding-top:20px;text-align:center;width:100%;">
<h2 style="margin: 0; color: #1a30eb; direction: ltr; font-family: Poppins, Arial, Helvetica, sans-serif; font-size: 20px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;"><span className="tinyMce-placeholder">Don't be out. Join us.</span></h2>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row row-8" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1a30eb; color: #000000; width: 680px;" width="680">
<tbody>
<tr>
<td className="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 25px; padding-bottom: 25px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="20" cellspacing="0" className="text_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
<tr>
<td className="pad">
<div style="font-family: sans-serif">
<div className="txtTinyMce-wrapper" style="font-size: 12px; font-family: Poppins, Arial, Helvetica, sans-serif; mso-line-height-alt: 18px; color: #fafafa; line-height: 1.5;">
<p style="margin: 0; font-size: 10px; text-align: center; mso-line-height-alt: 15px;"><span style="font-size:10px;"><span style="">team ${myDetails.name}</span></span><span style="font-size:10px;"><span style=""> All Rights Reserved.</span></span></p>
</div>
</div>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row row-9" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" className="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 680px;" width="680">
<tbody>
<tr>
<td className="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
<table border="0" cellpadding="0" cellspacing="0" className="icons_block block-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td className="pad" style="vertical-align: middle; color: #9d9d9d; font-family: inherit; font-size: 15px; padding-bottom: 5px; padding-top: 5px; text-align: center;">
<table cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
<tr>
<td className="alignment" style="vertical-align: middle; text-align: center;">
<!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]-->
<!--[if !vml]><!-->
<table cellpadding="0" cellspacing="0" className="icons-inner" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block; margin-right: -4px; padding-left: 0px; padding-right: 0px;">
<!--<![endif]-->
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table><!-- End -->
</body>
</html>
            `
		};
		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				return res.json({ status: false, msg: "Somthing went wrong", err: error })
			}
			res.json({ status: true, msg: "email sent successfully" })
		});
	} else {
		res.json({ status: false, msg: "Fill all account details carefully" });
	}
})

module.exports = router;