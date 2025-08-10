"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";
import styles from "../../styles/productCate.module.css";

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
  categoryId?: string | Category; // Đồng bộ với back-end: Thay 'categories' thành 'categoryId'
}

const CategoryPage = () => {
  const router = useRouter();
  const params = useParams();
const categoryId = (params?.categoryId as string) || "all";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
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
      });
  }, []);
  useEffect(() => {
    // Chỉ fetch khi categoryId đã có giá trị
    if (categoryId === undefined || categoryId === null) {
      console.warn("categoryId chưa sẵn sàng, bỏ qua fetch lần này");
      return;
    }

    setError(null);
    console.log("categoryId (frontend):", categoryId);

    let url = "http://localhost:5000/products";

    // Nếu không phải "all" thì thêm query param
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
  // Lọc theo giá
  useEffect(() => {
    const result = products.filter((p) => {
      const price = p.sizes?.[0]?.price?.discount ?? p.sizes?.[0]?.price?.original ?? 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    setFilteredProducts(result);
  }, [products, priceRange]);

  const renderPrice = (product: Product) => {
    if (!product.sizes || product.sizes.length === 0) return "Giá không khả dụng";
    const { original, discount } = product.sizes[0].price;
    return discount ? (
      <>
        <del>{original.toLocaleString()}đ</del>{" "}
        <strong>{discount.toLocaleString()}đ</strong>
      </>
    ) : (
      <>{original.toLocaleString()}đ</>
    );
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center">Danh sách sản phẩm</h1>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      <Row>
        <Col md={3} className={styles.categorySidebar}>
          <Card>
            <Card.Header className={styles.sidebarHeader}>
              Danh mục sản phẩm
            </Card.Header>
            <ListGroup variant="flush">
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
            {filteredProducts.map((product) => (
              <Col key={product._id} md={3} className="mb-4">
                <Card className={styles.productCard}>
                  <div className={styles.productImage}>
                    {product.imageUrl || product.image ? (
                      <img
                        src={product.imageUrl || product.image!}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder} />
                    )}
                  </div>
                  <Card.Body>
                    <Card.Title className={styles.productTitle}>
                      {product.name}
                    </Card.Title>
                    <Card.Text className={styles.productPrice}>
                      {renderPrice(product)}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

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