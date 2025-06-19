"use client";
import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";

function Post() {
  interface PostType {
    id: number;
    name: string;
    price: number;
  }
  const [Posts, setPost] = useState<PostType[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "https://be-friedking.onrender.com/products"
      );
      const data = await response.json();
      console.log("data:", data);
      setPost(data);
    };
    fetchData();
  }, []);
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>ID</th>
          <th>First Name</th>
          <th>Last Name</th>
        </tr>
      </thead>
      <tbody>
        {Posts.map((post) => {
          return (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td>{post.name}</td>
              <td>{post.price}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default Post;
