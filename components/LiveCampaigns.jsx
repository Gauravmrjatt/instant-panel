import {
  Table,
  useAsyncList,
  Loading,
  useCollator,
  Button,
  User,
  Row,
  Col,
  Tooltip,
  Dropdown,
} from "@nextui-org/react";
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IconButton } from "../icons/IconButton";
import { EyeIcon } from "../icons/EyeIcon";
import { EditIcon } from "../icons/EditIcon";
import { DeleteIcon } from "../icons/DeleteIcon";
import { StyledBadge } from "../icons/StyledBadge";
import { useRouter } from "next/router";
import Snackbar from "@mui/material/Snackbar";
import { Chart } from "react-iconly";

export default function CampaignsList() {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState({});
  const [isDisabled, setisDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState();
  const [toShow, settoShow] = useState();
  const [open, setOpen] = useState(false);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  const handleClick = () => {
    setOpen(true);
  };
  const action = (
    <>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <i style={{ color: "white" }} className="bx bx-x"></i>
      </IconButton>
    </>
  );
  let list = useAsyncList({ load, sort });
  const collator = useCollator({ numeric: true });
  async function load({ signal }) {
    const res = await fetch("/get/campaign", {
      signal,
    });
    const json = await res.json();
    return {
      items: json.data,
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

  async function deleteItem(_id, callback) {
    try {
      const response = await axios.post("/delete/campaign", { _id });
      const data = response.data;
      if (data.status === true) {
        toast.success(data.msg);
        list.reload();
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      toast.error(`An error occurred: ${error}`);
    }
  }

  useEffect(() => {
    if (selectedItems == "all") {
      setisDisabled(false);
      return settoShow("all");
    }
    if (selectedItems.length > 0) {
      setisDisabled(false);
      settoShow("selected " + selectedItems.length);
    } else {
      setisDisabled(true);
      settoShow("");
    }
  }, [selectedItems]);

  return (
    <>
      <Table
        aria-label="Example static collection table"
        sortDescriptor={list.sortDescriptor}
        onSortChange={list.sort}
        color="secondary"
        striped
      >
        <Table.Header>
          <Table.Column key="name" allowsSorting>
            NAME
          </Table.Column>
          <Table.Column
            key="events"
            css={{ textAlign: "center" }}
            allowsSorting
          >
            EVENTS
          </Table.Column>
          <Table.Column
            css={{ textAlign: "center" }}
            key="action"
            allowsSorting
          >
            ACTIONS
          </Table.Column>
        </Table.Header>
        <Table.Body items={list.items} loadingState={list.loadingState}>
          {(item) => (
            <Table.Row onClick={() => router.push("hi")} key={item._id}>
              <Table.Cell>
                {" "}
                <User squared src="" name={item.name} css={{ p: 0 }}>
                  {item.offerID}
                </User>
              </Table.Cell>
              <Table.Cell css={{ textAlign: "center" }}>
                <StyledBadge type="active">{item.events.length}</StyledBadge>
              </Table.Cell>
              <Table.Cell>
                <Row justify="center" align="center">
                  <Col css={{ d: "flex" }}>
                    <Tooltip content="Details">
                      <IconButton
                        onClick={() => router.push("camp/view/" + item._id)}
                      >
                        <EyeIcon size={20} fill="#979797" />
                      </IconButton>
                    </Tooltip>
                  </Col>
                  <Col css={{ d: "flex" }}>
                    <Tooltip content="Edit">
                      <IconButton
                        onClick={() => router.push("camp/edit/" + item._id)}
                      >
                        <EditIcon size={20} fill="#979797" />
                      </IconButton>
                    </Tooltip>
                  </Col>

                  <Col css={{ d: "flex" }}>
                    <Tooltip
                      content="Delete"
                      color="error"
                      onClick={() => handleClick()}
                      onDoubleClick={() => {
                        deleteItem(item._id, list.load);
                        handleClose();
                      }}
                    >
                      <IconButton>
                        <DeleteIcon size={20} fill="#FF0080" />
                      </IconButton>
                    </Tooltip>
                  </Col>
                </Row>
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
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message="Double Click to Delete"
        action={action}
      />
    </>
  );
}
