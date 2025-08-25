"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Navbar,
  Form,
  Button,
  Offcanvas,
  Dropdown,
  ProgressBar,
  Table,
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
  faRightFromBracket,
  faGear,
  faBarsStaggered,
  faBell,
  faDollar,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { FaSearch, FaUsers } from "react-icons/fa";
import Link from "next/link";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./admin.css";
import { motion, AnimatePresence } from "framer-motion";
import AdminSideBar from "../component/adminSideBar";
import AdminNavbar from "../component/adminNavbar";
import ProtectedRoute from "../component/ProtectedRoute";
import Image from "react-bootstrap/Image";
import { Order } from "../type/oder";
import { OrderItem } from "../type/oder";
import { toast } from "react-toastify";
ChartJS.register(ArcElement, Tooltip, Legend);
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return true;
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", newMode ? "dark" : "light");
        document.body.classList.toggle("dark-mode", newMode);
      }
      return newMode;
    });
  };
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.toggle("dark-mode", isDarkMode);
    }
  }, [isDarkMode]);

  return { isDarkMode, toggleDarkMode };
};
interface Product {
  _id: string;
  id?: string;
  category: string;
  name: string;
  image: string;
  quantity: number;
  taste?: string[];
  sizes?: {
    name: string;
    price: {
      original: number;
      discount?: number;
    };
  }[];
  description: string;
  view: number;
}
interface UserType {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isLocked: boolean;
}
interface Comment {
    _id: string;
    userId: { name: string };
    orderId?: { _id: string };
    productId?: { name: string; image?: string };
    comment: string;
    rating: number;
    createdAt: string;
}
export default function ShowAdmin() {
  const [openProductMenu, setOpenProductMenu] = useState(false);
  const [show, setShow] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toggleSidebar = () => setCollapsed(!collapsed);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [users, setUsers] = useState<UserType[]>([]);

  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/comment/all`);
      const data = await res.json();
      if (data.status) {
        setComments(data.result);
      } else {
        setError(data.message || "Lỗi khi tải bình luận");
      }
    } catch (err) {
      setError("Lỗi kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data?.result) {
        setUsers(data.result);
      } else if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (e) {
      toast.error("Lỗi tải danh sách người dùng");
    }
  };
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/orders/admin/all`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!data.status) {
        throw new Error(data.message || "Không thể tải danh sách đơn hàng");
      }

      setOrders(data.result || []);
    } catch (error: any) {
      setError(error.message || "Có lỗi khi tải danh sách đơn hàng");
      toast.error(error.message || "Có lỗi khi tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/products/hot`, {
          signal,
        });
        const data = await res.json();

        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data.result)
            ? data.result
            : Array.isArray(data.data)
              ? data.data
              : [];

        setHotProducts(productList);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Lỗi khi fetch sản phẩm:", error);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, []);
  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchComments();
  }, []);

  const activities = [
    { icon: "blue", text: "Vượng vừa sủa.", time: "4:45 PM" },
    { icon: "green", text: "Vượng nhận mình là con chó.", time: "3 hrs" },
    { icon: "green", text: "Đã xác thực Vượng là chó", time: "22 hrs" },
    {
      icon: "pink",
      text: "Vượng đã xác thực Vượng vừa ăn cức.",
      time: "today",
    },
    {
      icon: "yellow",
      text: "Khánh đẹp trai 02 2 bên 2 em gái.",
      time: "22 hrs",
    },
    { icon: "blue", text: "Trí đẳng cấp.", time: "12 hrs" },
  ];

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  return (
    <ProtectedRoute requireAdmin>
      <div className="d-flex">
        {/* Sidebar */}
        <AdminSideBar />
        {/* Main Content */}
        <Container
          fluid
          className={`content w-100 container-content ${collapsed ? "collapsed-content" : ""
            }`}
          style={{ minHeight: "100vh" }}
        >
          <AdminNavbar />
          {/* Dashboard Cards */}
          <div className="dashboard-container">
            <Row>
              <Col md={3}>
                <div className="dashboard-card">
                  <div className="card-header">
                    <span>Tổng doanh thu</span>

                  </div>
                  <p className="card-subtext">Tổng quan tháng này</p>
                  <div className="card-content">
                    <h3>{totalRevenue.toLocaleString('vi-VN')} VNĐ</h3>
                    <FontAwesomeIcon
                      icon={faDollar}
                      style={{
                        color: "rgb(175, 175, 38)",
                        fontSize: "23px",
                        marginBottom: "0.5rem",
                      }}
                    />
                  </div>
                </div>
              </Col>
              <Col md={3}>
                <div className="dashboard-card">
                  <div className="card-header">
                    <span>Tổng đơn hàng</span>

                  </div>
                  <p className="card-subtext">Tổng quan tháng này</p>
                  <div className="card-content">
                    <h3>{orders.length}</h3>
                    <FontAwesomeIcon
                      icon={faCartShopping}
                      style={{
                        color: "rgb(25, 154, 193)",
                        fontSize: "23px",
                        marginBottom: "0.5rem",
                      }}
                    />
                  </div>
                </div>
              </Col>
              <Col md={3}>
                <div className="dashboard-card">
                  <div className="card-header">
                    <span>Người dùng mới</span>

                  </div>
                  <p className="card-subtext">Tổng quan tháng này</p>
                  <div className="card-content">
                    <h3>{users.length}</h3>
                    <FaUsers className="card-icon green-icon" />
                  </div>
                </div>
              </Col>
              <Col md={3}>
                <div className="dashboard-card">
                  <div className="card-header">
                    <span>Tổng đánh giá</span>
                  </div>
                  <p className="card-subtext">Tổng quan tháng này</p>
                  <div className="card-content">
                    <h3>{comments.length}</h3>
                    <FontAwesomeIcon
                      icon={faComments}
                      style={{
                        color: "rgb(193, 25, 168)",
                        fontSize: "23px",
                        marginBottom: "0.5rem",
                      }}
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
                        <tr className="text-center">
                          <th style={{ color: "white" }}>Hình ảnh</th>
                          <th style={{ color: "white" }}>Tên sản phẩm</th>
                          <th style={{ color: "white" }}>Lượt view</th>

                        </tr>
                      </thead>
                      <tbody>
                        {hotProducts.map((product) => (
                          <tr key={product._id} className="text-center">
                            <td className="image-cell">
                              <Image style={{ width: "100px", height: "100px" }} src={product.image} alt={product.name} fluid />
                            </td>
                            <td>{product.name}</td>
                            <td>{product.view}</td>
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
    </ProtectedRoute>
  );
}
