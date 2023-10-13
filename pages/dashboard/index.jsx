import Script from 'next/script'
import MyNav from '../../components/Nav'
import MyFooter from '../../components/Footer'
import Header from '../../components/Header'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Skeleton from '@mui/material/Skeleton';
import dynamic from 'next/dynamic'
import config from '../../public/assets/js/config'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import DtPicker from 'react-calendar-datetime-picker'
import 'react-calendar-datetime-picker/dist/index.css'
import { Dropdown } from "@nextui-org/react";
import myDetails from '../myDetails.json' assert {type: 'json'};
import Link from 'next/link'
import { useRouter } from 'next/router'
export default function Dashboard() {
    const router = useRouter()
    function onChange(date) {
        if (!date || !date?.from || !date.to) {
            return
        }
        axios.post("/get/dashboard", { date }).then(r => {
            const totalCount = r.data.data.reduce((sum, item) => sum + item.count, 0)
            setDash(prev => ({
                ...prev,
                topCamps: r.data.data,
                topUsers: r.data.users,
                leads: {
                    ...prev.leads,
                    all: totalCount
                }
            }))
        })
    }
    const [dash, setDash] = useState({
        loading: true,
    })
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/js/main.js';
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    useEffect(() => {
        axios.get("/get/dashboard").then(r => {
            setDash(r.data)
        })
    }, [])

    const state = {
        options: {
            chart: {
                height: 80,
                // width: 175,
                type: 'line',
                id: 'profileReportChart',
                toolbar: {
                    show: false
                },
                dropShadow: {
                    enabled: true,
                    top: 10,
                    left: 5,
                    blur: 3,
                    color: config.colors.warning,
                    opacity: 0.15
                },
                sparkline: {
                    enabled: true
                }
            },
            grid: {
                show: false,
                padding: {
                    right: 8
                }
            },
            colors: [config.colors.warning],
            dataLabels: {
                enabled: false
            },
            stroke: {
                width: 5,
                curve: 'smooth'
            },
            xaxis: {
                show: false,
                lines: {
                    show: false
                },
                labels: {
                    show: false
                },
                axisBorder: {
                    show: false
                }
            },
            yaxis: {
                show: false
            }
        },
        payments: [
            {
                data: dash.paymentData ?? [0, 0, 0, 0, 0, 0, 0]
            }
        ],
    };
    let cardColor = config.colors.white,
        headingColor = config.colors.headingColor,
        axisColor = config.colors.axisColor
    const donutSum = dash?.topCamps?.reduce((acc, curr) => acc + curr.count, 0) || 0;

    const topCamp = {
        options: {
            chart: {
                height: 165,
                width: 130,
                type: 'donut'
            },
            labels: dash.topCamps ? dash.topCamps.map((camp) => camp.name) : [0, 0, 0, 0, 0],
            colors: ['#696cff', '#8592a3', '#03c3ec', '#71dd37', '#FFFF00'],
            stroke: {
                width: 5,
                colors: cardColor
            },
            dataLabels: {
                enabled: false,
                formatter: function (val, opt) {
                    return parseInt(val) + '%';
                }
            },
            legend: {
                show: false
            },

            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            value: {
                                fontSize: '1.5rem',
                                fontFamily: 'Public Sans',
                                color: headingColor,
                                offsetY: -15,
                                formatter: function (val) {
                                    return parseInt(val) + '%';
                                }
                            },
                            name: {
                                offsetY: 20,
                                fontFamily: 'Public Sans'
                            },
                            total: {
                                show: true,
                                fontSize: '0.8125rem',
                                color: axisColor,
                                label: 'All',
                                formatter: function (w) {
                                    return '100%';
                                }
                            }
                        }
                    }
                }
            }
        },

        series: dash.topCamps ? dash.topCamps.map((camp) => ((camp.count / donutSum) * 100)) : [0, 0, 0, 0,],
    };
    let shadeColor, borderColor = '#eceef1'
    const click = {
        series: [
            {
                data: dash.clicks ? dash.clicks : [0, 0, 0, 0, 0, 0, 0]
            }
        ],
        chart: {
            height: 500,
            id: "incomeChart",
            parentHeightOffset: 0,
            parentWidthOffset: 0,
            toolbar: {
                show: false
            },
            type: 'area'
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            width: 2,
            curve: 'smooth'
        },
        legend: {
            show: false
        },
        markers: {
            size: 6,
            colors: 'transparent',
            strokeColors: 'transparent',
            strokeWidth: 4,
            discrete: [
                {
                    fillColor: config.colors.white,
                    seriesIndex: 0,
                    dataPointIndex: 7,
                    strokeColor: config.colors.primary,
                    strokeWidth: 2,
                    size: 6,
                    radius: 8
                }
            ],
            hover: {
                size: 7
            }
        },
        colors: [config.colors.primary] ?? ["#696cff"],
        fill: {
            type: 'gradient',
            gradient: {
                shade: shadeColor,
                shadeIntensity: 0.6,
                opacityFrom: 0.5,
                opacityTo: 0.25,
                stops: [0, 95, 100]
            }
        },
        grid: {
            borderColor: borderColor,
            strokeDashArray: 3,
            padding: {
                top: -20,
                bottom: -8,
                left: -10,
                right: 8
            }
        },
        xaxis: {
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            },
            labels: {
                show: true,
                style: {
                    fontSize: '13px',
                    colors: axisColor
                }
            }
        },
        yaxis: {
            labels: {
                show: false
            },

        }
    };
    const leads = {
        series: [
            {
                name: 'all',
                data: dash.sevenLeads ? dash.sevenLeads.all : [0, 0, 0, 0, 0, 0, 0],
                color: "#81bdff"
            },
            {
                name: 'approved',
                data: dash.sevenLeads ? dash.sevenLeads.approved : [0, 0, 0, 0, 0, 0, 0],
                color: '#16c965'
            },
            {
                name: 'rejected',
                data: dash.sevenLeads ? dash.sevenLeads.rejected : [0, 0, 0, 0, 0, 0, 0],
                color: '#f31260'
            },
            {
                name: 'pending',
                data: dash.sevenLeads ? dash.sevenLeads.pending : [0, 0, 0, 0, 0, 0, 0],
                color: '#f4a524'
            },
        ],
        chart: {
            height: 500,
            stacked: true,
            type: 'area',
            toolbar: { show: false }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 3,
            lineCap: 'round',
        },
        legend: {
            show: true,
            horizontalAlign: 'left',
            position: 'top',
            markers: {
                height: 8,
                width: 8,
                radius: 12,
                offsetX: -3
            },
            labels: {
                colors: axisColor
            },
            itemMargin: {
                horizontal: 10
            }
        },
        grid: {
            borderColor: borderColor,
            padding: {
                top: 0,
                bottom: -8,
                left: 20,
                right: 20
            }
        },
        xaxis: {
            categories: [7, 6, 5, 4, 3, 2, 1],
            labels: {
                show: false,
                style: {
                    fontSize: '13px',
                    colors: axisColor
                }
            },
            axisTicks: {
                show: false
            },
            axisBorder: {
                show: false
            }
        },
        yaxis: {
            labels: {
                show: false,
                style: {
                    fontSize: '13px',
                    colors: axisColor
                }
            }
        },
        responsive: [
            {
                breakpoint: 1700,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: '32%'
                        }
                    }
                }
            },
            {
                breakpoint: 1580,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: '35%'
                        }
                    }
                }
            },
            {
                breakpoint: 1440,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: '42%'
                        }
                    }
                }
            },
            {
                breakpoint: 1300,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: '48%'
                        }
                    }
                }
            },
            {
                breakpoint: 1200,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: '40%'
                        }
                    }
                }
            },
            {
                breakpoint: 1040,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 11,
                            columnWidth: '48%'
                        }
                    }
                }
            },
            {
                breakpoint: 991,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: '30%'
                        }
                    }
                }
            },
            {
                breakpoint: 840,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: '35%'
                        }
                    }
                }
            },
            {
                breakpoint: 768,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: '28%'
                        }
                    }
                }
            },
            {
                breakpoint: 640,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: '32%'
                        }
                    }
                }
            },
            {
                breakpoint: 576,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: '37%'
                        }
                    }
                }
            },
            {
                breakpoint: 480,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: '45%'
                        }
                    }
                }
            },
            {
                breakpoint: 420,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: '52%'
                        }
                    }
                }
            },
            {
                breakpoint: 380,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: '60%'
                        }
                    }
                }
            }
        ],
        states: {
            hover: {
                filter: {
                    type: 'none'
                }
            },
            active: {
                filter: {
                    type: 'none'
                }
            }
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 1,
                opacityTo: 0.9,
                stops: [0, 90, 100]
            }
        },
    };
    const sevenDaysSum = dash.paymentData ? Math.floor(dash?.paymentData.reduce((accumulator, currentValue) => accumulator + currentValue, 0)) : 0;
    const cr = {
        series: [Math.round(
            dash?.allClicks !== 0 ? (dash?.leads?.all / dash?.allClicks) * 100 : 0
        )],
        labels: ['7 days'],
        chart: {
            height: 240,
            type: 'radialBar'
        },
        plotOptions: {
            radialBar: {
                size: 150,
                offsetY: 10,
                startAngle: -150,
                endAngle: 150,
                hollow: {
                    size: '55%'
                },
                track: {
                    background: cardColor,
                    strokeWidth: '100%'
                },
                dataLabels: {
                    name: {
                        offsetY: 15,
                        color: headingColor,
                        fontSize: '15px',
                        fontWeight: '600',
                        fontFamily: 'Public Sans'
                    },
                    value: {
                        offsetY: -25,
                        color: headingColor,
                        fontSize: '22px',
                        fontWeight: '500',
                        fontFamily: 'Public Sans'
                    }
                }
            }
        },
        colors: [config.colors.primary],
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                shadeIntensity: 0.5,
                gradientToColors: [config.colors.primary],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 0.6,
                stops: [30, 70, 100]
            }
        },
        stroke: {
            dashArray: 5
        },
        grid: {
            padding: {
                top: -35,
                bottom: -10
            }
        },
        states: {
            hover: {
                filter: {
                    type: 'none'
                }
            },
            active: {
                filter: {
                    type: 'none'
                }
            }
        }
    };
    return (
        <>
            <Head>
                <title>Dashboard || EarningArea</title>
            </Head>
            <div className="layout-wrapper layout-content-navbar">
                <div className="layout-container">
                    <MyNav />
                    <div className="layout-page">
                        <Header />
                        <div className="container-xxl flex-grow-1 container-p-y">
                            <h4 className="fw-bold py-3 mb-4">Dashboard</h4>

                            <div className="row">
                                <div className="col-lg-8 mb-4 order-0">
                                    {dash.loading ? <Skeleton animation="wave" variant="rounded" sx={{ height: "174.656px", }} /> :
                                        <>
                                            <div className="card">
                                                <div className="d-flex align-items-end row">
                                                    <div className="col-sm-7">
                                                        <div className="card-body">
                                                            <h5 className="card-title text-primary">Welcome to {myDetails.name}! 🎉</h5>
                                                            <p className="mb-4">
                                                                {dash.dashText}
                                                            </p>

                                                            <Link href="https://earningarea.in" className="btn btn-sm btn-outline-primary">View EarningArea</Link>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-5 text-center text-sm-left">
                                                        <div className="card-body pb-0 px-0 px-md-4">
                                                            <img
                                                                src="../assets/img/illustrations/man-with-laptop-light.png"
                                                                height="140"
                                                                alt="View Badge User"
                                                                data-app-dark-img="illustrations/man-with-laptop-dark.png"
                                                                data-app-light-img="illustrations/man-with-laptop-light.png"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    }
                                </div>
                                <div className="col-lg-4 col-md-4 order-1">
                                    <div className="row">
                                        <div className="col-lg-6 col-md-12 col-6 mb-4">
                                            {dash.loading ? <Skeleton animation="wave" variant="rounded" sx={{ height: "174.656px", }} /> :
                                                <>  <div className="card">
                                                    <div className="card-body">
                                                        <div className="card-title d-flex align-items-start justify-content-between">
                                                            <div className="avatar flex-shrink-0">
                                                                <img
                                                                    src="../assets/img/icons/unicons/chart-success.png"
                                                                    alt="chart success"
                                                                    className="rounded"
                                                                />
                                                            </div>
                                                            <div className="dropdown">
                                                                <button
                                                                    className="btn p-0"
                                                                    type="button"
                                                                    id="cardOpt3"
                                                                    data-bs-toggle="dropdown"
                                                                    aria-haspopup="true"
                                                                    aria-expanded="false"
                                                                >
                                                                    <i className="bx bx-dots-vertical-rounded"></i>
                                                                </button>
                                                                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt3">
                                                                    <Link href='/dashboard/reports' className="dropdown-item" >View More</Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="fw-semibold d-block mb-1">Total Leads</span>
                                                        <h3 className="card-title mb-2">{Math.floor(dash?.leads?.all)}</h3>
                                                        {dash?.leads?.grow >= 0 ? (<small className="fw-semibold">{Math.floor(dash?.leads?.all)} Yesterday</small>)
                                                            : (<small className=" fw-semibold"><i className="bx bx-up-arrow-alt"></i> +0%</small>
                                                            )}
                                                    </div>
                                                </div>
                                                </>
                                            }

                                        </div>
                                        <div className="col-lg-6 col-md-12 col-6 mb-4">
                                            {dash.loading ? <Skeleton animation="wave" variant="rounded" sx={{ height: "174.656px", }} /> :
                                                <>     <div className="card">
                                                    <div className="card-body">
                                                        <div className="card-title d-flex align-items-start justify-content-between">
                                                            <div className="avatar flex-shrink-0">
                                                                <img
                                                                    src="../assets/img/icons/unicons/wallet-info.png"
                                                                    alt="Credit Card"
                                                                    className="rounded"
                                                                />
                                                            </div>
                                                            <div className="dropdown">
                                                                <button
                                                                    className="btn p-0"
                                                                    type="button"
                                                                    id="cardOpt6"
                                                                    data-bs-toggle="dropdown"
                                                                    aria-haspopup="true"
                                                                    aria-expanded="false"
                                                                >
                                                                    <i className="bx bx-dots-vertical-rounded"></i>
                                                                </button>
                                                                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt6">
                                                                    <Link href='/dashboard/reports' className="dropdown-item" >View More</Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span>Today Leads
                                                        </span>
                                                        <h3 className="card-title text-nowrap mb-1">{Math.floor(dash?.leads?.today)}</h3>
                                                        {dash?.leads?.grow >= 0 ? (<small className="text-success fw-semibold"><i className="bx bx-up-arrow-alt"></i>+{Math.floor(dash?.leads?.grow)}%</small>)
                                                            : (<small className="text-danger fw-semibold"><i className="bx bx-down-arrow-alt"></i> {Math.floor(dash?.leads?.grow)}%</small>
                                                            )}</div>
                                                </div>
                                                </>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 col-lg-8 order-2 order-md-3 order-lg-2 mb-4">
                                    {dash.loading ? <Skeleton animation="wave" variant="rounded" sx={{ height: "400.031px", }} /> :
                                        <>   <div className="card">
                                            <div className="row row-bordered g-0">
                                                <div className="col-md-8">
                                                    <h5 className="card-header m-0 me-2 pb-3">Total Revenue</h5>
                                                    <Chart
                                                        options={leads}
                                                        series={leads.series}
                                                        id="incomeChart"
                                                        type='area'
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="card-body">
                                                        <div className="text-center">
                                                            <button
                                                                onClick={() => router.pust("/dashboard/reports")}
                                                                className="btn btn-sm btn-outline-primary"
                                                                type="button"
                                                                id="growthReportId"
                                                                data-bs-toggle="dropdown"
                                                                aria-haspopup="true"
                                                                aria-expanded="false"
                                                            >
                                                                view
                                                            </button>

                                                        </div>
                                                    </div>

                                                    <Chart
                                                        options={cr}
                                                        series={cr?.series}
                                                        id="growthChart"
                                                        type='radialBar'
                                                    />
                                                    <div className="text-center fw-semibold pt-3 mb-2">{Math.round(
                                                        dash?.allClicks !== 0 ? (dash.leads.all / dash?.allClicks) * 100 : 0
                                                    )}% Conversion Rate</div>

                                                    <div className="d-flex px-xxl-4 px-lg-2 p-4 gap-xxl-3 gap-lg-1 gap-3 justify-content-between">
                                                        <div className="d-flex">
                                                            <div className="me-2">
                                                                <span className="badge bg-label-primary p-2"><i className="bx bx-dollar text-primary"></i></span>
                                                            </div>
                                                            <div className="d-flex flex-column">
                                                                <small>clicks</small>
                                                                <h6 className="mb-0">{dash?.allClicks}</h6>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex">
                                                            <div className="me-2">
                                                                <span className="badge bg-label-info p-2"><i className="bx bx-wallet text-info"></i></span>
                                                            </div>
                                                            <div className="d-flex flex-column">
                                                                <small>conversion</small>
                                                                <h6 className="mb-0">{dash.leads.all}</h6>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        </>
                                    }
                                </div>

                                <div className="col-12 col-md-8 col-lg-4 order-3 order-md-2">
                                    <div className="row">
                                        <div className="col-6 mb-4">
                                            {dash.loading ? <Skeleton animation="wave" variant="rounded" sx={{ height: "174.656px", }} /> :
                                                <>
                                                    <div className="card">
                                                        <div className="card-body">
                                                            <div className="card-title d-flex align-items-start justify-content-between">
                                                                <div className="avatar flex-shrink-0">
                                                                    <img src="../assets/img/icons/unicons/paypal.png" alt="Credit Card" className="rounded" />
                                                                </div>
                                                                <div className="dropdown">
                                                                    <button
                                                                        className="btn p-0"
                                                                        type="button"
                                                                        id="cardOpt4"
                                                                        data-bs-toggle="dropdown"
                                                                        aria-haspopup="true"
                                                                        aria-expanded="false"
                                                                    >
                                                                        <i className="bx bx-dots-vertical-rounded"></i>
                                                                    </button>
                                                                    <div className="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt4">
                                                                        <Link href='/dashboard/payments' className="dropdown-item" >View More</Link>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className="fw-semibold d-block mb-1">Today&rsquo;s Payments</span>
                                                            <h3 className="card-title text-nowrap mb-2">₹{Math.floor(dash.payments.today)}</h3>
                                                            {dash?.payments?.grow >= 0 ? (<small className="text-success fw-semibold"><i className="bx bx-up-arrow-alt"></i>+{Math.floor(dash?.payments?.grow)}%</small>)
                                                                : (<small className="text-danger fw-semibold"><i className="bx bx-down-arrow-alt"></i> {Math.floor(dash?.payments?.grow)}%</small>
                                                                )}
                                                        </div>
                                                    </div>
                                                </>
                                            }
                                        </div>
                                        <div className="col-6 mb-4">
                                            {dash.loading ? <Skeleton animation="wave" variant="rounded" sx={{ height: "174.656px", }} /> :
                                                <>
                                                    <div className="card">
                                                        <div className="card-body">
                                                            <div className="card-title d-flex align-items-start justify-content-between">
                                                                <div className="avatar flex-shrink-0">
                                                                    <img src="../assets/img/icons/unicons/cc-primary.png" alt="Credit Card" className="rounded" />
                                                                </div>
                                                                <div className="dropdown">
                                                                    <button
                                                                        className="btn p-0"
                                                                        type="button"
                                                                        id="cardOpt1"
                                                                        data-bs-toggle="dropdown"
                                                                        aria-haspopup="true"
                                                                        aria-expanded="false"
                                                                    >
                                                                        <i className="bx bx-dots-vertical-rounded"></i>
                                                                    </button>
                                                                    <div className="dropdown-menu" aria-labelledby="cardOpt1">
                                                                        <Link href='/dashboard/payments' className="dropdown-item" >View More</Link>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className="fw-semibold d-block mb-1">Total Payments</span>
                                                            <h3 className="card-title mb-2">₹{dash.payments.all}</h3>
                                                            <small className="fw-semibold"><i className="bx bx-up-arrow-alt"></i> +0%</small>
                                                        </div>
                                                    </div>
                                                </>
                                            }
                                        </div>

                                        <div className="col-12 mb-4">
                                            {dash.loading ? <Skeleton animation="wave" variant="rounded" sx={{ height: "174.656px", }} /> :
                                                <>
                                                    <div className="card">
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between flex-sm-row flex-column gap-3">
                                                                <div className="d-flex flex-sm-column flex-row align-items-start justify-content-between">
                                                                    <div className="card-title">
                                                                        <h5 className="text-nowrap mb-2">Payments 7 Day&rsquo;s</h5>
                                                                        <span className="badge bg-label-warning rounded-pill">Total</span>
                                                                    </div>
                                                                    <div className="mt-sm-auto">
                                                                        {dash?.payments?.grow >= 0 ? (<small className="text-success fw-semibold"><i className="bx bx-up-arrow-alt"></i>+{dash?.payments?.grow}%</small>)
                                                                            : (<small className="text-danger fw-semibold"><i className="bx bx-down-arrow-alt"></i> {dash?.payments?.grow}%</small>
                                                                            )}
                                                                        <h3 className="mb-0">₹{sevenDaysSum}</h3>
                                                                    </div>
                                                                </div>
                                                                <div >
                                                                    <Chart
                                                                        options={state.options}
                                                                        series={state.payments}
                                                                        type="line"
                                                                        height='80'
                                                                        id="profileReportChart"
                                                                    />
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ maxWidth: "300px", marginLeft: "auto", marginBottom: "20px" }} className="dropdown">
                                <DtPicker
                                    onChange={onChange}
                                    local='en'
                                    type='range'
                                    placeholder="FILTER"
                                    NextBtnIcon=''
                                />
                            </div>
                            <div className="row">

                                <div className="col-md-6 col-lg-4 col-xl-4 order-0 mb-4">
                                    {dash.loading ? <Skeleton animation="wave" variant="rounded" sx={{ height: "400.656px", }} /> :
                                        <>
                                            <div className="card h-100">
                                                <div className="card-header d-flex align-items-center justify-content-between pb-0">
                                                    <div className="card-title mb-0">
                                                        <h5 className="m-0 me-2">Leads Statistics</h5>
                                                        <small className="text-muted">{dash.camp} Total Campigns</small>
                                                    </div>

                                                </div>

                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <div className="d-flex flex-column align-items-center gap-1">
                                                            <h2 className="mb-2">{dash.leads.all}</h2>
                                                            <span>Total Leads</span>
                                                        </div>
                                                        {/* <div id="orderStatisticsChart"></div>
                                                         */}
                                                        <Chart
                                                            options={topCamp.options}
                                                            series={topCamp.series}
                                                            type='donut'
                                                            id="orderStatisticsChart"
                                                            height='165'
                                                            width='130'
                                                        />
                                                    </div>
                                                    <ul className="p-0 m-0">
                                                        {
                                                            dash.topCamps.map((data) => (
                                                                <li key={data.name} className="d-flex mb-4 pb-1">
                                                                    <div className="avatar flex-shrink-0 me-3">
                                                                        <span className="avatar-initial rounded bg-label-primary"
                                                                        ><i className="bx bx-mobile-alt"></i
                                                                        ></span>
                                                                    </div>
                                                                    <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                                                                        <div className="me-2">
                                                                            <h6 className="mb-0">{data.name}</h6>
                                                                            <small className="text-muted">{data.offerID}</small>
                                                                        </div>
                                                                        <div className="user-progress">
                                                                            <small className="fw-semibold">{data.count}</small>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))
                                                        }

                                                    </ul>
                                                </div>

                                            </div>
                                        </>
                                    }
                                </div>
                                <div className="col-md-6 col-lg-4 order-1 mb-4">
                                    {dash.loading ? <Skeleton animation="wave" variant="rounded" sx={{ height: "400.656px", }} /> :
                                        <>
                                            <div className="card h-100">
                                                <div className="card-header">
                                                    <h5>Last 7 day&rsquo;s clicks</h5>
                                                </div>
                                                <div className="d-flex flex-column align-items-center gap-1">
                                                    <h2 className="mb-2">{dash?.totalClicks}</h2>
                                                    <span>Total Clicks</span>
                                                </div>
                                                <div className="card-body px-0">
                                                    <div className="tab-content p-0">
                                                        <div className="tab-pane fade show active" id="navs-tabs-line-card-income" role="tabpanel">
                                                            <Chart
                                                                options={click}
                                                                series={click.series}
                                                                id="incomeChart"
                                                                type='area'
                                                            />
                                                            <div className="d-flex p-4 pt-3">
                                                                <div className="avatar flex-shrink-0 me-3">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    }
                                </div>
                                <div className="col-md-6 col-lg-4 order-2 mb-4">
                                    {dash.loading ? <Skeleton animation="wave" variant="rounded" sx={{ height: "400.656px", }} /> :
                                        <>
                                            <div className="card h-100">
                                                <div className="card-header d-flex align-items-center justify-content-between">
                                                    <h5 className="card-title m-0 me-2">Top Users</h5>
                                                </div>
                                                <div className="card-body">
                                                    <ul className="p-0 m-0">
                                                        {
                                                            dash?.topUsers?.map((data) => (
                                                                <li key={data._id} className="d-flex mb-4 pb-1">
                                                                    <div className="avatar flex-shrink-0 me-3">
                                                                        <img src="../assets/img/icons/unicons/paypal.png" alt="User" className="rounded" />
                                                                    </div>
                                                                    <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                                                                        <div className="me-2">
                                                                            <small className="text-muted d-block mb-1">{data._id}</small>
                                                                            <h6 className="mb-0">{data.paymentCount} times</h6>
                                                                        </div>
                                                                        <div className="user-progress d-flex align-items-center gap-1">
                                                                            <h6 className="mb-0">+{data.totalAmount}</h6>
                                                                            <span className="text-muted"><i className='bx bx-rupee'></i></span>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))
                                                        }

                                                    </ul>
                                                </div>
                                            </div>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                        <MyFooter />
                        <div className="content-backdrop fade"></div>
                    </div>
                </div>

            </div>

            <div className="layout-overlay layout-menu-toggle"></div>

        </>
    )
}

