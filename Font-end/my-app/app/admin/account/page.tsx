'use client'
import React from "react";
import { Container, Row, Col, Card, Table, ProgressBar, Navbar, Form, InputGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse, faBarsProgress, faCartShopping,
    faTicket, faCircleUser, faChartSimple, faComments, faDollarSign, faTruck,
    faMagnifyingGlass, faBell, faBars, faSearch, faDollar, faRightFromBracket, faGear, faEye, faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import '../admin.css';
import useDarkMode from "../useDarkMode/page";
import Link from "next/link";
import { useState, useEffect } from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Dropdown from 'react-bootstrap/Dropdown';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { toast } from "react-toastify";

interface AccountType {
    id: number;
    name: string;
    password: string;
    image:string;
    email: string;
}

interface iShow {
    showUpdateAccount: boolean;
    setUpdateAccount: (value: boolean) => void;
    post: AccountType | null;
    fetchPosts: () => void;
}
export default function ShowAdmin({ showUpdateAccount, setUpdateAccount, post, fetchPosts }: iShow) {
    const [show, setShow] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const toggleSidebar = () => setCollapsed(!collapsed);
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const [id, setID] = useState<string>("");
    const [userData, setUserData] = useState<AccountType | null>(null);
    const [name, setName] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState<boolean>(false);
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:9000/User');
                if (!response.ok) {
                    throw new Error(`Lỗi khi lấy dữ liệu: ${response.status} - ${response.statusText}`);
                }
                const data = await response.json();
                const user = Array.isArray(data) ? data[0] : data;
                setUserData(user);
                setID(user.id.toString());
                setName(user.name);
                setPassword(user.password);
                setEmail(user.email);
                setImage(user.image);
            } catch (error) {
                toast.error("Lỗi khi lấy dữ liệu người dùng");
                console.error("Lỗi:", error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (post) {
            setID(post.id.toString());
            setName(post.name);
            setPassword(post.password);
            setEmail(post.email);
        }
    }, [post]);

    const handleSubmit = async () => {
        if (!userData && !post) {
            toast.error("Cập nhật không thành công! Không có dữ liệu người dùng.");
            return;
        }

        const updatedPost = {
            id: parseInt(id),
            name,
            email,
        };

        const url = `http://localhost:9000/User/${id}`;
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedPost),
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi cập nhật: ${response.status} - ${response.statusText}`);
            }

            toast.success("Cập nhật thông tin thành công!");
            fetchPosts();
            setUpdateAccount(false);
        } catch (error) {
            toast.error("Cập nhật thất bại");
            console.error("Lỗi cập nhật:", error);
        }
    };
    const handlePasswordSubmit = async () => {
        if (!userData && !post) {
            toast.error("Cập nhật mật khẩu không thành công! Không có dữ liệu người dùng.");
            return;
        }

        if (currentPassword !== (userData?.password || post?.password)) {
            toast.error("Mật khẩu hiện tại không đúng !");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            toast.error("Xác nhận mật khẩu không khớp !");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Mật khẩu mới ít nhất 6 ký tự !");
            return;
        }

        const updatedPost = {
            id: parseInt(id),
            name: userData?.name || post?.name || "",
            password: newPassword,
            email: userData?.email || post?.email || "",
        };

        const url = `http://localhost:9000/User/${id}`;
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedPost),
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi cập nhật mật khẩu: ${response.status} - ${response.statusText}`);
            }

            toast.success("Cập nhật mật khẩu thành công!");
            fetchPosts();
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (error) {
            toast.error("Cập nhật mật khẩu thất bại!");
            console.error("Lỗi cập nhật mật khẩu:", error);
        }
    };
    return (

        <>
            <div className="d-flex dark-mode">
                <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                    <h3 className="text-center">
                        <img
                            className="rounded-circle"
                            src="/logo-admin.jpg"
                            style={{ width: "100px", height: "100px", marginLeft: 50 }}
                            alt="Logo"
                        />
                    </h3>
                    <div className="navbar">
                        <div className="nav-item">
                            <div className="nav-link1">
                                <FontAwesomeIcon icon={faHouse} style={{ marginTop: "8px", marginLeft: "5px" }} />
                                <a href="/admin">Dashboard</a>
                            </div>
                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faBarsProgress}
                                    style={{ marginTop: "8px", marginLeft: "5px", color: "rgb(135, 136, 140)" }}
                                />
                                <a style={{ marginLeft: "2px", color: "rgb(135, 136, 140)" }} href="/admin/productAdmin">
                                    Quản lý sản phẩm
                                </a>
                            </div>
                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faCartShopping}
                                    style={{ marginTop: "8px", marginLeft: "5px", color: "rgb(135, 136, 140)" }}
                                />
                                <a style={{ marginLeft: "2px", color: "rgb(135, 136, 140)" }} href="#">
                                    Quản lý đơn hàng
                                </a>
                            </div>
                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faTicket}
                                    style={{ marginTop: "8px", marginLeft: "5px", color: "rgb(135, 136, 140)" }}
                                />
                                <a style={{ marginLeft: "2px", color: "rgb(135, 136, 140)" }} href="#">
                                    Quản lý voucher
                                </a>
                            </div>
                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faCircleUser}
                                    style={{ marginTop: "8px", marginLeft: "5px", color: "rgb(135, 136, 140)" }}
                                />
                                <a style={{ marginLeft: "2px", color: "rgb(135, 136, 140)" }} href="#">
                                    Quản lý user
                                </a>
                            </div>
                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faChartSimple}
                                    style={{ marginTop: "8px", marginLeft: "5px", color: "rgb(135, 136, 140)" }}
                                />
                                <a style={{ marginLeft: "2px", color: "rgb(135, 136, 140)" }} href="#">
                                    Thống kê
                                </a>
                            </div>
                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faComments}
                                    style={{ marginTop: "8px", marginLeft: "5px", color: "rgb(135, 136, 140)" }}
                                />
                                <a style={{ marginLeft: "2px", color: "rgb(135, 136, 140)" }} href="#">
                                    Đánh giá
                                </a>
                            </div>
                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faRightFromBracket}
                                    style={{ marginTop: "8px", marginLeft: "5px", color: "rgb(135, 136, 140)" }}
                                />
                                <a style={{ marginLeft: "2px", color: "rgb(135, 136, 140)" }} href="#">
                                    Đăng xuất
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <Container fluid className={`content w-100 ${collapsed ? 'collapsed-content' : ''}`}>
                    <Navbar className="navbar" style={{ marginRight: "10px" }}>
                        <Container fluid className="container-fluid">
                            <Button variant="light" onClick={toggleSidebar} className="me-3">
                                <FontAwesomeIcon icon={faBars} />
                            </Button>
                            <InputGroup className="input-group w-50">
                                <span className="input-group-text">
                                    <FontAwesomeIcon
                                        icon={faSearch}
                                    />
                                </span>
                                <Form.Control type="search" className="form-control" placeholder="Tìm kiếm..." />
                            </InputGroup>
                            <div className="hihi">
                                <span className="me-3">
                                    <FontAwesomeIcon
                                        icon={faBell}
                                        style={{ fontSize: 24 }}
                                    />
                                </span>
                                <span>
                                    <Dropdown>
                                        <Dropdown.Toggle className="drop-down-avt" id="dropdown-basic">
                                            <img
                                                src="/avt.jpg"
                                                className="rounded-circle"
                                                alt="Cinque Terre"
                                                style={{ width: "45px", height: "45px", marginTop: "-18px", marginRight: "12px" }}
                                            />                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <Dropdown.Item href="/admin/account">Trang cá nhân</Dropdown.Item>
                                            <Dropdown.Item href="#/action-3">Đăng xuất</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </span>
                                <span>
                                    <Button className="btn-setting" onClick={handleShow}>
                                        <FontAwesomeIcon
                                            icon={faGear}
                                            className="setting-icon"
                                            style={{ fontSize: 24 }}
                                        />
                                    </Button>
                                </span>
                                <Offcanvas show={show} onHide={handleClose} placement="end">
                                    <Offcanvas.Header closeButton>
                                        <Offcanvas.Title>Cấu hình trang web</Offcanvas.Title>
                                    </Offcanvas.Header>
                                    <Offcanvas.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
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
                    <Container>
                        <div className="row">
                            <div className="col">
                                <div className="menu-account ">

                                    <Tabs
                                        defaultActiveKey="general"
                                        id="uncontrolled-tab-example"
                                        className="mb-3"
                                    >
                                        <Tab eventKey="general" title="General" className="ps-2">

                                            <div className="title-account ps-3 mt-3">
                                                <div className="title-account-name">
                                                    <Form>
                                                        <Form.Group className="d-flex">
                                                            <Form.Label className="mt-3 form-label font-semibold">Tên tài khoản</Form.Label>
                                                            <Form.Control
                                                                className="form-control-account ms-auto mt-auto me-5"
                                                                type="text"
                                                                placeholder="ID"
                                                                value={name}
                                                                onChange={(e) => setName(e.target.value)}
                                                            />
                                                        </Form.Group>
                                                    </Form>
                                                </div>
                                            </div>

                                            <div className="title-account ps-3 mt-3">
                                                <div className="title-account-name">
                                                    <Form>
                                                        <Form.Group className="d-flex">
                                                            <Form.Label className="mt-3 form-label font-semibold">Email</Form.Label>
                                                            <Form.Control
                                                                className="form-control-account ms-auto mt-auto me-5"
                                                                type="text"
                                                                placeholder="Email"
                                                                value={email}
                                                                onChange={(e) => setEmail(e.target.value)}
                                                            />
                                                        </Form.Group>
                                                    </Form>
                                                </div>
                                            </div>

                                            <div className="title-account ps-3 mt-3">
                                                <div className="title-account-name">
                                                    <Form>
                                                        <Form.Group className="d-flex">
                                                            <Form.Label className="mt-3 form-label font-semibold">Ảnh đại diện</Form.Label>
                                                            <img
                                                                src="/avt.jpg"
                                                                className="rounded-circle image-account"
                                                                alt="Cinque Terre"
                                                                style={{ width: "45px", height: "45px", marginTop: "-18px", marginRight: "12px" }}
                                                            />
                                                        </Form.Group>
                                                    </Form>
                                                </div>
                                            </div>

                                            <div className="button-acount">
                                                <Button style={{ padding: "8px 32px" }} onClick={handleSubmit}>Update</Button>
                                            </div>
                                        </Tab>

                                        <Tab eventKey="password" title="Password" className="ps-3">
                                        <div className="title-account ps-3 mt-3">
                                            <div className="title-account-name">
                                                <Form>
                                                    <Form.Group className="d-flex">
                                                        <Form.Label className="mt-3 form-label font-semibold">Mật khẩu hiện tại</Form.Label>
                                                        <div className="d-flex ms-auto me-5 position-relative">
                                                            <Form.Control
                                                                className="form-control-account1 mt-auto"
                                                                type={showCurrentPassword ? "text" : "password"}
                                                                placeholder="Mật khẩu hiện tại"
                                                                value={currentPassword}
                                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                            />
                                                            <Button
                                                                variant="link"
                                                                className="position-absolute end-0 mt-auto"
                                                                style={{ top: "60%", transform: "translateY(-50%)" }}
                                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                            >
                                                                <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
                                                            </Button>
                                                        </div>
                                                    </Form.Group>
                                                </Form>
                                            </div>
                                        </div>
                                        <div className="title-account ps-3 mt-3">
                                            <div className="title-account-name">
                                                <Form>
                                                    <Form.Group className="d-flex">
                                                        <Form.Label className="mt-3 form-label font-semibold">Mật khẩu mới</Form.Label>
                                                        <div className="d-flex ms-auto me-5 position-relative">
                                                            <Form.Control
                                                                className="form-control-account1 mt-auto"
                                                                type={showNewPassword ? "text" : "password"}
                                                                placeholder="Mật khẩu mới"
                                                                value={newPassword}
                                                                onChange={(e) => setNewPassword(e.target.value)}
                                                            />
                                                            <Button
                                                                variant="link"
                                                                className="position-absolute end-0 mt-auto"
                                                                style={{ top: "60%", transform: "translateY(-50%)" }}
                                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                            >
                                                                <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                                                            </Button>
                                                        </div>
                                                    </Form.Group>
                                                </Form>
                                            </div>
                                        </div>
                                        <div className="title-account ps-3 mt-3">
                                            <div className="title-account-name">
                                                <Form>
                                                    <Form.Group className="d-flex">
                                                        <Form.Label className="mt-3 form-label font-semibold">Xác nhận mật khẩu mới</Form.Label>
                                                        <div className="d-flex ms-auto me-5 position-relative">
                                                            <Form.Control
                                                                className="form-control-account1 mt-auto"
                                                                type={showConfirmNewPassword ? "text" : "password"}
                                                                placeholder="Xác nhận mật khẩu"
                                                                value={confirmNewPassword}
                                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                            />
                                                            <Button
                                                                variant="link"
                                                                className="position-absolute end-0 mt-auto"
                                                                style={{ top: "60%", transform: "translateY(-50%)" }}
                                                                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                                            >
                                                                <FontAwesomeIcon icon={showConfirmNewPassword ? faEyeSlash : faEye} />
                                                            </Button>
                                                        </div>
                                                    </Form.Group>
                                                </Form>
                                            </div>
                                        </div>
                                        <div className="button-acount1">
                                            <Button style={{ padding: "8px 32px" }} onClick={handlePasswordSubmit}>Cập nhật mật khẩu</Button>
                                        </div>
                                        </Tab>
                                    </Tabs>


                                </div>

                            </div>
                        </div>
                    </Container>

                </Container>
            </div>
        </>
    );
}
