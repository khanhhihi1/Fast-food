import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";

interface iShow {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  category: {
    _id: string;
    name: string;
    imageUrl: string;
  };
}
function CategoryUpdateModal(props: iShow) {
  const { showModal, setShowModal, category } = props;
  const [name, setName] = useState<string>(category.name);
  const [image, setImage] = useState<string>(category.imageUrl);

  useEffect(() => {
    setName(category.name);
    setImage(category.imageUrl);
  }, [category]);

  const handleSubmit = async () => {
    if (!name || !image) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (!image.match(/^https?:\/\/.+/)) {
      toast.error("Hình ảnh phải là URL hợp lệ (http/https)");
      return;
    }

    const data = { name, imageUrl: image };

    try {
      const response = await fetch(
        `http://localhost:5000/categories/update/${category._id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.message || "Có lỗi xảy ra khi cập nhật danh mục"
        );
      }

      toast.success("Cập nhật thành công!");
      handleClose();
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Cập nhật thất bại");
    }
  };

  const handleClose = () => {
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
          <Modal.Title className="modal-title">Cập nhật danh mục</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label className="mt-3 form-label">
                Tên danh mục sản phẩm
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Tên sản phẩm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formImage">
              <Form.Label className="mt-3 form-label">
                URL Hình ảnh danh mục
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập URL hình ảnh (http:// hoặc https://)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Cập nhật danh mục
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CategoryUpdateModal;
