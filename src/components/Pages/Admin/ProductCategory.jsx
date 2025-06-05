import React, { useState, useEffect } from 'react';
import ProductCategoryService from '../../../Services/ProductCategoryService';
import { Url } from '../../../constants/config.js';

const ProductCategory = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [currentCategory, setCurrentCategory] = useState({
        categoryId: null,
        categoryName: '',
        description: '',
        imageUrl: '',
        imageFile: null
    });
    const [imagePreview, setImagePreview] = useState(null);

    const emptyCategory = {
        categoryId: null,
        categoryName: '',
        description: '',
        imageUrl: '',
        imageFile: null
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await ProductCategoryService.getAllCategories();
            setCategories(response.data || []);
            setFilteredCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            alert('Không thể tải danh sách danh mục sản phẩm. Vui lòng thử lại.');
        }
    };

    useEffect(() => {
        const filtered = (categories || []).filter(category =>
            (category.categoryName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
        setFilteredCategories(filtered);
        setCurrentPage(1);
    }, [searchTerm, categories]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentCategory(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra định dạng file
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                alert('Chỉ chấp nhận file ảnh định dạng JPG, JPEG, PNG, GIF');
                return;
            }

            // Kiểm tra kích thước file (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước file không được vượt quá 5MB');
                return;
            }

            setCurrentCategory(prevState => ({
                ...prevState,
                imageFile: file
            }));

            // Tạo preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setCurrentCategory({ ...emptyCategory });
        setImagePreview(null);
    };

    const handleAddCategory = async () => {
        try {
            const formData = new FormData();
            formData.append('categoryName', currentCategory.categoryName);
            formData.append('description', currentCategory.description);
            if (currentCategory.imageFile) {
                formData.append('imageFile', currentCategory.imageFile);
            }

            await ProductCategoryService.createCategory(formData);
            setShowAddModal(false);
            resetForm();
            fetchCategories();
            alert('Thêm danh mục sản phẩm thành công!');
        } catch (error) {
            console.error('Error adding category:', error);
            alert(`Không thể thêm danh mục sản phẩm: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEditCategory = async () => {
        try {
            const formData = new FormData();
            formData.append('categoryId', currentCategory.categoryId);
            formData.append('categoryName', currentCategory.categoryName);
            formData.append('description', currentCategory.description);
            if (currentCategory.imageFile) {
                formData.append('imageFile', currentCategory.imageFile);
            }

            await ProductCategoryService.updateCategory(currentCategory.categoryId, formData);
            setShowEditModal(false);
            resetForm();
            fetchCategories();
            alert('Cập nhật danh mục sản phẩm thành công!');
        } catch (error) {
            console.error('Error updating category:', error);
            alert(`Không thể cập nhật danh mục sản phẩm: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteCategory = async () => {
        try {
            await ProductCategoryService.deleteCategory(currentCategory.categoryId);
            setShowDeleteModal(false);
            fetchCategories();
            alert('Xóa danh mục sản phẩm thành công!');
        } catch (error) {
            console.error('Error deleting category:', error);
            alert(`Không thể xóa danh mục sản phẩm: ${error.response?.data?.message || error.message}`);
        }
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (category) => {
        setCurrentCategory({
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            description: category.description,
            imageUrl: category.imageUrl,
            imageFile: null
        });
        setImagePreview(category.imageUrl);
        setShowEditModal(true);
    };

    const openDeleteModal = (category) => {
        setCurrentCategory(category);
        setShowDeleteModal(true);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentItems = (filteredCategories || []).slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((filteredCategories || []).length / pageSize);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Danh sách danh mục sản phẩm</h1>
                <button
                    onClick={openAddModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Thêm danh mục
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên danh mục..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 border">#</th>
                            <th className="py-2 px-4 border">Mã danh mục</th>
                            <th className="py-2 px-4 border">Ảnh</th>
                            <th className="py-2 px-4 border">Tên danh mục</th>
                            <th className="py-2 px-4 border">Mô tả</th>
                            <th className="py-2 px-4 border">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems && currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <tr key={item.categoryId || index} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border text-center">{indexOfFirstItem + index + 1}</td>
                                    <td className="py-2 px-4 border text-center">{item.categoryId}</td>
                                    <td className="py-2 px-4 border text-center">
                                        {item.imageUrl ? (
                                            <img 
                                                src={Url+item.imageUrl} 
                                                alt={item.categoryName}
                                                className="w-12 h-12 object-cover rounded mx-auto"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-200 rounded mx-auto flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">No Image</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border">{item.categoryName || 'N/A'}</td>
                                    <td className="py-2 px-4 border">
                                        <div className="max-w-xs truncate" title={item.description}>
                                            {item.description || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border">
                                        <div className="flex space-x-2 justify-center">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(item)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                                    {searchTerm ? 'Không tìm thấy danh mục nào phù hợp' : 'Chưa có danh mục nào'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                            currentPage === 1
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
                                        className={`px-3 py-2 rounded-lg transition-colors ${
                                            isCurrentPage
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
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                            currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Sau
                    </button>
                </div>
            )}

            {/* Modal Thêm Danh Mục */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Thêm danh mục sản phẩm mới</h2>
                        <div>
                            <div className="mb-4">
                                <label htmlFor="add-category-name" className="block mb-1 font-medium">Tên danh mục *</label>
                                <input
                                    id="add-category-name"
                                    type="text"
                                    name="categoryName"
                                    value={currentCategory.categoryName}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="add-category-image" className="block mb-1 font-medium">Ảnh danh mục</label>
                                <input
                                    id="add-category-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-sm text-gray-500 mt-1">Chấp nhận file JPG, PNG, GIF. Tối đa 5MB</p>
                                
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="w-24 h-24 object-cover rounded border"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="add-category-description" className="block mb-1 font-medium">Mô tả</label>
                                <textarea
                                    id="add-category-description"
                                    name="description"
                                    value={currentCategory.description}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="4"
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
                                    onClick={handleAddCategory}
                                    disabled={!currentCategory.categoryName.trim()}
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Sửa Danh Mục */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Sửa danh mục sản phẩm</h2>
                        <div>
                            <div className="mb-4">
                                <label htmlFor="edit-category-name" className="block mb-1 font-medium">Tên danh mục *</label>
                                <input
                                    id="edit-category-name"
                                    type="text"
                                    name="categoryName"
                                    value={currentCategory.categoryName}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="edit-category-image" className="block mb-1 font-medium">Ảnh danh mục</label>
                                <input
                                    id="edit-category-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-sm text-gray-500 mt-1">Chấp nhận file JPG, PNG, GIF. Tối đa 5MB</p>
                                
                                {imagePreview && (
                                    <div className="mt-2">
                                        <p className="text-sm font-medium mb-1">Ảnh hiện tại:</p>
                                        <img 
                                            src={imagePreview} 
                                            alt="Current" 
                                            className="w-24 h-24 object-cover rounded border"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="edit-category-description" className="block mb-1 font-medium">Mô tả</label>
                                <textarea
                                    id="edit-category-description"
                                    name="description"
                                    value={currentCategory.description}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="4"
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
                                    onClick={handleEditCategory}
                                    disabled={!currentCategory.categoryName.trim()}
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xóa Danh Mục */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
                        <div className="mb-4">
                            {currentCategory.imageUrl && (
                                <img 
                                    src={currentCategory.imageUrl} 
                                    alt={currentCategory.categoryName}
                                    className="w-16 h-16 object-cover rounded mx-auto mb-2"
                                />
                            )}
                            <p className="text-center">
                                Bạn có chắc chắn muốn xóa danh mục "<strong>{currentCategory.categoryName}</strong>"?
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                onClick={handleDeleteCategory}
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

export default ProductCategory;