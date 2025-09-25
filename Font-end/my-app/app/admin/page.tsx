"use client";
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faComments,
  faDollar,
} from "@fortawesome/free-solid-svg-icons";
import { FaUsers } from "react-icons/fa";
import AdminSideBar from "../component/adminSideBar";
import AdminNavbar from "../component/adminNavbar";
import ProtectedRoute from "../component/ProtectedRoute";
import Image from "react-bootstrap/Image";
import { toast } from "react-toastify";
import styles from "./styles/adminPage.module.css";

// ========== Dark mode hook ==========
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return true;
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode: boolean) => {
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

// ========== Types ==========
interface Product {
  _id: string;
  category: string;
  name: string;
  image: string;
  quantity: number;
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

interface OrderItem {
  productId: string;
  name: string;
  image?: string;
  sizeName: string;
  taste: string[];
  quantity: number;
  price: {
    original: number;
    discount?: number;
  };
  finalPrice: number;
}

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  total: number;
  discount: number;
  voucherCode?: string;
  voucherData?: {
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    minOrderValue: number;
    maxDiscount: number;
    expiresAt: string;
  };
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
  };
  shippingFee: number;
  tax: number;
  paymentMethod: string;
  isPaid: boolean;
  status: number;
  createdAt: string;
}

interface DashboardStats {
  totalRevenue: number;
  newUsers: number;
  vouchersUsed: number;
  cancelledOrders: number;
  topProducts: Array<{
    name: string;
    revenue: number;
    sold: number;
    orderCount: number;
    image: string;
  }>;
  // Thêm các trường khác nếu cần, ví dụ: revenueChart, topCustomers, v.v.
}

// ========== Main Component ==========
export default function ShowAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRevenue: 0,
    newUsers: 0,
    vouchersUsed: 0,
    cancelledOrders: 0,
    topProducts: [],
  });
  const [totalOrders, setTotalOrders] = useState(0);

  const [collapsed, setCollapsed] = useState<boolean>(false);

  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch Dashboard Stats (thống kê theo tháng)
  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(`${API_URL}/statistics/dashboard?period=month`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      const data: DashboardStats = await res.json();
      setDashboardStats({
        totalRevenue: data.totalRevenue || 0,
        newUsers: data.newUsers || 0,
        vouchersUsed: data.vouchersUsed || 0,
        cancelledOrders: data.cancelledOrders || 0,
        topProducts: data.topProducts || [],
      });
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu thống kê");
    }
  };

  // Fetch Comments
  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/comment/all`);
      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await res.json();
      if (data.status && Array.isArray(data.result)) {
        setComments(data.result);
      }
    } catch {
      toast.error("Lỗi khi tải bình luận");
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      if (data?.result && Array.isArray(data.result)) {
        setUsers(data.result);
      } else if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch {
      toast.error("Lỗi tải danh sách người dùng");
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/all`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await res.json();
      if (data.status && Array.isArray(data.result)) {
        setOrders(data.result);
      } else {
        setOrders([]);
      }
    } catch {
      toast.error("Có lỗi khi tải danh sách đơn hàng");
      setOrders([]);
    }
  };

  // Fetch Hot Products
  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products/hot`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Failed to fetch hot products");
        }
        const data = await res.json();

        const productList: Product[] = Array.isArray(data)
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
    };

    fetchProducts();
    return () => controller.abort();
  }, [API_URL]);

  useEffect(() => {
    fetchDashboardStats();
    fetchOrders();
    fetchUsers();
    fetchComments();
  }, [API_URL]);

  const totalRevenue = dashboardStats.totalRevenue;

  const activities: Array<{ icon: string; text: string; time: string }> = [
    { icon: "blue", text: "User A vừa đăng nhập.", time: "4:45 PM" },
    { icon: "green", text: "User B vừa đặt hàng.", time: "3 hrs" },
    { icon: "green", text: "Đã xác thực đơn hàng #123", time: "22 hrs" },
    { icon: "pink", text: "User C đã bình luận sản phẩm.", time: "today" },
  ];

  return (
    <ProtectedRoute requireAdmin>
      <div className="d-flex">
        {/* Sidebar */}
        <AdminSideBar />

        {/* Main Content */}
        <Container
          fluid
          className={`${styles.content} w-100 ${styles.containerContent} ${collapsed ? styles.collapsedContent : ""
            }`}
        >
          <AdminNavbar />

          {/* Dashboard Cards */}
          <div className={styles.dashboardContainer}>
            <Row>
              <Col md={3}>
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <span>Tổng doanh thu</span>
                  </div>
                  <p className={styles.cardSubtext}>Tổng quan tháng này</p>
                  <div className={styles.cardContent}>
                    <h3>{totalRevenue.toLocaleString("vi-VN")} VNĐ</h3>
                    <FontAwesomeIcon
                      icon={faDollar}
                      style={{ color: "rgb(175, 175, 38)", fontSize: 23 }}
                    />
                  </div>
                </div>
              </Col>

              <Col md={3}>
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <span>Tổng đơn hàng</span>
                  </div>
                  <p className={styles.cardSubtext}>Tổng quan tháng này</p>
                  <div className={styles.cardContent}>
                    <h3>{totalOrders}</h3>
                    <FontAwesomeIcon
                      icon={faCartShopping}
                      style={{ color: "rgb(25, 154, 193)", fontSize: 23 }}
                    />
                  </div>
                </div>
              </Col>

              <Col md={3}>
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <span>Người dùng mới</span>
                  </div>
                  <p className={styles.cardSubtext}>Tổng quan tháng này</p>
                  <div className={styles.cardContent}>
                    <h3>{dashboardStats.newUsers}</h3>
                    <FaUsers style={{ color: "#2ecc71", fontSize: 23 }} />
                  </div>
                </div>
              </Col>

              <Col md={3}>
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <span>Tổng voucher</span>
                  </div>
                  <p className={styles.cardSubtext}>Tổng quan tháng này</p>
                  <div className={styles.cardContent}>
                    <h3>{dashboardStats.vouchersUsed}</h3>
                    <FontAwesomeIcon
                      icon={faComments}
                      style={{ color: "rgb(193, 25, 168)", fontSize: 23 }}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Dashboard Sections */}
          <div className={styles.dashboardProduct}>
            <Row>
              <Col md={7}>
                <div className={styles.dashboardCard}>
                  <h5>Sản phẩm phổ biến</h5>
                  <Table className={styles.table}>
                    <thead>
                      <tr className="text-center">
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Lượt view</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotProducts.map((product) => (
                        <tr key={product._id} className="text-center">
                          <td className={styles.imageCell}>
                            <Image
                              style={{ width: "100px", height: "100px" }}
                              src={`${API_URL}/${product.image}`}
                              alt={product.name}
                              fluid
                            />
                          </td>
                          <td>{product.name}</td>
                          <td>{product.view}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Col>

              <Col md={5}>
                <div className={styles.dashboardCard}>
                  <h5>Hoạt động gần đây</h5>
                  <ul className={styles.activityList}>
                    {activities.map((activity, index) => (
                      <li key={index} className={styles.activityItem}>
                        <div
                          className={`${styles.activityIcon} ${styles[activity.icon as keyof typeof styles] || ""
                            }`}
                        ></div>
                        <div className={styles.activityContent}>
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