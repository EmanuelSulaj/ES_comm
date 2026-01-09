import React from 'react';
import { useState, useEffect } from 'react'; 
import AddProductModal from './AddProductModal';

function ProductList() {
  const [products, setProducts] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // 1. Define the initial form state
  const initialFormState = {
    name: '',
    description: '',
    price: '',
    offerPrice: '',
    category: 'Women',
    image: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // 2. Fetch Products
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) return;
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 3. FIX: Define handleCloseModal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditId(null);
    setFormData(initialFormState); // Reset form
  };

  // 4. Handle Edit Button Click
  const handleEditClick = (product) => {
    setEditId(product._id);
    setIsEditing(true);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      offerPrice: product.offerPrice || '',
      category: product.category,
      image: product.image
    });
    setIsModalOpen(true);
  };

  // 5. FIX: Define handleSubmit (Handles both Add and Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Switch URL and Method based on mode
    const url = isEditing 
      ? `http://localhost:5000/api/products/${editId}` 
      : 'http://localhost:5000/api/products';
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchProducts(); // Refresh the list
        handleCloseModal(); // Close and reset
        alert(isEditing ? "Product updated!" : "Product added!");
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setProducts(products.filter(item => item._id !== productId));
          alert("Product removed!");
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <div className="admin-content">
      <div className="content-header">
        <h1 className="page-title">Products</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          Add New Product
        </button>
      </div>

      <div className="products-table-container">
        <table className="products-table"> 
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}> 
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>${product.price}</td>
                <td>{product.status || 'Active'}</td>
                <td className="actions-buttons"> 
                  <button className="action-btn edit" onClick={() => handleEditClick(product)}>
                    Edit
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(product._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table> 
      </div>

      <AddProductModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
      />
    </div>
  );
}

export default ProductList;