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
import "../admin.css";
import { useRouter } from "next/navigation";
import AdminSideBar from "@/app/component/adminSideBar";
import useDarkMode from "../useDarkMode/page";
import AdminNavbar from "@/app/component/adminNavbar";
import { Collapse } from "react-bootstrap";
import { toast } from "react-toastify";

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

const OrderStatusText = {
  0: "Chờ xác nhận",
  1: "Chờ thanh toán",
  2: "Đã xác nhận",
  3: "Đang vận chuyển",
  4: "Hoàn tất",
  5: "Hủy đơn hàng",
};

export default function CartManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<string>('all');
  const [collapsed, setCollapsed] = useState(false);
  const ordersPerPage = 10;
  const { isDarkMode } = useDarkMode();
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:5000/orders/admin/all", {
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

      const res = await fetch(`http://localhost:5000/orders/admin/${orderId}`, {
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
    }
  };

  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  
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
      <Container fluid className={`content w-100 container-content ${collapsed ? "collapsed-content" : ""}`}>
        <AdminNavbar />
        <div className="cart-admin">
          <div className="admin-container">
            <header className="admin-header">
              <h1>🛒 Quản lý giỏ hàng - Admin</h1>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Tổng đơn hàng</span>
                  <span className="stat-value">{orders.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Chờ xử lý</span>
                  <span className="stat-value">{orders.filter(order => order.status === 0 || order.status === 1).length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Đã hoàn thành</span>
                  <span className="stat-value">{orders.filter(order => order.status === 4).length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Doanh thu</span>
                  <span className="stat-value">{totalRevenue.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>
            </header>

            <div className="filters">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Tất cả
              </button>
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Chờ xử lý
              </button>
              <button
                className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
                onClick={() => setFilter('processing')}
              >
                Đang xử lý
              </button>
              <button
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Đã hoàn thành
              </button>
              <button
                className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setFilter('cancelled')}
              >
                Đã hủy
              </button>
            </div>

            <div className="orders-table">
              <div className="table-header">
                <div className="header-cell">Mã đơn</div>
                <div className="header-cell">Sản phẩm</div>
                <div className="header-cell">Khách hàng</div>
                <div className="header-cell">Số lượng</div>
                <div className="header-cell">Giá</div>
                <div className="header-cell">Tổng tiền</div>
                <div className="header-cell">Trạng thái</div>
                <div className="header-cell">Ngày đặt</div>
                <div className="header-cell">Thao tác</div>
              </div>

              <div className="table-body">
                {currentOrders.map((order) => (
                  <div key={order._id} className="table-row">
                    <div className="table-cell">#{order._id.slice(-4)}</div>
                    <div className="table-cell product-name">
                      {order.items.map(item => item.name).join(', ')}
                    </div>
                    <div className="table-cell">{order.userId.name}</div>
                    <div className="table-cell">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </div>
                    <div className="table-cell">
                      {order.items[0]?.price.original.toLocaleString('vi-VN')} VNĐ
                    </div>
                    <div className="table-cell">
                      {order.total.toLocaleString('vi-VN')} VNĐ
                    </div>
                    <div className="table-cell">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {OrderStatusText[order.status as keyof typeof OrderStatusText]}
                      </span>
                    </div>
                    <div className="table-cell">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="table-cell">
                      <button className="action-btn view" onClick={() => router.push(`/admin/orders/${order._id}`)}>Xem</button>
                      <button className="action-btn edit" onClick={() => router.push(`/admin/orders/edit/${order._id}`)}>Sửa</button>
                      <button className="action-btn delete" onClick={() => updateOrderStatus(order._id, 5)}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}