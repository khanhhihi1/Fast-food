"use client";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";

interface CartContextType {
  cartCount: number;
  setCartCount: React.Dispatch<React.SetStateAction<number>>;
  favoriteCount: number;
  setFavoriteCount: React.Dispatch<React.SetStateAction<number>>;
  refreshCart: () => Promise<void>;
  refreshFavorite: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // gọi API lấy giỏ hàng
  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/cart", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.status) {
        const totalQuantity = data.result.items.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        );
        setCartCount(totalQuantity);
      }
    } catch (err) {
      console.error("Lỗi refreshCart:", err);
    }
  }, []);

  // gọi API lấy danh sách yêu thích
  const refreshFavorite = useCallback(async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/favoriteProduct/favorites",
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok && data.status) {
        setFavoriteCount(data.result.length); // tuỳ API
      }
    } catch (err) {
      console.error("Lỗi refreshFavorite:", err);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        setCartCount,
        favoriteCount,
        setFavoriteCount,
        refreshCart,
        refreshFavorite,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
