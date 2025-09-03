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
  const [image, setImage] = useState<File | null>(null); // file upload mới
  const [preview, setPreview] = useState<string>(category.imageUrl);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    setName(category.name);
    setPreview(category.imageUrl);
    setImage(null); // reset khi mở modal mới
  }, [category]);

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Vui lòng nhập tên danh mục!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(
        `${API_URL}/categories/update/${category._id}`,
        {
          method: "PUT",
          body: formData, // gửi form-data, không cần headers
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Có lỗi xảy ra khi cập nhật danh mục");
      }

      toast.success("Cập nhật thành công!");
      handleClose();
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Cập nhật thất bại");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file)); // hiển thị ảnh preview ngay
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
          <Modal.Title className="modal-title" style={{ color: "black" }}>
            Cập nhật danh mục
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
                placeholder="Tên sản phẩm"
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
                onChange={handleFileChange}
              />
              {preview && (
                <img
                  src={`${API_URL}${preview}`}
                  alt="Preview"
                  style={{ width: "100%", marginTop: "10px", borderRadius: "8px",maxHeight:"200px",objectFit:"cover" }}
                />
              )}
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
