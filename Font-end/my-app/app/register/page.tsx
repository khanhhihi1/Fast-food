"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }

    const submitData = {
      name: formData.fullName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    try {
      const response = await fetch("http://localhost:5000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const contentType = response.headers.get("content-type");

      let data: any;
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Không phải JSON:", text);
        throw new Error("Phản hồi không hợp lệ");
      }

      if (!response.ok) {
        alert(data.message || "Đăng ký thất bại!");
        return;
      }

      alert("🎉 Đăng ký thành công! Chuyển về trang đăng nhập!");
      // Optionally redirect to login
      window.location.href = "/login";
    } catch (error: any) {
      console.error("Lỗi đăng ký:", error);
      alert(error.message || "Đã có lỗi xảy ra!");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 authentication-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3c67a4] to-[#2d4a7a]" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <h2 className="text-3xl font-bold mb-4">Chào mừng!</h2>
          <p className="text-blue-100 text-sm text-center">
            Tham gia nền tảng Fast-Food để quản lý dự án, cộng tác và truy cập
            các tính năng quản trị.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="mb-8">
            <img
              src="https://ext.same-assets.com/2464927738/3409472389.png"
              alt="Logo"
              width={136}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">Đăng ký</h1>
            <p className="text-gray-600">
              Tham gia ngay để trải nghiệm dịch vụ.
            </p>
          </div>

          <Form onSubmit={handleSubmit} className="space-y-4">
            <Form.Group controlId="formFullName">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                placeholder="Nhập họ và tên"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formUsername">
              <Form.Label>Tên đăng nhập</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Label>Mật khẩu</Form.Label>
              <div className="relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center bg-transparent border-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </Form.Group>

            <Form.Group controlId="formConfirmPassword">
              <Form.Label>Nhập lại mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Xác nhận lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-full bg-[#3c67a4] hover:bg-[#2d4a7a] border-0"
            >
              Đăng ký
            </Button>

            <div className="text-center text-sm text-gray-600 mt-2">
              Bạn đã có tài khoản?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Đăng nhập
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
