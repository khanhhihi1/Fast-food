import { useState } from "react";

const Counter = () => {
  const [quantity, setQuantity] = useState(1);

  const decrease = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const increase = () => {
    setQuantity((prev) => prev + 1);
  };

  const styles = {
    container: { display: "flex", alignItems: "center" },
    button: {
      width: "32px",
      height: "32px",
      background: "white",
      cursor: "pointer",
      fontWeight: "bold",
    },
    quantity: { margin: "0 25px", fontSize: "15px", fontWeight: "bold" },
  };

  return (
    <div style={styles.container}>
      <button onClick={decrease} style={styles.button}>
        -
      </button>
      <span style={styles.quantity}>{quantity}</span>
      <button onClick={increase} style={styles.button}>
        +
      </button>
    </div>
  );
};

export default Counter;
