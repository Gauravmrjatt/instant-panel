import { useEffect, useState } from "react";
import { Modal, Input, Button, Text, Switch, Radio } from "@nextui-org/react";
import { Location, } from 'react-iconly'
import toast, { Toaster } from 'react-hot-toast';

export default function EditEvent({ index, events, onEventSave, dispay, event, onClosePop, onEventChange }) {
    const [eventsData, seteventsData] = useState({
        name: '',
        user: '',
        refer: '',
        userComment: '',
        referComment: '',
        caps: '',
        time: '',
        payMode: 'auto',
        capSwitch: false,
        timeSwitch: false,
        dailyCaps: '',
        dailySwitch: false
    });
    useEffect(() => {
        seteventsData(event)
    }, [event])
    const closeHandler = () => {
        onClosePop(false)
    }

    function saveEvent() {

        if (eventsData.name == '') {
            return toast.error("Enter an event name")
        }
        else if (eventsData.user == '') {
            return toast.error("Enter an event user amount")
        }
        else if (eventsData.refer == '') {
            return toast.error("Enter an event refer amount")
        }
        else if (eventsData.userComment == '') {
            return toast.error("Enter an event user comment")
        }
        else if (eventsData.referComment == '') {
            return toast.error("Enter an event refer comment")
        }
        onEventChange(eventsData, index)
        seteventsData({
            name: '',
            user: '',
            refer: '',
            userComment: '',
            referComment: '',
            caps: '',
            time: '',
            payMode: 'auto',
            capSwitch: false,
            timeSwitch: false,
        })
        closeHandler()
    }
    const updateEvents = (e, name) => {
        var value = e.target.value;
        seteventsData(prev => ({
            ...prev,
            [name]: value
        }))
    }
    function handelSwitch(e, type) {
        if (type == "capSwitch") {
            seteventsData(prev => ({
                ...prev,
                caps: ""
            }))
        } else if (type == "dailySwitch") {
            seteventsData(prev => ({
                ...prev,
                dailyCaps: ""
            }))
        } else {
            seteventsData(prev => ({
                ...prev,
                time: ""
            }))
        }

        if (e.target.checked === true) {
            seteventsData(prev => ({
                ...prev,
                [type]: true
            }))
        } else {
            seteventsData(prev => ({
                ...prev,
                [type]: false
            }))
        }
    }
    function setEventPayMode(e) {
        seteventsData(prev => ({
            ...prev,
            payMode: e
        }))
    }
    return (<>
        <Modal
            closeButton
            blur
            open={dispay}
            aria-labelledby="Edit-Events"
            onClose={() => { closeHandler(); }}
            scroll
            autoMargin
        >
            <Modal.Header>
                <Text id="Edit-Events" size={18}>
                    Edit
                    <Text b css={{ marginLeft: "5px" }} size={18}>
                        Event
                    </Text>
                </Text>
            </Modal.Header>
            <Modal.Body>
                <Input
                    clearable
                    bordered
                    fullWidth
                    color="primary"
                    size="lg"
                    placeholder="Event Name"
                    aria-label="Event Name"
                    value={eventsData.name}

                    key='1'
                    onChange={(e) => updateEvents(e, "name")}
                    contentLeft={<i className='bx bx-rename'></i>}
                />
                <Input
                    clearable
                    bordered
                    fullWidth
                    color="primary"
                    size="lg"
                    placeholder="User Amount"
                    type='number'
                    aria-label='user'
                    value={eventsData.user}
                    key='2'
                    onChange={(e) => updateEvents(e, "user")}
                    contentLeft={<i className='bx bxs-user'></i>}
                />
                <Input
                    clearable
                    bordered
                    fullWidth
                    color="primary"
                    size="lg"
                    placeholder="Refer Amount"
                    type='number'
                    aria-label='refer'
                    value={eventsData.refer}
                    key='3'
                    onChange={(e) => updateEvents(e, "refer")}
                    contentLeft={<i className='bx bx-rupee'></i>}
                />
                <Input
                    clearable
                    bordered
                    fullWidth
                    color="primary"
                    size="lg"
                    placeholder="User Comment"
                    aria-label='ucomment'
                    key='4'
                    value={eventsData.userComment}
                    onChange={(e) => updateEvents(e, "userComment")}
                    contentLeft={<i className='bx bxs-comment-check'></i>}
                />
                <Input
                    clearable
                    bordered
                    fullWidth
                    color="primary"
                    size="lg"
                    aria-label='rcomment'
                    placeholder="Refer Comment"
                    value={eventsData.referComment}
                    key='5'
                    onChange={(e) => updateEvents(e, "referComment")}
                    contentLeft={<i className='bx bxs-message-square-dots'></i>}
                />
                <hr />
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <Switch
                        shadow
                        checked={eventsData.capSwitch}
                        size="md"
                        onChange={(e) => handelSwitch(e, "capSwitch")}
                        iconOn={<Location set="curved" primaryColor="blueviolet" />}
                        iconOff={<i className='bx bx-infinite'></i>}
                        color='warning'
                        aria-label='cap'
                    />
                    <small style={{ transform: " translateY(5px)" }}>Total Limit leads (Total Caps)</small>
                </div>
                <Input
                    css={(eventsData.capSwitch === true) ? { display: "block" } : { display: "none" }}
                    size='lg'
                    bordered
                    clearable
                    contentLeft={<i className='bx bxs-pencil'></i>}
                    placeholder="Stop After"
                    color='primary'
                    aria-label="Event Time"
                    value={eventsData.caps}
                    type='number'
                    onChange={(e) => updateEvents(e, "caps")}
                />
                <hr />
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <Switch
                        shadow
                        checked={eventsData.dailySwitch}
                        size="md"
                        onChange={(e) => handelSwitch(e, "dailySwitch")}
                        iconOn={<Location set="curved" primaryColor="blueviolet" />}
                        iconOff={<i className='bx bx-infinite'></i>}
                        color='success'
                        aria-label='cap'
                    />
                    <small style={{ transform: " translateY(5px)" }}>Limit Daily leads (Daily Caps)</small>
                </div>
                <Input
                    css={(eventsData.dailySwitch === true) ? { display: "block" } : { display: "none" }}
                    size='lg'
                    bordered
                    clearable
                    contentLeft={<i className='bx bxs-pencil'></i>}
                    placeholder="Stop After"
                    color='primary'
                    aria-label="Event Time"
                    value={eventsData.dailyCaps}
                    type='number'
                    onChange={(e) => updateEvents(e, "dailyCaps")}
                />
                <hr />


                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <Switch
                        shadow
                        checked={eventsData.timeSwitch}
                        size="md"
                        onChange={(e) => handelSwitch(e, "timeSwitch")}
                        iconOn={<i className='bx bx-timer'></i>}
                        iconOff={<i className='bx bx-infinite'></i>}
                        color='error'
                        aria-label='time'
                    />
                    <small style={{ transform: " translateY(5px)" }}>Track Next Event After Given Time</small>
                </div>
                <Input
                    css={(eventsData.timeSwitch === true) ? { display: "block" } : { display: "none" }}
                    size='lg'
                    bordered
                    clearable
                    contentLeft={<i className='bx bxs-time-five'></i>}
                    placeholder="Minutes"
                    color='primary'
                    value={eventsData.time}
                    aria-label="Event Time"
                    type='number'
                    onChange={(e) => updateEvents(e, "time")}
                />
                <hr />
                <Radio.Group value={eventsData.payMode} onChange={(value) => setEventPayMode(value)} color='error' size="sm" label="Payouts" defaultValue="1" orientation="horizontal">
                    <Radio color='success' size="sm" value="auto" description="Pay Instantly on lead received.">
                        Auto Approval
                    </Radio>
                    <Radio size="sm" value="manual" description="Pay when i approve lead">
                        Manual Approval
                    </Radio>
                </Radio.Group>
                <hr />
            </Modal.Body>
            <Modal.Footer>
                <Button auto flat color="error" onPress={closeHandler}>
                    Close
                </Button>
                <Button auto onPress={saveEvent}>
                    Save
                </Button>
            </Modal.Footer>
            <Toaster
                position='top-center'
                reverseOrder={false}
            />
        </Modal>

    </>)
}