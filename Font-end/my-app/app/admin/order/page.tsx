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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight, faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons";

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
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>('all');
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentRevenue, setCurrentRevenue] = useState(0);
  const [actualRevenue, setActualRevenue] = useState(0);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const ordersPerPage = 10;

  const fetchOrders = async (page: number, selectedFilter: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/orders/admin/all?page=${page}&limit=${ordersPerPage}&filter=${selectedFilter}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!data.status) {
        throw new Error(data.message || "Không thể tải danh sách đơn hàng");
      }

      setOrders(data.result.orders || []);
      setTotalPages(data.result.totalPages || 1);
      setTotalOrders(data.result.stats.totalOrders || 0);
      setCurrentRevenue(data.result.stats.currentRevenue || 0);
      setActualRevenue(data.result.stats.actualRevenue || 0);
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

      // Fetch lại với page và filter hiện tại
      await fetchOrders(currentPage, filter);
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi khi cập nhật trạng thái");
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, filter);
  }, [currentPage, filter]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi filter
  };

  const isOverdue = (createdAt: string) => {
    const now = new Date();
    const orderTime = new Date(createdAt);
    const diff = (now.getTime() - orderTime.getTime()) / (1000 * 60); // Phút
    return diff > 30;
  };

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
                  <span className={styles.statValue}>{totalOrders}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Doanh thu / Doanh thu gộp: </span>
                  <span className={styles.statValue}>
                    {currentRevenue.toLocaleString("vi-VN")} VNĐ / {actualRevenue.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>
            </header>

            {/* Bộ lọc */}
            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
                onClick={() => handleFilterChange("all")}
              >
                Tất cả
              </button>
              <button
                className={`${styles.filterBtn} ${filter === "pending" ? styles.active : ""}`}
                onClick={() => handleFilterChange("pending")}
              >
                Chờ xử lý
              </button>
              <button
                className={`${styles.filterBtn} ${filter === "processing" ? styles.active : ""}`}
                onClick={() => handleFilterChange("processing")}
              >
                Đang xử lý
              </button>
              <button
                className={`${styles.filterBtn} ${filter === "completed" ? styles.active : ""}`}
                onClick={() => handleFilterChange("completed")}
              >
                Đã hoàn thành
              </button>
              <button
                className={`${styles.filterBtn} ${filter === "cancelled" ? styles.active : ""}`}
                onClick={() => handleFilterChange("cancelled")}
              >
                Đã hủy
              </button>
            </div>

            {/* Bảng đơn hàng */}
            <div className={styles.ordersTableWrapper}>
              <div className={styles.ordersTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.tableCell}>Khách hàng</div>
                  <div className={styles.tableCell}>Ngày đặt</div>
                  <div className={styles.tableCell}>Phương thức thanh toán</div>
                  <div className={styles.tableCell}>Trạng thái thanh toán</div>
                  <div className={styles.tableCell}>Trạng thái </div>
                  <div className={styles.tableCell}>Thao tác</div>
                </div>

                <div className={styles.tableBody}>
                  {orders.map((order) => (
                    <div key={order._id} className={`${styles.tableRow} `}>
                      <div className={`${styles.tableCell} ${order.status === 0 && isOverdue(order.createdAt) ? styles.redText : ''}`}>
                        {order.userId?.name}
                      </div>
                      <div className={styles.tableCell}>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                      <div className={styles.tableCell} style={{marginLeft:"50px"}}>
                        {order.paymentMethod.toUpperCase()}
                      </div>
                      <div className={styles.tableCell}>
                        <span
                          className={`${styles.statusBadge} ${order.isPaid ? styles.paid : styles.unpaid}`}
                        >
                          {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                        </span>
                      </div>
                      <div className={styles.tableCell}>
                        <span
                          className={styles.statusBadge}
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {OrderStatusText[order.status as keyof typeof OrderStatusText]}
                        </span>
                      </div>

                      <div className={`${styles.tableCell} ${styles.actionCell}`}>
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

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className={`d-flex justify-content-center mt-4 ${styles.pagination}`}>
                {/* First */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ""}`}
                >
                  <FontAwesomeIcon icon={faAnglesLeft} />
                </button>

                {/* Prev */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ""}`}
                >
                  <FontAwesomeIcon icon={faAngleLeft} />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`${styles.pageNumber} ${currentPage === i + 1 ? styles.active : ""}`}
                  >
                    {i + 1}
                  </button>
                ))}

                {/* Next */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabled : ""}`}
                >
                  <FontAwesomeIcon icon={faAngleRight} />
                </button>

                {/* Last */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabled : ""}`}
                >
                  <FontAwesomeIcon icon={faAnglesRight} />
                </button>
              </div>
            )}
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