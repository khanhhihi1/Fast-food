"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button, Container, Table, Form, Image } from "react-bootstrap";
import { toast } from "react-toastify";
import ModalsAdmin from "@/app/component/create.model.admin";
import UpdateModelAdmin from "@/app/component/update-model-admin";
import useDarkMode from "../hooks/darkmode";
import AdminSideBar from "../../component/adminSideBar";
import AdminNavbar from "../../component/adminNavbar";
import styles from "../styles/product.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faPenToSquare, faPlus, faRotate } from "@fortawesome/free-solid-svg-icons";
import { FaSearch } from "react-icons/fa";
import { PostType } from "@/app/type/type";
export default function ShowAdmin() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [post, setPost] = useState<PostType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setUpdateModal] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const { isDarkMode } = useDarkMode();

  const productsPerPage = 10;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchAllProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data?.result) {
        // Ánh xạ status thành isHidden
        const mappedPosts = data.result.map((p: any) => ({
          ...p,
          isHidden: !p.status, // Chuyển status thành isHidden
        }));
        setPosts(mappedPosts);
      } else {
        toast.error("Không có dữ liệu sản phẩm");
        setPosts([]);
      }
    } catch (e) {
      toast.error(`Lỗi tải sản phẩm: ${(e as Error).message}`);
      setPosts([]);
    }
  }, []);

  const fetchInactiveProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/products/inactive`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data?.result) {
        // Ánh xạ status thành isHidden
        const mappedPosts = data.result.map((p: any) => ({
          ...p,
          isHidden: !p.status, // Chuyển status thành isHidden
        }));
        setPosts(mappedPosts);
      } else {
        toast.error("Không có dữ liệu sản phẩm không hoạt động");
        setPosts([]);
      }
    } catch (e) {
      toast.error(`Lỗi tải sản phẩm: ${(e as Error).message}`);
      setPosts([]);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.result;
      setCategories(list || []);
    } catch (e) {
      toast.error(`Lỗi tải danh mục: ${(e as Error).message}`);
      setCategories([]);
    }
  }, []);

  const fetchPosts = useCallback(() => {
    if (filter === "inactive") {
      fetchInactiveProducts();
    } else {
      fetchAllProducts();
    }
  }, [filter, fetchAllProducts, fetchInactiveProducts]);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [fetchPosts, fetchCategories]);

  const filteredProducts = useMemo(
    () =>
      posts
        .filter((p) => {
          if (filter === "active") return p.status; // Sử dụng status
          if (filter === "inactive") return !p.status; // Sử dụng status
          return true;
        })
        .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [posts, filter, searchTerm]
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleEdit = (product: PostType) => {
    setPost(product);
    setUpdateModal(true);
  };

  const handleShowProduct = async (id: string) => {
    if (!confirm("Bạn có chắc muốn khôi phục sản phẩm này?")) return;
    try {
      const res = await fetch(`${API_URL}/products/show/${id}`, { method: "PUT" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorData.message || "Không rõ"}`);
      }
      const data = await res.json();
      if (data?.success) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p._id === id ? { ...p, status: true, isHidden: false } : p
          )
        );
        window.location.reload();
        toast.success("Khôi phục sản phẩm thành công");
      } else {
        throw new Error(data?.message || "API response indicated failure");
      }
    } catch (e) {
      toast.error(`Khôi phục sản phẩm thất bại: ${(e as Error).message}`);
    }
  };

  const handleHideProduct = async (id: string) => {
    if (!confirm("Bạn có chắc muốn ẩn sản phẩm này?")) return;

    try {
      const res = await fetch(`${API_URL}/products/hide/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorData.message || "Không rõ"}`);
      }
      const data = await res.json();
      if (data?.success) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p._id === id ? { ...p, status: false, isHidden: true } : p
          )
        );
        window.location.reload();
        toast.success("Ẩn sản phẩm thành công");
      } else {
        throw new Error(data?.message || "API response indicated failure");
      }
    } catch (e) {
      toast.error(`Ẩn sản phẩm thất bại: ${(e as Error).message}`);
    }
  };

  const renderSizes = (sizes?: PostType["sizes"]) => {
    if (!sizes || sizes.length === 0) return "Không có";
    if (sizes.length === 1 && sizes[0].name === "default") {
      const s = sizes[0].price;
      return s.discount ? (
        <>
          <del>{s.original.toLocaleString()}đ</del>{" "}
          <strong>{s.discount.toLocaleString()}đ</strong>
        </>
      ) : (
        <>{s.original.toLocaleString()}đ</>
      );
    }
    return (
      <>
        {sizes.map((s) => (
          <div key={s.name}>
            {s.name}:{" "}
            {s.price.discount ? (
              <>
                <del>{s.price.original.toLocaleString()}đ</del>{" "}
                <strong>{s.price.discount.toLocaleString()}đ</strong>
              </>
            ) : (
              <>{s.price.original.toLocaleString()}đ</>
            )}
          </div>
        ))}
      </>
    );
  };

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);

  return (
    <div className={`d-flex ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <AdminSideBar />
      <Container fluid className={`content w-100 container-content ${collapsed ? "collapsed-content" : ""}`} style={{ minHeight: "100vh" }}>
        <AdminNavbar />
        <div className={styles["admin-product-container"]}>
          <h2>Quản lý sản phẩm</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Tổng sản phẩm</span>
              <span className={styles.statValue}>{posts.length}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Sản phẩm hoạt động</span>
              <span className={styles.statValue}>{filteredProducts.filter((p) => p.status).length}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Sản phẩm ngưng hoạt động</span>
              <span className={styles.statValue}>{filteredProducts.filter((p) => !p.status).length}</span>
            </div>
          </div>
          <div className={styles["adminHeader"] + " mb-4" + "d-flex"}>
            <div className={styles.meNu} >
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

                <Button onClick={() => setShowModal(true)}>
                  <FontAwesomeIcon icon={faPlus} /> Thêm sản phẩm
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
                    <FaSearch />
                  </button>
                </div>
              </Form>


            </div>
          </div>

          <Table striped bordered hover className={styles.table}>
            <thead>
              <tr className="text-center">
                <th>#</th>
                <th>Tên sản phẩm</th>
                <th>Hình ảnh</th>
                <th>Giá (VNĐ)</th>
                <th>Số lượng</th>
                <th>Vị</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product, index) => (
                <tr key={product._id} className="text-center">
                  <td>{indexOfFirst + index + 1}</td>
                  <td>{product.name}</td>
                  <td className="text-center">
                    <Image src={product.image} alt={product.name} width={60} height={60} rounded className={styles["product-img"]} />
                  </td>
                  <td>{renderSizes(product.sizes)}</td>
                  <td>{product.quantity}</td>
                  <td>{product.taste?.join(", ") || "Không có"}</td>
                  <td>
                    {typeof product.categoryId === "object" && product.categoryId
                      ? product.categoryId.name
                      : categories.find((c) => c._id === product.categoryId)?.name || "Không rõ"}
                  </td>
                  <td>
                    <span className={`${styles["status-badge"]} ${product.status ? styles.active : styles.inactive}`}>
                      {product.status ? "Hoạt động" : "Ngừng bán"}
                    </span>
                  </td>
                  <td>
                    <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleEdit(product)}>
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </Button>
                    {product.status ? (
                      <Button variant="outline-danger" size="sm" onClick={() => handleHideProduct(product._id)}>
                        <FontAwesomeIcon icon={faEyeSlash} />
                      </Button>
                    ) : (
                      <Button variant="outline-success" size="sm" onClick={() => handleShowProduct(product._id)}>
                        <FontAwesomeIcon icon={faRotate} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content mt-3 gap-2">
          <Button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} variant="outline-secondary">
            Trang trước
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button key={i} onClick={() => setCurrentPage(i + 1)} variant={currentPage === i + 1 ? "primary" : "outline-secondary"}>
              {i + 1}
            </Button>
          ))}
          <Button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} variant="outline-secondary">
            Trang sau
          </Button>
        </div>

        <ModalsAdmin showModal={showModal} setShowModal={setShowModal} fetchPosts={fetchPosts} />
        <UpdateModelAdmin showUpdateModal={showUpdateModal} setUpdateModal={setUpdateModal} post={post} fetchPosts={fetchPosts} />
      </Container>
    </div>
  );
}