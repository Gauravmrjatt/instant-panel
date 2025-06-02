import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { globalCss } from "@nextui-org/react";
import Script from "next/script";
import MyNav from "../../../../components/Nav";
import Header from "../../../../components/Header";
import Head from "next/head";
import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import LinearProgress from "@mui/material/LinearProgress";
import { IconButton } from "@mui/material";
import { Filter } from "react-iconly";
import Link from "next/link";
import { Badge, Tooltip, Dropdown } from "@nextui-org/react";
import UpdateSelection from "@/components/updateSelected";
export default function Leads() {
  const router = useRouter();
  const { id: ID } = router.query;
  const [rows, setRows] = useState([]);
  const [isLoading, setisLoading] = useState(true);
  const columns = [
    {
      field: "event",
      headerName: "EVENT",
      width: 100,
      renderCell: (params) => {
        const { value } = params;
        let chipColor = "primary";
        let chipLabel = value;

        return (
          <div
            style={{
              textAlign: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {chipLabel}
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "STATUS",
      width: 120,
      renderCell: (params) => {
        const { value } = params;
        let chipColor = "primary";
        let chipLabel = value;

        if (value === "Approved") {
          chipColor = "success";
        } else if (value === "Pending") {
          chipColor = "warning";
        } else if (value === "Rejected" || value === "REJECTED") {
          chipColor = "error";
        }

        return (
          <div
            style={{
              textAlign: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Badge enableShadow disableOutline color={chipColor}>
              {chipLabel}
            </Badge>
          </div>
        );
      },
    },
    {
      field: "message",
      headerName: "MSG",
      width: 70,
      renderCell: (params) => {
        const { value } = params;
        let chipColor = "primary";
        let chipLabel = value;

        if (value === "Approved") {
          chipColor = "success";
        } else if (value === "Pending") {
          chipColor = "warning";
        } else if (value === "Rejected") {
          chipColor = "error";
        }

        return (
          <Tooltip
            style={{
              textAlign: "center",
              justifyContent: "center",
              width: "100%",
            }}
            content={chipLabel}
            rounded
            color="primary"
          >
            <div
              style={{
                textAlign: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <i
                style={{ display: "block", marginInline: "auto" }}
                className="bx bx-info-circle"
              ></i>
            </div>
          </Tooltip>
        );
      },
    },
    { field: "user", headerName: "USER", width: 130 },
    { field: "refer", headerName: "REFER", width: 130 },
    { field: "userAmount", headerName: "USER AMO..", width: 130 },
    {
      field: "clicktoconv",
      headerName: "C2C TIME",
      width: 120,
      hide: true,
      valueFormatter: (params) => {
        const { value } = params;
        return Math.round(value);
      },
    },
    { field: "referAmount", headerName: "REFER AMO..", width: 130 },
    {
      field: "params", headerName: "Params",
      width: 130,
      renderCell: (params) => {
        const { value } = params;
        return (
          JSON.stringify(value)
        );
      },
    },
    {
      field: "paymentStatus",
      headerName: "PAYMENT",
      width: 130,
      renderCell: (params) => {
        const { value } = params;
        let chipColor = "default";
        let chipLabel = value;

        if (value === "ACCEPTED") {
          chipColor = "success";
        } else if (value === "PENDING") {
          chipColor = "warning";
        } else if (value === "fail" || value === "FAILURE") {
          chipColor = "error";
        }
        return (
          <Tooltip title={chipLabel} rounded color="primary">
            <div style={{ textAlign: "center" }}>
              <Badge enableShadow disableOutline color={chipColor}>
                {chipLabel}
              </Badge>
            </div>
          </Tooltip>
        );
      },
    },
    {
      field: "payMessage",
      headerName: "PAY",
      width: 70,
      renderCell: (params) => {
        const { value } = params;
        let chipColor = "primary";
        let chipLabel = value;

        return (
          <Tooltip
            style={{
              textAlign: "center",
              justifyContent: "center",
              width: "100%",
            }}
            content={chipLabel}
            rounded
            color="primary"
          >
            <div
              style={{
                textAlign: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <i
                style={{ display: "block", marginInline: "auto" }}
                className="bx bx-info-circle"
              ></i>
            </div>
          </Tooltip>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "CREATED AT",
      width: 180,
      type: "date",
      valueFormatter: (params) => {
        const date = new Date(params.value);
        const options = {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          day: "numeric",
          month: "short",
          year: "numeric",
        };
        return date.toLocaleString(undefined, options);
      },
    },
    {
      field: "click",
      headerName: "CLICK ID",
      width: 120,
      hide: true,
    },
    {
      field: "id",
      headerName: "ACTIONS",
      width: 120,
      renderCell: (params) => (
        <div
          style={{
            textAlign: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <IconButton
            color="primary"
            onClick={() =>
              router.push(
                "/dashboard/camp/click/" +
                params.row.id +
                "?event=" +
                params.row.event
              )
            } // Replace with your action function
          >
            <i
              style={{ display: "block", marginInline: "auto" }}
              className="bx bx-dots-vertical-rounded"
            ></i>
          </IconButton>
        </div>
      ),
    },
  ];
  function CustomToolbar() {
    return (
      <>
        <GridToolbarContainer
          sx={{ position: "absolute", top: "-60px", right: "10px" }}
        >
          <Dropdown closeOnSelect={false}>
            <Dropdown.Button light>
              <IconButton>
                <Filter set="bulk" primaryColor="blueviolet" />
              </IconButton>
            </Dropdown.Button>
            <Dropdown.Menu aria-label="Static Actions">
              <Dropdown.Item key="new">
                {" "}
                <GridToolbarColumnsButton />
              </Dropdown.Item>
              <Dropdown.Item key="copy">
                {" "}
                <GridToolbarFilterButton />
              </Dropdown.Item>
              <Dropdown.Item key="select">
                {" "}
                <GridToolbarDensitySelector />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <GridToolbarExport />
        </GridToolbarContainer>
      </>
    );
  }
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/assets/js/main.js";
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (ID) {
      async function getData() {
        try {
          const { data } = await axios.get("/get/leads/" + ID);
          setRows(data.data.map((row) => ({ ...row, id: row._id })));
          setisLoading(false);
        } catch (error) {
          setisLoading(false);
          console.log(error);
        }
      }
      getData();
    }
  }, [ID]);
  const [selectedRows, setSelectedRows] = useState([]);
  const handleRowSelection = (ids) => {
    setSelectedRows(ids);
  };

  return (
    <>
      <Head>
        <title>View Leads</title>
      </Head>
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          <MyNav />
          <div className="layout-page">
            <Header />
            <div className="content-wrapper">
              <div className="container-xxl flex-grow-1 container-p-y">
                <h4 className="fw-bold py-3 mb-4">
                  <Link href="/dashboard" className="text-muted fw-light">
                    Dashboard /
                  </Link>{" "}
                  <Link
                    href="/dashboard/liveCampaigns"
                    className="text-muted fw-light"
                  >
                    Camp /
                  </Link>{" "}
                  View
                </h4>
                <div className="row">
                  <div className="col-md-12">
                    <div className="card mb-4">
                      <h5 className="card-header">View Leads</h5>
                      <hr className="my-0" />

                      <div style={{ height: 900, width: "100%" }}>
                        <DataGrid
                          rows={rows}
                          columns={columns}
                          initialState={{
                            columns: {
                              columnVisibilityModel: {
                                params: false,
                              },
                            },
                          }}
                          components={{
                            Toolbar: CustomToolbar,
                            Header: (props) => (
                              <div
                                style={{
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 1,
                                  background: "white",
                                }}
                              >
                                <DataGrid.Header {...props} />
                              </div>
                            ),
                          }}
                          columnResizable={true}
                          rowMoveEnabled
                          pageSizeOptions={[5, 10, 50, 100]}
                          checkboxSelection
                          onSelectionModelChange={handleRowSelection}
                          onRowSelectionModelChange={handleRowSelection}
                          loading={isLoading}
                          slots={{
                            toolbar: CustomToolbar,
                            loadingOverlay: LinearProgress,
                          }}
                        />
                      </div>
                      {/* TODO update status to user select and if success then ask user to pay include  */}
                      <div>
                        {selectedRows.length > 0 && (
                          <>
                            <div
                              style={{ padding: "20px" }}
                              className="update-card"
                            >
                              <UpdateSelection selection={selectedRows} />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-backdrop fade"></div>
            </div>
          </div>
        </div>
        <div className="layout-overlay layout-menu-toggle"></div>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
      <Script src="/assets/js/dashboards-analytics.js"></Script>
    </>
  );
}
