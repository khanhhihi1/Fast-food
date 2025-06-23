"use client";
import React, { useState, useEffect } from "react";
import { Container, Table, Button, Alert, Spinner } from "react-bootstrap";
import AdminSideBar from "../../component/adminSideBar";
import AdminNavbar from "../../component/adminNavbar";
import CategoryFormModal from "@/app/component/CategoryFormModal";
import "../admin.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
interface CategoryType {
  _id: string;
  name: string;
  imageUrl: string;
}

export default function ProductCategory() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000/categories";

  // Fetch danh mục từ API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      const data = await res.json();
      if (data.status) {
        setCategories(data.result);
      } else {
        setError("Không thể tải danh mục.");
      }
    } catch (err) {
      setError("Lỗi khi tải danh mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Cập nhật giá trị form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý thêm/sửa danh mục
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API_BASE}/update/${editId}` : `${API_BASE}/add`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.status) {
        setShowModal(false);
        setFormData({ name: "", imageUrl: "" });
        setEditId(null);
        fetchCategories();
      } else {
        setError("Lỗi khi lưu danh mục.");
      }
    } catch (err) {
      setError("Lỗi khi gửi dữ liệu.");
    }
  };

  // Sửa danh mục
  const handleEdit = (category: CategoryType) => {
    setEditId(category._id);
    setFormData({
      name: category.name,
      imageUrl: category.imageUrl,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status) {
        fetchCategories();
      } else {
        setError("Không thể xóa danh mục.");
      }
    } catch (err) {
      setError("Lỗi khi xóa danh mục.");
    }
  };

  return (
    <div className="d-flex">
      <AdminSideBar />
      <Container fluid className="content w-100 container-content">
        <AdminNavbar />
        <div className="p-4 productCategory">
          <h3>Quản lý danh mục sản phẩm</h3>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Thêm danh mục
          </Button>

          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center mt-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table striped bordered hover className="mt-3 table1 text-center">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên</th>
                  <th>Hình ảnh</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => {
                  // ← Thêm dòng này để kiểm tra image

                  return (
                    <tr key={cat._id}>
                      <td>{index + 1}</td>
                      <td>{cat.name}</td>
                      <td>
                        <img src={cat.imageUrl} alt={cat.name} width="80" />
                      </td>
                      <td>
                        <button
                          className="action-btn edit-btn mx-2"
                          onClick={() => handleEdit(cat)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button
                          className="action-btn delete-btn mx-2"
                          onClick={() => handleDelete(cat._id)}
                        >
                          <FontAwesomeIcon icon={faEyeSlash} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}

          {/* Modal thêm/sửa danh mục */}
          <CategoryFormModal
            showModal={showModal}
            setShowModal={setShowModal}
          />
        </div>
      </Container>
    </div>
  );
}
