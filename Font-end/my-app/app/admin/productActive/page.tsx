'use client'
import React from "react";
import { Button, Dropdown } from "react-bootstrap";
import { Container, Row, Col, Card, Table, ProgressBar, Navbar, Form, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse, faBarsProgress, faCartShopping, faTicket,
    faCircleUser, faChartSimple, faComments, faDollarSign, faTruck, faMagnifyingGlass, faPlus,
    faBell, faBars, faSearch, faDollar, faPenToSquare, faTrash, faEye, faEyeSlash, faRotateRight, faRightFromBracket, faGear,
    faBarsStaggered,
    faChevronUp,
    faChevronDown
} from "@fortawesome/free-solid-svg-icons";
import '../admin.css';
import Link from "next/link";
import ModalsAdmin from "@/app/component/create.model.admin";
import { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import UpdateModelAdmin from "@/app/component/update-model-admin";
import useDarkMode from "../useDarkMode/page";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { FaSearch } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import AdminSideBar from '../../component/adminSideBar';
import AdminNavbar from "../../component/adminNavbar";

export default function ShowAdmin() {
    interface PostType {
        _id: string;
        name: string;
        image: string;
        price: number;
        quantity: number;
        taste: string;
        size: string;
        isHidden: boolean;
    }

    const [openProductMenu, setOpenProductMenu] = useState(false);
    const [posts, setPosts] = useState<PostType[]>([]);
    const [post, setPost] = useState<PostType | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [hiddenProducts, setHiddenProducts] = useState<PostType[]>([]);
    const [showUpdateModal, setUpdateModal] = useState<boolean>(false);
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const [show, setShow] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const toggleSidebar = () => setCollapsed(!collapsed);

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:5000/products', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Lỗi khi tải dữ liệu sản phẩm');
            }
            const data = await response.json();
            console.log('Dữ liệu sản phẩm:', data);
            if (!data.result || !Array.isArray(data.result)) {
                throw new Error('Dữ liệu sản phẩm không hợp lệ');
            }
            const visibleProducts = data.result.filter((product: PostType) => !product.isHidden);
            setPosts(visibleProducts);
            const hidden = data.result.filter((product: PostType) => product.isHidden);
            setHiddenProducts(hidden);
        } catch (error: any) {
            console.error('Lỗi khi lấy sản phẩm:', error);
            toast.error(error.message || 'Không thể tải danh sách sản phẩm');
            setPosts([]);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const totalPages = Math.ceil(posts.length / productsPerPage);
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = posts.slice(indexOfFirstProduct, indexOfLastProduct);

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    return (
        <>
            <div className="d-flex dark-mode">
                {/* <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
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
                                                href="/admin/productAdmin"
                                                className="nav-link2"
                                            >
                                                Sản phẩm đang bán
                                            </Link>
                                            <Link
                                                href="/admin/productAdmin/add"
                                                className="nav-link2"
                                            >
                                                Sản phẩm ngưng bán
                                            </Link>
                                            <Link
                                                href="/admin/productCategory"
                                                className="nav-link2"
                                            >
                                                Danh mục sản phẩm
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

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
                            </div>

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

                            <div className="nav-link">
                                <FontAwesomeIcon
                                    icon={faRightFromBracket}
                                    style={{ marginTop: '8px', marginLeft: '5px', color: 'rgb(135, 136, 140)' }}
                                />
                                <Link style={{ marginLeft: '2px', color: 'rgb(135, 136, 140)' }} href="#">
                                    Đăng xuất
                                </Link>
                            </div>
                        </div>
                    </div>
                </div> */}
                <AdminSideBar />

                <Container fluid className={`content w-100 container-content ${collapsed ? 'collapsed-content' : ''}`}>
                    {/* <Navbar className="navbar" style={{ marginRight: '10px' }}>
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
                    </Navbar> */}
                    <AdminNavbar />
                    <p className="text-center title-productAdmin mt-5">Sản phẩm đang bán</p>
                    <div className="row">
                        <div className="col">
                            <Button className="button-add" onClick={() => setShowModal(true)}>
                                <FontAwesomeIcon style={{ fontSize: '17px', color: 'rgb(10, 19, 100)', fontWeight: 'bold' }} icon={faPlus} />
                            </Button>
                        </div>
                    </div>
                    <div className="product-forSale">
                        <Table striped bordered hover className="table1 text-center">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Hình</th>
                                    <th>Tên</th>
                                    <th>Giá</th>
                                    <th>Số lượng</th>
                                    <th>Hương vị</th>
                                    <th>Kích cỡ</th>
                                    <th>Chức năng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProducts.length > 0 ? (
                                    currentProducts.map(product => (
                                        <tr key={product._id}>
                                            <td>{product._id}</td>
                                            <td>
                                                <img src={product.image} alt={product.name} className="product-image" />
                                            </td>
                                            <td>{product.name}</td>
                                            <td>{product.price}</td>
                                            <td>{product.quantity}</td>
                                            <td>{product.taste}</td>
                                            <td>{product.size}</td>
                                            <td>
                                                <button
                                                    className="action-btn edit-btn mx-3"
                                                    onClick={() =>{ setUpdateModal(true); setPost(product);}}
                                                >
                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                </button>
                                                <button className="action-btn delete-btn mx-3">
                                                    <FontAwesomeIcon icon={faEyeSlash} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8}>Không có sản phẩm đang bán</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                        <div className="pagination" style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <Button variant="outline-secondary" onClick={handlePrevious} disabled={currentPage === 1} style={{ marginRight: '10px' }}>
                                    Trang trước
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? 'primary' : 'outline-secondary'}
                                        onClick={() => setCurrentPage(page)}
                                        style={{ marginRight: '5px' }}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button variant="outline-secondary" onClick={handleNext} disabled={currentPage === totalPages} style={{ marginRight: '10px' }}>
                                    Trang sau
                                </Button>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            <ModalsAdmin showModal={showModal} setShowModal={setShowModal} />
            <UpdateModelAdmin showUpdateModal={showUpdateModal}
                setUpdateModal={setUpdateModal} post={post} fetchPosts={fetchPosts} />
        </>
    );
}