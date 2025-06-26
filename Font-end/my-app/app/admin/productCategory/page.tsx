"use client";
import React, { useState, useEffect } from "react";
import { Container, Table, Button, Alert, Spinner } from "react-bootstrap";
import AdminSideBar from "../../component/adminSideBar";
import AdminNavbar from "../../component/adminNavbar";
import CategoryFormModal from "@/app/component/CategoryFormModal";
import CategoryUpdateModal from "@/app/component/CategoryUpdateModal";
import "../admin.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import useDarkMode from "../useDarkMode/page";

interface CategoryType {
  _id: string;
  name: string;
  imageUrl: string;
}

export default function ProductCategory() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isDarkMode } = useDarkMode();

  const API_BASE = "http://localhost:5000/categories";

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

  const handleEdit = (category: CategoryType) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  return (
    <div className="d-flex">
      <AdminSideBar />
      <Container fluid className="content w-100 container-content">
        <AdminNavbar />
        <div className="p-4 productCategory">
          <h3>Quản lý danh mục sản phẩm</h3>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
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
                {categories.map((cat, index) => (
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
                ))}
              </tbody>
            </Table>
          )}

          {/* Modal Thêm */}
          <CategoryFormModal
            showModal={showAddModal}
            setShowModal={setShowAddModal}
          />

          {/* Modal Cập nhật */}
          {selectedCategory && (
            <CategoryUpdateModal
              showModal={showEditModal}
              setShowModal={setShowEditModal}
              category={selectedCategory}
            />
          )}
        </div>
      </Container>
    </div>
  );
}
