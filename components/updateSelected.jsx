import { useState } from "react";
import { Radio } from "@nextui-org/react";
import {
  Modal,
  Button,
  Text,
  Loading,
  Progress,
  Badge,
} from "@nextui-org/react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import axios from "axios";
import toast from "react-hot-toast";

const UpdatesList = ({ rows }) => {
  return (
    <List>
      {rows.map((row, index) => (
        <ListItem sx={{ width: "100%" }} key={index}>
          <Badge variant="flat">
            <Badge color="primary" variant="bordered">
              {index + 1}
            </Badge>
            <Badge color="secondary" variant="bordered">
              {row}
            </Badge>
          </Badge>
        </ListItem>
      ))}
    </List>
  );
};

const UpdateSelection = ({ selection }) => {
  const [isClose, setIsClose] = useState(true);
  const [isClose2, setIsClose2] = useState(true);
  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [update, setUpdate] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error, setError] = useState(null);

  // Handle status selection
  const handler = (status) => {
    setVisible(true);
    setUpdate(status);
  };

  // Close the modal
  const closeHandler = () => {
    setVisible2(false);
    setVisible(false);
    setIsClose(true); // Reset modal closability
    setIsClose2(true); // Reset modal closability
    setCount(0); // Reset progress count
    setError(null); // Reset error state
  };

  // Handle the update process for each selected ID
  const handelUpdates = async () => {
    setLoading(true); // Start loading state
    setIsClose(false); // Disable close button while processing
    setCount(0);
    try {
      await Promise.all(
        selection.map(async (ID) => {
          try {
            await axios.post("/update/selected", {
              ID,
              leadStatus: update,
            });
            setCount((prevCount) => prevCount + 1); // Increment count on success
          } catch (error) {
            console.error("Update failed for ID:", ID, error);
            setError("An error occurred while updating. Please try again.");
          }
        })
      );
    } finally {
      setLoading(false); // End loading state
      setIsClose(true); // Allow closing modal after completion
    }
  };
  const handleDeletes = async () => {
    setLoading2(true); // Start loading state
    setIsClose2(false); // Disable close button while processing

    try {
      await axios.post("/leads/delete", {
        selection,
      });
      toast.success("Deleted !")
    } finally {
      setLoading2(false); // End loading state
      setIsClose2(true); // Allow closing modal after completion
      closeHandler()
    }
  }
  const percentage =
    selection.length > 0 ? Math.round((count / selection.length) * 100) : 0;
  return (
    <>
      <div style={{
        "marginBottom": '5px'
      }}>With selected :</div>
      <div style={{
        "marginBottom": "10px"
      }}>
        <Button onPress={() => setVisible2(true)} color="error">Delete selected ({selection.length})</Button>
      </div>
      <hr />
      <Radio.Group
        orientation="horizontal"
        label="With selected"
        size="sm"
        style={{
          padding: "10px",
        }}
        onChange={handler}
      >
        <Radio value="Approved" color="success">
          Approved
        </Radio>
        <Radio value="Pending" color="warning">
          Pending
        </Radio>
        <Radio value="Rejected" color="error">
          Rejected
        </Radio>
      </Radio.Group>
      <Modal
        scroll
        preventClose
        closeButton={isClose}
        blur
        aria-labelledby="modal-title"
        open={visible}
        onClose={closeHandler}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Are You{" "}
            <Text b size={18}>
              Sure?
            </Text>
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Text>
            Updating to{"   "}
            <Text b size={18}>
              {update == "Approved" && (
                <Badge enableShadow disableOutline color="success">
                  Approved
                </Badge>
              )}
              {update == "Pending" && (
                <Badge enableShadow disableOutline color="warning">
                  Pending
                </Badge>
              )}
              {update == "Rejected" && (
                <Badge enableShadow disableOutline color="error">
                  Rejected
                </Badge>
              )}
            </Text>
          </Text>
          <UpdatesList rows={selection} />
          {error && <Text color="error">{error}</Text>}
        </Modal.Body>
        <Modal.Footer>
          {count > 0 && (
            <Text>
              {count}/{selection.length}
            </Text>
          )}
          <Progress striped color="secondary" size="xs" value={percentage} />
          {isClose && (
            <>
              <Button auto light color="error" onPress={closeHandler}>
                Close
              </Button>
            </>
          )}
          <Button
            color="secondary"
            auto
            shadow
            bordered={loading}
            disabled={loading}
            onPress={handelUpdates}
          >
            {loading ? (
              <Loading type="points-opacity" color="currentColor" size="sm" />
            ) : (
              "UPDATE ALL"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        scroll
        preventClose
        closeButton={isClose2}
        blur
        aria-labelledby="modal-title"
        open={visible2}
        onClose={closeHandler}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Are You{" "}
            <Text b size={18}>
              Sure?
            </Text>
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Text>
            Deleting{"   "}
            <Text b size={18}>
              {update == "Approved" && (
                <Badge enableShadow disableOutline color="success">
                  Approved
                </Badge>
              )}
              {update == "Pending" && (
                <Badge enableShadow disableOutline color="warning">
                  Pending
                </Badge>
              )}
              {update == "Rejected" && (
                <Badge enableShadow disableOutline color="error">
                  Rejected
                </Badge>
              )}
            </Text>
          </Text>
          <UpdatesList rows={selection} />
          {error && <Text color="error">{error}</Text>}
        </Modal.Body>
        <Modal.Footer>
          {count > 0 && (
            <Text>
              {count}/{selection.length}
            </Text>
          )}
          <Progress striped color="secondary" size="xs" value={percentage} />
          {isClose && (
            <>
              <Button auto light color="error" onPress={closeHandler}>
                Close
              </Button>
            </>
          )}
          <Button
            color="secondary"
            auto
            shadow
            bordered={loading2}
            disabled={loading2}
            onPress={handleDeletes}
          >
            {loading ? (
              <Loading type="points-opacity" color="currentColor" size="sm" />
            ) : (
              "DELETE ALL"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UpdateSelection;
