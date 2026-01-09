import React from 'react';  
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import './ProductCard.css';

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const renderStars = (rating) => {
    const productRating = rating || 0; 
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < productRating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  const handleClick = () => {
    // 🚨 FIX: Changed .id to ._id
    navigate(`/product/${product._id}`); 
  };

  const handleAdd = (e) => {
    e.stopPropagation(); 
    addToCart(product);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          {renderStars(product.rating)}
        </div>
        <div className="product-price">${product.price}</div>
        {/* Optional: Add an "Add to Cart" button back if you have it in your CSS */}
        <button className="add-btn" onClick={handleAdd}>+</button>
      </div>
    </div>
  );
}

export default ProductCard;