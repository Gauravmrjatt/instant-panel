import { useState } from "react"
import { Grid, Button, Modal, Text, Input, Badge } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
export default function AddIp({ ip, onIPSave, ondeleteIP }) {
    const [getIP, setIP] = useState('')
    const [visible, setVisible] = useState(false);
    const handler = () => setVisible(true)
    const closeHandler = () => setVisible(false)
    const saveIP = () => {
        if (getIP == '') {
            return toast.error("Enter a IP")
        }
        onIPSave(getIP)
        setIP('')
    }
    return (
        <div>
            <h5>
                Add IP (OPTIONAL)
            </h5>
            <Grid.Container gap={2}>
                {[...new Set(ip)].map((event) => (
                    <Grid key={event}>
                        <Badge key={event + "bag"} css={{ margin: "1px", display: "inline-block" }} enableShadow disableOutline color='warning'>
                            {event}
                            <i onClick={() => ondeleteIP(event)} style={{ marginLeft: "10px" }} className='bx bxs-x-circle'></i>
                        </Badge>
                    </Grid>
                ))}
            </Grid.Container>

            <Button style={{ marginLeft: "auto" }} auto onPress={() => handler()} rounded shadow color='warning'>Add IP</Button>

            <Modal
                closeButton
                blur
                aria-labelledby="Add-Events"
                open={visible}
                onClose={closeHandler}
                autoMargin
                scroll
            >
                <Modal.Header>
                    <Text id="Add-Events" size={18}>
                        Add
                        <Text b css={{ marginLeft: "5px" }} size={18}>
                            IP ADDRESS
                        </Text>
                    </Text>
                </Modal.Header>
                <Modal.Body>
                    <Toaster
                        position='top-center'
                        reverseOrder={false}
                    />

                    <Input
                        clearable
                        bordered
                        fullWidth
                        color="primary"
                        size="lg"
                        placeholder="IP Address"
                        value={getIP}
                        aria-label='name'
                        key='1'
                        onChange={(e) => setIP(prev => e.target.value)}
                        contentLeft={<i className='bx bx-trip'></i>}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button auto flat color="error" onPress={closeHandler}>
                        Close
                    </Button>
                    <Button auto onPress={saveIP}>
                        Add
                    </Button>
                </Modal.Footer>

            </Modal>
        </div>
    )

}