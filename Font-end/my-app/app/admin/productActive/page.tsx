"use client";
import React from "react";
import { Button, Dropdown } from "react-bootstrap";
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    ProgressBar,
    Navbar,
    Form,
    InputGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faBarsProgress,
    faCartShopping,
    faTicket,
    faCircleUser,
    faChartSimple,
    faComments,
    faDollarSign,
    faTruck,
    faMagnifyingGlass,
    faPlus,
    faBell,
    faBars,
    faSearch,
    faDollar,
    faPenToSquare,
    faTrash,
    faEye,
    faEyeSlash,
    faRotateRight,
    faRightFromBracket,
    faGear,
    faBarsStaggered,
    faChevronUp,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import "../admin.css";
import Link from "next/link";
import ModalsAdmin from "@/app/component/create.model.admin";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import UpdateModelAdmin from "@/app/component/update-model-admin";
import useDarkMode from "../useDarkMode/page";
import Offcanvas from "react-bootstrap/Offcanvas";
import { FaSearch } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import AdminSideBar from "../../component/adminSideBar";
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
            const response = await fetch("http://localhost:5000/products/active", {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error("Lỗi khi tải dữ liệu sản phẩm");
            }
            const data = await response.json();
            console.log("Dữ liệu sản phẩm:", data);
            if (!data.result || !Array.isArray(data.result)) {
                throw new Error("Dữ liệu sản phẩm không hợp lệ");
            }
            const visibleProducts = data.result.filter(
                (product: PostType) => !product.isHidden
            );
            setPosts(visibleProducts);
            const hidden = data.result.filter(
                (product: PostType) => product.isHidden
            );
            setHiddenProducts(hidden);
        } catch (error: any) {
            console.error("Lỗi khi lấy sản phẩm:", error);
            toast.error(error.message || "Không thể tải danh sách sản phẩm");
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

    const handleEdit = (product: PostType) => {
        if (
            !product ||
            !product._id ||
            !product.name ||
            !product.image ||
            product.price == null ||
            product.quantity == null ||
            !product.taste ||
            !product.size
        ) {
            toast.error("Dữ liệu sản phẩm không hợp lệ, không thể chỉnh sửa!");
            console.error("Sản phẩm lỗi:", product);
            return;
        }
        console.log("Sản phẩm được chọn để chỉnh sửa:", product);
        setPost(product);
        setUpdateModal(true);
    };

    // hàm ẩn sản phẩm
    const handleHideProduct = async (productId: string) => {
        try {
            const response = await fetch(
                `http://localhost:5000/products/hide/${productId}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Lỗi khi ẩn sản phẩm");
            }

            // Cập nhật lại danh sách sản phẩm sau khi ẩn
            await fetchPosts();
            toast.success("Ẩn sản phẩm thành công!");
        } catch (error: any) {
            console.error("Lỗi khi ẩn sản phẩm:", error);
            toast.error(error.message || "Không thể ẩn sản phẩm");
        }
    };
    return (
        <>
            <div className="d-flex dark-mode">
                <AdminSideBar />
                <Container
                    fluid
                    className={`content w-100 container-content ${collapsed ? "collapsed-content" : ""
                        }`}
                >
                    <AdminNavbar />
                    <p className="text-center title-productAdmin mt-5">
                        Sản phẩm đang bán
                    </p>
                    <div className="row">
                        <div className="col">
                            <Button className="button-add" onClick={() => setShowModal(true)}>
                                <FontAwesomeIcon
                                    style={{
                                        fontSize: "17px",
                                        color: "rgb(10, 19, 100)",
                                        fontWeight: "bold",
                                    }}
                                    icon={faPlus}
                                />
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
                                    currentProducts.map((product) => (
                                        <tr key={product._id}>
                                            <td>{product._id}</td>
                                            <td>
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="product-image"
                                                />
                                            </td>
                                            <td>{product.name}</td>
                                            <td>{product.price}</td>
                                            <td>{product.quantity}</td>
                                            <td>{product.taste}</td>
                                            <td>{product.size}</td>
                                            <td>
                                                <button
                                                    className="action-btn edit-btn mx-3"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                </button>
                                                <button
                                                    className="action-btn delete-btn mx-3"
                                                    onClick={() => handleHideProduct(product._id)}
                                                >
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
                        <div
                            className="pagination"
                            style={{
                                padding: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <div>
                                <Button
                                    variant="outline-secondary"
                                    onClick={handlePrevious}
                                    disabled={currentPage === 1}
                                    style={{ marginRight: "10px" }}
                                >
                                    Trang trước
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                    (page) => (
                                        <Button
                                            key={page}
                                            variant={
                                                currentPage === page ? "primary" : "outline-secondary"
                                            }
                                            onClick={() => setCurrentPage(page)}
                                            style={{ marginRight: "5px" }}
                                        >
                                            {page}
                                        </Button>
                                    )
                                )}
                                <Button
                                    variant="outline-secondary"
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                    style={{ marginRight: "10px" }}
                                >
                                    Trang sau
                                </Button>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            <ModalsAdmin showModal={showModal} setShowModal={setShowModal} />
            <UpdateModelAdmin
                showUpdateModal={showUpdateModal}
                setUpdateModal={setUpdateModal}
                post={post}
                fetchPosts={fetchPosts}
            />
        </>
    );
}
