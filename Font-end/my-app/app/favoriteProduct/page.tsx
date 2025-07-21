// components/FavoriteProducts.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Container, Alert, Button } from "react-bootstrap";
import { Image } from "react-bootstrap";
import Link from "next/link";
import { toast } from "react-toastify";
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
    sizes?: {
        name: string;
        price: {
            original: number;
            discount?: number;
        };
    }[];
    rating?: number;
    time?: string;
    description?: string | string[];
    taste?: string[] | Record<string, number>;
}
const renderPrice = (sizes?: Product["sizes"]) => {
    if (!sizes || sizes.length === 0) return "Không rõ";

    const firstSize = sizes[0];
    const { original, discount } = firstSize.price;

    if (discount) {
        return (
            <>
                <span style={{ textDecoration: "line-through", color: "#888", marginRight: "8px" }}>
                    {original.toLocaleString()}đ
                </span>
                <span style={{ color: "red", fontWeight: "bold" }}>
                    {discount.toLocaleString()}đ
                </span>
            </>
        );
    } else {
        return `${original.toLocaleString()}đ`;
    }
};


const FavoriteProducts = () => {
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

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

    if (favorites.length === 0) {
        return (
            <Container className="my-4">
                <Alert variant="info">Bạn chưa có sản phẩm nào trong danh sách yêu thích.</Alert>
            </Container>
        );
    }
    const addToCart = async (product: Product) => {
        try {
            const firstSize = product.sizes?.[0];

            if (!firstSize || !firstSize.price?.original) {
                toast.error("Sản phẩm không có thông tin giá.");
                return;
            }

            const body = {
                productId: product._id || product.id,
                sizeName: firstSize.name ?? "default",
                quantity: 1,
                price: firstSize.price,
            };

            const response = await fetch("http://localhost:5000/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(`${product.name} đã được thêm vào giỏ hàng.`);
            } else {
                toast.error(result.message || "Thêm vào giỏ hàng thất bại.");
            }
        } catch (error) {
            toast.error("Lỗi kết nối đến máy chủ.");
            console.error("Thêm giỏ hàng lỗi:", error);
        }
    };
    const handleRemoveFavorite = async (productId: string) => {
        try {
            const res = await fetch(`http://localhost:5000/favoriteProduct/favorites/${productId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            const data = await res.json();
            toast.success(` Đã xóa khỏi danh sách yêu thích.`);
            if (data.status) {
                setFavorites((prev) => prev.filter((item) => item._id !== productId));
            } else {
                setError(data.message || "Không thể xoá sản phẩm khỏi danh sách yêu thích.");
            }
        } catch (err) {
            console.error("Lỗi khi xoá:", err);
            setError("Lỗi kết nối đến server khi xoá.");
        }
    };

    return (
        <Container className=" favorite-products">
            <div className="header">
                <h1 className="title">Sản phẩm yêu thích</h1>
            </div>
            <Row xs={1} md={2} lg={3} className="g-4">
                {favorites.map((product) => (
                    <Col key={product._id} className="product-card">
                        <Card className="h-100 shadow-sm">
                            <div className="product-image-container">
                                <Link href={`/productList/${product._id}`}> <Image src={product.image} alt={product.name} fluid /></Link>



                                <Button
                                    className="remove-button"
                                    title="Remove from favorites"
                                    onClick={() => handleRemoveFavorite(product._id)}
                                >
                                    <span className="heart-icon">❤️</span>
                                </Button>
                            </div>

                            <Card.Body>
                                <Card.Title>{product.name}</Card.Title>
                                <Card.Text>{product.description}</Card.Text>
                                <Card.Text>
                                    <strong>Thời gian:</strong> {product.time}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Giá:{renderPrice(product.sizes)}</strong>

                                </Card.Text>
                            </Card.Body>
                            <Button  onClick={() => addToCart(product)}>Them vao gio hang</Button>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default FavoriteProducts;
