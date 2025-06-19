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

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    setCartItems(cartData ? JSON.parse(cartData) : []);
  }, []);
  const handleRemove = (id: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Shopping Cart</h2>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow p-4">
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {" "}
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Image
                        src={item.imageUrl}
                        style={{ width: "80px", height: "80px" }}
                      />
                    </td>
                    <td>{item.name}</td>
                    <td>{item.price}₫</td>
                    <td>{item.quantity}</td>
                    <td>{item.price * item.quantity}₫</td>
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
            <h4>Order Summary</h4>
            <p>
              <strong>Total Price:</strong> {totalPrice}₫
            </p>

            <Button variant="dark" className="w-100">
              Proceed to Checkout
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
