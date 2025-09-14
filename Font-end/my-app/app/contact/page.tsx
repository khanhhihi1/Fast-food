"use client";
import { Container, Row, Col, Form, Button, Modal, Alert } from "react-bootstrap";
import styles from "../styles/contact.module.css";
import { useState, ChangeEvent, FormEvent } from "react";

// Kiểu dữ liệu cho form liên hệ
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOTP] = useState("");
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/contacts/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data: { error?: string; message?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send OTP");
      setShowOTPModal(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/contacts/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data: { error?: string; message?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid OTP");

      setSuccess("Liên hệ hỗ trợ của bạn đã gửi tới Admin. Admin sẽ phản hồi mail bạn trong thời gian sớm nhất!");
      setShowOTPModal(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setOTP("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container>
        <section className={styles.contactPage}>
          <Container>
            <div className={styles.sectionTitle}>
              <h3>Thông Tin Cửa Hàng</h3>
              <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
            </div>

            <Row>
              {/* Bên trái: thông tin + form */}
              <Col lg={6}>
                <div className={styles.contactInfo}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div>
                      <h5>Địa Chỉ</h5>
                      <p>72 Lê Thánh Tôn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <i className="far fa-clock"></i>
                    </div>
                    <div>
                      <h5>Thời Gian Làm Việc</h5>
                      <p>
                        Thứ 2 - Thứ 6: 8:00 - 21:00 <br />
                        Thứ 7 - Chủ nhật: 8:00 - 22:00
                      </p>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <i className="fas fa-phone-alt"></i>
                    </div>
                    <div>
                      <h5>Hotline</h5>
                      <p>0901 234 567</p>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <i className="far fa-envelope"></i>
                    </div>
                    <div>
                      <h5>Email</h5>
                      <p>info@cuahang.com</p>
                    </div>
                  </div>
                </div>

                {/* Form liên hệ */}
                <div className={styles.contactForm}>
                  <h3>Gửi Thông Tin Liên Hệ</h3>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="name">
                          <Form.Label>Họ và tên</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="email">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3" controlId="subject">
                      <Form.Label>Tiêu đề</Form.Label>
                      <Form.Control
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="message">
                      <Form.Label>Nội dung</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Button type="submit" disabled={loading}>
                      {loading ? "Đang gửi..." : "Gửi Liên Hệ"}
                    </Button>
                  </Form>
                </div>
              </Col>

              {/* Bên phải: bản đồ */}
              <Col lg={6} className="mb-4">
                <div className={styles.mapContainer}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.632311374661!2d106.6797263148007!3d10.76273399233072!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1c06f4ec1b%3A0x6b6b6e1c2d6f3b1f!2sVincom%20Center%20Đồng%20Khởi!5e0!3m2!1svi!2s!4v1644392544747!5m2!1svi!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </Container>

      {/* OTP Modal */}
      <Modal show={showOTPModal} onHide={() => setShowOTPModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Điền mã xác thực OTP để gửi liên hệ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nhập mã OTP được gửi đến email của bạn</Form.Label>
            <Form.Control
              type="text"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              required
            />
          </Form.Group>
          {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOTPModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleVerifyOTP} disabled={loading}>
            {loading ? "Đang xác thực..." : "Xác thực"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
