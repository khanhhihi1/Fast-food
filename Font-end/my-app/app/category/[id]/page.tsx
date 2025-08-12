"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Container, Row, Col, Card, ListGroup, Button } from "react-bootstrap";
import Link from "next/link";
import styles from "../../styles/productCate.module.css";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faHeartBroken } from "@fortawesome/free-solid-svg-icons";

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
}

const CategoryPage = () => {
  const router = useRouter();
  const params = useParams();
  const categoryId = (params?.id as string) || "all";
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [error, setError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [displayedCount, setDisplayedCount] = useState(16);
  const itemsPerPage = 16;
  const [favoriteMap, setFavoriteMap] = useState<{ [key: string]: boolean }>({});
  const [isFavorite, setIsFavorite] = useState(false);
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch("http://localhost:5000/favoriteProduct/favorites", {
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
      const response = await fetch(`http://localhost:5000/favoriteProduct/favorites/${productId}`, {
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
    fetch("http://localhost:5000/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi fetch danh mục");
        return res.json();
      })
      .then((data) => {
        console.log("Categories response:", data);
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
        setLoadingCategories(false); // Kết thúc loading
      });
  }, []);

  useEffect(() => {
    if (!categoryId) {
      console.warn("categoryId chưa sẵn sàng");
      return;
    }

    setError(null);
    console.log("categoryId (frontend):", categoryId);

    let url = "http://localhost:5000/products";
    if (categoryId !== "all") {
      url += `?category=${categoryId}`;
    }
    console.log("Fetching products from URL:", url);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Lỗi khi fetch sản phẩm: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Products response:", data);
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
    const result = products.filter((p) => {
      const price = p.sizes?.[0]?.price?.discount ?? p.sizes?.[0]?.price?.original ?? 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    setFilteredProducts(result);
    setDisplayedCount(itemsPerPage);
  }, [products, priceRange]);

  const loadMore = () => {
    setDisplayedCount((prev) => prev + itemsPerPage);
  };

  const renderPrice = (product: Product) => {
    if (!product.sizes || product.sizes.length === 0) return "Giá không khả dụng";
    const { original, discount } = product.sizes[0].price;
    return discount ? (
      <>
        <del style={{ color: "gray" }}>{original.toLocaleString()}đ</del>{" "}
        <strong>{discount.toLocaleString()}đ</strong>
      </>
    ) : (
      <>{original.toLocaleString()}đ</>
    );
  };
  const getCategoryName = () => {
    if (categoryId === "all") return "Tất cả sản phẩm";
    const category = categories.find((c) => c._id === categoryId);
    return category ? category.name : "Danh sách sản phẩm";
  };
  return (
    <Container className="py-4">
      <div className="text-center">
        <h1 className={styles.sectionTitle}>{loadingCategories ? "Đang tải..." : getCategoryName()}</h1>
      </div>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      <Row>
        <Col md={3} className={styles.categorySidebar}>
          <Card>
            <Card.Header className={styles.sidebarHeader}>
              Danh sách danh mục
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item
                key="all"
                active={categoryId === "all"}
                action
                onClick={() => router.push("/category/all")}
                className={styles.categoryItem}
              >
                Tất cả
              </ListGroup.Item>
              {categories.map((category) => (
                <ListGroup.Item
                  key={category._id}
                  active={categoryId === category._id}
                  action
                  onClick={() => router.push(`/category/${category._id}`)}
                  className={styles.categoryItem}
                >
                  {category.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col md={9}>
          <Row>
            {filteredProducts.slice(0, displayedCount).map((product) => (
              <Col key={product._id} md={3} className="mb-4">
                <Card className={styles.productCard}>
                  <Link href={`/productList/${product._id}`}>
                    <div className={styles.productImage}>
                      {product.imageUrl || product.image ? (
                        <img
                          src={product.imageUrl || product.image!}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "160px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div className={styles.imagePlaceholder} />
                      )}
                    </div>
                  </Link>
                  <Card.Body>
                    <Card.Title className={styles.productTitle}>
                      {product.name}
                    </Card.Title>
                    <Card.Text className={styles.productPrice}>
                      {renderPrice(product)}

                    </Card.Text>
                    <FontAwesomeIcon
                      icon={favoriteMap[product._id] ? faHeart : faHeartBroken}
                      style={{ color: favoriteMap[product._id] ? "red" : "#aaa", cursor: "pointer" }}
                      onClick={() => toggleFavorite(product._id)}
                      title={favoriteMap[product._id] ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                    />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {filteredProducts.length > displayedCount && (
            <div className="text-center mt-4">
              <Button onClick={loadMore} className={styles.loadMoreButton}>
                Xem thêm
              </Button>
            </div>
          )}

          {filteredProducts.length === 0 && !error && (
            <div className="text-center py-5">
              <h4>Không tìm thấy sản phẩm nào</h4>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CategoryPage;