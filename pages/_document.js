import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
import { Fragment } from "react";

export default function Document() {
  return (
    <Fragment>
      <Html
        lang="en"
        className="light-style layout-menu-fixed"
        dir="ltr"
        data-theme="theme-default"
        data-assets-path="../assets/"
        data-template="vertical-menu-template-free"
      >
        <Head>
          <meta charSet="utf-8" />
          <meta name="description" content="" />
          <link
            rel="icon"
            type="image/x-icon"
            href="../assets/img/favicon/favicon.ico"
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
            rel="stylesheet"
          />
          <link rel="stylesheet" href="/assets/vendor/fonts/boxicons.css" />
        </Head>
        <body
          style={{
            fontFamily:
              '"Public Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
          }}
        >
          <Main />
          <NextScript />
          <Script
            src="/assets/vendor/js/helpers.jspublic/assets/js/main.js"
            defer
            strategy="beforeInteractive"
          ></Script>
          <Script
            src="/assets/vendor/js/helpers.js"
            defer
            strategy="beforeInteractive"
          ></Script>
          <Script
            src="/assets/js/config.js"
            defer
            strategy="beforeInteractive"
          ></Script>
          <Script
            src="/assets/vendor/js/menu.js"
            defer
            strategy="beforeInteractive"
          ></Script>
          <Script
            src="/assets/vendor/libs/jquery/jquery.js"
            defer
            strategy="beforeInteractive"
          ></Script>
          <Script
            src="/assets/vendor/libs/popper/popper.js"
            defer
            strategy="beforeInteractive"
          ></Script>
          <Script
            src="/assets/vendor/js/bootstrap.js"
            defer
            strategy="beforeInteractive"
          ></Script>
          <Script
            src="/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"
            defer
            strategy="beforeInteractive"
          ></Script>
        </body>
      </Html>
    </Fragment>
  );
}
