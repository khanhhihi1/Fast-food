"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import Link from "next/link";

function PaymentSuccessContent() {
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
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );
        const data = await res.json();
        if (!data.status) throw new Error("Không tìm thấy session");

        const orderId = data.session.metadata.orderId;

        // B2: Kiểm tra trạng thái đơn hàng
        const orderRes = await fetch(
          `http://localhost:5000/orders/${orderId}/status`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );
        const orderData = await orderRes.json();

        console.log("Kiểm tra đơn:", orderData);

        if (orderData.status && orderData.result.isPaid === true) {
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
          🎉 Thanh toán thành công! Cảm ơn bạn đã đặt hàng. Bạn có thể xem đơn
          hàng tại{" "}
          <Link href="/account" className="fw-bold text-decoration-underline">
            trang cá nhân
          </Link>
          .
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

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Đang tải...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
