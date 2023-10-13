import { Table, useAsyncList, Loading, useCollator, Button } from "@nextui-org/react";
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

export default function App() {
    const [selectedItems, setSelectedItems] = useState({});
    const [isDisabled, setisDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState();
    const [toShow, settoShow] = useState();

    let list = useAsyncList({ load, sort });
    const collator = useCollator({ numeric: true });
    async function load({ signal }) {
        const res = await fetch("/get/custom", {
            signal,
        });
        const json = await res.json();
        return {
            items: json.list,
        };
    }
    async function sort({ items, sortDescriptor }) {
        return {
            items: items.sort((a, b) => {
                let first = a[sortDescriptor.column];
                let second = b[sortDescriptor.column];
                let cmp = collator.compare(first, second);
                if (sortDescriptor.direction === "descending") {
                    cmp *= -1;
                }
                return cmp;
            }),
        };
    }

    const handleClick = async (buttonId) => {
        setIsLoading((prev) => ([buttonId]));
        toast.promise(
            new Promise((resolve, reject) => {
                axios.post('/detete/custom', { _id: buttonId })
                    .then((response) => {
                        const data = response.data;
                        if (data.status === true) {
                            resolve(data.msg);
                            list.reload()
                        } else {
                            reject(data.msg);
                        }
                    })
                    .catch((error) => {
                        reject(`An error occurred: ${error}`);
                    });
            }),
            {
                loading: 'Deleting....',
                success: 'Deleted!',
                error: (error) => `Error: ${error}`,
            }
        );
    };
    function deleteSelected() {
        toast.promise(
            new Promise((resolve, reject) => {
                axios.post('/detete/custom', { data: selectedItems })
                    .then((response) => {
                        const data = response.data;
                        if (data.status === true) {
                            resolve(data.msg);
                            list.reload()
                        } else {
                            reject(data.msg);
                        }
                    })
                    .catch((error) => {
                        reject(`An error occurred: ${error}`);
                    });
            }),
            {
                loading: 'Deleting....',
                success: 'Deleted!',
                error: (error) => `Error: ${error}`,
            }
        );
    }
    useEffect(() => {
        console.log(selectedItems);
        if (selectedItems == "all") {
            setisDisabled(false)
            return settoShow("all")
        }
        if (selectedItems.length > 0) {
            setisDisabled(false)
            settoShow("selected " + selectedItems.length)
        } else {
            setisDisabled(true)
            settoShow('')
        }
    }, [selectedItems]);



    function handleSelection(Item) {
        if (Item == "all") {
            setSelectedItems("all");
        } else {
            const selectedRows = new Set(Item);
            const selectedRowsArray = [...selectedRows];
            setSelectedItems(selectedRowsArray);
        }
    }

    return (
        <>
            <Button onPress={deleteSelected} css={{ width: 20, right: 10, top: 14, position: "absolute" }} auto color="error" disabled={isDisabled}>Delete {toShow}</Button>

            <Table
                aria-label="view custom amount"
                css={{ minWidth: "100%", height: "calc($space$14 * 10)" }}
                sortDescriptor={list.sortDescriptor}
                onSortChange={list.sort}
                selectionMode="multiple"
                selectedItems={selectedItems}
                onSelectionChange={handleSelection}
            >
                <Table.Header>
                    <Table.Column css={{ width: "200px", marginInline: '20px', justifyContent: 'center', alignItems: "center", textAlign: "center" }} key="number" allowsSorting>
                        NUMBER
                    </Table.Column>
                    <Table.Column css={{ width: "200px", marginInline: '20px', justifyContent: 'center', alignItems: "center", textAlign: "center" }} key="name" allowsSorting>
                        CAMP
                    </Table.Column>
                    <Table.Column css={{ width: "200px", marginInline: '20px', justifyContent: 'center', alignItems: "center", textAlign: "center" }} key="event" allowsSorting>
                        EVENT
                    </Table.Column>
                    <Table.Column css={{ width: "200px", marginInline: '20px', justifyContent: 'center', alignItems: "center", textAlign: "center" }} key="userAmount" allowsSorting>
                        USER
                    </Table.Column>
                    <Table.Column css={{ width: "200px", marginInline: '20px', justifyContent: 'center', alignItems: "center", textAlign: "center" }} key="referAmoun" allowsSorting>
                        REFER
                    </Table.Column>
                    <Table.Column css={{ width: "200px", marginInline: '20px', justifyContent: 'center', alignItems: "center", textAlign: "center" }} key="referComment" allowsSorting>
                        REFER.COM
                    </Table.Column>
                    <Table.Column css={{ width: "200px", marginInline: '20px', justifyContent: 'center', alignItems: "center", textAlign: "center" }} key="userComment" allowsSorting>
                        USER.COM
                    </Table.Column>
                    <Table.Column css={{ width: "200px", marginInline: '20px', justifyContent: 'center', alignItems: "center", textAlign: "center" }} key="action" allowsSorting>
                        action
                    </Table.Column>

                </Table.Header>
                <Table.Body items={list.items} loadingState={list.loadingState}>
                    {(item) => (
                        <Table.Row key={item._id}>
                            <Table.Cell css={{ minWidth: "200px" }}>{item.number}</Table.Cell>
                            <Table.Cell css={{ minWidth: "200px" }}>{item.name}</Table.Cell>
                            <Table.Cell css={{ minWidth: "200px" }}>{item.event}</Table.Cell>
                            <Table.Cell css={{ minWidth: "200px" }}>{item.userAmount}</Table.Cell>
                            <Table.Cell css={{ minWidth: "200px" }}>{item.referAmoun}</Table.Cell>
                            <Table.Cell css={{ minWidth: "200px" }}>{item.referComment}</Table.Cell>
                            <Table.Cell css={{ minWidth: "200px" }}>{item.userComment}</Table.Cell>
                            <Table.Cell css={{ minWidth: "200px" }}>
                                <Button auto rounded color="error" onPress={() => handleClick(item._id)}>
                                    {(isLoading == item._id) ? <Loading type="points-opacity" color="currentColor" size="sm" /> : <i className='bx bxs-trash-alt'></i>}
                                </Button>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
                <Table.Pagination
                    shadow
                    noMargin
                    align="center"
                    rowsPerPage={10}
                    onPageChange={(page) => console.log({ page })}
                />
            </Table>
            <Toaster
                position="bottom-right"
                reverseOrder={false}
            />
        </>
    );
}
