import React, { useEffect, useState, useRef } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Badge, Loading } from "@nextui-org/react";
import axios from 'axios';
import LinearProgress from '@mui/material/LinearProgress';

async function getUserPostback() {
    const response = await axios.get("/get/postback");
    return response.data;
}

export default function ClickIdPayList({ list, paying, event, setDisable }) {
    const [user, setUser] = useState(null);
    const [items, setItems] = useState(
        list.map(item => ({ value: item, status: false, color: 'warning' }))
    );
    const updatedRef = useRef(false);
    const doneCount = useRef({ count: 0, loading: false });

    useEffect(() => {
        const fetchData = async () => {
            if (paying === true && !updatedRef.current) {
                const userData = await getUserPostback();
                setUser(userData);
                for (const id of items) {
                    try {
                        const response = await axios.get(`/api/v1/postback/${userData.key}/${event}?click=${id.value}&type=manual`);
                        updateStatus(id.value);
                    } catch (error) {
                        updateStatus(id.value);
                        console.log(error);
                    }
                }
                updatedRef.current = true;
            }
        };
        fetchData();
    }, [paying]);

    function updateStatus(id) {
        const index = items.findIndex(item => item.value === id);
        doneCount.current.count = index + 1;
        doneCount.current.loading = true;
        setDisable = true
        const newItems = [...items];
        newItems[index] = { value: items[index].value, status: true };
        setItems(newItems);
    }

    function calculatePercentage(value, total) {
        return (value / total) * 100;
    }

    const percentage = calculatePercentage(doneCount.current.count, items.length);
    const percentage2 = calculatePercentage(doneCount.current.count + 1, items.length);

    return (
        <>
            <div style={{ maxHeight: '400px', overflow: "scroll", overflowX: "hidden" }}>
                <LinearProgress sx={{ borderRadius: "20px" }} variant="buffer" value={percentage} valueBuffer={percentage2} />
                <List sx={{ width: 'calc(100% - 10px)', bgcolor: 'background.paper' }}>
                    {items.map(item => (
                        <ListItem
                            key={item.value}
                            sx={{ background: "#e7eaef00", border: "1px #eee solid", margin: "5px", borderRadius: "10px", padding: "2px", marginBlock: "13px", paddingInline: "10px" }}
                        >
                            <ListItemText sx={{ marginBlock: '15px', fontSize: '2.125rem' }} primary={item.value} />
                            {item.status ? <Loading type='spinner' /> : null}
                        </ListItem>
                    ))}
                </List>
            </div>
            <div style={{ margin: '10px', textAlign: 'end', display: "flex", justifyContent: "space-between" }}>
                <small><b>{doneCount.current.count}</b> of {items.length}</small>
                <small>Total ClickId: <b>{items.length}</b></small>
            </div>
        </>
    );
}
