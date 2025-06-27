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
} from "react-bootstrap";
import { useEffect, useState } from "react";
import ProtectedRoute from "../component/ProtectedRoute";

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
  taste?: string[];
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("http://localhost:5000/cart", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          const text = await res.text(); // trả về nội dung lỗi để debug
          throw new Error("Lỗi API: " + text);
        }
        const data = await res.json();
        setCartItems(data.items || []);
      } catch (error) {
        console.error("Lỗi tải giỏ hàng:", error);
      }
    };

    fetchCart();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/cart/remove/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <ProtectedRoute>
      <Container className="py-5">
        <h2 className="text-center mb-4">Giỏ hàng của bạn</h2>
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
                          src={item.imageUrl}
                          style={{ width: "80px", height: "80px" }}
                          alt={item.name}
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>{item.price.toLocaleString()}₫</td>
                      <td>{item.quantity}</td>
                      <td>{item.sizeName}</td>
                      <td>
                        {item.taste?.[0] === "Không"
                          ? "Không có"
                          : item.taste?.join(", ")}
                      </td>
                      <td>{(item.price * item.quantity).toLocaleString()}₫</td>
                      <td>
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
      </Container>
    </ProtectedRoute>
  );
}
