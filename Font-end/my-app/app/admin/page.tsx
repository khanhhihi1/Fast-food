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
import AdminSideBar from '../component/adminSideBar';
import AdminNavbar from '../component/adminNavbar';
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
            <AdminSideBar />
            {/* Main Content */}
            <Container fluid className={`content w-100 container-content ${collapsed ? 'collapsed-content' : ''}`}>
                <AdminNavbar />
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