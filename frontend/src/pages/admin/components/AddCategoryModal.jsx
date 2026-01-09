import React, { useState } from 'react';

function AddCategoryModal({ isOpen, onClose, onAddCategory }) {
  const [categoryName, setCategoryName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onAddCategory(categoryName);
      setCategoryName(''); // Clear input for next time
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="center-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top-bar">
          <span>Add New Category</span>
          {/* Bold and Large X for clear exit */}
          <button className="close-x" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category Name</label>
              <input 
                type="text" 
                placeholder="Enter category name" 
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required 
              />
            </div>

            <div className="modal-footer-right">
              <button type="submit" className="btn-add-large">ADD CATEGORY</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCategoryModal;