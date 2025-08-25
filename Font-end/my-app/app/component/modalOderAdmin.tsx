import React, { useEffect, useState } from "react";
import {
<<<<<<< HEAD
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
      setCurrentOrder(data.order);    } catch (error: any) {
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

  const subtotal = currentOrder.items.reduce(
    (sum, item) => sum + item.price.original * item.quantity,
    0
  );
  const discount = currentOrder.discount || 0;
  const voucherDiscount = currentOrder.voucherData?.discountValue || 0;
  const shippingFee = currentOrder.shippingFee || 0;
  const tax = currentOrder.tax || 0;
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
                <td style={{color:"black"}}>{item.name}</td>
                <td style={{color:"black"}}>{item.sizeName || "Không xác định"}</td>
                <td style={{color:"black"}}>{item.taste.join(", ") || "Không có"}</td>
                <td style={{color:"black"}}>{item.price.original.toLocaleString()}đ</td>
                <td style={{color:"black"}}>{item.quantity}</td>
                <td style={{color:"black"}}>{(item.finalPrice * item.quantity).toLocaleString()}đ</td>
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
                {currentOrder.voucherCode && currentOrder.voucherData?.discountValue && (
                  <div className="d-flex justify-content-between">
                    <span>Voucher ({currentOrder.voucherCode}):</span>
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
=======
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

    // Xóa state không cần thiết (orders, isLoading, currentPage, v.v.) vì chỉ hiển thị 1 order
    if (!order) return null;

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
            window.location.reload();
            if (onStatusUpdated) {
                onStatusUpdated();
            }
        } catch (error: any) {
            toast.error(error.message || "Có lỗi khi cập nhật trạng thái");
        }
    };
    const subtotal = order.items.reduce((sum, item) => sum + item.price.original * item.quantity, 0);
    const discount = order.discount || 0;
    const voucherDiscount = order.voucherData?.discountValue|| 0;
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
                            <strong>SĐT:</strong> {order.shippingInfo.phone || "Không xác định"}
                        </p>
                        <p>
                            <strong>Địa chỉ:</strong> {order.shippingInfo.address || "Không xác định"}
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
                                className={`form-select fw-bold text-capitalize ${order.status === 0
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
                        </Form.Group>
                    </Col>
                </Row>

                <h6>Sản phẩm trong giỏ</h6>
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
                        {order.items.map((item, index) => (
                            <tr key={`${item.productId}-${index}`}>
                                <td>
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={60}
                                        rounded

                                    />
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
                                <p>
                                    {order.shippingInfo?.note || "Khách hàng không có ghi chú"}
                                </p>
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
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
