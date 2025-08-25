"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Form, Button, Card, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

// Danh sách quận huyện TP.HCM
const hcmDistricts: string[] = [
  "Quận 1",
  "Quận 3",
  "Quận 5",
  "Quận 7",
  "Quận 8",
  "Quận 10",
  "Bình Thạnh",
  "Gò Vấp",
  "Tân Bình",
  "Tân Phú",
  "Thủ Đức",
  "Hóc Môn",
  "Củ Chi",
  "Bình Chánh",
];

export default function ShippingInfo() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
<<<<<<< HEAD
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
=======
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !district || !detailAddress) {
      toast.warning("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const fullAddress = `${detailAddress}, ${district}, TP.HCM`;

    try {
      const res = await fetch(
<<<<<<< HEAD
        `${API_URL}/temp-order/update-shipping`,
=======
        "http://localhost:5000/temp-order/update-shipping",
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, phone, address: fullAddress }),
        }
      );

      const data = await res.json();
      if (data.status) {
        localStorage.setItem(
          "shippingInfo",
          JSON.stringify({ name, phone, address: fullAddress })
        );
        localStorage.setItem("shippingDistrict", district);

        router.push("/checkout");
      } else {
        toast.error(data.message || "Cập nhật địa chỉ giao hàng thất bại");
      }
    } catch {
      toast.error("Lỗi khi cập nhật thông tin giao hàng");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("shippingInfo");
    if (saved) {
      const parsed = JSON.parse(saved);
      setName(parsed.name || "");
      setPhone(parsed.phone || "");

      const [detail, dist] =
        parsed.address?.split(",").map((s: string) => s.trim()) || [];
      setDistrict(dist || "");
      setDetailAddress(detail || "");
    }
  }, []);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow p-4">
            <h4 className="mb-3">Thông tin giao hàng</h4>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Họ tên người nhận</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Quận/Huyện (TP.HCM)</Form.Label>
                <Form.Select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                >
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {hcmDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Địa chỉ chi tiết</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  required
                />
              </Form.Group>

              <Button type="submit" className="w-100">
                Tiếp tục
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
