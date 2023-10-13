import '@/styles/globals.css'
import Head from 'next/head'
import Script from 'next/script'
import NProgress from 'nprogress';
import '../styles/globals.css';
import Router from 'next/router';
import '../styles/code.css';
import '../public/assets/vendor/css/core.css'
import '../public/assets/css/demo.css'
import '../public/assets/vendor/css/theme-default.css'
import '../public/assets/vendor/css/pages/page-auth.css'
import '../public//assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css'
// import '../public/assets/vendor/fonts/boxicons.css'
import '../public//assets/vendor/css/pages/page-misc.css'
export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0"
        />
      </Head>
      <Component {...pageProps} />;
    </>
  );
}

NProgress.configure({ showSpinner: true, trickle: true });
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());