"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Table,
  Button,
  Row,
  Col,
  Card,
  Image,
  Alert,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import ProtectedRoute from "../component/ProtectedRoute";
import { toast } from "react-toastify";

export interface Product {
  _id: string;
  name: string;
  categoryId: string;
  image: string;
  description?: string;
  taste?: string[];
  quantity: number;
  status: boolean;
  saleOff?: boolean;
  time?: string;
  view?: number;
  rating?: number;
  sizes: {
    name: string;
    price: {
      original: number;
      discount?: number;
    };
  }[];
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  sizeName: string;
  price: number;
  fullPrice?: {
    original: number;
    discount?: number;
  };
  taste?: string[];
  availableSizes?: {
    name: string;
    price: {
      original: number;
      discount?: number;
    };
  }[];
  availableTastes?: string[];
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("http://localhost:5000/cart", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Lỗi API giỏ hàng: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      console.log("Cart API response:", data);

      const itemsWithProduct = await Promise.all(
        data.items.map(async (item: CartItem) => {
          try {
            const productRes = await fetch(
              `http://localhost:5000/products/${item.productId}`
            );
            if (!productRes.ok) {
              console.error(`Không thể lấy sản phẩm ${item.productId}: ${productRes.status}`);
              return {
                ...item,
                availableSizes: [],
                availableTastes: [],
                fullPrice: { original: item.price },
              };
            }
           const productJson = await productRes.json();
           const productData: Product = productJson.result;

            console.log(`productData for ${item.productId}:`, productData);

            const selectedSize = productData.sizes?.find((s) => s.name === item.sizeName);
            return {
              ...item,
              availableSizes: productData.sizes || [],
              availableTastes: productData.taste || [],
              fullPrice: selectedSize?.price || { original: item.price },
              price: selectedSize?.price.discount ?? selectedSize?.price.original ?? item.price,
            };
          } catch (error: any) {
            console.error(`Lỗi khi lấy sản phẩm ${item.productId}:`, error.message);
            return {
              ...item,
              availableSizes: [],
              availableTastes: [],
              fullPrice: { original: item.price },
            };
          }
        })
      );

      setCartItems(itemsWithProduct);
    } catch (error: any) {
      console.error("❌ Lỗi tải giỏ hàng:", error.message);
      setError("Không thể tải giỏ hàng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const syncCart = async () => {
    try {
      const res = await fetch("http://localhost:5000/cart/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Lỗi đồng bộ giỏ hàng: ${errorText}`);
      }
      toast.success("Đã đồng bộ giỏ hàng thành công");
      await fetchCart();
    } catch (error: any) {
      console.error("❌ Lỗi khi đồng bộ giỏ hàng:", error.message);
      toast.error("Không thể đồng bộ giỏ hàng. Vui lòng thử lại.");
    }
  };

  const handleUpdate = async (item: CartItem) => {
    try {
      const selectedSize = item.availableSizes?.find((size) => size.name === item.sizeName);
      const price = selectedSize?.price || { original: item.price }; 

      const res = await fetch(`http://localhost:5000/cart/update/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          quantity: item.quantity,
          taste: item.taste || [],
          sizeName: item.sizeName,
          price, 
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error("Lỗi cập nhật: " + text);
      }

      toast.success("Cập nhật sản phẩm thành công");
      await fetchCart();
    } catch (error: any) {
      console.error("❌ Lỗi khi cập nhật:", error.message);
      toast.error("Cập nhật sản phẩm không thành công");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/cart/remove/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Xóa sản phẩm thành công");
      } else {
        throw new Error("Lỗi khi xóa sản phẩm");
      }
    } catch (error: any) {
      console.error("Lỗi khi xóa sản phẩm:", error.message);
      toast.error("Không thể xóa sản phẩm. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <ProtectedRoute>
      <Container className="py-5">
        <h2 className="text-center mb-4">Giỏ hàng của bạn</h2>
        <Button variant="primary" onClick={syncCart} className="mb-3">
          Đồng bộ giỏ hàng
        </Button>
        {error && <Alert variant="danger">{error}</Alert>}
        {isLoading ? (
          <Alert variant="info">Đang tải giỏ hàng...</Alert>
        ) : cartItems.length === 0 ? (
          <Alert variant="warning">Giỏ hàng của bạn đang trống.</Alert>
        ) : (
          <Row className="justify-content-center">
            <Col md={8}>
              <Card className="shadow p-4">
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Hình ảnh</th>
                      <th>Tên</th>
                      <th>Giá</th>
                      <th>Số lượng</th>
                      <th>Kích cỡ</th>
                      <th>Hương vị</th>
                      <th>Thành tiền</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Image
                            src={item.imageUrl || "/default-image.png"}
                            style={{ width: "80px", height: "80px", objectFit: "cover" }}
                            alt={item.name}
                          />
                        </td>
                        <td>{item.name || "Sản phẩm không xác định"}</td>
                        <td>{item.price.toLocaleString()}₫</td>
                        <td>
                          <input
                            type="number"
                            value={item.quantity}
                            min={1}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1;
                              setCartItems((prev) =>
                                prev.map((p) =>
                                  p.id === item.id ? { ...p, quantity: newQty } : p
                                )
                              );
                            }}
                            style={{ width: "60px" }}
                          />
                        </td>
                        <td>
                          <select
                            value={item.sizeName}
                            onChange={(e) => {
                              const newSize = e.target.value;
                              const selectedSize = item.availableSizes?.find(
                                (size) => size.name === newSize
                              );
                              setCartItems((prev) =>
                                prev.map((p) =>
                                  p.id === item.id
                                    ? {
                                        ...p,
                                        sizeName: newSize,
                                        price:
                                          selectedSize?.price.discount ??
                                          selectedSize?.price.original ??
                                          p.price,
                                        fullPrice: selectedSize?.price ?? p.fullPrice,
                                      }
                                    : p
                                )
                              );
                            }}
                          >
                            {item.availableSizes?.map((size) => (
                              <option key={size.name} value={size.name}>
                                {size.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {item.availableTastes && item.availableTastes.length > 0 && (
                            <select
                              value={item.taste?.[0] || "Không"}
                              onChange={(e) => {
                                const newTaste = e.target.value;
                                setCartItems((prev) =>
                                  prev.map((p) =>
                                    p.id === item.id
                                      ? { ...p, taste: newTaste === "Không" ? [] : [newTaste] }
                                      : p
                                  )
                                );
                              }}
                            >
                              <option value="Không">Không</option>
                              {item.availableTastes.map((taste) => (
                                <option key={taste} value={taste}>
                                  {taste}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td>{(item.price * item.quantity).toLocaleString()}₫</td>
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleUpdate(item)}
                          >
                            Cập nhật
                          </Button>{" "}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemove(item.id)}
                          >
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow p-4">
                <h4>Tổng đơn hàng</h4>
                <p>
                  <strong>Tổng giá:</strong> {totalPrice.toLocaleString()} ₫
                </p>
                <Button variant="dark" className="w-100">
                  Thanh toán
                </Button>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </ProtectedRoute>
  );
}