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

interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string;
}

const UserProfile = () => {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/users/profile", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.status) {
          setUser(data.result);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Fetch user error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

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
                      <p>Chưa có đơn hàng nào.</p>
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
