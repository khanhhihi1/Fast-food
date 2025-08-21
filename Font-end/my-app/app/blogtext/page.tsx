"use client";
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import styles from '../styles/blogContent.module.css';

const BlogPage = () => {
    const blogPosts = [
        {
            id: 1,
            title: "Bí quyết làm pizza tại nhà ngon như Ý",
            image: "https://themewagon.github.io/pizza/images/image_2.jpg",
            date: "15 tháng 4, 2024",
            excerpt: "Khám phá công thức bí mật từ những đầu bếp Ý để tạo ra lớp vỏ giòn tan hoàn hảo...Một chiếc pizza ngon “chuẩn Ý” không chỉ đến từ phần topping hấp dẫn mà còn phụ thuộc rất nhiều vào lớp vỏ bánh. Người Ý thường nói: “Vỏ bánh chính là linh hồn của pizza”. Để làm được một chiếc vỏ giòn bên ngoài, mềm xốp bên trong, bạn cần lưu ý một vài bí quyết sau:1. Chọn loại bột mì phù hợpDùng bột mì số 00 (Tipo 00), đây là loại bột chuyên dụng của Ý, có độ mịn cao, giúp vỏ bánh dai nhẹ, dễ nhào nặn.Nếu không có, bạn có thể thay thế bằng bột mì đa dụng nhưng hãy rây kỹ để bột thật mịn.2. Tỷ lệ men và thời gian ủNgười Ý thường dùng men khô instant với lượng vừa phải, không quá nhiều để tránh bánh nở nhanh nhưng bị xốp rỗng.Ủ bột chậm trong 12 đến24 giờ ở ngăn mát tủ lạnh. Cách này giúp gluten phát triển đều, hương vị thơm hơn và khi nướng vỏ bánh sẽ có độ giòn tự nhiên.3. Nhiệt độ nướng quyết định thành côngPizza ngon nhất khi được nướng bằng lò củi ở nhiệt độ trên 400°C, chỉ trong 90 giây là chín vàng.Ở nhà, bạn có thể làm nóng lò ở mức cao nhất (250°C), đặt pizza trên đá nướng hoặc khay gang để giữ nhiệt tốt, giúp vỏ bánh giòn hơn.4. Bí quyết cán bộtĐừng dùng cây lăn bột quá nhiều, hãy dùng tay để dàn bột từ giữa ra ngoài, giữ được bọt khí trong bột → vỏ bánh phồng đẹp khi nướng.Mép ngoài (cornicione) nên dày hơn một chút để khi nướng tạo được vành bánh vàng ruộm, giòn tan.",
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
                <h1 className={styles.sectionTitle}>Blog Ẩm Thực FastFood</h1>
                <Col lg={8} className="pe-lg-4">


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