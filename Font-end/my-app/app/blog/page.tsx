"use client"
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import styles from '../styles/blog.module.css';

const Blog = () => {
    const blogData = [
        {
            id: 1,
            title: "Bí quyết làm pizza tại nhà ngon như Ý",
            excerpt: "Khám phá công thức bí mật từ những đầu bếp Ý để tạo ra lớp vỏ giòn tan hoàn hảo...",
            date: "15 tháng 4, 2024",
            readTime: "5 phút đọc",
            image: "https://themewagon.github.io/pizza/images/image_2.jpg"
        },
        {
            id: 2,
            title: "Top 10 loại phô mai không thể thiếu cho pizza",
            excerpt: "Từ Mozzarella truyền thống đến Parmesan đậm vị, đây là những loại phô mai tạo nên sự khác biệt...",
            date: "2 tháng 4, 2024",
            readTime: "4 phút đọc",
            image: "https://themewagon.github.io/pizza/images/image_1.jpg"
        },
        {
            id: 3,
            title: "Hành trình của pizza từ Napoli ra thế giới",
            excerpt: "Lịch sử thú vị về món ăn nổi tiếng toàn cầu bắt đầu từ một thị trấn nhỏ ở Ý...",
            date: "28 tháng 3, 2024",
            readTime: "7 phút đọc",
            image: "https://upload.wikimedia.org/wikipedia/commons/9/91/Pizza-3007395.jpg"
        }
    ];

    return (
        <Container className={styles.blogContainer}>
            <h2 className={styles.sectionTitle}>Fast-Food Blog</h2>
            <Row>
                {blogData.map((post) => (
                    <Col key={post.id} md={4} className="mb-4">
                        <Card className={styles.blogCard}>
                            <div className={styles.imageWrapper}>
                                <Card.Img
                                    variant="top"
                                    src={post.image}
                                    alt={post.title}
                                    className={styles.cardImage}
                                />
                                <div className={styles.dateBadge}>
                                    <span>{post.date}</span>
                                </div>
                            </div>
                            <Card.Body className={styles.cardBody}>
                                <Card.Title className={styles.cardTitle}>{post.title}</Card.Title>
                                <Card.Text className={styles.cardExcerpt}>{post.excerpt}</Card.Text>
                                <div className={styles.metaInfo}>

                                    <button className={styles.readMoreBtn}>Đọc tiếp</button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Blog;