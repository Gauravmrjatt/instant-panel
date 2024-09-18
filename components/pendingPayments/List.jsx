import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import axios from 'axios';
import LinearProgress from '@mui/material/LinearProgress';
import { Badge, Button, Loading } from "@nextui-org/react";
import { useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';


export default function Lists({ iist, Campid }) {
    const [comment, setComment] = useState('')
    const [items, setItems] = useState(
        iist.data.map(item => ({ value: item._id, status: "wait", color: 'warning', total: item.total }))
    );
    const sum = items.reduce((accumulator, currentObject) => {
        return accumulator + currentObject.total;
    }, 0);

    const updatedRef = useRef(false);
    const doneCount = useRef({ count: 0, loading: false });

    function calculatePercentage(value, total) {
        return (value / total) * 100;
    }
    const percentage = calculatePercentage(doneCount.current.count, items.length);
    const percentage2 = calculatePercentage(doneCount.current.count + 1, items.length);
    const setRejected = async () => {
        const isRejected = window.confirm("Do you really want to Reject All?")
        if (isRejected) {
            const response = await axios.get(`/api/update/pendings/` + Campid.id);
        } else {
            toast('Request Canceled!',
                {
                    icon: '👏',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                }
            );
        }
    }
    const payAllUsers = async () => {
        const payAll = window.confirm("Do you really want to Pay All?")
        if (payAll) {
            if (!updatedRef.current) {

                for (const id of items) {
                    try {
                        const response = await axios.post(`/api/update/pendings/` + Campid.id + "?comment=" + comment, { ...id });
                        updateStatus(id.value, response.data.status);
                    } catch (error) {
                        updateStatus(id.value, response.data.status);
                        console.log(error);
                    }
                }
                updatedRef.current = true;
            }
        } else {
            toast('Request Canceled!',
                {
                    icon: '👏',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                }
            );
        }

    };


    function updateStatus(id, status) {
        const index = items.findIndex(item => item.value === id);
        doneCount.current.count = index + 1;
        doneCount.current.loading = true;
        const newItems = [...items];
        newItems[index] = { value: items[index].value, status: status };
        setItems(newItems);
    }
    const handelChanges = (e) => {
        const value = e.target.value
        setComment(value)
    }
    return (
        <div>
            <div className="mb-3">
                <label for="exampleFormControlInput1" className="form-label">Comment</label>
                <input onChange={handelChanges} type="text" value={comment} className="form-control" id="exampleFormControlInput1" placeholder="Earning Area Pending Payments" fdprocessedid="rs00b6" />
            </div>
            <LinearProgress sx={{ borderRadius: "20px" }} variant="buffer" value={percentage} valueBuffer={percentage2} />
            <div style={{ maxHeight: '400px', overflow: "scroll", overflowX: "hidden" }}>
                <List sx={{ width: 'calc(100% - 10px)', bgcolor: 'background.paper' }}>
                    {items.map(item => (
                        <ListItem
                            key={item.value}
                            sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}
                        >
                            <ListItemText sx={{ marginBlock: '15px', fontSize: '2.125rem' }} primary={item.value} />
                            {(item.status == "wait") ? "₹" + item.total : (item.status == "ACCEPTED") ? <i className='bx bxs-check-circle' style={{ color: "#33f719" }}></i> : <i className='bx bxs-error-circle' style={{ color: "#e20606" }}  ></i>}
                        </ListItem>
                    ))}
                </List>
            </div>
            <div style={{ margin: '25px', textAlign: 'end', display: "flex", justifyContent: "space-between" }}>
                <small><b>{doneCount.current.count}</b> of {items.length}</small>
                <small>Total Amount: ₹<b>{sum}</b></small>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
                <Button color='error' onPress={setRejected} auto flat>
                    Reject All
                </Button>
                <Button onPress={payAllUsers} shadow  >
                    Pay All
                </Button>
            </div>
        </div>
    );
}