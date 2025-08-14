"use client";
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import styles from '../styles/blogContent.module.css';

const BlogPage = () => {
    // Dữ liệu mẫu bài viết
    const blogPosts = [
        {
            id: 1,
            title: "Cách làm burger ngon tại nhà",
            image: "https://themewagon.github.io/pizza/images/image_2.jpg",
            date: "15/08/2023",
            excerpt: "Hướng dẫn chi tiết cách làm burger thơm ngon với nguyên liệu đơn giản...",
            category: "Công thức"
        },
        {
            id: 2,
            title: "Top 10 cửa hàng fastfood tại Hà Nội",
            image: "https://themewagon.github.io/pizza/images/image_1.jpg",
            date: "10/08/2023",
            excerpt: "Khám phá những địa điểm ăn nhanh chất lượng nhất thủ đô...",
            category: "Địa điểm"
        },
        {
            id: 3,
            title: "Lịch sử phát triển ngành fastfood",
            image: "https://themewagon.github.io/pizza/images/bg_2.jpg",
            date: "05/08/2023",
            excerpt: "Tìm hiểu quá trình hình thành và phát triển của ngành công nghiệp thức ăn nhanh...",
            category: "Lịch sử"
        }
    ];

    // Danh mục thể loại
    const categories = [
        { id: 1, name: "Công thức", count: 12 },
        { id: 2, name: "Địa điểm", count: 8 },
        { id: 3, name: "Khuyến mãi", count: 5 },
        { id: 4, name: "Lịch sử", count: 3 },
        { id: 5, name: "Sức khỏe", count: 7 }
    ];

    // Bài viết gần đây (lấy 3 bài mới nhất)
    const recentPosts = [...blogPosts].slice(0, 3);

    return (
        <Container className={`${styles.blogContainer} py-5`}>
            <Row>
                {/* Phần nội dung chính - bên trái */}
                <Col lg={8} className="pe-lg-4">
                    <h1 className="mb-4">Blog Ẩm Thực FastFood</h1>

                    {blogPosts.map(post => (
                        <Card key={post.id} className={`${styles.postCard} mb-4`}>
                            <Card.Body>
                                <Card.Title as="h2" className={styles.postTitle}>
                                    {post.title}
                                </Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    {post.date} | {post.category}
                                </Card.Subtitle>
                                <Card.Img
                                    variant="top"
                                    src={post.image}
                                    alt={post.title}
                                    className={styles.cardImage}
                                />
                                <Card.Text className={styles.postExcerpt}>
                                    {post.excerpt}
                                </Card.Text>
                                <Card.Link href="#" className={styles.readMore}>Đọc tiếp →</Card.Link>
                            </Card.Body>
                        </Card>
                    ))}
                </Col>

                {/* Sidebar - bên phải */}
                <Col lg={4} className="mt-5 mt-lg-0">
                    <Card className={`${styles.sidebarCard} mb-4`}>
                        <Card.Header as="h5">Bài viết gần đây</Card.Header>
                        <ListGroup variant="flush">
                            {recentPosts.map(post => (
                                <ListGroup.Item key={post.id} action className={styles.recentPostItem}>
                                    <div className="fw-bold">{post.title}</div>
                                    <small className="text-muted">{post.date}</small>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>

                    <Card className={styles.sidebarCard}>
                        <Card.Header as="h5">Thể loại</Card.Header>
                        <ListGroup variant="flush">
                            {categories.map(category => (
                                <ListGroup.Item
                                    key={category.id}
                                    action
                                    className={`${styles.categoryItem} d-flex justify-content-between align-items-center`}
                                >
                                    <span>{category.name}</span>
                                    <span className={`badge ${styles.categoryBadge}`}>{category.count}</span>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default BlogPage;