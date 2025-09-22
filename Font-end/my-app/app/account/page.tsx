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
  Modal,
  Spinner,
  Badge,
  Image,
  ListGroup,
  InputGroup,
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
  faBox,
  faTruck,
  faCheckCircle,
  faTimesCircle,
  faCreditCard,
  faMapMarkerAlt,
  faTicketAlt,
  faCommentDots,
  faCalendar,
  faEyeSlash,
  faEye,
  faEdit,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import "./account.css";
import ProtectedRoute from "../component/ProtectedRoute";
import { toast } from "react-toastify";
import styles from "../styles/account.module.css";

interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  address?: string; // 👈 Thêm trường address
}
type ProductIdLike = string | { _id: string };

interface OrderItem {
  productId: ProductIdLike;
  name: string;
  image: string;
  sizeName: string;
  taste: string[];
  quantity: number;
  price: {
    original: number;
    discount?: number;
  };
  finalPrice: number;
}
const hcmDistricts: string[] = [
  "Quận 1",
  "Quận 3",
  "Quận 5",
  "Quận 7",
  "Quận 8",
  "Quận 10",
  "Bình Thạnh",
  "Gò Vấp",
  "Tân Bình",
  "Tân Phú",
  "Thủ Đức",
  "Hóc Môn",
  "Củ Chi",
  "Bình Chánh",
];
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
  5: "Đã hủy",
};
const OrderStatusBadge: Record<number, { text: string; variant: string }> = {
  0: { text: OrderStatusText[0], variant: "warning" },
  1: { text: OrderStatusText[1], variant: "warning" },
  2: { text: OrderStatusText[2], variant: "info" },
  3: { text: OrderStatusText[3], variant: "primary" },
  4: { text: OrderStatusText[4], variant: "success" },
  5: { text: OrderStatusText[5], variant: "danger" },
};

// ---- Helper để chuẩn hóa productId về string ----
const resolveProductId = (pid: ProductIdLike): string =>
  typeof pid === "string" ? pid : pid._id;

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
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [district, setDistrict] = useState("");

  // 👈 Thêm state cho chỉnh sửa thông tin (bao gồm địa chỉ)
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editName, setEditName] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        setLoading(true);

        const [userRes, ordersRes] = await Promise.all([
          fetch(`${API_URL}/users/profile`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/orders`, {
            credentials: "include",
          }),
        ]);

        const userData = await userRes.json();
        const ordersData = await ordersRes.json();

        console.log("User Data:", JSON.stringify(userData, null, 2));
        console.log("Orders Data:", JSON.stringify(ordersData, null, 2));

        if (userRes.ok && userData.status) {
          setUser(userData.result);
          // 👈 Khởi tạo state edit từ user data
          setEditName(userData.result.name || "");
          setEditPhone(userData.result.phone || "");
          setEditAddress(userData.result.address || "");
        } else {
          setUser(null);
          toast.error(userData.message || "Không thể lấy thông tin người dùng");
        }

        if (ordersRes.ok && ordersData.status) {
          setOrders(ordersData.result || []);
          const completedOrders = ordersData.result.filter(
            (order: Order) => order.status === 4
          );
          console.log(
            "Completed Orders:",
            JSON.stringify(completedOrders, null, 2)
          );

          const commentablePromises = completedOrders.map((order: Order) => {
            if (!order._id || !userData.result?._id) {
              console.error("Missing orderId or userId:", {
                orderId: order._id,
                userId: userData.result?._id,
              });
              return Promise.resolve({
                status: false,
                message: "Thiếu ID",
              });
            }
            console.log("Fetching commentable products for:", {
              orderId: order._id,
              userId: userData.result._id,
            });
            return fetch(
              `${API_URL}/comment/commentable-products?orderId=${order._id}&userId=${userData.result._id}`,
              { credentials: "include" }
            ).then((res) => res.json());
          });

          const commentableResults = await Promise.all(commentablePromises);
          console.log(
            "Commentable Results:",
            JSON.stringify(commentableResults, null, 2)
          );

          const commentableMap: { [orderId: string]: CommentableProduct[] } = {};
          const canCommentOrderMap: { [orderId: string]: boolean } = {};
          completedOrders.forEach((order: Order, index: number) => {
            if (commentableResults[index].status) {
              commentableMap[order._id.toString()] =
                commentableResults[index].result || [];
              canCommentOrderMap[order._id.toString()] =
                commentableResults[index].canCommentOrder || false;
            } else {
              console.error(
                `Failed to fetch commentable products for order ${order._id}:`,
                commentableResults[index].message
              );
            }
          });
          console.log(
            "Commentable Products:",
            JSON.stringify(commentableMap, null, 2)
          );
          console.log(
            "Can Comment Order:",
            JSON.stringify(canCommentOrderMap, null, 2)
          );
          setCommentableProducts(commentableMap);
          setCanCommentOrder(canCommentOrderMap);
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

  // 👈 Hàm cập nhật thông tin cá nhân (bao gồm địa chỉ)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    setUpdatingProfile(true);
    try {
      const updateData: Record<string, any> = {};

      if (editName !== user.name) updateData.name = editName;
      if (editPhone !== user.phone) updateData.phone = editPhone;

      // Format lại address: chi tiết + district (nếu có)
      if (editAddress !== user.address || district !== "") {
        if (district) {
          updateData.address = `${editAddress}, ${district}, TP.HCM`;
        } else {
          // fallback nếu chưa chọn district
          updateData.address = editAddress;
        }
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("Không có thay đổi nào");
        return;
      }

      const res = await fetch(`${API_URL}/users/update/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (!data.status) {
        throw new Error(data.message || "Không thể cập nhật thông tin");
      }

      // Cập nhật local state
      setUser({ ...user, ...updateData });
      toast.success("Cập nhật thông tin thành công!");
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi cập nhật thông tin");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!data.status) throw new Error(data.message || "Không thể hủy đơn hàng");

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
    let commentData: any = null;
    try {
      commentData = {
        userId: user?._id,
        orderId: selectedOrderId,
        productId: selectedProductId,
        comment: commentText.trim(),
        rating: Number(rating),
      };

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
      if (
        !Number.isInteger(commentData.rating) ||
        commentData.rating < 1 ||
        commentData.rating > 5
      ) {
        toast.error("Đánh giá phải là số nguyên từ 1 đến 5");
        return;
      }

      console.log("Comment Data:", JSON.stringify(commentData, null, 2));

      const res = await fetch(`${API_URL}/comment`, {
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
          [selectedOrderId]: prev[selectedOrderId].filter(
            (p) => p.productId !== selectedProductId
          ),
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmNewPassword,
        }),
      });
      const data = await res.json();
      if (!data.status) {
        throw new Error(data.message || "Không thể thay đổi mật khẩu");
      }
      toast.success("Thay đổi mật khẩu thành công");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi thay đổi mật khẩu");
    } finally {
      setPasswordLoading(false);
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

  // Hàm định dạng tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Hàm rút gọn địa chỉ
  const shortenAddress = (address: string, maxLength = 40) => {
    return address.length > maxLength
      ? address.substring(0, maxLength) + "..."
      : address;
  };

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
                <Nav className="justify-content-center mt-4">
                  <Nav.Item>
                    <Nav.Link
                      eventKey="profile"
                      className={styles.navLink}
                    >
                      <FontAwesomeIcon icon={faUserCircle} className={styles.icon} />
                      Thông tin cá nhân
                    </Nav.Link>
                  </Nav.Item>

                  <Nav.Item>
                    <Nav.Link
                      eventKey="security"
                      className={styles.navLink}
                    >
                      <FontAwesomeIcon icon={faLock} className={styles.icon} />
                      Bảo mật
                    </Nav.Link>
                  </Nav.Item>

                  <Nav.Item>
                    <Nav.Link
                      eventKey="orders"
                      className={styles.navLink}
                    >
                      <FontAwesomeIcon icon={faShoppingBag} className={styles.icon} />
                      Đơn hàng
                    </Nav.Link>
                  </Nav.Item>

                  <Nav.Item>
                    <Nav.Link
                      eventKey="settings"
                      className={styles.navLink}
                    >
                      <FontAwesomeIcon icon={faCog} className={styles.icon} />
                      Thông tin
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content className="mt-4">
                  <Tab.Pane eventKey="profile">
                    <Card className="p-4 border-0 shadow-sm">
                      <h5 className="mb-4 text-center">
                        <FontAwesomeIcon icon={faUserCircle} className="text-primary me-2" />
                        Thông tin cá nhân
                      </h5>

                      {user ? (
                        <ListGroup variant="flush">
                          <ListGroup.Item className="d-flex align-items-center py-3 ">
                            <FontAwesomeIcon icon={faUserCircle} className="text-muted me-3" />
                            <div>
                              <div className="fw-bold">Tên người dùng</div>
                              <div>{user.name || user.username}</div>
                            </div>
                          </ListGroup.Item>

                          <ListGroup.Item className="d-flex align-items-center py-3">
                            <FontAwesomeIcon icon={faEnvelope} className="text-muted me-3" />
                            <div>
                              <div className="fw-bold">Email</div>
                              <div>{user.email}</div>
                            </div>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex align-items-center py-3">
                            <FontAwesomeIcon icon={faEnvelope} className="text-muted me-3" />
                            <div>
                              <div className="fw-bold">Số điện thoại</div>
                              <div>{user.phone}</div>
                            </div>
                          </ListGroup.Item>

                          <ListGroup.Item className="d-flex align-items-center py-3">
                            <FontAwesomeIcon icon={faLock} className="text-muted me-3" />
                            <div>
                              <div className="fw-bold">Vai trò</div>
                              <div>{user.role === "admin" ? "Quản trị viên" : "Khách hàng"}</div>
                            </div>
                          </ListGroup.Item>
                          {/* 👈 Thêm hiển thị địa chỉ nếu có */}
                          {user.address && (
                            <ListGroup.Item className="d-flex align-items-center py-3">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-muted me-3" />
                              <div>
                                <div className="fw-bold">Địa chỉ mặc định</div>
                                <div>{shortenAddress(user.address)}</div>
                              </div>
                            </ListGroup.Item>
                          )}
                        </ListGroup>
                      ) : (
                        <p className="text-muted">Không có thông tin người dùng.</p>
                      )}
                    </Card>
                  </Tab.Pane>
                  <Tab.Pane eventKey="security">
                    <Card className={`p-4 border-0 shadow-sm ${styles.cardContainer}`}>
                      <h5 className={styles.cardTitle}>
                        <FontAwesomeIcon icon={faLock} className="text-primary me-2" />
                        Thay đổi mật khẩu
                      </h5>
                      <Form onSubmit={handleChangePassword}>
                        <Form.Group controlId="oldPassword" className={`mb-3 ${styles.formGroup}`}>
                          <Form.Label>Mật khẩu cũ</Form.Label>
                          <InputGroup>
                            <Form.Control
                              type={showOldPassword ? "text" : "password"}
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              placeholder="Nhập mật khẩu cũ"
                              required
                              className={styles.inputField}
                            />
                            <Button
                              variant="outline-secondary"
                              onClick={() => setShowOldPassword(!showOldPassword)}
                            >
                              <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} />
                            </Button>
                          </InputGroup>
                        </Form.Group>

                        <Form.Group controlId="newPassword" className={`mb-3 ${styles.formGroup}`}>
                          <Form.Label>Mật khẩu mới</Form.Label>
                          <InputGroup>
                            <Form.Control
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Nhập mật khẩu mới"
                              required
                              className={styles.inputField}

                            />
                            <Button
                              variant="outline-secondary"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                            </Button>
                          </InputGroup>
                        </Form.Group>

                        <Form.Group controlId="confirmNewPassword" className={`mb-3 ${styles.formGroup}`}>
                          <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                          <InputGroup>
                            <Form.Control
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              placeholder="Xác nhận mật khẩu mới"
                              required
                              className={styles.inputField}
                            />
                            <Button
                              variant="outline-secondary"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                            </Button>
                          </InputGroup>
                        </Form.Group>

                        <Button
                          variant="primary"
                          type="submit"
                          className={`w-100 ${styles.saveButton}`}
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? (
                            <Spinner animation="border" size="sm" className="me-2" />
                          ) : null}
                          Thay đổi mật khẩu
                        </Button>
                      </Form>
                    </Card>
                  </Tab.Pane>
                  <Tab.Pane eventKey="orders">
                    <Card className="p-4 border-0 shadow-sm">
                      <h5 className="mb-4">
                        <FontAwesomeIcon icon={faShoppingBag} className="text-primary me-2" />
                        Lịch sử đơn hàng
                      </h5>

                      {orders.length === 0 ? (
                        <div className="text-center py-5">
                          <FontAwesomeIcon
                            icon={faBox}
                            className="text-muted mb-3"
                            size="3x"
                          />
                          <p className="text-muted">Chưa có đơn hàng nào.</p>
                        </div>
                      ) : (
                        <div className="order-list">
                          {orders.map((order) => (
                            <Card key={order._id} className="mb-4 border order-card">
                              <Card.Header className="d-flex justify-content-between align-items-center py-3">
                                <div>
                                  <span className="fw-bold">Mã đơn hàng: </span>
                                  <span className="text-muted">{order._id}</span>
                                </div>
                                <div>
                                  <Badge pill bg={OrderStatusBadge[order.status].variant}>
                                    {OrderStatusBadge[order.status].text}
                                  </Badge>
                                </div>
                              </Card.Header>

                              <Card.Body>
                                <Row>
                                  <Col md={8}>
                                    <h6 className="mb-3">Sản phẩm</h6>
                                    <ListGroup variant="flush">
                                      {order.items.map((item, i) => (
                                        <ListGroup.Item key={`${resolveProductId(item.productId)}-${i}`} className="py-3 px-0">
                                          <div className="d-flex">
                                            <Image
                                              src={item.image}
                                              width={80}
                                              height={80}
                                              className="rounded me-3 product-img"
                                              alt={item.name}
                                            />
                                            <div className="flex-grow-1">
                                              <div className="d-flex justify-content-between">
                                                <h6 className="mb-1">{item.name}</h6>
                                                <div className="text-end">
                                                  <div className="fw-bold">{formatCurrency(item.finalPrice)}</div>
                                                  <small className="text-muted">x {item.quantity}</small>
                                                </div>
                                              </div>
                                              <div className="mt-2">
                                                {item.sizeName !== "default" && (
                                                  <small className="text-muted d-block">
                                                    <strong>Size:</strong> {item.sizeName}
                                                  </small>
                                                )}
                                                {item.taste.length > 0 && (
                                                  <small className="text-muted">
                                                    <strong>Hương vị:</strong> {item.taste.join(", ")}
                                                  </small>
                                                )}
                                              </div>
                                              {order.status === 4 && (
                                                commentableProducts[order._id.toString()]?.length > 0 ? (
                                                  commentableProducts[order._id.toString()].some(
                                                    (p) => p.productId === resolveProductId(item.productId)
                                                  ) && (
                                                    <Button
                                                      size="sm"
                                                      className="mt-2"
                                                      variant="outline-primary"
                                                      onClick={() => openCommentModal(order._id, resolveProductId(item.productId))}
                                                    >
                                                      <FontAwesomeIcon icon={faStar} className="me-1" />
                                                      Đánh giá sản phẩm
                                                    </Button>
                                                  )
                                                ) : (
                                                  <small className="text-muted">
                                                    {commentableProducts[order._id.toString()] === undefined
                                                      ? "Đang tải dữ liệu bình luận..."
                                                      : "Không có sản phẩm nào để đánh giá."}
                                                  </small>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        </ListGroup.Item>
                                      ))}
                                    </ListGroup>
                                  </Col>

                                  <Col md={4} className="border-start ps-md-4">
                                    <h6 className="mb-3">Thông tin đơn hàng</h6>

                                    <div className="mb-3">
                                      <div className="d-flex align-items-center mb-2">
                                        <FontAwesomeIcon
                                          icon={faMapMarkerAlt}
                                          className="text-primary me-2"
                                        />
                                        <span className="fw-bold">Giao đến:</span>
                                      </div>
                                      <div className="ms-4">
                                        <div className="text-truncate">
                                          {shortenAddress(order.shippingInfo.address)}
                                        </div>
                                        <div>Họ tên: {order.shippingInfo.name}</div>
                                        <div>SDT: {order.shippingInfo.phone}</div>

                                      </div>
                                    </div>

                                    <div className="mb-3">
                                      <div className="d-flex align-items-center mb-2">
                                        <FontAwesomeIcon
                                          icon={faCreditCard}
                                          className="text-primary me-2"
                                        />
                                        <span className="fw-bold">Thanh toán:</span>
                                      </div>
                                      <div className="ms-4">
                                        <div className="text-capitalize">
                                          {order.paymentMethod} {order.isPaid ? "(Đã thanh toán)" : "(Chưa thanh toán)"}
                                        </div>
                                      </div>
                                    </div>

                                    {order.voucherCode && (
                                      <div className="mb-3">
                                        <div className="d-flex align-items-center mb-2">
                                          <FontAwesomeIcon
                                            icon={faTicketAlt}
                                            className="text-success me-2"
                                          />
                                          <span className="fw-bold">Mã giảm giá:</span>
                                        </div>
                                        <div className="ms-4">
                                          <div>{order.voucherCode}</div>
                                          <small className="text-success">
                                            Tiết kiệm: {formatCurrency(order.discount)}
                                          </small>
                                        </div>
                                      </div>
                                    )}

                                    <div className="border-top pt-3 mt-3">
                                      <div className="d-flex justify-content-between mb-1">
                                        <span>Tạm tính:</span>
                                        <span>{formatCurrency(order.total)}</span>
                                      </div>
                                      <div className="d-flex justify-content-between mb-1">
                                        <span>Phí vận chuyển:</span>
                                        <span>{formatCurrency(order.shippingFee)}</span>
                                      </div>
                                      <div className="d-flex justify-content-between mb-1">
                                        <span>Voucher:</span>
                                        <span>{formatCurrency(order.tax)}</span>
                                      </div>
                                      <div className="d-flex justify-content-between mt-2 fw-bold">
                                        <span>Tổng cộng:</span>
                                        <span className="text-danger fs-5">
                                          {formatCurrency(order.total + order.shippingFee + order.tax)}
                                        </span>
                                      </div>
                                    </div>
                                  </Col>
                                </Row>
                              </Card.Body>

                              <Card.Footer className="d-flex justify-content-between align-items-center py-3">
                                <div className="text-muted small">
                                  <FontAwesomeIcon icon={faCalendar} className="me-1" />
                                  {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </div>

                                <div>
                                  {(order.status === 0 || order.status === 1) && (
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      className="me-2"
                                      onClick={() => cancelOrder(order._id)}
                                    >
                                      <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                                      Hủy đơn
                                    </Button>
                                  )}

                                  {order.status === 4 && canCommentOrder[order._id.toString()] && (
                                    <Button
                                      size="sm"
                                      variant="outline-secondary"
                                      onClick={() => openCommentModal(order._id)}
                                    >
                                      <FontAwesomeIcon icon={faCommentDots} className="me-1" />
                                      Đánh giá đơn hàng
                                    </Button>
                                  )}
                                </div>
                              </Card.Footer>
                            </Card>
                          ))}
                        </div>
                      )}
                    </Card>
                  </Tab.Pane>
                  {/* 👈 Triển khai tab Settings cho cập nhật địa chỉ */}
                  <Tab.Pane eventKey="settings">
                    <Card className={`p-4 border-0 shadow-sm ${styles.cardContainer}`}>
                      <h5 className={styles.cardTitle}>
                        <FontAwesomeIcon icon={faCog} className="text-primary me-2" />
                        Cập nhật thông tin
                      </h5>

                      <Form onSubmit={handleUpdateProfile}>
                        <Form.Group controlId="editName" className={`mb-3 ${styles.formGroup}`}>
                          <Form.Label>Họ tên</Form.Label>
                          <Form.Control
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nhập họ tên"
                            className={styles.inputField}
                          />
                        </Form.Group>

                        <Form.Group controlId="editPhone" className={`mb-3 ${styles.formGroup}`}>
                          <Form.Label>Số điện thoại</Form.Label>
                          <Form.Control
                            type="text"
                            value={editPhone}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*$/.test(value) && value.length <= 10) {
                                setEditPhone(value);
                              }
                            }}
                            placeholder="Nhập số điện thoại (bắt đầu bằng 0)"
                            className={styles.inputField}
                          />
                        </Form.Group>

                        <Form.Group controlId="district" className={`mb-3 ${styles.formGroup}`}>
                          <Form.Label>Quận / Huyện</Form.Label>
                          <Form.Select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className={styles.selectField}
                          >
                            <option value="">-- Chọn quận/huyện --</option>
                            {hcmDistricts.map((d, index) => (
                              <option key={index} value={d}>
                                {d}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        <Form.Group controlId="editAddress" className={`mb-4 ${styles.formGroup}`}>
                          <Form.Label>
                            Địa chỉ mặc định (VD: Số nhà, đường, Quận/Huyện, TP.HCM)
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            placeholder="Nhập địa chỉ đầy đủ"
                            className={styles.textareaField}
                          />
                          <Form.Text className={styles.helperText}>
                            Địa chỉ này sẽ được sử dụng mặc định khi đặt hàng.
                          </Form.Text>
                        </Form.Group>

                        <Button
                          type="submit"
                          className={`w-100 ${styles.saveButton}`}
                          disabled={updatingProfile}
                        >
                          {updatingProfile ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Đang cập nhật...
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faSave} className="me-2" />
                              Lưu thay đổi
                            </>
                          )}
                        </Button>
                      </Form>
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
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="danger">Vô hiệu hóa</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)} centered>
          <Modal.Header closeButton className="border-bottom-0">
            <Modal.Title>
              <FontAwesomeIcon
                icon={selectedProductId ? faStar : faCommentDots}
                className="me-2 text-warning"
              />
              {selectedProductId ? "Đánh giá sản phẩm" : "Đánh giá đơn hàng"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="rating" className="mb-3">
                <Form.Label>Đánh giá của bạn</Form.Label>
                <div className="d-flex align-items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant={rating >= star ? "warning" : "outline-secondary"}
                      className="me-1 p-0 border-0"
                      onClick={() => setRating(star)}
                    >
                      <FontAwesomeIcon icon={faStar} size="lg" />
                    </Button>
                  ))}
                  <span className="ms-2 fw-bold">{rating}/5</span>
                </div>
              </Form.Group>

              <Form.Group controlId="commentText">
                <Form.Label>
                  {selectedProductId ? "Nhận xét về sản phẩm" : "Nhận xét về đơn hàng"}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    selectedProductId
                      ? "Sản phẩm này như thế nào? Chia sẻ cảm nhận của bạn..."
                      : "Trải nghiệm mua hàng của bạn như thế nào? Hãy chia sẻ nhé..."
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-top-0">
            <Button variant="light" onClick={() => setShowCommentModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={submitComment}>
              <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
              Gửi đánh giá
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </ProtectedRoute>
  );
};

export default UserProfile;