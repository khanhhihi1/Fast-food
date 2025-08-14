"use client";
import React, { useState, useEffect } from "react";
import { Container, Table, Button, Alert, Spinner, Form } from "react-bootstrap";
import AdminSideBar from "../../component/adminSideBar";
import AdminNavbar from "../../component/adminNavbar";
import CategoryFormModal from "@/app/component/CategoryFormModal";
import CategoryUpdateModal from "@/app/component/CategoryUpdateModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faPenToSquare, faPlus, faSearch, faRotate } from "@fortawesome/free-solid-svg-icons";
import useDarkMode from "../useDarkMode/page";
import styles from "../styles/product.module.css";
import { toast } from "react-toastify";

interface CategoryType {
  _id: string;
  name: string;
  imageUrl: string;
  isHidden?: boolean;
}

export default function ProductCategory() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(15);
  const { isDarkMode } = useDarkMode();

  const API_BASE = "http://localhost:5000/categories";

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [filter]);

  const handleHide = async (id: string) => {
    if (!confirm("Bạn có chắc muốn ẩn danh mục này?")) return;
    try {
      const res = await fetch(`${API_BASE}/hide/${id}`, {
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
      const res = await fetch(`${API_BASE}/restore/${id}`, {
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
    }
  };

  const handleEdit = (category: CategoryType) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

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

          {loading ? (
            <div className="text-center mt-4">
              <Spinner animation="border" />
            </div>
          ) : (
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
