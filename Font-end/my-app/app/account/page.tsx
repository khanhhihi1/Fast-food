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
  faStar,
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

interface CommentableProduct {
  productId: string;
  name: string;
  image?: string;
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
  const [commentableProducts, setCommentableProducts] = useState<{ [orderId: string]: CommentableProduct[] }>({});
  const [canCommentOrder, setCanCommentOrder] = useState<{ [orderId: string]: boolean }>({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        setLoading(true);

        const [userRes, ordersRes] = await Promise.all([
          fetch("http://localhost:5000/users/profile", {
            credentials: "include",
          }),
          fetch("http://localhost:5000/orders", {
            credentials: "include",
          }),
        ]);

        const userData = await userRes.json();
        const ordersData = await ordersRes.json();

        console.log("User Data:", JSON.stringify(userData, null, 2));
        console.log("Orders Data:", JSON.stringify(ordersData, null, 2));

        if (userRes.ok && userData.status) {
          setUser(userData.result);
        } else {
          setUser(null);
          toast.error(userData.message || "Không thể lấy thông tin người dùng");
        }

        if (ordersRes.ok && ordersData.status) {
          setOrders(ordersData.result || []);
          const completedOrders = ordersData.result.filter((order: Order) => order.status === 4);
          console.log("Completed Orders:", JSON.stringify(completedOrders, null, 2));

          const commentablePromises = completedOrders.map((order: Order) => {
            if (!order._id || !userData.result?._id) {
              console.error("Missing orderId or userId:", {
                orderId: order._id,
                userId: userData.result?._id,
              });
              return Promise.resolve({ status: false, message: "Thiếu ID" });
            }
            console.log("Fetching commentable products for:", {
              orderId: order._id,
              userId: userData.result._id,
            });
            return fetch(
              `http://localhost:5000/comment/commentable-products?orderId=${order._id}&userId=${userData.result._id}`,
              { credentials: "include" }
            ).then(res => res.json());
          });

          const commentableResults = await Promise.all(commentablePromises);
          console.log("Commentable Results:", JSON.stringify(commentableResults, null, 2));

          const commentableMap: { [orderId: string]: CommentableProduct[] } = {};
          const canCommentOrderMap: { [orderId: string]: boolean } = {};
          completedOrders.forEach((order: Order, index: number) => {
            if (commentableResults[index].status) {
              commentableMap[order._id.toString()] = commentableResults[index].result;
              canCommentOrderMap[order._id.toString()] = commentableResults[index].canCommentOrder;
            }
          });
          setCommentableProducts(commentableMap);
          setCanCommentOrder(canCommentOrderMap);
          console.log("Commentable Products:", JSON.stringify(commentableMap, null, 2));
          console.log("Can Comment Order:", JSON.stringify(canCommentOrderMap, null, 2));
        } else {
          setOrders([]);
          toast.error(ordersData.message || "Không thể lấy đơn hàng");
        }
      } catch (err: any) {
        console.error("Fetch error:", {
          message: err.message,
          stack: err.stack,
        });
        toast.error("Lỗi kết nối đến máy chủ");
        setUser(null);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndOrders();
  }, []);

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    try {
      const res = await fetch(`http://localhost:5000/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!data.status) throw new Error(data.message || "Không thể hủy đơn hàng");

      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? { ...order, status: 5 } : order))
      );
      toast.success("Hủy đơn hàng thành công!");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi khi hủy đơn hàng");
    }
  };

  const openCommentModal = (orderId: string, productId?: string) => {
    if (!user?._id) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }
    setSelectedOrderId(orderId);
    setSelectedProductId(productId || null);
    setCommentText("");
    setRating(5);
    setShowCommentModal(true);
  };

  const submitComment = async () => {
    try {
      const commentData = {
        userId: user?._id,
        orderId: selectedOrderId,
        productId: selectedProductId,
        comment: commentText.trim(),
        rating: Number(rating),
      };

      // Kiểm tra các trường bắt buộc
      if (!commentData.userId) {
        toast.error("Vui lòng đăng nhập để bình luận");
        return;
      }
      if (!commentData.orderId) {
        toast.error("Không tìm thấy đơn hàng");
        return;
      }
      if (!commentData.comment) {
        toast.error("Vui lòng nhập nội dung bình luận");
        return;
      }
      if (!Number.isInteger(commentData.rating) || commentData.rating < 1 || commentData.rating > 5) {
        toast.error("Đánh giá phải là số nguyên từ 1 đến 5");
        return;
      }

      console.log("Comment Data:", JSON.stringify(commentData, null, 2));

      const res = await fetch("http://localhost:5000/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(commentData),
      });

      const data = await res.json();
      if (!data.status) {
        throw new Error(data.message || "Không thể gửi bình luận");
      }

      toast.success("Đã gửi bình luận");
      setShowCommentModal(false);

      if (selectedProductId) {
        setCommentableProducts((prev) => ({
          ...prev,
          [selectedOrderId]: prev[selectedOrderId].filter((p) => p.productId !== selectedProductId),
        }));
      } else {
        setCommentableProducts((prev) => ({
          ...prev,
          [selectedOrderId]: [],
        }));
        setCanCommentOrder((prev) => ({
          ...prev,
          [selectedOrderId]: false,
        }));
      }
    } catch (err: any) {
      console.error("Submit Comment Error:", {
        message: err.message,
        stack: err.stack,
        commentData,
      });
      toast.error(err.message || "Không thể gửi bình luận");
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

              <Tab.Container defaultActiveKey="orders">
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
                  <Tab.Pane eventKey="profile">{/* Thông tin cá nhân */}</Tab.Pane>
                  <Tab.Pane eventKey="security">{/* Bảo mật */}</Tab.Pane>
                  <Tab.Pane eventKey="orders">
                    <Card className="p-4">
                      <h5>
                        <FontAwesomeIcon icon={faShoppingBag} className="text-primary me-2" />
                        Lịch sử đơn hàng
                      </h5>
                      {orders.length === 0 ? (
                        <p>Chưa có đơn hàng nào.</p>
                      ) : (
                        <Table striped bordered hover responsive className="mt-3 text-center">
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
                                  {order.items.map((item, i) => (
                                    <div key={`${item.productId}-${i}`} className="mb-2">
                                      <strong>{item.name}</strong> ({item.sizeName}, {item.quantity} x{" "}
                                      {item.finalPrice.toLocaleString()} ₫)
                                      {item.taste.length > 0 && (
                                        <div>
                                          <strong>Hương vị:</strong> {item.taste.join(", ")}
                                        </div>
                                      )}
                                      {order.status === 4 &&
                                        commentableProducts[order._id.toString()]?.some(
                                          (p) => p.productId === item.productId
                                        ) && (
                                          <Button
                                            size="sm"
                                            className="mt-2"
                                            variant="outline-primary"
                                            onClick={() => openCommentModal(order._id, item.productId)}
                                          >
                                            <FontAwesomeIcon icon={faStar} className="me-1" />
                                            Viết bình luận
                                          </Button>
                                        )}
                                    </div>
                                  ))}
                                  {order.status === 4 && commentableProducts[order._id.toString()]?.length === 0 && (
                                    <p className="text-muted mt-2">Không còn sản phẩm nào để bình luận.</p>
                                  )}
                                  {order.status === 4 && canCommentOrder[order._id.toString()] && (
                                    <Button
                                      size="sm"
                                      className="mt-2"
                                      variant="outline-secondary"
                                      onClick={() => openCommentModal(order._id)}
                                    >
                                      <FontAwesomeIcon icon={faStar} className="me-1" />
                                      Bình luận đơn hàng
                                    </Button>
                                  )}
                                </td>
                                <td>
                                  {order.shippingInfo.name}
                                  <br />
                                  {order.shippingInfo.phone}
                                  <br />
                                  {order.shippingInfo.address}
                                </td>
                                <td>
                                  {order.voucherCode ? (
                                    <>
                                      {order.voucherCode}
                                      <br />
                                      {order.voucherData?.description}
                                      <br />
                                      Giảm: {order.discount.toLocaleString()} ₫
                                    </>
                                  ) : (
                                    "Không áp dụng"
                                  )}
                                </td>
                                <td>{order.total.toLocaleString()} ₫</td>
                                <td className="text-capitalize">{order.paymentMethod}</td>
                                <td
                                  className={`fw-bold ${
                                    order.status === 4
                                      ? "text-success"
                                      : order.status === 5
                                      ? "text-danger"
                                      : "text-secondary"
                                  }`}
                                >
                                  {OrderStatusText[order.status]}
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                                <td>
                                  {(order.status === 0 || order.status === 1) && (
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
                  <Tab.Pane eventKey="settings">{/* Cài đặt */}</Tab.Pane>
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
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="danger">Vô hiệu hóa</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{selectedProductId ? "Bình luận sản phẩm" : "Bình luận đơn hàng"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="commentText">
                <Form.Label>Bình luận</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    selectedProductId ? "Nhập bình luận về sản phẩm..." : "Nhập bình luận về đơn hàng..."
                  }
                />
              </Form.Group>
              <Form.Group controlId="rating" className="mt-2">
                <Form.Label>Đánh giá (1-5 sao)</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCommentModal(false)}>Hủy</Button>
            <Button variant="primary" onClick={submitComment}>Gửi bình luận</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </ProtectedRoute>
  );
};

export default UserProfile;