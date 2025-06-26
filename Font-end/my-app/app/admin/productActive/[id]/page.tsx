"use client";
import useSWR from "swr";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Image from "react-bootstrap/Image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Counter from "@/app/count/count";
import "./productList.css";
import ProductList from "./productList";

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
  categoryId?: CategoryInfo;
}

const ProductDetail = () => {
  const { id } = useParams();
  const [productId, setProductId] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === "string") {
      setProductId(id);
    }
  }, [id]);

  const fetcher = async (url: string): Promise<ProductType> => {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || !data.result) {
      throw new Error("Không thể lấy dữ liệu sản phẩm");
    }
    return data.result;
  };

  const { data, error, isLoading } = useSWR(
    productId ? `http://localhost:5000/products/${productId}` : null,
    fetcher
  );

  useEffect(() => {
    if (data?.sizes && data.sizes.length > 0) {
      setSelectedSize(data.sizes[0].name);
    } else {
      setSelectedSize(null);
    }
  }, [data]);

  const renderPrice = () => {
    if (!data?.sizes || data.sizes.length === 0) return "Giá không khả dụng";
    const size = data.sizes.find((s) => s.name === selectedSize);
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

  if (isLoading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi khi tải sản phẩm: {error.message}</p>;
  if (!data || !data._id) return <p>Không tìm thấy sản phẩm</p>;

  return (
    <>
      <Container fluid className="mt-4">
        <Breadcrumb className="ms-5">
          <Breadcrumb.Item href="/" className="breadCrumbItem">
            Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item href="" className="breadCrumbItem">
            {data.categoryId?.name || "Danh mục"}
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{data.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Container fluid className="p-5">
          <Row>
            <Col xs={8} className="d-flex justify-content-center">
              <Image src={data.image} fluid />
            </Col>
            <Col xs={4}>
              <Row className="d-flex flex-column" style={{ gap: "12px" }}>
                <h1 style={{ fontSize: "20px", color: "#252a2b" }}>{data.name}</h1>

                <span>{renderPrice()}</span>

                {data.sizes && data.sizes.length > 0 && (
                  <>
                    <p className="m-0">Chọn kích thước:</p>
                    <Form>
                      {data.sizes.map((size, index) => (
                        <Form.Check
                          type="radio"
                          key={index}
                          id={`size-${index}`}
                          label={`${size.name} (${size.price.discount ? size.price.discount.toLocaleString() : size.price.original.toLocaleString()}đ)`}
                          name="size"
                          checked={selectedSize === size.name}
                          onChange={() => setSelectedSize(size.name)}
                        />
                      ))}
                    </Form>
                  </>
                )}

                <span>{data.time || "Thời gian không khả dụng"}</span>
                <span>Đánh giá: 0 sao</span>

                <p className="m-0">Chọn vị:</p>
                <Form>
                  {Array.isArray(data.taste) && data.taste.length > 0 ? (
                    data.taste.map((item, index) => (
                      <Form.Check
                        key={index}
                        id={`taste-checkbox-${index}`}
                        label={item}
                      />
                    ))
                  ) : (
                    <p>Không có lựa chọn vị</p>
                  )}
                </Form>

                <p className="m-0" style={{ color: "orange" }}>Combo bao gồm:</p>
                <ul>
                  <li>{data.description || "Không có mô tả"}</li>
                </ul>

                <Counter />

                <Button
                  className="text-light p-2"
                  style={{ border: "none", borderRadius: "0", backgroundColor: "#e00000" }}
                  onClick={() => {
                    const sizeInfo = data.sizes?.find((s) => s.name === selectedSize);
                    const price = sizeInfo?.price.discount ?? sizeInfo?.price.original ?? 0;

                    console.log("Thêm vào giỏ:", {
                      productId: data._id,
                      name: data.name,
                      size: selectedSize,
                      price,
                    });
                  }}
                >
                  Thêm vào giỏ
                </Button>
              </Row>
            </Col>
          </Row>
        </Container>
      </Container>

      <ProductList category="related" title="Sản phẩm liên quan" limit={6} />
    </>
  );
};

export default ProductDetail;