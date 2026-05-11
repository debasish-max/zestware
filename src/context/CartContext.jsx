import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      // Check for same product name AND same size
      const found = prev.find((i) => 
        i.name === product.name && i.selectedSize === product.selectedSize
      );
      
      if (found) {
        return prev.map((i) =>
          (i.name === product.name && i.selectedSize === product.selectedSize)
            ? { ...i, qty: i.qty + (product.qty || 1) }
            : i
        );
      }
      // Use the qty passed from product page, or default to 1
      return [...prev, { ...product, qty: product.qty || 1 }];
    });
  };

  const increaseQty = (name, selectedSize) => {
    setCart((prev) =>
      prev.map((i) =>
        (i.name === name && i.selectedSize === selectedSize) 
          ? { ...i, qty: i.qty + 1 } 
          : i
      )
    );
  };

  const decreaseQty = (name, selectedSize) => {
    setCart((prev) =>
      prev
        .map((i) =>
          (i.name === name && i.selectedSize === selectedSize) 
            ? { ...i, qty: i.qty - 1 } 
            : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (name, selectedSize) => {
    setCart((prev) => prev.filter((i) => !(i.name === name && i.selectedSize === selectedSize)));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeItem,
        clearCart,
        uniqueCount: cart.length,
        total: cart.reduce((s, i) => s + i.price * i.qty, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
