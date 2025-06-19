"use client";
import useSWR, { Fetcher } from "swr";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Image from "react-bootstrap/Image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Counter from "@/app/count/count";
import "./productList.css";
import ProductList from "../productList";
interface ProductType {
  id: string;

  category: string;
  name: string;
  imageUrl: string;
  price: number;
  rating: number;
  time: string;
  description: string[];
  taste: string[];
}

const ProductDetail = () => {
  const { id } = useParams();
  const [productId, setProductId] = useState<string | null>(null);
  useEffect(() => {
    if (id) setProductId(id.toString());
  }, [id]);
  const fetcher: Fetcher<ProductType, string> = (url: string) =>
    fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR(
    productId
      ? `https://be-friedking.onrender.com/products/${productId}`
      : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading product</p>;
  return (
    <>
      <Container fluid className="mt-4">
        <Breadcrumb className="ms-5">
          <Breadcrumb.Item href="/" className="breadCrumbItem">
            Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item href="" className="breadCrumbItem">
            {data?.category}
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{data?.name}</Breadcrumb.Item>
        </Breadcrumb>
        <Container fluid className="p-5">
          <Row>
            <Col xs={8} className="d-flex justify-content-center">
              <Image src={data?.imageUrl}></Image>
            </Col>
            <Col xs={4}>
              <Row className="d-flex flex-column" style={{ gap: "12px" }}>
                <h1 style={{ fontSize: "20px", color: "#252a2b" }}>
                  {data?.name}
                </h1>
                <span> {data?.price}</span>
                <span> {data?.time}</span>
                <span> {data?.rating}</span>
                <p className="m-0">Chọn vị:</p>
                <Form>
                  {data?.taste.map((item, index) => (
                    <Form.Check
                      id={`default-checkbox`}
                      key={index}
                      label={item}
                    />
                  ))}
                </Form>
                <p className="m-0" style={{ color: "orange" }}>
                  Combo bao gồm:
                </p>
                <ul>
                  {data?.description.map((item, index) => (
                    <li key={index}>- {item}</li>
                  ))}
                </ul>
                <Counter />
                <Button
                  className="text-light p-2"
                  style={{
                    border: "none",
                    borderRadius: "0",
                    backgroundColor: "#e00000",
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
