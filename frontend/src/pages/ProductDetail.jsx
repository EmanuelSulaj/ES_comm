import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        setLoading(true);
        // 1. Fetch the specific product from Backend
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);

        // 2. Fetch all products to filter for "Related" items
        const allRes = await fetch(`http://localhost:5000/api/products`);
        const allData = await allRes.json();
        const related = allData
          .filter(p => p._id !== id && p.category === data.category)
          .slice(0, 4);
        setRelatedProducts(related);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
    window.scrollTo(0, 0); // Scroll to top when ID changes
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleBuyNow = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: [{
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: quantity
        }]
      }),
    });

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url; // Redirects to Stripe
    }
  } catch (error) {
    console.error("Checkout error:", error);
  }
};

  if (loading) return <div className="loading-state">Loading Product...</div>;

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <button onClick={() => navigate(-1)} className="back-button">← Back</button>

        <div className="product-detail-content">
          {/* Main Product Image */}
          <div className="product-images">
            <div className="main-image">
              <img src={product.image} alt={product.name} />
            </div>
          </div>

          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-price-section">
              <span className="product-price">${product.price}</span>
              <span className="stock-status in-stock">✓ Available in {product.category}</span>
            </div>

            <p className="product-short-description">{product.description}</p>

            <div className="quantity-section">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="quantity-btn">−</button>
                <span className="quantity-value">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="quantity-btn">+</button>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                onClick={handleAddToCart} 
                className={`add-to-cart-btn ${showSuccess ? 'success' : ''}`}
              >
                {showSuccess ? "Added! ✓" : "Add to Cart"}
              </button>
              <button className="buy-now-btn" onClick={handleBuyNow}>Buy It Now</button>
            </div>

            {/* Tabs Section */}
            <div className="product-tabs">
              <button className={`tab ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
              <button className={`tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details</button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'description' ? <p>{product.description}</p> : <p>Category: {product.category}</p>}
            </div>
          </div>
        </div>

        {/* Dynamic Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section">
            <h2 className="related-products-title">Related Products</h2>
            <div className="related-products-grid">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;