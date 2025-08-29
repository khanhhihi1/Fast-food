"use client";
import useSWR from "swr";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Image from "react-bootstrap/Image";
import Card from "react-bootstrap/Card";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Counter from "@/app/count/count";
import "./productList.css";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faHeartBroken, faStar } from "@fortawesome/free-solid-svg-icons";
import styles from "../../styles/HotProduct.module.css";
import Link from "next/link";

interface SizeType {
  name: string;
  price: {
    original: number;
    discount?: number;
  };
}

interface CategoryInfo {
  _id: string;
  name: string;
  imageUrl?: string;
  isHidden?: boolean;
}

interface ProductType {
  _id: string;
  name: string;
  image: string;
  description: string;
  time: string;
  view: number;
  quantity: number;
  taste?: string[];
  sizes?: SizeType[];
  categoryId?: string | CategoryInfo;
  status?: boolean;
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
interface PaginationProps {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
}

const PaginationComponent: React.FC<PaginationProps> = ({
  value,
  setValue,
}) => {
  return (
    <div>
      <button onClick={() => setValue(value - 1)}>Prev</button>
      <button onClick={() => setValue(value + 1)}>Next</button>
    </div>
  );
};
const ProductDetail = () => {
  const { id } = useParams();
  const [productId, setProductId] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedTaste, setSelectedTaste] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (id && typeof id === "string") {
      setProductId(id);
    }
  }, [id]);

  const fetcher = async (url: string) => {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Lỗi ${res.status}: ${text.startsWith("<!DOCTYPE") ? "Không tìm thấy endpoint" : text
        }`
      );
    }
    const data = await res.json();
    if (!data.result) throw new Error("API không trả về 'result'");
    return data.result;
  };

  const {
    data: product,
    error: productError,
    isLoading: productLoading,
  } = useSWR<ProductType>(
    productId ? `${API_URL}/products/${productId}` : null,
    fetcher
  );

  const {
    data: categories,
    error: categoryError,
    isLoading: categoryLoading,
  } = useSWR<CategoryInfo[]>(`${API_URL}/categories`, fetcher);

  const {
    data: comments,
    error: commentError,
    isLoading: commentLoading,
  } = useSWR<CommentType[]>(
    productId ? `${API_URL}/comment/${productId}` : null,
    async (url: string) => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Lỗi ${res.status}: ${text.startsWith("<!DOCTYPE") ? "Không tìm thấy endpoint" : text
          }`
        );
      }
      const data = await res.json();
      if (!data.result) throw new Error("API không trả về 'result'");
      return data.result;
    }
  );

  useEffect(() => {
    if (product) {
      let catId: string | null = null;
      if (typeof product.categoryId === "string") {
        catId = product.categoryId;
      } else if (product.categoryId && typeof product.categoryId === "object") {
        catId = (product.categoryId as CategoryInfo)._id;
      }
      setCategoryId(catId);
    }
  }, [product]);

  const {
    data: allProducts,
    error: relatedError,
    isLoading: relatedLoading,
  } = useSWR<ProductType[]>(`${API_URL}/products`, fetcher);

  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0].name);
    } else {
      setSelectedSize(null);
    }
  }, [product]);

  const getCategoryName = () => {
    if (!product || !categories) return "Danh mục";
    if (typeof product.categoryId === "string") {
      const category = categories.find((cat) => cat._id === product.categoryId);
      return category?.name || "Danh mục";
    }
    return (product.categoryId as CategoryInfo)?.name || "Danh mục";
  };

  const getProductCategoryId = (prod: ProductType): string | null => {
    if (typeof prod.categoryId === "string") {
      return prod.categoryId;
    } else if (prod.categoryId && typeof prod.categoryId === "object") {
      return (prod.categoryId as CategoryInfo)._id;
    }
    return null;
  };

  const renderPrice = () => {
    if (!product?.sizes || product.sizes.length === 0)
      return "Giá không khả dụng";
    const size = product.sizes.find((s) => s.name === selectedSize);
    if (!size) return "Không có size phù hợp";

    const { original, discount } = size.price;
    return (
      <span>
        {discount ? (
          <>
            <del>{original.toLocaleString()}đ</del>{" "}
            <strong>{discount.toLocaleString()}đ</strong>
          </>
        ) : (
          <>{original.toLocaleString()}đ</>
        )}
      </span>
    );
  };
  const toggleFavorite = async (productId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/favoriteProduct/favorites/${productId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

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
  const renderStars = (rating: number) => (
    <span>
      {[...Array(5)].map((_, index) => (
        <FontAwesomeIcon
          key={index}
          icon={faStar}
          style={{
            color: index < rating ? "#ffc107" : "#e4e5e9",
          }}
        />
      ))}
    </span>
  );

  const handleAddToCart = async (product: ProductType) => {
    if (!selectedSize || !product?._id) {
      toast.error("Vui lòng chọn kích cỡ");
      return;
    }

    const sizeInfo = product.sizes?.find((s) => s.name === selectedSize);
    if (!sizeInfo) {
      toast.error("Kích cỡ không hợp lệ");
      return;
    }

    const price = {
      original: sizeInfo.price.original,
      discount: sizeInfo.price.discount,
    };

    try {
      const res = await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          sizeName: selectedSize,
          taste: selectedTaste ? [selectedTaste] : [],
          quantity,
          price,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Lỗi không xác định");

      toast.success(`${product.name} đã được thêm vào giỏ hàng.`);
    } catch (error: any) {
      toast.error(`Thêm giỏ hàng thất bại: ${error.message}`);
    }
  };

  if (productLoading || categoryLoading || commentLoading)
    return <p>Đang tải...</p>;
  if (productError) return <p>Lỗi khi tải sản phẩm: {productError.message}</p>;
  if (categoryError)
    return <p>Lỗi khi tải danh mục: {categoryError.message}</p>;
  if (commentError) return <p>Lỗi khi tải bình luận: {commentError.message}</p>;
  if (!product || !product._id) return <p>Không tìm thấy sản phẩm</p>;

  const filteredRelatedProducts = allProducts?.filter(
    (p) => {
      const pCatId = getProductCategoryId(p);
      const cat = categories?.find((c) => c._id === pCatId);
      return pCatId === categoryId && p._id !== product._id && cat && !cat.isHidden && p.status !== false;
    }
  ) || [];

  return (
    <>
      <Container fluid style={{ padding: "0px" }}>
        <Breadcrumb
          className="m-0"
          style={{ backgroundColor: "#ddd", padding: "10px 110px" }}
        >
          <Breadcrumb.Item
            href="/"
            className="breadCrumbItem"
            style={{ margin: "0px" }}
          >
            Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item href="" className="breadCrumbItem">
            {getCategoryName()}
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Container fluid className={styles.productDetail}>
          <Row>
            <Col xs={6} className="d-flex justify-content-center" style={{ height: "440px" }}>
              <Image src={`${API_URL}/${product.image}`} fluid className={styles.productImageS} />
            </Col>
            <Col xs={6}>
              <div className={styles.productInfo}>
                <h1 className={styles.productName}>{product.name}</h1>
                <span className={styles.productPriceS}>{renderPrice()}</span>

                {product.sizes && product.sizes.length > 0 && (
                  <>
                    <p className={styles.optionTitle}>Chọn kích thước:</p>
                    <Form>
                      {product.sizes.map((size, index) => (
                        <Form.Check
                          type="radio"
                          key={index}
                          id={`size-${index}`}
                          label={`${size.name} (${size.price.discount
                            ? size.price.discount.toLocaleString()
                            : size.price.original.toLocaleString()
                            }đ)`}
                          name="size"
                          checked={selectedSize === size.name}
                          onChange={() => setSelectedSize(size.name)}
                        />
                      ))}
                    </Form>
                  </>
                )}

                <p className={styles.optionTitle}>Chọn vị:</p>
                <Form>
                  {Array.isArray(product.taste) && product.taste.length > 0 ? (
                    <>
                      <Form.Check
                        key="no-taste"
                        id="taste-radio-no"
                        label="Không"
                        type="radio"
                        name="taste"
                        checked={selectedTaste === null}
                        onChange={() => setSelectedTaste(null)}
                      />
                      {product.taste.map((item, index) => (
                        <Form.Check
                          key={index}
                          id={`taste-radio-${index}`}
                          label={item}
                          type="radio"
                          name="taste"
                          checked={selectedTaste === item}
                          onChange={() => setSelectedTaste(item)}
                        />
                      ))}
                    </>
                  ) : (
                    <p>Không có lựa chọn vị</p>
                  )}
                </Form>

                <p className="m-0" style={{ color: "orange" }}>Combo bao gồm:</p>
                <ul className={styles.productDesc}>
                  <li>{product.description || "Không có mô tả"}</li>
                </ul>
                <p className={styles.optionTitle}>Số lượng:</p>
                <div className={styles.buttonPrevious}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                  >
                    -
                  </Button>
                  <span className="mx-3">{quantity}</span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    +
                  </Button>
                </div>
                <Button
                  className={styles.addToCart}
                  onClick={() => handleAddToCart(product)}
                >
                  Thêm vào giỏ
                </Button>
              </div>
            </Col>
          </Row>

          <Row className={styles.commentSection}>
            <Col xs={12}>
              <h3>Bình luận về sản phẩm</h3>
              {(comments ?? []).length > 0 ? (
                (comments ?? []).map((comment) => (
                  <Card key={comment._id} className={styles.commentCard + " mb-3"}>
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{comment.userId.name}</strong>
                          <div>{renderStars(comment.rating)}</div>
                        </div>
                        <small>
                          {new Date(comment.createdAt).toLocaleDateString("vi-VN")}{" "}
                          {new Date(comment.createdAt).toLocaleTimeString("vi-VN")}
                        </small>
                      </div>
                      <p>{comment.comment}</p>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <p>Chưa có bình luận nào cho sản phẩm này.</p>
              )}
            </Col>
          </Row>
        </Container>

      </Container>

      <Container className="py-5">
        <h2
          className={`text-center mb-4 ${styles.sectionTitle} ${styles.sectionTitle1}`}
        >
          SẢN PHẨM LIÊN QUAN
        </h2>

        {relatedLoading && <p>Đang tải sản phẩm liên quan...</p>}
        {relatedError && <p>Lỗi tải sản phẩm liên quan: {relatedError.message}</p>}
        {!relatedLoading && !relatedError && filteredRelatedProducts.length === 0 && (
          <p>Không có sản phẩm liên quan.</p>
        )}

        <Row>
          {filteredRelatedProducts.map((product) => {
            const hasSizes = product.sizes && product.sizes.length > 0;
            const priceInfo = hasSizes ? product.sizes![0].price : null;
            const displayPrice = priceInfo
              ? priceInfo.discount ?? priceInfo.original
              : "Liên hệ";

            const isFavorite = favoriteMap[product._id] || false;

            return (
              <Col key={product._id} md={3} sm={6} className="mb-4">
                <Card className={`h-100 ${styles.productCard}`}>
                  <Link href={`/productList/${product._id}`}>
                    <div className={styles.imageContainer}>
                      <Card.Img
                        variant="top"
                        src={`${API_URL}/${product.image}`}
                        alt={product.name}
                        className={styles.productImage}
                      />
                    </div>
                  </Link>

                  <Card.Body className={styles.cardBody}>
                    <Card.Title className={styles.productTitle}>
                      {product.name}
                    </Card.Title>
                    <Card.Text className={styles.productDesc}>
                      {product.description}
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className={styles.productPrice}>
                        {typeof displayPrice === "number"
                          ? displayPrice.toLocaleString("vi-VN") + "₫"
                          : displayPrice}
                      </span>

                      <FontAwesomeIcon
                        icon={isFavorite ? faHeart : faHeartBroken}
                        style={{
                          color: isFavorite ? "red" : "#aaa",
                          cursor: "pointer",
                        }}
                        onClick={() => toggleFavorite(product._id)}
                        title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default ProductDetail;