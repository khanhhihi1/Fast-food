"use client";
import Image from "react-bootstrap/Image";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import styles from "../stylesComponent/slide.module.css";
import Button from "react-bootstrap/Button";
interface Props {
  text: string;
}

export default function SlideImage({ text }: Props) {
  return (
    <Container fluid className="m-0 p-0">
      <Row className="m-0">
        <Col lg={12} className="p-0">
          <div style={{ position: "relative" }}>
            <Image
              src="/bannerQv.png"
              alt="Banner"
              className={`${styles.bannerMain}`}
            />
            <Button className={`${styles.btnMain}`}>ORDER NOW</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
