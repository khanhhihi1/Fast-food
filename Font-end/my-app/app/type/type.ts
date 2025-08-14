export interface PostType {
  _id: string;
  name: string;
  image: string;
  categoryId?: string | { _id: string; name: string };
  category: string; 
  quantity: number;
  taste?: string[] ;
  description: string;
  sizes: {
    name: string;
    price: {
      original: number;
      discount?: number;
    };
  }[];
  status?: boolean;
}
