"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import styles from "../styles/service.module.css";

interface Service {
  _id: string;
  name: string;
  imageUrl: string;
}

export default function Service() {
  const [service, setService] = useState<Service[]>([]);

  useEffect(() => {
    async function fetchService() {
      try {
        const res = await fetch("http://localhost:5000/categories");
        const data = await res.json();

        if (Array.isArray(data.result)) {
          setService(data.result);
        } else {
          console.error("Dữ liệu không đúng định dạng mảng:", data);
        }
      } catch (err) {
        console.error("Lỗi khi fetch categories:", err);
      }
    }

    fetchService();
  }, []);

  if (!service.length) return <div>Loading...</div>;

  return (
    <Container className="my-4">
      <Row>
        <Col className="d-flex justify-content-center">
          <h1 className={`${styles.h1} ${styles.h1Box}`}>DANH MỤC SẢN PHẨM</h1>
        </Col>
      </Row>

      <Row className="d-flex p-3" style={{ gap: "10px" }}>
        {service.map((item) => (
          <Col
            key={item._id}
            className={`d-flex align-items-center justify-content-between ${styles.service} p-3`}
          >
            <div className={styles.serviceTittle}>
              <h1>{item.name}</h1>
            </div>
            <div>
              <Image
                src={item.imageUrl}
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
                alt={item.name}
              />
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
