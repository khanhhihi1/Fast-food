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
import AdminSideBar from "@/app/component/adminSideBar";
import useDarkMode from "../useDarkMode/page";
import AdminNavbar from "@/app/component/adminNavbar";
import { Collapse } from "react-bootstrap";

interface OrderItem {
  productId: string;
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

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  total: number;
  shippingFee: number;
  tax: number;
  status: string;
  createdAt: string;
}

export default function CartManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode } = useDarkMode();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/orders/admin/all", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Lỗi lấy đơn hàng: ${res.status} - ${text}`);
        }
        const data = await res.json();
        if (data.status) {
          setOrders(data.result);
        } else {
          throw new Error(data.message || "Lỗi không xác định");
        }
      } catch (err: any) {
        console.error("❌ Lỗi tải đơn hàng:", err.message);
        setErrorOrders("Không thể tải đơn hàng. Vui lòng thử lại.");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrderDetails = (id: string) => {
    setOpenOrderId(openOrderId === id ? null : id);
  };

  const statusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "warning";
      case "delivered":
        return "success";
      case "pending":
        return "secondary";
      case "cancelled":
        return "danger";
      default:
        return "light";
    }
  };

  return (
    <div className="d-flex dark-mode">
      <AdminSideBar />
      <Container fluid className={`content w-100 container-content ${collapsed ? "collapsed-content" : ""}`}>
        <AdminNavbar />
        <Container fluid="xl">
          <header>
            <Row className="align-items-center justify-content-between">
              <Col>
                <h2 className="fw-bold text-white d-flex">
                  <FaShoppingBag className="me-2" />
                  Quản lý đơn hàng
                </h2>
              </Col>
              <Col xs="auto" className="d-flex align-items-center gap-2">
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
            </Row>
          </header>
        </Container>

        <Container fluid="xl" className="py-4">
          <Card className="mb-4">
            <Card.Body>
              <Row className="justify-content-between g-2">
                <Col md="auto" className="d-flex gap-2">
                  <Button variant="primary">Tất cả đơn hàng</Button>
                  <Button variant="light">Hôm nay</Button>
                  <Button variant="light">Trong tuần</Button>
                  <Button variant="light">Trong tháng</Button>
                </Col>
                <Col md="auto">
                  <Form.Select>
                    <option>Trạng thái</option>
                    <option>Chờ xác nhận</option>
                    <option>Đã xác nhận</option>
                    <option>Đang giao</option>
                    <option>Đã nhận hàng</option>
                    <option>Hủy đơn hàng</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {loadingOrders ? (
            <Alert variant="info">Đang tải danh sách đơn hàng...</Alert>
          ) : errorOrders ? (
            <Alert variant="danger">{errorOrders}</Alert>
          ) : (
            orders.map((order) => (
              <Card className="mb-3" key={order._id}>
                <Card.Body onClick={() => toggleOrderDetails(order._id)}>
                  <div className="d-flex gap-3 align-items-center">
                    <div className="rounded-circle bg-light p-3">
                      <FaShoppingCart className="text-primary" />
                    </div>
                    <div>
                      <h5 className="mb-1">Khách hàng #{order._id}</h5>
                      <small className="text-white">Thời gian: {new Date(order.createdAt).toLocaleString()}</small>
                    </div>
                  </div>

                  <div className="d-flex gap-4 align-items-center flex-wrap">
                    <div>
                      <div className="text-white small">Khách hàng</div>
                      <div>{order.userId?.name}</div>
                    </div>
                    <div>
                      <div className="text-white small">Tổng tiền</div>
                      <div>{order.total.toLocaleString()}₫</div>
                    </div>
                    <div>
                      <div className="text-white small">Trạng thái</div>
                      <Badge bg={statusBadgeVariant(order.status)}>{order.status}</Badge>
                    </div>
                    <FaChevronDown className="text-white" />
                  </div>
                </Card.Body>

                <Collapse in={openOrderId === order._id}>
                  <div>
                    <Card.Body className="bg-light border-top">
                      <Row className="mb-4 text-dark">
                        <Col md={6}>
                          <h6>Thông tin khách hàng</h6>
                          <p><strong>Tên:</strong> {order.userId.name}</p>
                          <p><strong>Email:</strong> {order.userId.email}</p>
                          {/* Nếu bạn có thêm thông tin như SĐT hay địa chỉ, hiển thị tại đây */}
                        </Col>
                        <Col md={6}>
                          <h6>Thông tin đơn hàng</h6>
                          <p><strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                          {/* Bạn có thể thêm ngày cập nhật cuối nếu có */}
                          <p><strong>Trạng thái:</strong> <Badge bg={statusBadgeVariant(order.status)}>{order.status}</Badge></p>
                        </Col>
                      </Row>

                      <h6>Sản phẩm trong đơn hàng</h6>
                      <div className="table-responsive">
                        <Table hover responsive>
                          <thead>
                            <tr>
                              <th>Sản phẩm</th>
                              <th>Đơn giá</th>
                              <th>Số lượng</th>
                              <th>Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, i) => (
                              <tr key={i}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      width={60}
                                      height={60}
                                      className="me-3 rounded bg-light"
                                    />
                                    <div>
                                      <p className="mb-0">{item.name}</p>
                                      <small className="text-muted">
                                        Size: {item.sizeName}, Hương vị: {item.taste.join(", ")}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td>{(item.price.discount ?? item.price.original).toLocaleString()}đ</td>
                                <td>{item.quantity}</td>
                                <td>{(item.quantity * (item.price.discount ?? item.price.original)).toLocaleString()}đ</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>

                      <Row className="mt-3">
                        <Col md={6}>
                          <Card>
                            <Card.Body>
                              <h6>Ghi chú</h6>
                              <p>Khách hàng muốn kiểm tra sản phẩm trước khi thanh toán</p> {/* hoặc bạn lấy từ DB nếu có */}
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card>
                            <Card.Body>
                              <h6>Tổng thanh toán</h6>
                              <div className="d-flex justify-content-between">
                                <span>Tạm tính:</span>
                                <span>{order.total.toLocaleString()}đ</span>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span>Phí ship:</span>
                                <span>{order.shippingFee.toLocaleString()}đ</span>
                              </div>
                              <hr />
                              <div className="d-flex justify-content-between fw-bold">
                                <span>Tổng cộng:</span>
                                <span>{(order.total + order.shippingFee + order.tax).toLocaleString()}đ</span>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </Card.Body>
                  </div>
                </Collapse>


              </Card>
            ))
          )}
        </Container>
      </Container>
    </div>
  );
}
