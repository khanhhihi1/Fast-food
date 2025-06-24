import { useEffect, useState } from "react";

export interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string;
}

// kiểm tra người dùng đã đăng nhập hay chưa
// nếu đã đăng nhập thì trả về thông tin người dùng, nếu chưa thì trả về null
// sử dụng hook này trong các component để lấy thông tin người dùng
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/users/profile", {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.status) {
          setUser(data.result);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  return { user, loading };
}
