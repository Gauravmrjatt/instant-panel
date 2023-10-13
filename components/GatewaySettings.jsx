import axios from "axios";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

const GatewayCustom = ({ url }) => {
    const [payUrl, setPayUrl] = useState(url)
    const handleUrlChange = (event) => {
        setPayUrl(event.target.value);
    };
    const update = () => {
        return new Promise((resolve, reject) => {
            axios.post('/update/gateway-settings', { type: "Custom", url: payUrl })
                .then((response) => {
                    const data = response.data;
                    if (data.status === true) {
                        return resolve(data.msg)
                    } else {
                        return reject(data.msg)
                    }
                })
                .catch((error) => {
                    return reject('This is an error "' + error + '"!')
                });
        })
    }
    const updateUrl = (e) => {
        e.preventDefault();
        toast.promise(
            update(),
            {
                loading: 'Changing Gateway Settings....',
                success: 'Successfully changed!',
                error: (error) => error
            }
        );
    }
    return (
        <>
            <div>
                <div style={{ maxWidth: "500px", marginInline: "auto" }} className="mb-4">
                    <h5 className="card-header">Custom Url</h5>
                    <div className="card-body">
                        <div className="form-floating">
                            <input onChange={handleUrlChange} value={payUrl} type="text" className="form-control" id="floatingInput" placeholder="https://earningarea.in" aria-describedby="floatingInputHelp" fdprocessedid="badxh9" />
                            <label htmlFor="floatingInput">Payout Url</label>
                            <div id="floatingInputHelp" className="form-text">
                                We&apos;ll never share your details with anyone else.
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <button type="button" onClick={updateUrl} className="btn rounded-pill btn-primary mt-3" >Update</button>
                        </div>
                    </div>
                </div>
            </div >
            <Toaster
                position="bottom-right"
                reverseOrder={false}
            />
        </>
    )
}
const GatewayEa = ({ guid }) => {
    const [payGuid, setPayGuid] = useState(guid)
    const handleGuidChange = (event) => {
        setPayGuid(event.target.value);
    };
    const update = () => {
        return new Promise((resolve, reject) => {
            axios.post('/update/gateway-settings', { type: "Earning Area", guid: payGuid })
                .then((response) => {
                    const data = response.data;
                    if (data.status === true) {
                        return resolve(data.msg)
                    } else {
                        return reject(data.msg)
                    }
                })
                .catch((error) => {
                    return reject('This is an error "' + error + '"!')
                });
        })
    }
    const updateGuid = (e) => {
        e.preventDefault();
        toast.promise(
            update(),
            {
                loading: 'Changing Gateway Settings....',
                success: 'Successfully changed!',
                error: (error) => error
            }
        );
    }
    return (
        <>
            <div>
                <div style={{ maxWidth: "500px", marginInline: "auto" }} className="mb-4">
                    <h5 className="card-header">Earning Area</h5>
                    <div className="card-body">
                        <div className="form-floating">
                            <input onChange={handleGuidChange} value={payGuid} className="form-control" id="floatingInput" placeholder="https://earningarea.in" aria-describedby="floatingInputHelp" fdprocessedid="badxh9" />
                            <label htmlFor="floatingInput">GUID</label>
                            <div id="floatingInputHelp" className="form-text">
                                We&apos;ll never share your details with anyone else.
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <button type="button" onClick={updateGuid} className="btn rounded-pill btn-primary mt-3" >Update</button>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster
                position="bottom-right"
                reverseOrder={false}
            />
        </>
    )
}

export { GatewayCustom, GatewayEa }