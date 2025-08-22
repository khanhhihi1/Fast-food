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
import useDarkMode from "../admin/useDarkMode/page";
import { Order } from "../type/oder";


const OrderStatusText: { [key: number]: string } = {
  0: "Chờ xác nhận",
  1: "Chờ thanh toán",
  2: "Đã xác nhận",
  3: "Đang vận chuyển",
  4: "Hoàn tất",
  5: "Hủy đơn hàng",
};

interface OderDetailModalProps {
  show: boolean;
  onHide: () => void;
  order: Order | null;
  onStatusUpdated?: () => void;
}

const OderDetailModal: React.FC<OderDetailModalProps> = ({
  show,
  onHide,
  order,
  onStatusUpdated,
}) => {
  const { isDarkMode } = useDarkMode();
  const [updating, setUpdating] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  if (!order) return null;

  const updateOrderStatus = async (orderId: string, newStatus: number) => {
    try {
      if (newStatus < order.status) {
        toast.warning("Không thể cập nhật lùi trạng thái!");
        return;
      }
      if (newStatus === 5 && !confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
        return;
      }

      const res = await fetch(`http://localhost:5000/orders/admin/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!data.status) {
        throw new Error(data.message || "Không thể cập nhật trạng thái");
      }

      toast.success("Cập nhật trạng thái thành công!");
      window.location.reload();
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi khi cập nhật trạng thái");
    }
  };

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price.original * item.quantity,
    0
  );
  const discount = order.discount || 0;
  const voucherDiscount = order.voucherData?.discountValue || 0;
  const shippingFee = order.shippingFee || 0;
  const tax = order.tax || 0;
  const totalAmount = subtotal - discount - voucherDiscount + shippingFee + tax;
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết đơn hàng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-4">
          <Col md={6}>
            <h6>Thông tin khách hàng</h6>
            <p>
              <strong>Tên:</strong> {order.userId.name || "Không xác định"}
            </p>
            <p>
              <strong>Email:</strong> {order.userId.email || "Không xác định"}
            </p>
            <p>
              <strong>SĐT:</strong>{" "}
              {order.shippingInfo.phone || "Không xác định"}
            </p>
            <p>
              <strong>Địa chỉ:</strong>{" "}
              {order.shippingInfo.address || "Không xác định"}
            </p>
          </Col>
          <Col md={6}>
            <h6>Thông tin đơn hàng</h6>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              <Badge bg="info">{OrderStatusText[order.status]}</Badge>
            </p>
            <p>
              <strong>Phương thức thanh toán:</strong>{" "}
              {order.paymentMethod || "Không xác định"}
            </p>
            <p>
              <strong>Trạng thái thanh toán:</strong>{" "}
              {order.isPaid ? "Có" : "Chưa"}
            </p>
            <Form.Group className="mt-3">
              <Form.Label>Cập nhật trạng thái:</Form.Label>
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
                {Object.entries(OrderStatusText).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <h6>Sản phẩm trong giỏ</h6>
        <Table className="mt-3 text-center table">
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
            {order.items.map((item, index) => (
              <tr key={`${item.productId}-${index}`}>
                <td>
                  <Image src={item.image} alt={item.name} width={60} rounded />
                </td>
                <td>{item.name}</td>
                <td>{item.sizeName || "Không xác định"}</td>
                <td>{item.taste.join(", ") || "Không có"}</td>
                <td>{item.price.original.toLocaleString()}đ</td>
                <td>{item.quantity}</td>
                <td>{item.finalPrice.toLocaleString()}đ</td>
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
                <div className="d-flex justify-content-between">
                  <span>Giảm giá:</span>
                  <span>-{discount.toLocaleString()}đ</span>
                </div>
                {order.voucherCode && order.voucherData && (
                  <div className="d-flex justify-content-between">
                    <span>Voucher ({order.voucherCode}):</span>
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

export default OderDetailModal;
