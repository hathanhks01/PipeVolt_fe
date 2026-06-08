import React, { useState, useEffect } from 'react';
import BrandService from '../../../Services/BrandService';
import { showAlert } from '../../../common/ui';

const Brand = () => {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20); // Số lượng thương hiệu mỗi trang
  const [currentBrand, setCurrentBrand] = useState({
    brandId: null,
    brandName: ''
  });

  const emptyBrand = {
    brandId: null,
    brandName: ''
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await BrandService.getAllBrands();
      setBrands(response.data || []);
      setFilteredBrands(response.data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      showAlert('Không thể tải danh sách thương hiệu. Vui lòng thử lại.', 'error');
    }
  };

  useEffect(() => {
    const filtered = brands.filter(brand =>
      (brand.brandName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setFilteredBrands(filtered);
    setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm thay đổi
  }, [searchTerm, brands]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentBrand(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const resetForm = () => {
    setCurrentBrand({ ...emptyBrand });
  };

  const handleAddBrand = async () => {
    try {
      const brandData = {
        brandName: currentBrand.brandName
      };

      await BrandService.createBrand(brandData);
      setShowAddModal(false);
      resetForm();
      fetchBrands();
      showAlert('Thêm thương hiệu thành công!', 'success');
    } catch (error) {
      console.error('Error adding brand:', error);
      showAlert(`Không thể thêm thương hiệu: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleEditBrand = async () => {
    try {
      const brandData = {
        brandName: currentBrand.brandName
      };

      await BrandService.updateBrand(currentBrand.brandId, brandData);
      setShowEditModal(false);
      resetForm();
      fetchBrands();
      showAlert('Cập nhật thương hiệu thành công!', 'success');
    } catch (error) {
      console.error('Error updating brand:', error);
      showAlert(`Không thể cập nhật thương hiệu: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleDeleteBrand = async () => {
    try {
      await BrandService.deleteBrand(currentBrand.brandId);
      setShowDeleteModal(false);
      fetchBrands();
      showAlert('Xóa thương hiệu thành công!', 'success');
    } catch (error) {
      console.error('Error deleting brand:', error);
      showAlert(`Không thể xóa thương hiệu: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (brand) => {
    setCurrentBrand({
      brandId: brand.brandId,
      brandName: brand.brandName
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (brand) => {
    setCurrentBrand(brand);
    setShowDeleteModal(true);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredBrands.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBrands.length / pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="p-4" style={{ fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .admin-table tr:hover td { background: #f0f9ff !important; }
        .action-btn { background: none; border: none; cursor: pointer; font-size: 13px; font-weight: 600; padding: 5px 10px; border-radius: 6px; transition: background 0.15s; }
        .action-btn.edit { color: #3b82f6; } .action-btn.edit:hover { background: #eff6ff; }
        .action-btn.delete { color: #ef4444; } .action-btn.delete:hover { background: #fef2f2; }
      `}</style>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách thương hiệu</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thêm thương hiệu
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên thương hiệu..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['#', 'Mã thương hiệu', 'Tên thương hiệu', 'Thao tác'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={item.brandId || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '13px 16px', color: '#475569', fontSize: '14px' }}>{indexOfFirstItem + index + 1}</td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ fontWeight: '600', color: '#1e293b', fontFamily: 'monospace', fontSize: '13px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                    #{item.brandId}
                  </span>
                </td>
                <td style={{ padding: '13px 16px', color: '#334155', fontSize: '14px', fontWeight: '600' }}>{item.brandName || 'N/A'}</td>
                <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => openEditModal(item)}
                    className="action-btn edit"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => openDeleteModal(item)}
                    className="action-btn delete"
                  >
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border transition-colors ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            Trước
          </button>
          <div className="flex space-x-1">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === currentPage;
              if (
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${isCurrentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                );
              }
              if (
                (page === 2 && currentPage > 4) ||
                (page === totalPages - 1 && currentPage < totalPages - 3)
              ) {
                return (
                  <span key={page} className="px-3 py-2 text-gray-400">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg border transition-colors ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            Sau
          </button>
        </div>
      )}

      {/* Modal Thêm Thương Hiệu */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Thêm thương hiệu mới</h2>
            <div>
              <div className="mb-4">
                <label htmlFor="add-brand-name" className="block mb-1 font-medium">Tên thương hiệu</label>
                <input
                  id="add-brand-name"
                  type="text"
                  name="brandName"
                  value={currentBrand.brandName}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  onClick={handleAddBrand}
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa Thương Hiệu */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Sửa thương hiệu</h2>
            <div>
              <div className="mb-4">
                <label htmlFor="edit-brand-name" className="block mb-1 font-medium">Tên thương hiệu</label>
                <input
                  id="edit-brand-name"
                  type="text"
                  name="brandName"
                  value={currentBrand.brandName}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  onClick={handleEditBrand}
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xóa Thương Hiệu */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa thương hiệu "{currentBrand.brandName}"?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={handleDeleteBrand}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brand;