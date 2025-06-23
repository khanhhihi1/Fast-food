"use client";
import { useRouter } from "next/navigation";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { useState, useEffect } from "react";
import { Roboto } from "next/font/google";
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
});
export default function About() {
  return (
    <>
      <Container className="mt-5">
        <Row>
          <Col xs={4}>
            <Image
              src="https://i.pinimg.com/736x/6a/bd/91/6abd91b4b6ef51e212c83a6dad70dd5d.jpg"
              className="img-full"
              style={{ borderRadius: "10px" }}
            ></Image>
          </Col>
          <Col xs={8} className="d-flex flex-column justify-content-end gap-2">
            <h1 style={{ fontSize: "20px" }}>Về chúng tôi</h1>
            <h1 style={{ fontSize: "26px", color: "#c10a28" }}>Fried King</h1>
            <p>
              Chào mừng bạn đến với Fried King - điểm đến lý tưởng cho những
              người yêu thưởng thức pizza tại thành phố! Fried King tự hào là
              địa chỉ pizza hàng đầu, nổi tiếng với chất lượng món ăn tuyệt vời,
              dịch vụ tận tâm và mức độ hài lòng cao từ phía khách hàng.
            </p>
            <div className="d-flex gap-3">
              <Image
                src="https://bizweb.dktcdn.net/100/510/571/themes/941527/assets/image_1.jpg?1727255430829"
                style={{
                  width: "201px",
                  height: "201px",
                  borderRadius: "10px",
                }}
              ></Image>
              <Image
                src="https://bizweb.dktcdn.net/100/510/571/themes/941527/assets/image_2.jpg?1727255430829"
                style={{
                  width: "201px",
                  height: "201px",
                  borderRadius: "10px",
                }}
              ></Image>
              <Image
                src="https://bizweb.dktcdn.net/100/510/571/themes/941527/assets/image_3.jpg?1727255430829"
                style={{
                  width: "201px",
                  height: "201px",
                  borderRadius: "10px",
                }}
              ></Image>
              <Image
                src="https://bizweb.dktcdn.net/100/510/571/themes/941527/assets/image_3.jpg?1727255430829"
                style={{
                  width: "201px",
                  height: "201px",
                  borderRadius: "10px",
                }}
              ></Image>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
