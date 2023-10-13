import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'

function Error() {
    const router = useRouter()
    const goBack = () => {
        router.push("/")
    }
    return (
        <>
            <Head>
                <title>Not Found</title>
            </Head>

            <div className="container-xxl container-p-y">
                <div className="misc-wrapper">
                    <h2 className="mb-2 mx-2">Page Not Found :(</h2>
                    <p className="mb-4 mx-2">Oops! 😖 The requested URL was not found on this server.</p>
                    <button onClick={goBack} className="btn btn-primary">Back to home</button>
                    <div className="mt-3">
                        <Image
                            src="/assets/img/illustrations/page-misc-error-light.png"
                            alt="page-misc-error-light"
                            width="500"
                            height="500"
                            className="img-fluid"
                            data-app-dark-img="illustrations/page-misc-error-dark.png"
                            data-app-light-img="illustrations/page-misc-error-light.png"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Error;
