import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import "./model.css";

interface iShow {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
}

function CategoryFormModal(props: iShow) {
  const { showModal, setShowModal } = props;
  const [name, setName] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async () => {
    if (!name || !image) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (image) formData.append("image", image);

    try {
      const response = await fetch(`${API_URL}/categories/add`, {
        method: "POST",
        body: formData, // gửi form-data
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("Phản hồi từ server:", result);
        throw new Error(
          result.message || "Có lỗi xảy ra khi thêm danh mục sản phẩm"
        );
      }

      toast.success("Thêm danh mục sản phẩm thành công!");
      handleClose();
      window.location.reload();
    } catch (error: any) {
      console.error("Lỗi chi tiết khi thêm sản phẩm:", error);
      toast.error(error.message || "Thêm danh mục sản phẩm thất bại");
    }
  };

  const handleClose = () => {
    setName("");
    setImage(null);
    setShowModal(false);
  };

  return (
    <>
      <Modal
        show={showModal}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title" style={{ color: "black" }}>
            Thêm danh mục mới
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label className="mt-3 form-label">
                Tên danh mục sản phẩm
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Tên danh mục"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formImage">
              <Form.Label className="mt-3 form-label">
                Hình ảnh danh mục
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setImage(e.target.files ? e.target.files[0] : null)
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Thêm danh mục
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CategoryFormModal;
