import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import Script from "next/script";
import MyNav from "../../components/Nav";
import Header from "../../components/Header";
import Head from "next/head";
import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import LinearProgress from "@mui/material/LinearProgress";
import { IconButton } from "@mui/material";
import { Filter } from "react-iconly";
import { Badge, Tooltip, Dropdown } from "@nextui-org/react";

export default function Leads() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPayments, setTotalPayments] = useState(0);

  const columns = [
    { field: "number", headerName: "USER", width: 100 },
    { field: "amount", headerName: "AMOUNT", width: 120 },
    { field: "comment", headerName: "MSG", width: 70 },
    { field: "type", headerName: "TYPE", width: 130 },
    { field: "response", headerName: "STATUS", width: 130 },
    {
      field: "createdAt",
      headerName: "CREATED AT",
      width: 250,
      type: "date",
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleString(undefined, {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      },
    },
  ];

  function CustomToolbar() {
    return (
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
    );
  }

  const fetchPayments = async (
    currentPage = page,
    currentPageSize = pageSize
  ) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `/get/payments?page=${currentPage + 1}&limit=${currentPageSize}`
      );
      setRows(data.data.map((row) => ({ ...row, id: row._id })));
      setTotalPayments(data.totalPayments);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch payments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, pageSize]);

  return (
    <>
      <Head>
        <title>Payments History</title>
      </Head>
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          <MyNav />
          <div className="layout-page">
            <Header />
            <div className="content-wrapper">
              <div className="container-xxl flex-grow-1 container-p-y">
                <h4 className="fw-bold py-3 mb-4">
                  <span className="text-muted fw-light">Dashboard /</span>{" "}
                  Payments History
                </h4>
                <div className="row">
                  <div className="col-md-12">
                    <div className="card mb-4">
                      <h5 className="card-header">Payments</h5>
                      <hr className="my-0" />
                      <div style={{ height: 900, width: "100%" }}>
                        <DataGrid
                          rows={rows}
                          columns={columns}
                          rowCount={totalPayments}
                          pagination
                          paginationMode="server"
                          pageSize={pageSize}
                          onPageSizeChange={(newPageSize) =>
                            setPageSize(newPageSize)
                          }
                          page={page}
                          onPageChange={(newPage) => setPage(newPage)}
                          loading={isLoading}
                          components={{
                            Toolbar: CustomToolbar,
                            LoadingOverlay: LinearProgress,
                          }}
                          checkboxSelection
                        />
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
      <Script src="/assets/js/dashboards-analytics.js" />
    </>
  );
}
