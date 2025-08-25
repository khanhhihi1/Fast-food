"use client";
import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { Container, Table, Button, Alert, Spinner, Form } from "react-bootstrap";
=======
import { Container, Table, Button, Alert, Spinner } from "react-bootstrap";
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
import AdminSideBar from "../../component/adminSideBar";
import AdminNavbar from "../../component/adminNavbar";
import CategoryFormModal from "@/app/component/CategoryFormModal";
import CategoryUpdateModal from "@/app/component/CategoryUpdateModal";
<<<<<<< HEAD
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faPenToSquare, faPlus, faSearch, faRotate } from "@fortawesome/free-solid-svg-icons";
import useDarkMode from "../hooks/darkmode";
import styles from "../styles/product.module.css";
import { toast } from "react-toastify";
=======
import "../admin.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import useDarkMode from "../useDarkMode/page";
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb

interface CategoryType {
  _id: string;
  name: string;
  imageUrl: string;
<<<<<<< HEAD
  isHidden?: boolean;
=======
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
}

export default function ProductCategory() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
<<<<<<< HEAD
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(15);
  const { isDarkMode } = useDarkMode();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
=======
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isDarkMode } = useDarkMode();

  const API_BASE = "http://localhost:5000/categories";
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb

  const fetchCategories = async () => {
    try {
      setLoading(true);
<<<<<<< HEAD
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();

      if (data.success && Array.isArray(data.result)) {
        let fetchedCategories = data.result;

        // Lọc theo filter ở frontend thay vì API
        if (filter === "active") {
          fetchedCategories = fetchedCategories.filter((cat: CategoryType) => !cat.isHidden);
        } else if (filter === "inactive") {
          fetchedCategories = fetchedCategories.filter((cat: CategoryType) => cat.isHidden);
        }


        setCategories(fetchedCategories);
        setVisibleCount(15);
      } else {
        setCategories([]);
        setError(data.message || "Dữ liệu danh mục không hợp lệ.");
      }
    } catch (err: any) {
      setError("Lỗi khi tải danh mục: " + (err.message || "Không xác định"));
=======
      const res = await fetch(API_BASE);
      const data = await res.json();
      if (data.status) {
        setCategories(data.result);
      } else {
        setError("Không thể tải danh mục.");
      }
    } catch (err) {
      setError("Lỗi khi tải danh mục.");
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
<<<<<<< HEAD
  }, [filter]);

  const handleHide = async (id: string) => {
    if (!confirm("Bạn có chắc muốn ẩn danh mục này?")) return;
    try {
      const res = await fetch(`${API_URL}/categories/hide/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      } else {
        toast.error(data.message || "Không thể ẩn danh mục.");
      }
    } catch {
      setError("Lỗi khi ẩn danh mục.");
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm("Bạn có chắc muốn khôi phục danh mục này?")) return;
    try {
      const res = await fetch(`${API_URL}/categories/restore/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      } else {
        setError(data.message || "Không thể khôi phục danh mục.");
      }
    } catch {
      setError("Lỗi khi khôi phục danh mục.");
=======
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
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
    }
  };

  const handleEdit = (category: CategoryType) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

<<<<<<< HEAD
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCategories = categories.length;
  const activeCategories = categories.filter((cat) => !cat.isHidden).length;
  const inactiveCategories = categories.filter((cat) => cat.isHidden).length;

  return (
    <div className={`d-flex ${isDarkMode ? "dark-mode" : ""}`}>
      <AdminSideBar />
      <Container fluid className="content w-100 container-content" style={{ minHeight: "100vh" }}>
        <AdminNavbar />
        <div className={styles["admin-product-container"]}>
          <h2>Quản lý danh mục sản phẩm</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Tổng danh mục </span>
              <span className={styles.statValue}> {totalCategories}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Danh mục hoạt động</span>
              <span className={styles.statValue}>{activeCategories}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Danh mục ngưng hoạt động </span>
              <span className={styles.statValue}>{inactiveCategories}</span>
            </div>
          </div>

          <div className={styles["adminHeader"] + " mb-4"}>
            <div className={styles.meNu}>
              <div className={styles.filters}>
                <button
                  className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
                  onClick={() => setFilter("all")}
                >
                  Tất cả
                </button>
                <button
                  className={`${styles.filterBtn} ${filter === "active" ? styles.active : ""}`}
                  onClick={() => setFilter("active")}
                >
                  Đang hoạt động
                </button>
                <button
                  className={`${styles.filterBtn} ${filter === "inactive" ? styles.active : ""}`}
                  onClick={() => setFilter("inactive")}
                >
                  Ngưng hoạt động
                </button>
                <Button onClick={() => setShowAddModal(true)}>
                  <FontAwesomeIcon icon={faPlus} /> Thêm danh mục
                </Button>
              </div>
              <Form className={styles.fromInput} onSubmit={(e) => e.preventDefault()}>
                <div className="input-group">
                  <input
                    className="form-control search-input"
                    type="search"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn search-button" type="submit">
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </Form>
            </div>
          </div>
=======
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
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb

          {loading ? (
            <div className="text-center mt-4">
              <Spinner animation="border" />
            </div>
          ) : (
<<<<<<< HEAD
            <>
              <Table striped bordered hover className={styles.table}>
                <thead>
                  <tr className="text-center">
                    <th>#</th>
                    <th>Tên</th>
                    <th>Hình ảnh</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.slice(0, visibleCount).map((cat, index) => (
                    <tr key={cat._id} className="text-center">
                      <td>{index + 1}</td>
                      <td>{cat.name}</td>
                      <td className="text-center">
                        <img src={cat.imageUrl} alt={cat.name} width="80" />
                      </td>
                      <td>
                        <span className={`${styles["status-badge"]} ${!cat.isHidden ? styles.active : styles.inactive}`}>
                          {!cat.isHidden ? "Hoạt động" : "Ngưng hoạt động"}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="outline-warning"
                          size="sm" className="me-2"
                          onClick={() => handleEdit(cat)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </Button>
                        {!cat.isHidden ? (
                          <Button variant="outline-danger" size="sm" onClick={() => handleHide(cat._id)} className="mx-2">
                            <FontAwesomeIcon icon={faEyeSlash} />
                          </Button>
                        ) : (
                          <Button variant="outline-success" size="sm" onClick={() => handleRestore(cat._id)} className="mx-2">
                            <FontAwesomeIcon icon={faRotate} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {visibleCount < categories.length && (
                <div className="text-center mt-3">
                  <Button onClick={() => setVisibleCount(prev => prev + 15)}>
                    Xem thêm
                  </Button>
                </div>
              )}
            </>
=======
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
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
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
