import React, { useState } from "react";
import AddCategoryModal from "./AddCategoryModal"; //

function Categories() {
  // 1. You must use 'useState' for categories so 'setCategories' exists
  const [categories, setCategories] = useState([
    { id: 1, name: 'Electronics', count: 12, description: 'Electronic devices and gadgets' },
    { id: 2, name: 'Clothing', count: 28, description: 'Fashion and apparel' },
    { id: 3, name: 'Accessories', count: 15, description: 'Fashion accessories and jewelry' },
    { id: 4, name: 'Home & Living', count: 8, description: 'Home decor and furniture' }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. This is the function name we will use below
  const handleAddCategory = (name) => {
    const newCategory = {
      id: Date.now(),
      name: name,
      count: 0,
      description: 'Newly created category'
    };
    setCategories([...categories, newCategory]);
  };

  return (
    <> 
      <div className="admin-content">
        <div className="content-header">
          <h1>Categories</h1>
          {/* 3. Added onClick to open the modal */}
          <button 
            className="btn-primary" 
            onClick={() => setIsModalOpen(true)}
          >
            Add New Category
          </button>
        </div>
        
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-header">
                <h3>{category.name}</h3>
                <div className="category-actions">
                  <button className="action-btn-icon edit">Edit</button>
                  <button className="action-btn-icon delete">Delete</button>
                </div>
              </div>
              <p className="category-count">{category.count} products</p>
              <div className="category-description">{category.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. FIXED: Changed 'handleYourAddLogic' to 'handleAddCategory' */}
      <AddCategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddCategory={handleAddCategory} 
      />
    </> 
  );
}

export default Categories;