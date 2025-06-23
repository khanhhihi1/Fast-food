'use client'
import React, { useState } from "react";
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
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faUserCircle,
  faLock,
  faShoppingBag,
  faCog,
  faInfoCircle,
  faMapMarkerAlt,
  faEnvelope,
  faKey,
  faShieldAlt,
  faHistory,
  faBell,
  faGlobe,
  faUserSlash,
  faTrashAlt,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import './account.css'
const UserProfile = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="bg-white p-4">
            {/* Header */}
            <div className="text-center">
              <div className="position-relative mx-auto" style={{ width: "fit-content" }}>
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Profile"
                  className="rounded-circle"
                  width="120"
                />
                <Button
                  variant="light"
                  size="sm"
                  className="rounded-circle position-absolute bottom-0 end-0"
                >
                  <FontAwesomeIcon icon={faCamera} />
                </Button>
              </div>
              <h3 className="mt-3 mb-0">Nguyễn Văn A</h3>
              <p className="text-muted mb-0">Thành viên từ: 15/02/2020</p>
            </div>

            {/* Tabs */}
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
                {/* Thông tin cá nhân */}
                <Tab.Pane eventKey="profile">
                  <Row>
                    <Col md={6}>
                      <Card className="p-4 mb-3 position-relative">
                        <Button variant="outline-primary" size="sm" className="edit-btn position-absolute top-0 end-0 m-2">
                          <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
                        </Button>
                        <h5>
                          <FontAwesomeIcon icon={faInfoCircle} className="text-primary me-2" />
                          Thông tin cơ bản
                        </h5>
                        <p><strong>Họ và tên:</strong> Nguyễn Văn A</p>
                        <p><strong>Ngày sinh:</strong> 15/05/1990</p>
                        <p><strong>Giới tính:</strong> Nam</p>
                        <p><strong>SĐT:</strong> 0987654321</p>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="p-4 mb-3 position-relative">
                        <Button variant="outline-primary" size="sm" className="edit-btn position-absolute top-0 end-0 m-2">
                          <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
                        </Button>
                        <h5>
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary me-2" />
                          Địa chỉ
                        </h5>
                        <p><strong>Địa chỉ chính:</strong> 123 Đường ABC, Quận 1</p>
                        <p><strong>Địa chỉ phụ:</strong> 456 Đường DEF, Quận 2</p>
                      </Card>
                    </Col>
                    <Col md={12}>
                      <Card className="p-4 mb-3 position-relative">
                        <Button variant="outline-primary" size="sm" className="edit-btn position-absolute top-0 end-0 m-2">
                          <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
                        </Button>
                        <h5>
                          <FontAwesomeIcon icon={faEnvelope} className="text-primary me-2" />
                          Thông tin liên hệ
                        </h5>
                        <Row>
                          <Col md={6}><p><strong>Email:</strong> nguyenvana@gmail.com</p></Col>
                          <Col md={6}><p><strong>Facebook:</strong> facebook.com/nguyenvana</p></Col>
                          <Col md={6}><p><strong>Zalo:</strong> 0987654321</p></Col>
                          <Col md={6}><p><strong>Skype:</strong> nguyenvana</p></Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                </Tab.Pane>

                {/* Bảo mật */}
                <Tab.Pane eventKey="security">
                  <Row>
                    <Col md={6}>
                      <Card className="p-4 mb-3">
                        <h5>
                          <FontAwesomeIcon icon={faKey} className="text-primary me-2" />
                          Mật khẩu
                        </h5>
                        <p><strong>Trạng thái:</strong> <span className="badge bg-success">Mạnh</span></p>
                        <p><strong>Lần đổi cuối:</strong> 15 ngày trước</p>
                        <Button variant="primary">Đổi mật khẩu</Button>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="p-4 mb-3">
                        <h5>
                          <FontAwesomeIcon icon={faShieldAlt} className="text-primary me-2" />
                          Bảo mật 2 lớp
                        </h5>
                        <p><strong>Trạng thái:</strong> <span className="badge bg-danger">Tắt</span></p>
                        <p><strong>SĐT xác thực:</strong> 0987654321</p>
                        <Button variant="primary">Kích hoạt</Button>
                      </Card>
                    </Col>
                    <Col md={12}>
                      <Card className="p-4">
                        <h5>
                          <FontAwesomeIcon icon={faHistory} className="text-primary me-2" />
                          Hoạt động đăng nhập
                        </h5>
                        <Table hover responsive>
                          <thead>
                            <tr>
                              <th>Thời gian</th>
                              <th>IP</th>
                              <th>Thiết bị</th>
                              <th>Vị trí</th>
                              <th>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>10 phút trước</td>
                              <td>192.168.1.1</td>
                              <td>Chrome, Windows</td>
                              <td>TP.HCM</td>
                              <td><span className="badge bg-success">Thành công</span></td>
                            </tr>
                          </tbody>
                        </Table>
                      </Card>
                    </Col>
                  </Row>
                </Tab.Pane>

                {/* Đơn hàng */}
                <Tab.Pane eventKey="orders">
                  <Card className="p-4">
                    <h5>
                      <FontAwesomeIcon icon={faShoppingBag} className="text-primary me-2" />
                      Lịch sử đơn hàng
                    </h5>
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th>Mã đơn</th>
                          <th>Ngày</th>
                          <th>Sản phẩm</th>
                          <th>Tổng</th>
                          <th>Trạng thái</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>#DH12345</td>
                          <td>15/02/2023</td>
                          <td>Áo thun</td>
                          <td>750.000đ</td>
                          <td><span className="badge bg-success">Đã giao</span></td>
                          <td><Button size="sm" variant="outline-primary">Chi tiết</Button></td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card>
                </Tab.Pane>

                {/* Cài đặt */}
                <Tab.Pane eventKey="settings">
                  <Row>
                    <Col md={6}>
                      <Card className="p-4 mb-3">
                        <h5>
                          <FontAwesomeIcon icon={faBell} className="text-primary me-2" />
                          Cài đặt thông báo
                        </h5>
                        <Form.Check type="switch" label="Thông báo qua email" defaultChecked />
                        <Form.Check type="switch" label="Thông báo qua SMS" defaultChecked />
                        <Form.Check type="switch" label="Nhận khuyến mãi" />
                        <Button className="mt-3">Lưu cài đặt</Button>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="p-4 mb-3">
                        <h5>
                          <FontAwesomeIcon icon={faGlobe} className="text-primary me-2" />
                          Ngôn ngữ & Vùng
                        </h5>
                        <Form.Group className="mb-3">
                          <Form.Label>Ngôn ngữ</Form.Label>
                          <Form.Select defaultValue="vi">
                            <option>Tiếng Việt</option>
                            <option>English</option>
                            <option>中文</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Múi giờ</Form.Label>
                          <Form.Select defaultValue="utc7">
                            <option>(UTC+07:00) Hà Nội</option>
                            <option>(UTC+08:00) Bắc Kinh</option>
                          </Form.Select>
                        </Form.Group>
                        <Button className="mt-3">Lưu thay đổi</Button>
                      </Card>
                    </Col>
                    <Col md={12}>
                      <Card className="p-4 text-danger border-danger">
                        <h5>
                          <FontAwesomeIcon icon={faUserSlash} className="text-danger me-2" />
                          Vô hiệu hóa tài khoản
                        </h5>
                        <p>Bạn sẽ không thể khôi phục lại tài khoản.</p>
                        <Button variant="outline-danger" onClick={() => setShowModal(true)}>
                          <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                          Vô hiệu hóa tài khoản
                        </Button>
                      </Card>
                    </Col>
                  </Row>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Card>
        </Col>
      </Row>

      {/* Modal xác nhận xóa */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Xác nhận vô hiệu hóa tài khoản</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tất cả dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
          <Form.Group className="mb-3">
            <Form.Label>Lý do (tùy chọn)</Form.Label>
            <Form.Control as="textarea" rows={3} />
          </Form.Group>
          <Form.Check
            type="checkbox"
            label="Tôi hiểu và đồng ý"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
          <Button variant="danger">Vô hiệu hóa</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserProfile;
