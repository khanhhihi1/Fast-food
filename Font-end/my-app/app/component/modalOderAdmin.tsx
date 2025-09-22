import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Table,
  Card,
  Badge,
  Image,
  Form,
} from "react-bootstrap";
import "./oder.css";
import { toast } from "react-toastify";
import useDarkMode from "../admin/hooks/darkmode";
import { Order } from "../type/oder";

const OrderStatusText: { [key: number]: string } = {
  0: "Chờ xác nhận",
  1: "Chờ thanh toán",
  2: "Đã xác nhận",
  3: "Đang vận chuyển",
  4: "Hoàn tất",
  5: "Hủy đơn hàng",
};

interface OrderDetailModalProps {
  show: boolean;
  onHide: () => void;
  order: Order | null;
  onStatusUpdated?: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  show,
  onHide,
  order: initialOrder,
  onStatusUpdated,
}) => {
  const { isDarkMode } = useDarkMode();
  const [updating, setUpdating] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (show && initialOrder) {
      console.log("Dữ liệu order từ props ban đầu:", initialOrder);
      fetchOrderDetails(initialOrder._id);
    }
  }, [show, initialOrder]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/${orderId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      if (!data.status) {
        throw new Error(data.message || "Không thể lấy chi tiết đơn hàng");
      }

      console.log("Dữ liệu order từ backend:", data.order);
      setCurrentOrder(data.order);
    } catch (error: any) {
      console.error("Lỗi fetch order:", error);
      toast.error(error.message || "Có lỗi khi tải chi tiết đơn hàng");
    }
  };

  if (!show || !currentOrder) return null;

  const updateOrderStatus = async (orderId: string, newStatus: number) => {
    setUpdating(true);
    try {
      if (newStatus < currentOrder.status) {
        toast.warning("Không thể cập nhật lùi trạng thái!");
        return;
      }
      if (newStatus === 5 && !confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
        return;
      }

      const res = await fetch(`${API_URL}/orders/admin/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!data.status) {
        throw new Error(data.message || "Không thể cập nhật trạng thái");
      }

      setCurrentOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      toast.success("Cập nhật trạng thái thành công!");
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi khi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

 const subtotal = Array.isArray(currentOrder.items)
  ? currentOrder.items.reduce(
      (sum, item) => sum + item.finalPrice * item.quantity,
      0
    )
  : 0;

  const discount = currentOrder.discount || 0; // giảm giá trực tiếp từ order

  let voucherDiscount = 0;
  if (currentOrder.voucherCode && currentOrder.voucherData) {
    if (currentOrder.voucherData.discountType === "percentage") {
      voucherDiscount = Math.min(
        (subtotal * currentOrder.voucherData.discountValue) / 100,
        currentOrder.voucherData.maxDiscount || Infinity
      );
    } else if (currentOrder.voucherData.discountType === "fixed") {
      voucherDiscount = currentOrder.voucherData.discountValue;
    }
  }

  const shippingFee = currentOrder.shippingFee || 0;
  const tax = currentOrder.tax || 0;

  const totalAmount =
    subtotal - discount - voucherDiscount + shippingFee + tax;

  const voucherDisplay = currentOrder.voucherData
    ? currentOrder.voucherData.discountType === "percentage"
      ? `${currentOrder.voucherData.discountValue}%`
      : `${currentOrder.voucherData.discountValue.toLocaleString()}đ`
    : "";

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-dark">Chi tiết đơn hàng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-4">
          <Col md={6}>
            <h6>Thông tin khách hàng</h6>
            <p>
              <strong>Tên:</strong> {currentOrder.userId?.name || "Không xác định"}
            </p>
            <p>
              <strong>Email:</strong> {currentOrder.userId?.email || "Không xác định"}
            </p>
            <p>
              <strong>SĐT:</strong>{" "}
              {currentOrder.shippingInfo?.phone || "Không xác định"}
            </p>
            <p>
              <strong>Địa chỉ:</strong>{" "}
              {currentOrder.shippingInfo?.address || "Không xác định"}
            </p>
          </Col>
          <Col md={6}>
            <h6>Thông tin đơn hàng</h6>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {new Date(currentOrder.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              <Badge bg="info">{OrderStatusText[currentOrder.status]}</Badge>
            </p>
            <p>
              <strong>Phương thức thanh toán:</strong>{" "}
              {currentOrder.paymentMethod || "Không xác định"}
            </p>
            <p>
              <strong>Trạng thái thanh toán:</strong>{" "}
              {currentOrder.isPaid ? "Có" : "Chưa"}
            </p>
            <Form.Group className="mt-3">
              <Form.Label>Cập nhật trạng thái:</Form.Label>
              <Form.Select
                value={currentOrder.status}
                className={`form-select fw-bold text-capitalize ${currentOrder.status === 0
                  ? "text-warning"
                  : currentOrder.status === 1
                    ? "text-info"
                    : currentOrder.status === 2
                      ? "text-primary"
                      : currentOrder.status === 3
                        ? "text-secondary"
                        : currentOrder.status === 4
                          ? "text-success"
                          : "text-danger"
                  }`}
                onChange={(e) =>
                  updateOrderStatus(currentOrder._id, Number(e.target.value))
                }
                disabled={updating}
              >
                {Object.entries(OrderStatusText).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <h6>Sản phẩm trong giỏ hàng</h6>
        <Table className="mt-3 text-center">
          <thead>
            <tr>
              <th>Hình</th>
              <th>Tên</th>
              <th>Kích cỡ</th>
              <th>Hương vị</th>
              <th>Đơn giá</th>
              <th>Số lượng</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {currentOrder.items.map((item, index) => (
              <tr key={`${item.productId}-${index}`}>
                <td className="text-center">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={60}
                    rounded
                    onError={(e) => {
                      console.error(`Lỗi load image: ${item.image}`);
                      e.currentTarget.src = 'https://via.placeholder.com/60?text=No+Image';
                    }}
                  />
                </td>
                <td style={{ color: "black" }}>{item.name}</td>
                <td style={{ color: "black" }}>{item.sizeName || "Không xác định"}</td>
                <td style={{ color: "black" }}>{item.taste.join(", ") || "Không có"}</td>
                <td style={{ color: "black" }}>{item.price.original.toLocaleString()}đ</td>
                <td style={{ color: "black" }}>{item.quantity}</td>
                <td style={{ color: "black" }}>{(item.finalPrice * item.quantity).toLocaleString()}đ</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Row className="mt-3">
          <Col md={6}>
            <Card>
              <Card.Body>
                <h6>Ghi chú</h6>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <h6>Tổng thanh toán</h6>
                <div className="d-flex justify-content-between">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString()}đ</span>
                </div>

                {discount > 0 && (
                  <div className="d-flex justify-content-between">
                    <span>Giảm giá:</span>
                    <span>-{discount.toLocaleString()}đ</span>
                  </div>
                )}

                {voucherDiscount > 0 && (
                  <div className="d-flex justify-content-between">
                    <span>
                      Voucher ({currentOrder.voucherCode} - {voucherDisplay}):
                    </span>
                    <span>-{voucherDiscount.toLocaleString()}đ</span>
                  </div>
                )}

                <div className="d-flex justify-content-between">
                  <span>Phí vận chuyển:</span>
                  <span>{shippingFee.toLocaleString()}đ</span>
                </div>

                <div className="d-flex justify-content-between">
                  <span>Thuế:</span>
                  <span>{tax.toLocaleString()}đ</span>
                </div>

                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Tổng cộng:</span>
                  <span>{totalAmount.toLocaleString()}đ</span>
                </div>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetailModal;