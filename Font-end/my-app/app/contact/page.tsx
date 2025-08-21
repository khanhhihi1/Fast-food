"use client";
import { Container, Row, Col, Navbar, Nav, Form, Button } from "react-bootstrap";
import Head from "next/head";
import styles from "../styles/contact.module.css";

export default function ContactPage() {
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
                            {/* Bản đồ bên trái */}
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

                                {/* Form */}
                                <div className={styles.contactForm}>
                                    <h3>Gửi Thông Tin Liên Hệ</h3>
                                    <Form>
                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Form.Group controlId="name">
                                                    <Form.Label>Họ và tên</Form.Label>
                                                    <Form.Control type="text" required />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Form.Group controlId="email">
                                                    <Form.Label>Email</Form.Label>
                                                    <Form.Control type="email" required />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Form.Group className="mb-3" controlId="subject">
                                            <Form.Label>Tiêu đề</Form.Label>
                                            <Form.Control type="text" required />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="message">
                                            <Form.Label>Nội dung</Form.Label>
                                            <Form.Control as="textarea" rows={5} required />
                                        </Form.Group>
                                        <Button type="submit" >
                                            Gửi Liên Hệ
                                        </Button>
                                    </Form>
                                </div>
                            </Col>
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


        </>
    );
}
