import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Image } from "next/image";
import { toast } from "react-toastify";


const Footer = () => {
    return (
        <footer className="bg-light text-dark pt-4">
            <Container>
                {/* Đăng ký nhận tin */}
                <Row className="align-items-center border-bottom pb-3">
                    <Col md={6} className="d-flex align-items-center">
                        <i className="bi bi-envelope fs-5 me-2"></i>
                        <span className="fw-bold">Đăng ký nhận tin</span>
                    </Col>
                    <Col md={6}>
                        <Form className="d-flex">
                            <Form.Control type="email" placeholder="Nhập email của bạn" className="me-2" />
                            <Button className="button-footer" variant="danger">Đăng Ký</Button>
                        </Form>
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col md={4}>
                        <h5 className="fw-bold">VỀ CHÚNG TÔI</h5>
                        <p>
                            Khởi nguồn từ đam mê với những miếng gà giòn ngon đậm vị của Hàn Quốc, Gà rán Fried-King ra đời để mang đến trải nghiệm “wow” cho thực khách Việt.
                        </p>
                        <img src="./logo-admin.jpg" alt="Bộ Công Thương" width={150} />
                    </Col>

                    <Col md={4}>
                        <h5 className="fw-bold">CÁC CHÍNH SÁCH</h5>
                        <ul className="list-unstyled">
                            <li>Hướng dẫn mua hàng</li>
                            <li>Hướng dẫn thanh toán</li>
                            <li>Chính sách đổi trả</li>
                            <li>Chính sách bảo mật</li>
                            <li>Các điều khoản chung</li>
                        </ul>
                    </Col>

                    <Col md={4}>
                        <h5 className="fw-bold">THÔNG TIN LIÊN HỆ</h5>
                        <p>
                            <i className="bi bi-geo-alt-fill"></i> 665 Quốc lộ 13, TP. Thủ Đức, Việt Nam
                        </p>
                        <p><i className="bi bi-telephone-fill"></i> Hotline: <span className="text-danger">19009480</span></p>
                        <p><i className="bi bi-envelope-fill"></i> FriedKing123@gmail.com</p>
                    </Col>
                </Row>
                <Row className="mt-3 text-center">
                    <Col>
                        <p className="mb-0">Copyright © 2025 Gà Rán Fried-King. Powered by Haravan</p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}
export default Footer;