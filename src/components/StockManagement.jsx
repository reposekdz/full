import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Package, TrendingUp, AlertTriangle, Plus, Search, Filter,
  Edit, Trash2, ArrowUpCircle, ArrowDownCircle, History, Download
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/stock';

const StockManagement = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    item_code: '', item_name: '', category: 'Stationery', quantity: 0,
    unit: '', unit_price: 0, reorder_level: 10, supplier: '', location: ''
  });
  const [transactionData, setTransactionData] = useState({
    transaction_type: 'in', quantity: 0, notes: ''
  });

  const categories = ['Stationery', 'Electronics', 'Furniture', 'Sports', 'Laboratory', 'Kitchen', 'Cleaning', 'Medical', 'Other'];

  useEffect(() => {
    fetchData();
  }, [search, category]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, statsRes] = await Promise.all([
        axios.get(API_URL, { params: { search, category } }),
        axios.get(`${API_URL}/stats`)
      ]);
      setItems(itemsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await axios.put(`${API_URL}/${selectedItem.id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      setShowAddModal(false);
      setSelectedItem(null);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Error: ' + error.response?.data?.error || error.message);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/transaction`, {
        stock_item_id: selectedItem.id,
        ...transactionData
      });
      setShowTransactionModal(false);
      setSelectedItem(null);
      setTransactionData({ transaction_type: 'in', quantity: 0, notes: '' });
      fetchData();
    } catch (error) {
      alert('Error: ' + error.response?.data?.error || error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      item_code: '', item_name: '', category: 'Stationery', quantity: 0,
      unit: '', unit_price: 0, reorder_level: 10, supplier: '', location: ''
    });
  };

  const getStockBadge = (item) => {
    if (item.quantity === 0) return <span className="badge-danger">Out of Stock</span>;
    if (item.quantity <= item.reorder_level) return <span className="badge-warning">Low Stock</span>;
    return <span className="badge-success">In Stock</span>;
  };

  return (
    <div className="stock-management">
      {/* Header */}
      <div className="header">
        <h1><Package size={32} /> Stock Management</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus size={20} /> Add Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <Box size={40} />
          <div>
            <h3>{stats.total_items || 0}</h3>
            <p>Total Items</p>
          </div>
        </div>
        <div className="stat-card green">
          <TrendingUp size={40} />
          <div>
            <h3>{(stats.total_value || 0).toLocaleString()} RWF</h3>
            <p>Total Value</p>
          </div>
        </div>
        <div className="stat-card orange">
          <AlertTriangle size={40} />
          <div>
            <h3>{stats.low_stock || 0}</h3>
            <p>Low Stock</p>
          </div>
        </div>
        <div className="stat-card red">
          <Package size={40} />
          <div>
            <h3>{stats.out_of_stock || 0}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Items Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{textAlign: 'center'}}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="9" style={{textAlign: 'center'}}>No items found</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.item_code}</strong></td>
                  <td>{item.item_name}</td>
                  <td><span className="category-badge">{item.category}</span></td>
                  <td><strong>{item.quantity}</strong></td>
                  <td>{item.unit}</td>
                  <td>{item.unit_price.toLocaleString()} RWF</td>
                  <td>{(item.quantity * item.unit_price).toLocaleString()} RWF</td>
                  <td>{getStockBadge(item)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon green" onClick={() => { setSelectedItem(item); setShowTransactionModal(true); }} title="Stock In">
                        <ArrowUpCircle size={18} />
                      </button>
                      <button className="btn-icon orange" onClick={() => { setSelectedItem(item); setTransactionData({...transactionData, transaction_type: 'out'}); setShowTransactionModal(true); }} title="Stock Out">
                        <ArrowDownCircle size={18} />
                      </button>
                      <button className="btn-icon blue" onClick={() => { setSelectedItem(item); setFormData(item); setShowAddModal(true); }} title="Edit">
                        <Edit size={18} />
                      </button>
                      <button className="btn-icon red" onClick={() => handleDelete(item.id)} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedItem ? 'Edit Item' : 'Add New Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input type="text" placeholder="Item Code" value={formData.item_code} onChange={(e) => setFormData({...formData, item_code: e.target.value})} required disabled={selectedItem} />
                <input type="text" placeholder="Item Name" value={formData.item_name} onChange={(e) => setFormData({...formData, item_name: e.target.value})} required />
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input type="number" placeholder="Quantity" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} required />
                <input type="text" placeholder="Unit (e.g., Pcs, Box)" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} required />
                <input type="number" placeholder="Unit Price" value={formData.unit_price} onChange={(e) => setFormData({...formData, unit_price: parseFloat(e.target.value)})} required />
                <input type="number" placeholder="Reorder Level" value={formData.reorder_level} onChange={(e) => setFormData({...formData, reorder_level: parseInt(e.target.value)})} required />
                <input type="text" placeholder="Supplier" value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} />
                <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowAddModal(false); setSelectedItem(null); }}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Stock Transaction - {selectedItem?.item_name}</h2>
            <form onSubmit={handleTransaction}>
              <div className="form-group">
                <label>Transaction Type</label>
                <select value={transactionData.transaction_type} onChange={(e) => setTransactionData({...transactionData, transaction_type: e.target.value})} required>
                  <option value="in">Stock In</option>
                  <option value="out">Stock Out</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" value={transactionData.quantity} onChange={(e) => setTransactionData({...transactionData, quantity: parseInt(e.target.value)})} required min="1" />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={transactionData.notes} onChange={(e) => setTransactionData({...transactionData, notes: e.target.value})} rows="3" placeholder="Optional notes..."></textarea>
              </div>
              <div className="info-box">
                <p>Current Stock: <strong>{selectedItem?.quantity}</strong></p>
                <p>After Transaction: <strong>{transactionData.transaction_type === 'in' ? selectedItem?.quantity + transactionData.quantity : selectedItem?.quantity - transactionData.quantity}</strong></p>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowTransactionModal(false); setSelectedItem(null); }}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .stock-management {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .header h1 {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 32px;
          color: #1a1a1a;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .stat-card.blue { border-left: 4px solid #3b82f6; }
        .stat-card.green { border-left: 4px solid #10b981; }
        .stat-card.orange { border-left: 4px solid #f59e0b; }
        .stat-card.red { border-left: 4px solid #ef4444; }
        .stat-card h3 { font-size: 28px; margin: 0; }
        .stat-card p { margin: 5px 0 0; color: #666; }
        .filters {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }
        .search-box {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-box svg {
          position: absolute;
          left: 15px;
          color: #666;
        }
        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 45px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }
        select {
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          min-width: 200px;
        }
        .table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 15px;
          border-bottom: 1px solid #f0f0f0;
        }
        tr:hover {
          background: #f9fafb;
        }
        .category-badge {
          background: #e0e7ff;
          color: #4f46e5;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        .badge-success {
          background: #d1fae5;
          color: #065f46;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        .badge-warning {
          background: #fef3c7;
          color: #92400e;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        .badge-danger {
          background: #fee2e2;
          color: #991b1b;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        .btn-icon {
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .btn-icon.green { background: #d1fae5; color: #065f46; }
        .btn-icon.orange { background: #fed7aa; color: #92400e; }
        .btn-icon.blue { background: #dbeafe; color: #1e40af; }
        .btn-icon.red { background: #fee2e2; color: #991b1b; }
        .btn-icon:hover { transform: scale(1.1); }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }
        .btn-secondary {
          background: #e5e7eb;
          color: #374151;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: white;
          padding: 30px;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal h2 {
          margin: 0 0 20px;
          color: #1a1a1a;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #374151;
        }
        input, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        .info-box {
          background: #f0f9ff;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .info-box p {
          margin: 5px 0;
          color: #1e40af;
        }
        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
};

export default StockManagement;
