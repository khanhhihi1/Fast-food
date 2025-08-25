"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Badge,
  Pagination,
  InputGroup,
  FormControl,
  Alert,
} from "react-bootstrap";
<<<<<<< HEAD
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";
import AdminSideBar from "@/app/component/adminSideBar";
import useDarkMode from "../hooks/darkmode";
=======
import {
  FaSearch,
  FaShoppingCart,
  FaShoppingBag,
  FaPlus,
  FaUser,
  FaBoxes,
  FaPrint,
  FaEnvelope,
  FaCheck,
  FaChevronDown,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./cart.css";
import { useRouter } from "next/navigation";
import AdminSideBar from "@/app/component/adminSideBar";
import useDarkMode from "../useDarkMode/page";
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
import AdminNavbar from "@/app/component/adminNavbar";
import { Collapse } from "react-bootstrap";
import { toast } from "react-toastify";
import OderDetailModal from "@/app/component/modalOderAdmin";
<<<<<<< HEAD
import { Order } from "@/app/type/oder";
=======

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
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb

const OrderStatusText = {
  0: "Chờ xác nhận",
  1: "Chờ thanh toán",
  2: "Đã xác nhận",
  3: "Đang vận chuyển",
  4: "Hoàn tất",
  5: "Hủy đơn hàng",
};

export default function CartManagementPage() {
  const [showModal, setShowModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
<<<<<<< HEAD
  const [filter, setFilter] = useState<string>("all");
=======
  const [filter, setFilter] = useState<string>('all');
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
  const [collapsed, setCollapsed] = useState(false);
  const ordersPerPage = 10;
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
<<<<<<< HEAD
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/orders/admin/all`, {
=======

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:5000/orders/admin/all", {
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
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

  const updateOrderStatus = async (orderId: string, status: number) => {
    try {
      if (status === 5 && !confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
        return;
      }

<<<<<<< HEAD
      const res = await fetch(`${API_URL}/orders/admin/${orderId}`, {
=======
      const res = await fetch(`http://localhost:5000/orders/admin/${orderId}`, {
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!data.status) {
        throw new Error(data.message || "Không thể cập nhật trạng thái");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi khi cập nhật trạng thái");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
<<<<<<< HEAD
        return "#ffa500";
      case 1:
        return "#ff4500";
      case 2:
        return "#1e90ff";
      case 3:
        return "#9370db";
      case 4:
        return "#32cd32";
      case 5:
        return "#ff0000";
      default:
        return "#808080";
=======
        return '#ffa500';
      case 1:
        return '#ff4500';
      case 2:
        return '#1e90ff';
      case 3:
        return '#9370db';
      case 4:
        return '#32cd32';
      case 5:
        return '#ff0000';
      default:
        return '#808080';
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
    }
  };

  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;

<<<<<<< HEAD
  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    switch (filter) {
      case "pending":
        return order.status === 0 || order.status === 1;
      case "processing":
        return order.status === 2 || order.status === 3;
      case "completed":
        return order.status === 4;
      case "cancelled":
=======
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    switch (filter) {
      case 'pending':
        return order.status === 0 || order.status === 1;
      case 'processing':
        return order.status === 2 || order.status === 3;
      case 'completed':
        return order.status === 4;
      case 'cancelled':
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
        return order.status === 5;
      default:
        return true;
    }
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);

  return (
    <div className="d-flex dark-mode">
      <AdminSideBar />
<<<<<<< HEAD
      <Container
        fluid
        className={`content w-100 container-content ${collapsed ? "collapsed-content" : ""
          }`}
      >
=======
      <Container fluid className={`content w-100 container-content ${collapsed ? "collapsed-content" : ""}`}>
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
        <AdminNavbar />
        <div className="cart-admin">
          <div className="admin-container">
            <header className="admin-header">
              <h1>🛒 Quản lý đơn hàng</h1>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Tổng đơn hàng</span>
                  <span className="stat-value">{orders.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Chờ xử lý</span>
<<<<<<< HEAD
                  <span className="stat-value">
                    {
                      orders.filter(
                        (order) => order.status === 0 || order.status === 1
                      ).length
                    }
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Đã hoàn thành</span>
                  <span className="stat-value">
                    {orders.filter((order) => order.status === 4).length}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Doanh thu</span>
                  <span className="stat-value">
                    {totalRevenue.toLocaleString("vi-VN")} VNĐ
                  </span>
=======
                  <span className="stat-value">{orders.filter(order => order.status === 0 || order.status === 1).length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Đã hoàn thành</span>
                  <span className="stat-value">{orders.filter(order => order.status === 4).length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Doanh thu</span>
                  <span className="stat-value">{totalRevenue.toLocaleString('vi-VN')} VNĐ</span>
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
                </div>
              </div>
            </header>

            <div className="filters">
              <button
<<<<<<< HEAD
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
=======
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
              >
                Tất cả
              </button>
              <button
<<<<<<< HEAD
                className={`filter-btn ${filter === "pending" ? "active" : ""}`}
                onClick={() => setFilter("pending")}
=======
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
              >
                Chờ xử lý
              </button>
              <button
<<<<<<< HEAD
                className={`filter-btn ${filter === "processing" ? "active" : ""
                  }`}
                onClick={() => setFilter("processing")}
=======
                className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
                onClick={() => setFilter('processing')}
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
              >
                Đang xử lý
              </button>
              <button
<<<<<<< HEAD
                className={`filter-btn ${filter === "completed" ? "active" : ""
                  }`}
                onClick={() => setFilter("completed")}
=======
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
              >
                Đã hoàn thành
              </button>
              <button
<<<<<<< HEAD
                className={`filter-btn ${filter === "cancelled" ? "active" : ""
                  }`}
                onClick={() => setFilter("cancelled")}
=======
                className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setFilter('cancelled')}
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
              >
                Đã hủy
              </button>
            </div>
            <div className="orders-table-wrapper">
              <div className="orders-table">
                <div className="table-header">
                  <div className="header-cell">Mã đơn</div>
                  <div className="header-cell">Khách hàng</div>
                  <div className="header-cell">Trạng thái</div>
                  <div className="header-cell">Ngày đặt</div>
                  <div className="header-cell">Thao tác</div>
                </div>

                <div className="table-body">
                  {currentOrders.map((order) => (
                    <div key={order._id} className="table-row">
                      <div className="table-cell">#{order._id.slice(-4)}</div>
                      <div className="table-cell">{order.userId.name}</div>
                      <div className="table-cell">
                        <span
                          className="status-badge"
<<<<<<< HEAD
                          style={{
                            backgroundColor: getStatusColor(order.status),
                          }}
                        >
                          {
                            OrderStatusText[
                            order.status as keyof typeof OrderStatusText
                            ]
                          }
                        </span>
                      </div>
                      <div className="table-cell">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="table-cell">
                        <Button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                        >
                          Xem chi tiết
                        </Button>
=======
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {OrderStatusText[order.status as keyof typeof OrderStatusText]}
                        </span>
                      </div>
                      <div className="table-cell">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="table-cell">
                       
                          <Button onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}>
                            Xem chi tiết
                          </Button>
                        
                       
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
<<<<<<< HEAD
          </div>
        </div>
      </Container>
      <OderDetailModal
        show={showModal}
        onHide={() => setShowModal(false)}
        order={selectedOrder}
      />
    </div>
  );
}
=======

          </div>
        </div>
      </Container>
       <OderDetailModal show={showModal} onHide={() => setShowModal(false)} order={selectedOrder} />
    </div>
    
  );
}
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
