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
import styles from "../styles/order.module.css";
import { useRouter } from "next/navigation";
import AdminSideBar from "@/app/component/adminSideBar";
import useDarkMode from "../hooks/darkmode";
import AdminNavbar from "@/app/component/adminNavbar";
import { Collapse } from "react-bootstrap";
import { toast } from "react-toastify";
import OderDetailModal from "@/app/component/modalOderAdmin";

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
  const [showModal, setShowModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<string>('all');
  const [collapsed, setCollapsed] = useState(false);
  const ordersPerPage = 10;
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
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

  const updateOrderStatus = async (orderId: string, status: number) => {
    try {
      if (status === 5 && !confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
        return;
      }

      const res = await fetch(`${API_URL}/orders/admin/${orderId}`, {
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
      <Container
        fluid
        className={` ${styles.content} content w-100 container-content ${collapsed ? "collapsed-content" : ""}`}
      >
        <AdminNavbar />
        <div className={styles.cartAdmin}>
          <div className={styles.adminContainer}>
            <header className={styles.adminHeader}>
              <h1 className="text-center">🛒 Quản lý đơn hàng</h1>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Tổng đơn hàng: </span>
                  <span className={styles.statValue}>{orders.length}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Chờ xử lý: </span>
                  <span className={styles.statValue}>
                    {orders.filter(order => order.status === 0 || order.status === 1).length}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Đã hoàn thành: </span>
                  <span className={styles.statValue}>
                    {orders.filter(order => order.status === 4).length}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Doanh thu: </span>
                  <span className={styles.statValue}>
                    {totalRevenue.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>
            </header>

            {/* Bộ lọc */}
            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
                onClick={() => setFilter("all")}
              >
                Tất cả
              </button>
              <button
                className={`${styles.filterBtn} ${filter === "pending" ? styles.active : ""}`}
                onClick={() => setFilter("pending")}
              >
                Chờ xử lý
              </button>
              <button
                className={`${styles.filterBtn} ${filter === "processing" ? styles.active : ""}`}
                onClick={() => setFilter("processing")}
              >
                Đang xử lý
              </button>
              <button
                className={`${styles.filterBtn} ${filter === "completed" ? styles.active : ""}`}
                onClick={() => setFilter("completed")}
              >
                Đã hoàn thành
              </button>
              <button
                className={`${styles.filterBtn} ${filter === "cancelled" ? styles.active : ""}`}
                onClick={() => setFilter("cancelled")}
              >
                Đã hủy
              </button>
            </div>

            {/* Bảng đơn hàng */}
            <div className={styles.ordersTableWrapper}>
              <div className={styles.ordersTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.tableCell}>Mã đơn</div>
                  <div className={styles.tableCell}>Khách hàng</div>
                  <div className={styles.tableCell}>Trạng thái</div>
                  <div className={styles.tableCell}>Ngày đặt</div>
                  <div className={styles.tableCell}>Thao tác</div>
                </div>

                <div className={styles.tableBody}>
                  {currentOrders.map((order) => (
                    <div key={order._id} className={`${styles.tableRow} `}>
                      <div className={styles.tableCell}>#{order._id.slice(-4)}</div>
                      <div className={styles.tableCell}>{order.userId.name}</div>
                      <div className={styles.tableCell}>
                        <span
                          className={styles.statusBadge}
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {OrderStatusText[order.status as keyof typeof OrderStatusText]}
                        </span>
                      </div>
                      <div className={styles.tableCell}>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                      <div className={styles.tableCell}>
                        <Button
                          size="sm"
                          className={styles.detailBtn}
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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