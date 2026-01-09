import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { useCart } from '../Context/CartContext';

const Success = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    if (clearCart) clearCart();
  }, []);

  return (
    <div className="success-page" style={{ 
      textAlign: 'center', 
      marginTop: '150px', 
      position: 'relative', // Ensure it's not behind anything
      zIndex: 1 
    }}>
      <div style={{ fontSize: '60px', color: '#4BB543' }}>✓</div>
      <h1>Payment Successful!</h1>
      <p>Your order is confirmed.</p>
      
      {/* Option A: Using navigate hook */}
      <button 
        onClick={() => navigate('/')} 
        style={{ padding: '10px 20px', cursor: 'pointer', zIndex: 10 }}
      >
        Continue Shopping
      </button>

      {/* Option B: Using Link (often more reliable) */}
      <div style={{ marginTop: '20px' }}>
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
};

export default Success;