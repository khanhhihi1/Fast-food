"use client";
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
export default function AdminNavbar() {
    const [openProductMenu, setOpenProductMenu] = useState(false);
        const [show, setShow] = useState(false);
        const [collapsed, setCollapsed] = useState(false);
        const handleClose = () => setShow(false);
        const handleShow = () => setShow(true);
        const toggleSidebar = () => setCollapsed(!collapsed);
        const { isDarkMode, toggleDarkMode } = useDarkMode();
    return (
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
    )
}