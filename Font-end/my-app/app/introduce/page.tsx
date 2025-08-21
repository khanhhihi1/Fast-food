"use client"
import { Container, Row, Col, Card, Button,Image } from 'react-bootstrap';
import Head from 'next/head';
import styles from '../styles/introduce.module.css';

export default function Introduce() {
    return (
        <>
            <Head>
                <title>LorenKing - Thức Ăn Nhanh Chất Lượng</title>
                <meta name="description" content="LorenKing - điểm đến lý tưởng cho những người yêu thích thức ăn nhanh" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Hero Section */}
            <section className={styles.heroSection}>
                <Container>
                    <h1 className={`display-3 fw-bold mb-4 ${styles.heroTitle}`}>LorenKing</h1>
                    <p className={`lead mb-5 ${styles.heroSubtitle}`}>Chào mừng bạn đến với LorenKing - điểm đến lý tưởng cho những người yêu thích thức ăn nhanh tại thành phố!</p>
                    <Button variant="primary" size="lg" href="#about" className={styles.ctaButton}>
                        Khám phá ngay
                    </Button>
                </Container>
            </section>

            {/* About Section */}
            <section id="about" className={styles.aboutSection}>
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6}>
                            <h2 className={styles.sectionTitle}>Giới thiệu</h2>
                            <p className="lead">LorenKing tự hào là địa chỉ thức ăn nhanh hàng đầu, nổi tiếng với chất lượng món ăn tuyệt vời, dịch vụ tận tâm và mức độ hài lòng cao từ phía khách hàng.</p>

                            <ul className={styles.featuresList}>
                                <li>Chất lượng món ăn hàng đầu</li>
                                <li>Dịch vụ chăm sóc khách hàng xuất sắc</li>
                                <li>Menu đa dạng phong phú</li>
                                <li>Chất lượng nguyên liệu cao cấp</li>
                                <li>Không gian thoải mái và ấm cúng</li>
                                <li>Ưu đãi và khuyến mãi hấp dẫn</li>
                            </ul>
                        </Col>
                        <Col lg={6}>
                            <img
                                src="https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80"
                                alt="LorenKing Restaurant"
                                className={`img-fluid rounded shadow ${styles.aboutImage}`}
                            />
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Why Choose Section */}
            <section className={styles.whyChooseSection}>
                <Container>
                    <h2 className={styles.sectionTitle}>Tại Sao Nên Chọn <span className={styles.highlight}>LorenKing</span></h2>
                    <p className={`text-center mb-5 ${styles.whyChooseDesc}`}>Đến với LorenKing, bạn sẽ không chỉ là khách hàng mà còn là thành viên của một cộng đồng yêu thực phẩm ngon. Hãy để chúng tôi đưa bạn vào hành trình khám phá hương vị tuyệt vời của thức ăn nhanh và ẩm thực đa dạng tại LorenKing!</p>

                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className={styles.featureBox}>
                                <Card.Body className="text-center">
                                    <div className={styles.featureIcon}>
                                        <Image  className={styles.featureImage} src="https://upload.wikimedia.org/wikipedia/commons/9/91/Pizza-3007395.jpg"></Image>
                                    </div>
                                    <Card.Title>Đồ ăn đa dạng</Card.Title>
                                    <Card.Text>Thực khách có nhiều sự lựa chọn dựa trên gu ăn uống của mình</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className={styles.featureBox}>
                                <Card.Body className="text-center">
                                    <div className={styles.featureIcon}>
                                        <Image  className={styles.featureImage} src="https://img.lovepik.com/free-png/20210918/lovepik-chef-chef-png-image_400180038_wh860.png"></Image>
                                    </div>
                                    <Card.Title>Tốc độ nhanh</Card.Title>
                                    <Card.Text>Thời gian chờ đợi nhanh chóng nhưng vẫn đảm bảo chất lượng</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className={styles.featureBox}>
                                <Card.Body className="text-center">
                                    <div className={styles.featureIcon}>
                                         <Image  className={styles.featureImage} src="https://www.pc-mobile.jp/upload/post/delivery-3399.png"></Image>
                                    </div>
                                    <Card.Title>Đặt hàng nhanh chóng</Card.Title>
                                    <Card.Text>Hệ thống đặt hàng hiện đại, dễ dàng và tiện lợi</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    );
}