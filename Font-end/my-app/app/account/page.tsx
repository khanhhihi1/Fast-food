"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Tab,
  Nav,
  Form,
  Table,
  Modal,
  Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faUserCircle,
  faLock,
  faShoppingBag,
  faCog,
  faInfoCircle,
  faEnvelope,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./account.css";
import ProtectedRoute from "../component/ProtectedRoute";
import { toast } from "react-toastify";

interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string;
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
  userId: string;
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

const UserProfile = () => {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const userRes = await fetch("http://localhost:5000/users/profile", {
          credentials: "include",
        });
        const userData = await userRes.json();
        if (userRes.ok && userData.status) {
          setUser(userData.result);
        } else {
          setUser(null);
        }

        // Fetch orders
        const ordersRes = await fetch("http://localhost:5000/orders", {
          credentials: "include",
        });
        const ordersData = await ordersRes.json();
        if (ordersRes.ok && ordersData.status) {
          setOrders(ordersData.result || []);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setUser(null);
        setOrders([]);
        toast.error("Có lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndOrders();
  }, []);

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    try {
      const res = await fetch(
        `http://localhost:5000/orders/${orderId}/cancel`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!data.status) {
        throw new Error(data.message || "Không thể hủy đơn hàng");
      }
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: 5 } : order
        )
      );
      toast.success("Hủy đơn hàng thành công!");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi khi hủy đơn hàng");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
        </Container>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="bg-white p-4">
              <div className="text-center">
                <h3 className="mt-3 mb-0">{user?.name || "Người dùng"}</h3>
              </div>

              <Tab.Container defaultActiveKey="profile">
                <Nav variant="pills" className="justify-content-center mt-4">
                  <Nav.Item>
                    <Nav.Link eventKey="profile">
                      <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                      Thông tin cá nhân
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="security">
                      <FontAwesomeIcon icon={faLock} className="me-2" />
                      Bảo mật
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="orders">
                      <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
                      Đơn hàng
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="settings">
                      <FontAwesomeIcon icon={faCog} className="me-2" />
                      Cài đặt
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content className="mt-4">
                  <Tab.Pane eventKey="profile">
                    <Row>
                      <Col md={6}>
                        <Card className="p-4 mb-3 position-relative">
                          <h5>
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className="text-primary me-2"
                            />
                            Thông tin cơ bản
                          </h5>
                          <p>
                            <strong>Họ và tên:</strong> {user?.name}
                          </p>
                          <p>
                            <strong>Email:</strong> {user?.email}
                          </p>
                          <p>
                            <strong>Tên đăng nhập:</strong> {user?.username}
                          </p>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="p-4 mb-3">
                          <h5>
                            <FontAwesomeIcon
                              icon={faEnvelope}
                              className="text-primary me-2"
                            />
                            Liên hệ
                          </h5>
                          <p>
                            <strong>Email:</strong> {user?.email}
                          </p>
                        </Card>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  <Tab.Pane eventKey="security">
                    <Card className="p-4">
                      <h5>
                        <FontAwesomeIcon
                          icon={faLock}
                          className="text-primary me-2"
                        />
                        Bảo mật
                      </h5>
                      <p>Chức năng đổi mật khẩu sẽ được cập nhật sau.</p>
                    </Card>
                  </Tab.Pane>

                  <Tab.Pane eventKey="orders">
                    <Card className="p-4">
                      <h5>
                        <FontAwesomeIcon
                          icon={faShoppingBag}
                          className="text-primary me-2"
                        />
                        Lịch sử đơn hàng
                      </h5>
                      {orders.length === 0 ? (
                        <p>Chưa có đơn hàng nào.</p>
                      ) : (
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
                            {orders.map((order, idx) => (
                              <tr key={order._id}>
                                <td>{idx + 1}</td>
                                <td>
                                  <div>
                                    {order.items.map((item) => (
                                      <div key={item.productId + item.sizeName}>
                                        <strong>Tên:</strong> {item.name} (
                                        {item.sizeName}, {item.quantity} x{" "}
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
                                    <strong>Tên:</strong>{" "}
                                    {order.shippingInfo.name}
                                    <br />
                                    <strong>SĐT:</strong>{" "}
                                    {order.shippingInfo.phone}
                                    <br />
                                    <strong>Địa chỉ:</strong>{" "}
                                    {order.shippingInfo.address}
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
                                <td className="text-capitalize">
                                  {order.paymentMethod}
                                </td>
                                <td
                                  className={`fw-bold ${
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
                                >
                                  {OrderStatusText[order.status]}
                                </td>
                                <td>
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </td>
                                <td>
                                  {(order.status === 0 ||
                                    order.status === 1) && (
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => cancelOrder(order._id)}
                                    >
                                      Hủy đơn
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </Card>
                  </Tab.Pane>

                  <Tab.Pane eventKey="settings">
                    <Card className="p-4 text-danger border-danger">
                      <h5>
                        <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                        Vô hiệu hóa tài khoản
                      </h5>
                      <p>
                        Bạn sẽ không thể khôi phục lại tài khoản sau khi vô hiệu
                        hóa.
                      </p>
                      <Button
                        variant="outline-danger"
                        onClick={() => setShowModal(true)}
                      >
                        Vô hiệu hóa
                      </Button>
                    </Card>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card>
          </Col>
        </Row>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title>Xác nhận vô hiệu hóa tài khoản</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Tài khoản sẽ bị xóa và không thể khôi phục.</p>
            <Form.Check type="checkbox" label="Tôi hiểu và đồng ý" />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="danger">Vô hiệu hóa</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </ProtectedRoute>
  );
};

export default UserProfile;
