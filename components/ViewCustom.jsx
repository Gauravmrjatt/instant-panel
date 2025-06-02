import {
  Table,
  useAsyncList,
  Loading,
  useCollator,
  Button,
} from "@nextui-org/react";
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function App() {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [loadingItems, setLoadingItems] = useState(new Set());
  const [isDisabled, setIsDisabled] = useState(true);
  const [toShow, setToShow] = useState("");

  const collator = useCollator({ numeric: true });
  const list = useAsyncList({ load, sort });

  async function load({ signal }) {
    const res = await fetch("/get/custom", { signal });
    const json = await res.json();
    return { items: json.list };
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
    setLoadingItems((prev) => new Set(prev).add(buttonId));
    toast.promise(
      new Promise((resolve, reject) => {
        axios
          .post("/delete/custom", { _id: buttonId })
          .then((response) => {
            const data = response.data;
            if (data.status === true) {
              resolve(data.msg);
              list.reload();
            } else {
              reject(data.msg);
            }
          })
          .catch((error) => {
            reject(`An error occurred: ${error}`);
          })
          .finally(() => {
            setLoadingItems((prev) => {
              const newSet = new Set(prev);
              newSet.delete(buttonId);
              return newSet;
            });
          });
      }),
      {
        loading: "Deleting....",
        success: "Deleted!",
        error: (error) => `Error: ${error}`,
      }
    );
  };

  function deleteSelected() {
    setIsDeletingSelected(true);
    const itemsToDelete = selectedItems === "all" ? "all" : Array.from(selectedItems);
    toast.promise(
      new Promise((resolve, reject) => {
        axios
          .post("/delete/custom", { data: itemsToDelete })
          .then((response) => {
            const data = response.data;
            if (data.status === true) {
              resolve(data.msg);
              list.reload();
              setSelectedItems(new Set());
            } else {
              reject(data.msg);
            }
          })
          .catch((error) => {
            reject(`An error occurred: ${error}`);
          })
          .finally(() => {
            setIsDeletingSelected(false);
          });
      }),
      {
        loading: "Deleting....",
        success: "Deleted!",
        error: (error) => `Error: ${error}`,
      }
    );
  }

  useEffect(() => {
    if (selectedItems === "all") {
      setIsDisabled(false);
      setToShow("all");
    } else if (selectedItems.size > 0) {
      setIsDisabled(false);
      setToShow("selected " + selectedItems.size);
    } else {
      setIsDisabled(true);
      setToShow("");
    }
  }, [selectedItems]);

  function handleSelection(Item) {
    setSelectedItems(Item);
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", }}>
        <Button
          onPress={deleteSelected}

          auto
          color="error"

          disabled={isDisabled || isDeletingSelected}
        >
          {isDeletingSelected ? (
            <Loading type="points-opacity" color="currentColor" size="sm" />
          ) : (
            `Delete ${toShow}`
          )}
        </Button>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <Table
            aria-label="View custom amount table"
            sortDescriptor={list.sortDescriptor}
            onSortChange={list.sort}
            selectionMode="multiple"
            selectedKeys={selectedItems}
            onSelectionChange={handleSelection}
            striped
          >
            <Table.Header>
              <Table.Column key="number"
                allowsSorting>
                NUMBER
              </Table.Column>
              <Table.Column key="name"
                css={{ textAlign: "center", padding: "10px" }}
                allowsSorting>
                CAMP
              </Table.Column>
              <Table.Column
                css={{ textAlign: "center", padding: "10px" }}
                key="event" allowsSorting>
                EVENT
              </Table.Column>
              <Table.Column
                css={{ textAlign: "center", padding: "10px" }}
                key="userAmount" allowsSorting>
                USER
              </Table.Column>
              <Table.Column
                css={{ textAlign: "center", padding: "10px" }}
                key="referAmount" allowsSorting>
                REFER
              </Table.Column>
              <Table.Column
                css={{ textAlign: "center", padding: "10px" }}
                key="referComment" allowsSorting>
                REFER COMMENT
              </Table.Column>
              <Table.Column
                css={{ textAlign: "center", padding: "10px" }}
                key="userComment" allowsSorting>
                USER COMMENT
              </Table.Column>
              <Table.Column
                css={{ textAlign: "center", padding: "10px" }}
                key="action">
                ACTION
              </Table.Column>
            </Table.Header>
            <Table.Body items={list.items} loadingState={list.loadingState}>
              {(item) => (
                <Table.Row key={item._id}>
                  <Table.Cell>{item.number}</Table.Cell>
                  <Table.Cell css={{ textAlign: "center" }}>{item.name}</Table.Cell>
                  <Table.Cell css={{ textAlign: "center" }}>{item.event}</Table.Cell>
                  <Table.Cell css={{ textAlign: "center" }}>{item.userAmount}</Table.Cell>
                  <Table.Cell css={{ textAlign: "center" }}>{item.referAmount}</Table.Cell>
                  <Table.Cell css={{ textAlign: "center" }}>{item.referComment}</Table.Cell>
                  <Table.Cell css={{ textAlign: "center" }}>{item.userComment}</Table.Cell>
                  <Table.Cell css={{ textAlign: "center", margin: "auto" }}>
                    <Button
                      auto
                      rounded
                      color="error"
                      css={{ margin: "auto" }}
                      onPress={() => handleClick(item._id)}
                      disabled={loadingItems.has(item._id)}
                    >
                      {loadingItems.has(item._id) ? (
                        <Loading
                          type="points-opacity"
                          color="currentColor"
                          size="sm"
                        />
                      ) : (
                        <i className="bx bxs-trash-alt"></i>
                      )}
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
        </div>
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
    </>
  );
}