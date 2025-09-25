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

  const [showDailyRestockModal, setShowDailyRestockModal] = useState(false); // Đổi từ showSlowRestockModal
  const [dailyProducts, setDailyProducts] = useState<PostType[]>([]); // Đổi từ slowProducts
  const [showInventoryRestockModal, setShowInventoryRestockModal] = useState(false); // Modal mới cho tồn kho
  const [inventoryProducts, setInventoryProducts] = useState<PostType[]>([]); // Danh sách sản phẩm tồn kho
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

  const fetchDailyProducts = useCallback(async () => { // Đổi từ fetchSlowProducts
    try {
      const res = await fetch(`${API_URL}/products/daily-products`); // API mới
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data?.result) {
        setDailyProducts(data.result);
        const initialQuantities: Record<string, number> = {};
        data.result.forEach((p: PostType) => {
          initialQuantities[p._id] = 0; // Bắt đầu từ 0, người dùng nhập số lượng thêm
        });
        setRestockQuantities(initialQuantities);
      } else {
        setDailyProducts([]);
      }
    } catch (e) {
      toast.error(`Lỗi tải sản phẩm theo ngày: ${(e as Error).message}`);
      setDailyProducts([]);
    }
  }, [API_URL]);

  const fetchInventoryProducts = useCallback(async () => { // Fetch mới cho tồn kho
    try {
      const res = await fetch(`${API_URL}/products/inventory-products`); // API mới
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data?.result) {
        setInventoryProducts(data.result);
        const initialQuantities: Record<string, number> = {};
        data.result.forEach((p: PostType) => {
          initialQuantities[p._id] = 0; // Bắt đầu từ 0
        });
        setRestockQuantities(initialQuantities);
      } else {
        setInventoryProducts([]);
      }
    } catch (e) {
      toast.error(`Lỗi tải sản phẩm tồn kho: ${(e as Error).message}`);
      setInventoryProducts([]);
    }
  }, [API_URL]);

  useEffect(() => {
    resetDailyProducts().then(() => {
      fetchPosts();
      fetchCategories();
      fetchDailyProducts(); // Đổi từ fetchSlowProducts
    });
  }, [fetchPosts, fetchCategories, resetDailyProducts, fetchDailyProducts]);

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

  const handleRestockMultiple = async (items: { id: string, qty: number }[]) => { // Hàm mới cho cập nhật tổng
    try {
      const res = await fetch(`${API_URL}/products/restock-multiple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.message || `Không thể cập nhật sản phẩm`;
        toast.error(msg, { autoClose: 5000, pauseOnHover: true });
        return;
      }

      toast.success(
        `Đã cập nhật tổng cộng ${items.length} sản phẩm thành công!`,
        { autoClose: 4000, pauseOnHover: true }
      );

      // Refresh data
      fetchDailyProducts();
      fetchInventoryProducts();
      fetchPosts();
    } catch (e) {
      toast.error(`Cập nhật thất bại: ${(e as Error).message}`, {
        autoClose: 5000,
        pauseOnHover: true,
      });
    }
  };

  const handleDailyRestockAll = () => { // Xử lý cập nhật tổng cho daily
    const items = dailyProducts
      .map(p => ({ id: p._id, qty: restockQuantities[p._id] || 0 }))
      .filter(item => item.qty > 0); // Chỉ cập nhật nếu qty > 0

    if (items.length === 0) {
      toast.warn("Không có sản phẩm nào cần cập nhật.");
      return;
    }

    handleRestockMultiple(items);
    setShowDailyRestockModal(false);
  };

  const handleInventoryRestockAll = () => { // Xử lý cập nhật tổng cho inventory
    const items = inventoryProducts
      .map(p => ({ id: p._id, qty: restockQuantities[p._id] || 0 }))
      .filter(item => item.qty > 0);

    if (items.length === 0) {
      toast.warn("Không có sản phẩm nào cần cập nhật.");
      return;
    }

    handleRestockMultiple(items);
    setShowInventoryRestockModal(false);
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
                  onClick={() => {
                    fetchDailyProducts(); // Fetch trước khi mở modal
                    setShowDailyRestockModal(true);
                  }}
                >
                  Cập nhật sản phẩm theo ngày
                </Button>
                <Button
                  className={styles.reStockProductBtn}
                  variant="info"
                  onClick={() => {
                    fetchInventoryProducts(); // Fetch trước khi mở modal
                    setShowInventoryRestockModal(true);
                  }}
                >
                  Cập nhật số lượng tồn kho
                </Button>
              </div>

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

        {/* Modal for daily products restock */}
        <Modal show={showDailyRestockModal} onHide={() => setShowDailyRestockModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title className="text-dark">Cập nhật sản phẩm theo ngày</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {dailyProducts.length === 0 ? (
              <p>Không có sản phẩm theo ngày cần cập nhật.</p>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Bán hôm qua</th>
                    <th>Số lượng mới (thêm)</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyProducts.map(p => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td
                        style={{
                          color: p.isDaily
                            ? p.salesStatus === "slow"
                              ? "red"
                              : p.salesStatus === "best"
                                ? "green"
                                : "inherit"
                            : "inherit",
                        }}
                      >
                        {p.isDaily && p.soldYesterday !== undefined
                          ? p.soldYesterday
                          : "-"}
                      </td>
                      <td>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            min={0}
                            value={restockQuantities[p._id] || 0}
                            onChange={(e) => handleQuantityChange(p._id, Number(e.target.value))}
                          />
                        </InputGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDailyRestockModal(false)}>
              Đóng
            </Button>
            {dailyProducts.length > 0 && (
              <Button className={styles.reStockProductBtn} onClick={handleDailyRestockAll}>
                Cập nhật tất cả
              </Button>
            )}
          </Modal.Footer>
        </Modal>

        {/* Modal for inventory products restock */}
        <Modal show={showInventoryRestockModal} onHide={() => setShowInventoryRestockModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title className="text-dark">Cập nhật số lượng tồn kho</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {inventoryProducts.length === 0 ? (
              <p>Không có sản phẩm tồn kho cần cập nhật.</p>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Số lượng hiện tại</th>
                    <th>Số lượng mới (thêm)</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryProducts.map(p => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.quantity || 0}</td>
                      <td>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            min={0}
                            value={restockQuantities[p._id] || 0}
                            onChange={(e) => handleQuantityChange(p._id, Number(e.target.value))}
                          />
                        </InputGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInventoryRestockModal(false)}>
              Đóng
            </Button>
            {inventoryProducts.length > 0 && (
              <Button className={styles.reStockProductBtn} onClick={handleInventoryRestockAll}>
                Cập nhật tất cả
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}