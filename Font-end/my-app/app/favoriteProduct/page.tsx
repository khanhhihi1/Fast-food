"use client";
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Container, Alert, Button } from "react-bootstrap";
import styles from "../styles/favoriteProduct.module.css";
import Head from "next/head";
import Link from "next/link";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faHeartBroken } from "@fortawesome/free-solid-svg-icons";

interface Size {
    name: string;
    price: {
        original: number;
        discount?: number;
    };
}

interface Product {
    id: string;
    _id?: string;
    category: string;
    name: string;
    image: string;
    sizes?: Size[];
    rating?: number;
    time?: string;
    description?: string | string[];
    taste?: string[] | Record<string, number>;
}

const renderPrice = (sizes?: Product["sizes"]) => {
    if (!sizes || sizes.length === 0) return "Không rõ";
    const firstSize = sizes[0];
    const { original, discount } = firstSize.price;
    return discount ? (
        <>
            <span style={{ textDecoration: "line-through", color: "#888", marginRight: "8px" }}>
                {original.toLocaleString()}đ
            </span>
            <span style={{ color: "red", fontWeight: "bold" }}>
                {discount.toLocaleString()}đ
            </span>
        </>
    ) : `${original.toLocaleString()}đ`;
};

const FavoriteProduct = () => {
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await fetch("http://localhost:5000/favoriteProduct/favorites", {
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                const data = await res.json();
                if (data.status) {
                    setFavorites(data.result);
                } else {
                    setError(data.message || "Không thể tải danh sách yêu thích");
                }
            } catch (err) {
                console.error("Lỗi khi fetch:", err);
                setError("Lỗi kết nối đến server");
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    const handleRemoveFavorite = async (productId: string) => {
        try {
            const res = await fetch(`http://localhost:5000/favoriteProduct/favorites/${productId}`, {
                method: "POST", // Nếu API yêu cầu DELETE
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const data = await res.json();
            if (data.status) {
                setFavorites((prev) => prev.filter((item) => item._id !== productId));
                toast.success("Đã xóa khỏi danh sách yêu thích.");
            } else {
                toast.error(data.message || "Không thể xoá sản phẩm khỏi danh sách yêu thích.");
            }
        } catch (err) {
            console.error("Lỗi khi xoá:", err);
            toast.error("Lỗi kết nối đến server khi xoá.");
        }
    };

    if (loading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" role="status" />
                <div>Đang tải danh sách yêu thích...</div>
            </div>
        );
    }

    if (error) {
        return (
            <Container className="my-4">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <>
            <Head>
                <title>Pizza Yêu Thích | Pizza Deluxe</title>
                <meta name="description" content="Danh sách các loại pizza yêu thích của bạn" />
            </Head>
            <Container className="my-5">
                {favorites.length === 0 ? (
                    <div className={styles.emptyState}>
                        <img src="/icons/empty-favorites.svg" alt="Empty" className={styles.emptyIcon} />
                        <h3>Chưa có pizza yêu thích nào</h3>
                        <p>Hãy thêm các loại pizza bạn yêu thích vào danh sách!</p>
                        <Link href="/menu">
                            <Button variant="danger" size="lg">Khám phá menu</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className={styles.favoritesHeader}>
                            <h2>Danh sách yêu thích của bạn</h2>
                            <p>{favorites.length} sản phẩm</p>
                        </div>

                        <Row className="g-4">
                            {favorites.map((product) => (
                                <Col key={product._id || product.id} md={6} lg={4} xl={3}>
                                    <Card className={styles.productCard}>
                                        <div className={styles.cardImageContainer}>
                                            <Link href={`/productList/${product._id}`}>
                                                <Card.Img variant="top" src={product.image} className={styles.productImage} /></Link>
                                        </div>
                                        <Card.Body>
                                            <Card.Title className={styles.productTitle}>{product.name}</Card.Title>
                                            <Card.Text className={styles.productDescription}>
                                                {typeof product.description === "string"
                                                    ? product.description
                                                    : product.description?.join(", ")}
                                            </Card.Text>
                                            <div className={styles.cardFooter}>
                                                <span className={styles.productPrice}>
                                                    {renderPrice(product.sizes)}
                                                </span>
                                                <FontAwesomeIcon
                                                    icon={faHeart}
                                                    style={{ color: "red", cursor: "pointer", marginLeft: "10px" }}
                                                    onClick={() => handleRemoveFavorite(product._id || product.id)}
                                                    title="Bỏ yêu thích"
                                                />
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}
            </Container>
        </>
    );
};

export default FavoriteProduct;
