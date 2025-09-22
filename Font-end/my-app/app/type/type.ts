export interface PostType {
  _id: string;
  name: string;
  image: string;
  categoryId?: string | { _id: string; name: string };
  category: string | { _id: string; name: string };
   quantity: number;
  taste?: string[];
  description: string;
  sizes: {
    name: string;
    price: {
      original: number;
      discount?: number;
    };
  }[];
  status?: boolean;
  isDaily?: boolean; // Mới: Loại sản phẩm daily
  dailyInitialQuantity?: number; // Mới: Số lượng ban đầu cho daily
  soldYesterday?: number;         // 👈 Thêm trường này để khớp API
  salesStatus?: "slow" | "best" | "normal";
}
