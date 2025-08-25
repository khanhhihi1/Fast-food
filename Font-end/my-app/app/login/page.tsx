"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
<<<<<<< HEAD
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
=======
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body = new URLSearchParams();
    body.append("username", formData.username);
    body.append("password", formData.password);

    try {
<<<<<<< HEAD
      const res = await fetch(`${API_URL}/users/login`, {
=======
      const res = await fetch("http://localhost:5000/users/login", {
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.status) {
        alert(data.message || "Đăng nhập thất bại!");
        return;
      }

      alert("Đăng nhập thành công!");
<<<<<<< HEAD
=======
      // ✅ Điều hướng theo vai trò
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
      if (data.result.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đăng nhập!");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 authentication-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3c67a4] to-[#2d4a7a]" />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Illustration Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          {/* Illustration */}
          <div className="mb-8 relative illustration-float">
            <div className="w-80 h-80 relative">
              {/* Device Frame */}
              <div className="absolute top-8 left-8 w-64 h-48 bg-gray-800 rounded-lg shadow-2xl transform rotate-3">
                <div className="w-full h-8 bg-gray-700 rounded-t-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <div className="p-4 bg-white rounded-b-lg h-40">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full mb-2 flex items-center justify-center">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full" />
                    </div>
                    <div className="text-xs text-gray-800 font-semibold mb-2">
                      LOGIN
                    </div>
                    <div className="w-32 h-2 bg-gray-200 rounded mb-1" />
                    <div className="w-32 h-2 bg-gray-200 rounded mb-3" />
                    <div className="w-20 h-6 bg-yellow-400 rounded text-xs flex items-center justify-center text-white font-semibold">
                      LOGIN
                    </div>
                  </div>
                </div>
              </div>

              {/* Character */}
              <div className="absolute bottom-0 right-8 w-32 h-40">
                <div className="w-full h-full relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-400 rounded-full" />
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-yellow-400 rounded-lg" />
                  <div className="absolute top-8 left-2 w-6 h-2 bg-yellow-400 rounded" />
                  <div className="absolute top-8 right-2 w-6 h-2 bg-yellow-400 rounded" />
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-gray-800 rounded-b-full" />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gray-700 rounded" />
                </div>
              </div>

              {/* Plant */}
              <div className="absolute bottom-0 left-0 w-16 h-20">
                <div className="w-8 h-12 bg-yellow-600 rounded-t-full mx-auto" />
                <div className="w-12 h-8 bg-gray-800 rounded mx-auto" />
              </div>
            </div>
          </div>

          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Đăng nhập</h2>
            <p className="text-blue-100 text-sm leading-relaxed opacity-80">
              Chào mừng đến với nền tảng Fast-Food của chúng tôi! Đăng nhập để
              quản lý dự án Fast-Food, cộng tác với chúng tôi và truy cập bảng
              điều khiển của bạn..
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="mb-8">
            <img
              src="https://ext.same-assets.com/2464927738/3409472389.png"
              alt="Sparic"
              width={136}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">Đăng nhập</h1>
            <p className="text-gray-600">Fast-Food</p>
          </div>

          {/* Social Sign In */}
          <div className="space-y-4">
            <div className="flex space-x-3">
              <Button
                variant="outline-secondary"
                className="flex-1 justify-center"
              >
                <span className="mr-2">🌐</span> Đăng nhập với Google
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">OR</span>
            </div>
          </div>

          {/* Sign In Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tên đăng nhập
              </label>
              <Form.Control
                id="username"
                name="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Form.Control
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#3c67a4] hover:bg-[#2d4a7a] border-0 text-white"
            >
              Đăng nhập
            </Button>

            <div className="text-center text-sm text-gray-600 mt-2">
              Bạn chưa có tài khoản?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Đăng ký
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
