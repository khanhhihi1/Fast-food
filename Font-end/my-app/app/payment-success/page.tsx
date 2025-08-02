"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "fail">(
    "loading"
  );

  useEffect(() => {
    const checkOrderStatus = async () => {
      try {
        // B1: Gọi backend lấy thông tin session
        const res = await fetch(
          `http://localhost:5000/payment/stripe/session/${sessionId}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (!data.status) throw new Error("Không tìm thấy session");

        const orderId = data.session.metadata.orderId;

        // B2: Gọi backend kiểm tra trạng thái đơn hàng
        const orderRes = await fetch(
          `http://localhost:5000/orders/${orderId}/status`,
          {
            credentials: "include",
          }
        );
        const orderData = await orderRes.json();

        console.log("Kiểm tra đơn:", orderData);

        if (orderData.status && orderData.isPaid) {
          setStatus("success");
        } else {
          setStatus("fail");
        }
      } catch (error) {
        console.error("Lỗi kiểm tra thanh toán:", error);
        setStatus("fail");
      }
    };

    if (sessionId) {
      checkOrderStatus();
    }
  }, [sessionId]);

  return (
    <Container className="py-5 text-center">
      <h2 className="mb-4">Kết quả thanh toán</h2>
      {status === "loading" && (
        <>
          <Spinner animation="border" role="status" />
          <div className="mt-3">Đang kiểm tra trạng thái đơn hàng...</div>
        </>
      )}
      {status === "success" && (
        <Alert variant="success">
          🎉 Thanh toán thành công! Cảm ơn bạn đã đặt hàng.
        </Alert>
      )}
      {status === "fail" && (
        <Alert variant="danger">
          ❌ Thanh toán chưa hoàn tất hoặc đơn hàng không hợp lệ.
        </Alert>
      )}
    </Container>
  );
}
