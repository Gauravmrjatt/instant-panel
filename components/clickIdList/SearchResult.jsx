import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarExport,
    GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import { useEffect, useState, useRef } from 'react'
import { Badge, Tooltip, Dropdown, Button } from "@nextui-org/react";
import { IconButton } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { Filter } from 'react-iconly'
export default function Lists({ rows, onBack }) {
    const columns = [
        { field: 'click', headerName: 'ID', width: 130 },
        { field: 'user', headerName: 'USER', width: 200 },
        { field: 'refer', headerName: 'REFER', width: 200 },
        { field: 'ip', headerName: 'IP', width: 200 },
        {
            field: 'createdAt',
            headerName: 'CREATED AT',
            width: 200,
            type: 'date',
            valueFormatter: (params) => {
                const date = new Date(params.value);
                const options = {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                };
                return date.toLocaleString(undefined, options);
            },
        },
    ];
    function CustomToolbar() {
        return (
            <>
                <GridToolbarContainer sx={{ position: "absolute", top: "-60px", right: "10px" }}>

                    <Dropdown closeOnSelect={false}>
                        <Dropdown.Button light><IconButton>
                            <Filter set="bulk" primaryColor="blueviolet" />
                        </IconButton></Dropdown.Button>
                        <Dropdown.Menu aria-label="Static Actions">
                            <Dropdown.Item key="new"> <GridToolbarColumnsButton /></Dropdown.Item>
                            <Dropdown.Item key="copy"> <GridToolbarFilterButton /></Dropdown.Item>
                            <Dropdown.Item key="select">  <GridToolbarDensitySelector /></Dropdown.Item>

                        </Dropdown.Menu>
                    </Dropdown>
                    <GridToolbarExport />

                </GridToolbarContainer>
            </>
        );
    }
    function goBack() {
        onBack()
    }
    return (<>
        <div className="row">
            <div className="col-md-12">
                <Button onPress={goBack} auto css={{ marginLeft: "auto", marginBottom: "10px", marginRight: "10px" }}>
                    Back
                </Button>
                <div className="card mb-4">
                    <h5 className="card-header">Click Details</h5>
                    <hr className="my-0" />

                    <div style={{ height: 900, width: '100%' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            initialState={{
                                columns: {
                                    columnVisibilityModel: {
                                        // Hide columns status and traderName, the other columns will remain visible
                                        params: false,
                                    },
                                },
                            }}
                            components={{
                                Toolbar: CustomToolbar,
                                Header: (props) => (
                                    <div style={{ position: 'sticky', top: 0, zIndex: 1, background: 'white' }}>
                                        <DataGrid.Header {...props} />
                                    </div>
                                ),
                            }}
                            columnResizable={true}
                            rowMoveEnabled
                            pageSizeOptions={[5, 10, 50, 100]}
                            checkboxSelection
                            slots={{
                                toolbar: CustomToolbar,
                                loadingOverlay: LinearProgress,
                            }}
                        />
                    </div>

                </div>
            </div>
        </div>
    </>)
}