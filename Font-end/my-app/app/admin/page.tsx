'use client';
import React, { useState } from 'react';
import { Container, Row, Col, Navbar, Form, Button, Offcanvas, Dropdown, ProgressBar, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHouse, faBarsProgress, faCartShopping, faTicket, faCircleUser,
    faChartSimple, faComments, faDollarSign, faRightFromBracket, faGear,
    faBarsStaggered, faBell, faDollar,
    faChevronUp,
    faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { FaSearch, FaUsers } from 'react-icons/fa';
import Link from 'next/link';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './admin.css';
import { motion, AnimatePresence } from 'framer-motion';
ChartJS.register(ArcElement, Tooltip, Legend);

const useDarkMode = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark';
        }
        return true;
    });

    const toggleDarkMode = () => {
        setIsDarkMode((prevMode) => {
            const newMode = !prevMode;
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', newMode ? 'dark' : 'light');
                document.body.classList.toggle('dark-mode', newMode);
            }
            return newMode;
        });
    };
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            document.body.classList.toggle('dark-mode', isDarkMode);
        }
    }, [isDarkMode]);

    return { isDarkMode, toggleDarkMode };
};

export default function ShowAdmin() {
    const [openProductMenu, setOpenProductMenu] = useState(false);
    const [show, setShow] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const toggleSidebar = () => setCollapsed(!collapsed);
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    const products = [
        { sno: '01', name: 'Mì ý', popularity: 50, percentage: 50, barColor: '#4dabf7' },
        { sno: '02', name: 'Gà rán', popularity: 20, percentage: 20, barColor: '#2ecc71' },
        { sno: '03', name: 'Combo mì gà', popularity: 30, percentage: 30, barColor: '#4dabf7' },
        { sno: '04', name: 'Pizza sốt cà', popularity: 45, percentage: 45, barColor: '#2ecc71' },
        { sno: '05', name: 'Cơm gạo Nhật', popularity: 70, percentage: 70, barColor: '#f1c40f' },
        { sno: '06', name: 'Combo 2 gà', popularity: 45, percentage: 45, barColor: '#e74c3c' },
    ];

    const activities = [
        { icon: 'blue', text: 'Vượng vừa sủa.', time: '4:45 PM' },
        { icon: 'green', text: 'Vượng nhận mình là con chó.', time: '3 hrs' },
        { icon: 'green', text: 'Đã xác thực Vượng là chó', time: '22 hrs' },
        { icon: 'pink', text: 'Vượng đã xác thực Vượng vừa ăn cức.', time: 'today' },
        { icon: 'yellow', text: 'Khánh đẹp trai 02 2 bên 2 em gái.', time: '22 hrs' },
        { icon: 'blue', text: 'Trí đẳng cấp.', time: '12 hrs' },
    ];
    return (
        <div className="d-flex">
            {/* Sidebar */}
            <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                <h3 className="text-center">
                    <img
                        className="rounded-circle"
                        src="/logo-admin.jpg"
                        style={{ width: '100px', height: '100px', marginLeft: 50 }}
                        alt="Logo"
                    />
                </h3>
                <div className="navbar">
                    <div className="nav-item">
                        <div className="nav-link1">
                            <FontAwesomeIcon icon={faHouse} style={{ marginTop: '8px', marginLeft: '5px' }} />
                            <Link href="/admin">Dashboard</Link>
                        </div>
                        <div
                            className="nav-link flex items-center justify-between text-gray-700 hover:text-blue-600 cursor-pointer transition"
                            onClick={() => setOpenProductMenu(!openProductMenu)}
                        >
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }} icon={faBarsProgress} />
                                <span style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }}>Quản lý sản phẩm</span>
                            </div>
                            <FontAwesomeIcon style={{ color: 'rgb(135, 136, 140)' }} icon={openProductMenu ? faChevronUp : faChevronDown} />
                        </div>

                        <AnimatePresence>
                            {openProductMenu && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="ml-6 overflow-hidden"
                                >
                                    <div className="submenu space-y-1 mt-2">
                                        <Link
                                            href="/admin/productActive"
                                            className="nav-link2"
                                        >
                                            Sản phẩm đang bán
                                        </Link>
                                        <Link
                                            href="/admin/productHidden"
                                            className="nav-link2"
                                        >
                                            Sản phẩm ngưng bán
                                        </Link>

                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="nav-link">
                        <FontAwesomeIcon
                            icon={faTicket}
                            style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }}
                        />
                        <Link style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }} href="#">
                            Quản lý danh mục
                        </Link>
                    </div>

                    <div className="nav-link">
                        <FontAwesomeIcon
                            icon={faCartShopping}
                            style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }}
                        />
                        <Link style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }} href="#">
                            Quản lý đơn hàng
                        </Link>
                    </div>

                    <div className="nav-link">
                        <FontAwesomeIcon
                            icon={faTicket}
                            style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }}
                        />
                        <Link style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }} href="#">
                            Quản lý voucher
                        </Link>



                        <div className="nav-link">
                            <FontAwesomeIcon
                                icon={faCircleUser}
                                style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }}
                            />
                            <Link style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }} href="#">
                                Quản lý người dùng
                            </Link>
                        </div>

                        <div className="nav-link">
                            <FontAwesomeIcon
                                icon={faChartSimple}
                                style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }}
                            />
                            <Link style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }} href="#">
                                Thống kê
                            </Link>
                        </div>

                        <div className="nav-link">
                            <FontAwesomeIcon
                                icon={faComments}
                                style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }}
                            />
                            <Link style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }} href="#">
                                Đánh giá
                            </Link>
                        </div>

                       
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <Container fluid className={`content w-100 container-content ${collapsed ? 'collapsed-content' : ''}`}>
                <Navbar className="navbar" style={{ marginRight: '10px' }}>
                    <Container fluid className="container-fluid">
                        <Button variant="light" onClick={toggleSidebar} className="me-3">
                            <FontAwesomeIcon icon={faBarsStaggered} />
                        </Button>
                        <Form className="d-flex search-form">
                            <div className="input-group">
                                <input
                                    className="form-control search-input"
                                    type="search"
                                    placeholder="Tìm kiếm..."
                                    aria-label="Search"
                                />
                                <button className="btn search-button" type="submit">
                                    <FaSearch />
                                </button>
                            </div>
                        </Form>
                        <div className="hihi">
                            <span className="me-3">
                                <FontAwesomeIcon icon={faBell} style={{ fontSize: 24 }} />
                            </span>
                            <span>
                                <Dropdown>
                                    <Dropdown.Toggle className="drop-down-avt" id="dropdown-basic">
                                        <img
                                            src="/avt.jpg"
                                            className="rounded-circle"
                                            alt="User Avatar"
                                            style={{ width: '45px', height: '45px', marginTop: '-18px', marginRight: '12px' }}
                                        />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item href="/admin/account">Trang cá nhân</Dropdown.Item>
                                        <Dropdown.Item href="#/action-2">Cài đặt</Dropdown.Item>
                                        <Dropdown.Item href="#/action-3">Đăng xuất</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </span>
                            <span>
                                <Button className="btn-setting" onClick={handleShow}>
                                    <FontAwesomeIcon icon={faGear} className="setting-icon" style={{ fontSize: 24 }} />
                                </Button>
                            </span>
                            <Offcanvas show={show} onHide={handleClose} placement="end">
                                <Offcanvas.Header closeButton>
                                    <Offcanvas.Title>Cấu hình trang web</Offcanvas.Title>
                                </Offcanvas.Header>
                                <Offcanvas.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span>{isDarkMode ? 'Trạng thái: Light Mode' : 'Trạng thái: Dark Mode'}</span>
                                        <Form.Check
                                            type="switch"
                                            id="dark-mode-switch"
                                            label=""
                                            checked={isDarkMode}
                                            onChange={toggleDarkMode}
                                        />
                                    </div>
                                </Offcanvas.Body>
                            </Offcanvas>
                        </div>
                    </Container>
                </Navbar>

                {/* Dashboard Cards */}
                <div className="dashboard-container">
                    <Row>
                        <Col md={3}>
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <span>Tổng doanh thu</span>
                                    <div className="toggle-switch">
                                        <input type="checkbox" id="toggle1" />
                                        <label htmlFor="toggle1"></label>
                                    </div>
                                </div>
                                <p className="card-subtext">Tổng quan tháng này</p>
                                <div className="card-content">
                                    <h3>3,456 VND</h3>
                                    <FontAwesomeIcon
                                        icon={faDollar}
                                        style={{ color: 'rgb(175, 175, 38)', fontSize: '23px', marginBottom: '0.5rem' }}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <span>Tổng đơn hàng</span>
                                    <div className="toggle-switch">
                                        <input type="checkbox" id="toggle2" defaultChecked />
                                        <label htmlFor="toggle2"></label>
                                    </div>
                                </div>
                                <p className="card-subtext">Tổng quan tháng này</p>
                                <div className="card-content">
                                    <h3>4,738</h3>
                                    <FontAwesomeIcon
                                        icon={faCartShopping}
                                        style={{ color: 'rgb(25, 154, 193)', fontSize: '23px', marginBottom: '0.5rem' }}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <span>Người dùng mới</span>
                                    <div className="toggle-switch">
                                        <input type="checkbox" id="toggle3" />
                                        <label htmlFor="toggle3"></label>
                                    </div>
                                </div>
                                <p className="card-subtext">Tổng quan tháng này</p>
                                <div className="card-content">
                                    <h3>6,738</h3>
                                    <FaUsers className="card-icon green-icon" />
                                </div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <span>Tổng đánh giá</span>
                                    <div className="toggle-switch">
                                        <input type="checkbox" id="toggle4" />
                                        <label htmlFor="toggle4"></label>
                                    </div>
                                </div>
                                <p className="card-subtext">Tổng quan tháng này</p>
                                <div className="card-content">
                                    <h3>$8,963</h3>
                                    <FontAwesomeIcon
                                        icon={faComments}
                                        style={{ color: 'rgb(193, 25, 168)', fontSize: '23px', marginBottom: '0.5rem' }}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Dashboard Sections */}
                <div className="dashboard-product">
                    <Row>
                        <Col md={7}>
                            <div className="dashboard-card">
                                <h5>Sản phẩm phổ biến</h5>
                                <div className="table">
                                    <Table className="table">
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th>Tên sản phẩm</th>
                                                <th>Sự phổ biến</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((product) => (
                                                <tr key={product.sno}>
                                                    <td>{product.sno}</td>
                                                    <td>{product.name}</td>
                                                    <td>
                                                        <ProgressBar
                                                            now={product.popularity}
                                                            style={{ height: '5px', backgroundColor: '#2a3b4c' }}
                                                            variant="custom"
                                                            className={`progress-bar-${product.barColor}`}

                                                        />
                                                    </td>
                                                    <td>{product.percentage}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </Col>
                        <Col md={5}>
                            <div className="dashboard-card">
                                <h5>Hoạt động gần đây</h5>
                                <ul className="activity-list">
                                    {activities.map((activity, index) => (
                                        <li key={index} className="activity-item">
                                            <div className={`activity-icon ${activity.icon}`}></div>
                                            <div className="activity-content">
                                                <p>{activity.text}</p>
                                                <span>{activity.time}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
}