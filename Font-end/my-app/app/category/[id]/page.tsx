"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { Search, Filter, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import styles from "../../styles/category.module.css"; // Giả sử bạn sử dụng cùng module CSS, điều chỉnh nếu cần
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faHeartBroken } from "@fortawesome/free-solid-svg-icons";
import { Star, StarHalf, Star as StarEmpty } from "lucide-react";
import useSWR from "swr";

interface Category {
  _id: string;
  name: string;
  imageUrl?: string;
  isHidden?: boolean;
}

interface SizeType {
  name: string;
  price: {
    original: number;
    discount?: number;
  };
}
interface CommentType {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  productId: string;
  orderId: string;
  comment: string;
  rating: number;
  createdAt: string;
}
interface Product {
  _id: string;
  name: string;
  image?: string;
  imageUrl?: string;
  description: string;
  time: string;
  view: number;
  quantity: number;
  taste?: string[];
  sizes?: SizeType[];
  categoryId?: string | Category;
  status?: boolean;
}

const ITEMS_PER_PAGE = 9; // Điều chỉnh số sản phẩm mỗi trang, dựa trên mẫu (6 sản phẩm)

// Hàm renderStars mới thêm: Render sao dựa trên rating trung bình
const renderStars = (averageRating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= averageRating) {
      stars.push(<Star key={i} size={16} fill="gold" stroke="gold" />);
    } else if (i - 0.5 <= averageRating) {
      stars.push(<StarHalf key={i} size={16} fill="gold" stroke="gold" />);
    } else {
      stars.push(<StarEmpty key={i} size={16} stroke="gold" />);
    }
  }
  return stars;
};

// Component con mới: ProductCard, tách logic fetch comments cho từng sản phẩm
const ProductCard = ({ product, favoriteMap, toggleFavorite, API_URL }: {
  product: Product;
  favoriteMap: { [key: string]: boolean };
  toggleFavorite: (id: string) => void;
  API_URL: string | undefined;
}) => {
  // Fetch comments riêng cho từng productId sử dụng useSWR
  const { data: comments, error: commentError } = useSWR<CommentType[]>(
    `${API_URL}/comment/${product._id}`,
    async (url: string) => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Lỗi ${res.status}: ${text.startsWith("<!DOCTYPE") ? "Không tìm thấy endpoint" : text}`);
      }
      const data = await res.json();
      if (!data.result) throw new Error("API không trả về 'result'");
      return data.result;
    }
  );

  // Tính toán rating trung bình nếu có comments
  const averageRating = comments && comments.length > 0
    ? comments.reduce((acc, c) => acc + c.rating, 0) / comments.length
    : 0;

  const renderPrice = (product: Product) => {
    if (!product.sizes || product.sizes.length === 0) return "Giá không khả dụng";
    const { original, discount } = product.sizes[0].price;
    return discount ? `${discount.toLocaleString()}đ` : `${original.toLocaleString()}đ`;
  };

  return (
    <Card className={`${styles.productCard} h-100 border-0 shadow-sm`}>
      <div className="position-relative">
        <Link href={`/productList/${product._id}`}>
          <Card.Img
            variant="top"
            src={`${API_URL}/${product.image || product.imageUrl}`}
            alt={product.name}
            className={`object-fit-cover ${product.quantity === 0 ? styles.outOfStock : ""}`}
            style={{ height: "180px" }}
          />
          {product.quantity === 0 && (
            <span className={styles.outOfStockText}>Hết hàng</span>
          )}
        </Link>
      </div>
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start">
          <Link href={`/productList/${product._id}`} passHref legacyBehavior>
            <a
              className={`text-decoration-none ${product.quantity === 0 ? "text-muted" : "text-dark"
                }`}
            >
              <Card.Title className="fw-bold fs-6 m-0">
                {product.name}
              </Card.Title>
            </a>
          </Link>
          <span className={` ${styles.priceBadge}`}>{renderPrice(product)}</span>
        </div>
        <Card.Text
          className={`small mt-2 ${product.quantity === 0 ? "text-muted" : "text-muted"
            }`}
        >
          {product.description}
        </Card.Text>

        <div className="mt-auto d-flex justify-content-between align-items-center">
          {comments && comments.length > 0 ? (
            <div className="d-flex align-items-center">
              {renderStars(averageRating)}
              <span style={{ marginLeft: "8px", color: "#555" }}>
                {averageRating.toFixed(1)} / 5 ({comments.length} đánh giá)
              </span>
            </div>
          ) : (
            <p style={{ color: "#786868ff" }}>Chưa có đánh giá</p>
          )}
          <FontAwesomeIcon
            icon={favoriteMap[product._id] ? faHeart : faHeartBroken}
            style={{
              color: favoriteMap[product._id] ? "red" : "#aaa",
              cursor: "pointer",
            }}
            onClick={() => toggleFavorite(product._id)}
            title={favoriteMap[product._id] ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          />
        </div>
      </Card.Body>
    </Card>

  );
};

export default function FastFoodMenu() {
  const router = useRouter();
  const params = useParams();
  const categoryId = (params?.id as string) || "all";
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<number>(500000); // Max giá mặc định, *1000 cho đơn vị '000đ
  const [sortBy, setSortBy] = useState("popular"); // Mặc định phổ biến
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [favoriteMap, setFavoriteMap] = useState<{ [key: string]: boolean }>({});
  const [activeCategory, setActiveCategory] = useState("all");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(`${API_URL}/favoriteProduct/favorites`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        if (data.status && Array.isArray(data.result)) {
          const favs: { [key: string]: boolean } = {};
          data.result.forEach((fav: Product) => {
            favs[fav._id] = true;
          });
          setFavoriteMap(favs);
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra yêu thích:", err);
      }
    };
    fetchFavorites();
  }, []);

  const toggleFavorite = async (productId: string) => {
    try {
      const response = await fetch(`${API_URL}/favoriteProduct/favorites/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        setFavoriteMap((prev) => ({
          ...prev,
          [productId]: !prev[productId],
        }));
        toast.success(result.message || "Cập nhật yêu thích thành công");
      } else {
        toast.error(result.message || "Lỗi cập nhật yêu thích");
      }
    } catch (error) {
      console.error("Lỗi yêu thích:", error);
      toast.error("Không kết nối được đến server");
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi fetch danh mục");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.result)) {
          setCategories(data.result);
        } else {
          setCategories([]);
          setError("Dữ liệu danh mục không hợp lệ");
        }
      })
      .catch((err) => {
        console.error("Lỗi khi fetch categories:", err);
        setError("Không thể tải danh mục");
      })
      .finally(() => {
        setLoadingCategories(false);
      });
  }, []);

  useEffect(() => {
    if (!categoryId) return;
    setError(null);
    let url = `${API_URL}/products`;
    if (categoryId !== "all") {
      url += `?category=${categoryId}`;
    }
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Lỗi khi fetch sản phẩm: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.result)) {
          setProducts(data.result);
        } else {
          setProducts([]);
          setError(data.message || "Dữ liệu sản phẩm không hợp lệ");
        }
      })
      .catch((err) => {
        console.error("Lỗi khi fetch products:", err);
        setProducts([]);
        setError("Không thể tải sản phẩm: " + err.message);
      });
  }, [categoryId]);

  useEffect(() => {
    let result = products.filter((p) => {
      const price = p.sizes?.[0]?.price?.discount ?? p.sizes?.[0]?.price?.original ?? 0;
      return (
        (p.status === undefined || p.status === true) &&
        price <= priceRange &&
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    // Sắp xếp
    if (sortBy === "price_low_high") {
      result.sort((a, b) => {
        const priceA = a.sizes?.[0]?.price?.discount ?? a.sizes?.[0]?.price?.original ?? 0;
        const priceB = b.sizes?.[0]?.price?.discount ?? b.sizes?.[0]?.price?.original ?? 0;
        return priceA - priceB;
      });
    } else if (sortBy === "price_high_low") {
      result.sort((a, b) => {
        const priceA = a.sizes?.[0]?.price?.discount ?? a.sizes?.[0]?.price?.original ?? 0;
        const priceB = b.sizes?.[0]?.price?.discount ?? b.sizes?.[0]?.price?.original ?? 0;
        return priceB - priceA;
      });
    } else if (sortBy === "newest") {
      // Giả sử sắp xếp theo time (thời gian tạo), điều chỉnh nếu cần
      result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    } else if (sortBy === "a_z") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "popular") {
      // Giả sử phổ biến theo view
      result.sort((a, b) => b.view - a.view);
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset trang khi lọc thay đổi
  }, [products, searchQuery, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getCategoryName = () => {
    if (categoryId === "all") return "Tất cả sản phẩm";
    const category = categories.find((c) => c._id === categoryId);
    return category ? category.name : "Thực Đơn Hấp Dẫn";
  };

  return (
    <Container className=" py-4">
      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      <Row className="gx-4">
        {/* Sidebar Filters */}
        <Col md={3} className="mb-4">
          <div className="bg-white rounded shadow-sm p-4 sticky-top" style={{ top: "1rem" }}>
            <h2 className="h5 fw-bold  mb-4 d-flex align-items-center">
              <Filter className="me-2" size={20} /> Bộ lọc
            </h2>

            {/* Search */}
            <div className="mb-4">
              <Form.Label className="fw-medium ">Tìm kiếm</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  placeholder="Burger, khoai tây..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="position-absolute top-50 end-0 translate-middle-y me-2 text-muted" size={18} />
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <Form.Label className="fw-medium ">Khoảng giá</Form.Label>
              <Form.Range
                className={styles.priceRangeSlider}
                min={0}
                max={500000}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
              />
              <div className={`${styles.priceDeal} d-flex justify-content-between`}>
                <span>0đ</span>
                <span>{priceRange.toLocaleString()}đ</span>
                <span>500.000đ</span>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-4">
              <Form.Label className="fw-medium text-danger">Danh mục</Form.Label>
              <ul className="list-unstyled">
                <li className={`${styles.categoryItem} mb-2`}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveCategory("all");
                      router.push("/category/all");
                    }}
                    className={`d-flex align-items-center text-decoration-none ${activeCategory === "all" ? styles.activeCategory : "text-dark"
                      }`}
                  >
                    <ChevronRight
                      size={16}
                      className={`me-2 ${activeCategory === "all" ? "text-danger" : "text-muted"}`}
                    />
                    Tất cả
                  </a>
                </li>

                {categories.map((category) => (
                  <li key={category._id} className={`${styles.categoryItem} mb-2`}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveCategory(category._id);
                        router.push(`/category/${category._id}`);
                      }}
                      className={`d-flex align-items-center text-decoration-none ${activeCategory === category._id ? styles.activeCategory : "text-dark"
                        }`}
                    >
                      <ChevronRight
                        size={16}
                        className={`me-2 ${activeCategory === category._id ? "text-danger" : "text-muted"}`}
                      />
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>


            {/* Sort By */}
            <div>
              <Form.Label className="fw-medium ">Sắp xếp theo</Form.Label>
              <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="popular">Phổ biến</option>
                <option value="price_low_high">Giá: Thấp đến Cao</option>
                <option value="price_high_low">Giá: Cao đến Thấp</option>
                <option value="newest">Mới nhất</option>
                <option value="a_z">A - Z</option>
              </Form.Select>
            </div>
          </div>
        </Col>

        {/* Product Grid */}
        <Col md={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className={`${styles.categoryName}`}>{loadingCategories ? "Đang tải..." : getCategoryName()}</h1>
            <div className="text-muted">
              <span className="fw-medium">{filteredProducts.length}</span> món ăn
            </div>
          </div>

          <Row className="g-4">
            {paginatedProducts.map((p) => (
              <Col sm={6} lg={4} key={p._id}>
                {/* Sử dụng ProductCard thay vì render trực tiếp */}
                <ProductCard
                  product={p}
                  favoriteMap={favoriteMap}
                  toggleFavorite={toggleFavorite}
                  API_URL={API_URL}
                />
              </Col>
            ))}
          </Row>

          {filteredProducts.length === 0 && !error && (
            <div className="text-center py-5">
              <h4>Không tìm thấy sản phẩm nào</h4>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Button
                className={`${styles.paginationBtn} me-2`}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                <ChevronLeft size={16} />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  className={`${styles.paginationBtn} me-2 ${currentPage === page ? styles.paginationActive : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                className={styles.paginationBtn}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>

          )}
        </Col>
      </Row>
    </Container>
  );
}