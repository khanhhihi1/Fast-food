"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button, Container, Table, Form, Image, Modal, InputGroup } from "react-bootstrap";
import { toast } from "react-toastify";
import ModalsAdmin from "@/app/component/create.model.admin";
import UpdateModelAdmin from "@/app/component/update-model-admin";
import useDarkMode from "../hooks/darkmode";
import AdminSideBar from "../../component/adminSideBar";
import AdminNavbar from "../../component/adminNavbar";
import styles from "../styles/product.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faEyeSlash,
  faPenToSquare,
  faPlus,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import { FaSearch } from "react-icons/fa";
import { PostType } from "@/app/type/type";
import RestockModal from "@/app/component/restocModalAdmin";

export default function ShowAdmin() {
  const [posts, setPosts] = useState<
    (PostType & { salesStatus?: "slow" | "best" | null })[]
  >([]);
  const [post, setPost] = useState<PostType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setUpdateModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PostType | null>(null);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const { isDarkMode } = useDarkMode();

  const [showSlowRestockModal, setShowSlowRestockModal] = useState(false);
  const [slowProducts, setSlowProducts] = useState<PostType[]>([]);
  const [restockQuantities, setRestockQuantities] = useState<Record<string, number>>({});

  const productsPerPage = 10;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // gọi API reset daily khi load trang
  const resetDailyProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/products/reset-daily`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data?.status) {
        console.log("Reset daily thành công", data.result);
      } else {
        toast.error(data.message || "Reset daily thất bại");
      }
    } catch (e) {
      toast.error("Reset daily thất bại: " + (e as Error).message);
    }
  }, [API_URL]);

  const mapProducts = (data: any[]) =>
    data.map((p: any) => {
      let salesStatus: "slow" | "best" | null = null;

      if (p.isDaily && p.soldYesterday !== undefined) {
        if (p.soldYesterday <= 10) salesStatus = "slow";
        else if (p.soldYesterday > 10) salesStatus = "best";
      }

      return {
        ...p,
        isHidden: !p.status,
        salesStatus,
      };
    });

  const fetchAllProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data?.result) {
        setPosts(mapProducts(data.result));
      } else {
        toast.error("Không có dữ liệu sản phẩm");
        setPosts([]);
      }
    } catch (e) {
      toast.error(`Lỗi tải sản phẩm: ${(e as Error).message}`);
      setPosts([]);
    }
  }, [API_URL]);

  const fetchInactiveProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/products/inactive`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data?.result) {
        setPosts(mapProducts(data.result));
      } else {
        toast.error("Không có dữ liệu sản phẩm không hoạt động");
        setPosts([]);
      }
    } catch (e) {
      toast.error(`Lỗi tải sản phẩm: ${(e as Error).message}`);
      setPosts([]);
    }
  }, [API_URL]);

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
  }, [API_URL]);

  const fetchPosts = useCallback(() => {
    if (filter === "inactive") {
      fetchInactiveProducts();
    } else {
      fetchAllProducts();
    }
  }, [filter, fetchAllProducts, fetchInactiveProducts]);

  const fetchSlowProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/products/slow-daily`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data?.result) {
        // 👇 FIX: slowProducts giờ đã có soldYesterday từ backend
        setSlowProducts(data.result);
        const initialQuantities: Record<string, number> = {};
        data.result.forEach((p: PostType) => {
          initialQuantities[p._id] = 10; // 👇 FIX: Cap tại 10 cho slow
        });
        setRestockQuantities(initialQuantities);
      } else {
        setSlowProducts([]);
      }
    } catch (e) {
      toast.error(`Lỗi tải sản phẩm bán chậm: ${(e as Error).message}`);
      setSlowProducts([]);
    }
  }, [API_URL]);

  useEffect(() => {
    resetDailyProducts().then(() => {
      fetchPosts();
      fetchCategories();
      fetchSlowProducts();
    });
  }, [fetchPosts, fetchCategories, resetDailyProducts, fetchSlowProducts]);

  const filteredProducts = useMemo(
    () =>
      posts
        .filter((p) => {
          if (filter === "active") return p.status;
          if (filter === "inactive") return !p.status;
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
      const res = await fetch(`${API_URL}/products/show/${id}`, {
        method: "PUT",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          `HTTP error! status: ${res.status}, message: ${errorData.message || "Không rõ"
          }`
        );
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
      const res = await fetch(`${API_URL}/products/hide/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          `HTTP error! status: ${res.status}, message: ${errorData.message || "Không rõ"
          }`
        );
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

  const handleRestock = (product: PostType) => {
    setSelectedProduct(product);
    setShowRestockModal(true);
  };

  const handleRestockSlowProduct = async (id: string, qty: number) => {
    const product = slowProducts.find((p) => p._id === id);
    if (!product) {
      toast.error("Sản phẩm không tồn tại");
      return;
    }

    const maxQuantity = 10; // 👇 FIX: Hardcode 10 cho slow products

    if (qty <= 0) {
      toast.warn("Vui lòng nhập số lượng hợp lệ để restock");
      return;
    }

    if (qty > maxQuantity) {
      toast.error(
        ` <strong>${product.name}</strong> bán chậm và đã đạt tối đa tồn kho (${maxQuantity}). Không thể nhập thêm.`,
        { autoClose: 5000, pauseOnHover: true }
      );
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/restock/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.message || `Không thể restock sản phẩm`;
        toast.error(msg, { autoClose: 5000, pauseOnHover: true });
        return;
      }

      toast.success(
        <>
          <strong>{product.name}</strong> đã được nhập thêm <strong>{qty}</strong> sản phẩm
        </>,
        { autoClose: 4000, pauseOnHover: true }
      );

      fetchSlowProducts();
      fetchPosts();
    } catch (e) {
      toast.error(`Restock thất bại: ${(e as Error).message}`, {
        autoClose: 5000,
        pauseOnHover: true,
      });
    }
  };

  const handleQuantityChange = (id: string, value: number) => {
    setRestockQuantities(prev => ({ ...prev, [id]: value }));
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
      <Container
        fluid
        className={` ${styles.content} ${styles.containerContent}content w-100 container-content ${collapsed ? "collapsed-content" : ""
          }`}
        style={{ minHeight: "100vh" }}
      >
        <AdminNavbar />
        <div className={styles["admin-product-container"]}>
          <h2 className="text-center">Quản lý sản phẩm</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Tổng sản phẩm</span>
              <span className={styles.statValue}>{posts.length}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Đang hoạt động</span>
              <span className={styles.statValue}>
                {filteredProducts.filter((p) => p.status).length}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Ngưng hoạt động</span>
              <span className={styles.statValue}>
                {filteredProducts.filter((p) => !p.status).length}
              </span>
            </div>
          </div>
          <div className={styles["adminHeader"] + " mb-4" + "d-flex"}>
            <div className={styles.meNu}>
              <div className={styles.filters}>
                <button
                  className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""
                    }`}
                  onClick={() => setFilter("all")}
                >
                  Tất cả
                </button>
                <button
                  className={`${styles.filterBtn} ${filter === "active" ? styles.active : ""
                    }`}
                  onClick={() => setFilter("active")}
                >
                  Đang hoạt động
                </button>
                <button
                  className={`${styles.filterBtn} ${filter === "inactive" ? styles.active : ""
                    }`}
                  onClick={() => setFilter("inactive")}
                >
                  Ngưng hoạt động
                </button>

                <Button
                  onClick={() => setShowModal(true)}
                  className={styles.addProductBtn}
                >
                  <FontAwesomeIcon icon={faPlus} /> Thêm sản phẩm
                </Button>
                <Button
                  className={styles.reStockProductBtn}
                  variant="info"
                  onClick={() => setShowSlowRestockModal(true)}
                >
                  Cập nhật số lượng sản phẩm bán chậm
                </Button>
              </div>
              <Form
                className={styles.fromInput}
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  className={`form-control ${styles["search-input"]}`}
                  type="search"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className={styles["search-button"]} type="submit">
                  <FaSearch />
                </button>
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
                <th>Bán hôm qua</th>
                <th>Vị</th>
                <th>Danh mục</th>
                <th>Loại sản phẩm</th>
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
                    <Image
                      src={`${API_URL}/${product.image}`}
                      alt={product.name}
                      width={60}
                      height={60}
                      rounded
                      className={styles["product-img"]}
                    />
                  </td>
                  <td>{renderSizes(product.sizes)}</td>
                  <td>{product.quantity}</td>
                  <td
                    style={{
                      color: product.isDaily
                        ? product.salesStatus === "slow"
                          ? "red"
                          : product.salesStatus === "best"
                            ? "green"
                            : "inherit"
                        : "inherit",
                    }}
                  >
                    {product.isDaily && product.soldYesterday !== undefined
                      ? product.soldYesterday
                      : "-"}
                  </td>
                  <td>{product.taste?.join(", ") || "Không có"}</td>
                  <td>
                    {typeof product.categoryId === "object" && product.categoryId
                      ? product.categoryId.name
                      : categories.find((c) => c._id === product.categoryId)
                        ?.name || "Không rõ"}
                  </td>
                  <td>{product.isDaily ? "Theo ngày" : "Tồn kho"}</td>
                  <td>
                    <span
                      className={`${styles["status-badge"]} ${product.status ? styles.active : styles.inactive
                        }`}
                    >
                      {product.status ? "Hoạt động" : "Ngừng bán"}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(product)}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </Button>
                    {product.status ? (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="me-2"
                        onClick={() => handleHideProduct(product._id)}
                      >
                        <FontAwesomeIcon icon={faEyeSlash} />
                      </Button>
                    ) : (
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowProduct(product._id)}
                      >
                        <FontAwesomeIcon icon={faRotate} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div
          className={`d-flex justify-content-center mt-3 ${styles.pagination}`}
        >
          <Button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={styles.pageBtn}
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`${styles.pageNumber} ${currentPage === i + 1 ? styles.active : ""
                }`}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={styles.pageBtn}
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </Button>
        </div>

        <ModalsAdmin
          showModal={showModal}
          setShowModal={setShowModal}
          fetchPosts={fetchPosts}
        />
        <UpdateModelAdmin
          showUpdateModal={showUpdateModal}
          setUpdateModal={setUpdateModal}
          post={post}
          fetchPosts={fetchPosts}
        />

        {/* Modal for manual restock slow products */}
        <Modal show={showSlowRestockModal} onHide={() => setShowSlowRestockModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title className="text-white">Cập nhật số lượng sản phẩm bán chậm</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {slowProducts.length === 0 ? (
              <p>Không có sản phẩm bán chậm cần cập nhật.</p>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Bán hôm qua</th>
                    <th>Số lượng mới</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {slowProducts.map(p => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.soldYesterday || 0}</td>
                      <td>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            value={restockQuantities[p._id] || 0}
                            onChange={(e) => handleQuantityChange(p._id, Number(e.target.value))}
                          />
                        </InputGroup>
                      </td>
                      <td>
                        <Button className={styles.reStockProductBtn} onClick={() => handleRestockSlowProduct(p._id, restockQuantities[p._id])}>
                          Cập nhật
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSlowRestockModal(false)}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}