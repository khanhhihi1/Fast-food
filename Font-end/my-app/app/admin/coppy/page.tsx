"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Table,
  Button,
  Form,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import AdminNavbar from "../../component/adminNavbar";
import AdminSideBar from "../../component/adminSideBar";
import "../admin.css";
import useDarkMode from "../useDarkMode/page";

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

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirst, indexOfLast);

  return (
    <div className={`d-flex ${isDarkMode ? "dark-mode" : ""}`}>
      <AdminSideBar />
      <Container fluid className="content w-100 container-content">
        <AdminNavbar />
        <h4 className="text-center mt-4">Quản lý đơn hàng</h4>
        {error && <Alert variant="danger">{error}</Alert>}
        {isLoading ? (
          <Alert variant="info">Đang tải danh sách đơn hàng...</Alert>
        ) : currentOrders.length === 0 ? (
          <Alert variant="warning">Không có đơn hàng nào.</Alert>
        ) : (
          <Row>
            <Col>
              <Table
                striped
                bordered
                hover
                responsive
                className="mt-3 text-center"
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Khách hàng</th>
                    <th>Email</th>
                    <th>Sản phẩm</th>
                    <th>Thông tin giao hàng</th>
                    <th>Voucher</th>
                    <th>Thành tiền</th>
                    <th>Phương thức thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order, idx) => (
                    <tr key={order._id}>
                      <td>{indexOfFirst + idx + 1}</td>
                      <td>{order.userId.name}</td>
                      <td>{order.userId.email}</td>
                      <td>
                        <div>
                          {order.items.map((item) => (
                            <div key={item.productId + item.sizeName}>
                              <strong>Tên:</strong> {item.name} ({item.sizeName}
                              , {item.quantity} x{" "}
                              {item.finalPrice.toLocaleString()} ₫)
                              {item.taste.length > 0 && (
                                <>
                                  <br />
                                  <strong>Hương vị:</strong>{" "}
                                  {item.taste.join(", ")}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>Tên:</strong> {order.shippingInfo.name}
                          <br />
                          <strong>SĐT:</strong> {order.shippingInfo.phone}
                          <br />
                          <strong>Địa chỉ:</strong> {order.shippingInfo.address}
                        </div>
                      </td>
                      <td>
                        {order.voucherCode ? (
                          <div>
                            <strong>Mã:</strong> {order.voucherCode}
                            <br />
                            <strong>Mô tả:</strong>{" "}
                            {order.voucherData?.description || "N/A"}
                            <br />
                            <strong>Giảm giá:</strong>{" "}
                            {order.discount.toLocaleString()} ₫
                          </div>
                        ) : (
                          "Không áp dụng"
                        )}
                      </td>
                      <td>{order.total.toLocaleString()} ₫</td>
                      <td className="text-capitalize">{order.paymentMethod}</td>
                      <td>
                        <Form.Select
                          value={order.status}
                          className={`form-select fw-bold text-capitalize ${
                            order.status === 0
                              ? "text-warning"
                              : order.status === 1
                              ? "text-info"
                              : order.status === 2
                              ? "text-primary"
                              : order.status === 3
                              ? "text-secondary"
                              : order.status === 4
                              ? "text-success"
                              : "text-danger"
                          }`}
                          onChange={(e) =>
                            updateOrderStatus(order._id, Number(e.target.value))
                          }
                        >
                          {Object.entries(OrderStatusText).map(
                            ([key, value]) => (
                              <option key={key} value={key}>
                                {value}
                              </option>
                            )
                          )}
                        </Form.Select>
                      </td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() =>
                            router.push(`/admin/orders/${order._id}`)
                          }
                        >
                          <FontAwesomeIcon icon={faEye} /> Xem chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              <div className="d-flex justify-content-center mt-3 gap-2">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline-secondary"
                >
                  Trang trước
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    variant={
                      currentPage === i + 1 ? "primary" : "outline-secondary"
                    }
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  variant="outline-secondary"
                >
                  Trang sau
                </Button>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}
