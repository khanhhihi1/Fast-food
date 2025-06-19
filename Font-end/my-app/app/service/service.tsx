"use client";
import { useRouter } from "next/navigation";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { useState, useEffect } from "react";
import styles from "../styles/service.module.css";
interface Service {
  id: number;
  imageUrl: string;
  tittle: string;
  status: string;
}
export default function Service() {
  const [service, setService] = useState<Service[]>([]);

  useEffect(() => {
    async function fetchService() {
      const res = await fetch("https://be-friedking.onrender.com/service");
      const data = await res.json();
      setService(data);
    }
    fetchService();
  }, []);

  if (!service) return <div>Loading...</div>;
  return (
    <>
      <Container className="my-4">
        <Row>
          <Col className="d-flex justify-content-center">
            <h1 className={`${styles.h1} ${styles.h1Box}`}>DANH MỤC NỔI BẬT</h1>
          </Col>
        </Row>
        <Row className="d-flex p-3" style={{ gap: "10px" }}>
          {service.map((item) => (
            <Col
              key={item.id}
              className={`d-flex align-items-center justify-content-between  ${styles.service} p-3`}
            >
              <div className={styles.serviceTittle}>
                <h1>{item.tittle}</h1>
                <p>{item.status}</p>
              </div>
              <div>
                <Image
                  src={item.imageUrl}
                  style={{ width: "100px", height: "100px", color: "white" }}
                  alt="Banner"
                ></Image>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
