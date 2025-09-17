import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { PostType } from "@/app/type/type";

interface RestockModalProps {
  show: boolean;
  onHide: () => void;
  product: PostType | null;
  fetchPosts: () => void;
}

const RestockModal: React.FC<RestockModalProps> = ({ show, onHide, product, fetchPosts }) => {
  const [quantity, setQuantity] = useState(0);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || quantity <= 0) {
      toast.error("Số lượng phải lớn hơn 0");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/restock/${product._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Nhập liệu thành công");
        fetchPosts();
        onHide();
      } else {
        toast.error(data.message || "Lỗi nhập liệu");
      }
    } catch (error) {
      toast.error("Lỗi nhập liệu: " + (error as Error).message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Nhập liệu cho sản phẩm: {product?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Số lượng nhập</Form.Label>
            <Form.Control 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))} 
              min={1} 
              required 
            />
            {product?.isDaily && (
              <Form.Text className="text-muted">
                Lưu ý: Nếu còn tồn kho, không thể nhập thêm cho sản phẩm theo ngày.
              </Form.Text>
            )}
          </Form.Group>
          <Button variant="primary" type="submit">
            Xác nhận nhập liệu
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RestockModal;