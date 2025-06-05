import React, { useState, useEffect, useRef } from 'react';
import ProductService from '../../../Services/ProductService';
import BrandService from '../../../Services/BrandService';
import ProductCategoryService from '../../../Services/ProductCategoryService';
import { Url } from '../../../constants/config.js';

const Product = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const fileInputRef = useRef(null);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [currentProduct, setCurrentProduct] = useState({
        productId: null,
        productCode: '',
        productName: '',
        categoryId: null,
        brandId: null, 
        sellingPrice: null,
        unit: '',
        description: '',
        imageUrl: '',
        categoryName: null,
        brandName: null
    });

    const emptyProduct = {
        productId: null,
        productCode: '',
        productName: '',
        categoryId: null,
        brandId: null, 
        sellingPrice: null,
        unit: '',
        description: '',
        imageUrl: '',
        categoryName: null,
        brandName: null
    };

    useEffect(() => {
        fetchProducts();
        fetchBrands();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await ProductService.getAllProducts();
            setProducts(response.data || []);
            setFilteredProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            setLoadingBrands(true);
            const response = await BrandService.getAllBrands();
            setBrands(response.data || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoadingBrands(false);
        }
    };

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await ProductCategoryService.getAllCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    useEffect(() => {
        const filtered = products.filter(product =>
            (product.productCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (product.productName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
        setCurrentPage(1);
    }, [searchTerm, products]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct(prevState => ({
            ...prevState,
            [name]: value === '' ? null : parseInt(value, 10)
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setSelectedFile(null);
        setPreviewImage('');
    };

    const resetForm = () => {
        setCurrentProduct({...emptyProduct});
        resetFileInput();
    };

    const handleAddProduct = async () => {
        try {
            const formData = new FormData();
            if (currentProduct.productCode) formData.append('productCode', currentProduct.productCode);
            if (currentProduct.productName) formData.append('productName', currentProduct.productName);
            if (currentProduct.sellingPrice) formData.append('sellingPrice', currentProduct.sellingPrice);
            if (currentProduct.unit) formData.append('unit', currentProduct.unit);
            if (currentProduct.description) formData.append('description', currentProduct.description);
            if (currentProduct.brandId) formData.append('brandId', currentProduct.brandId);
            if (currentProduct.categoryId) formData.append('categoryId', currentProduct.categoryId);
            if (selectedFile) {
                formData.append('imageFile', selectedFile);
            }
            await ProductService.createProduct(formData);
            setShowAddModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    const handleEditProduct = async () => {
        try {
            const formData = new FormData();
            if (currentProduct.productCode) formData.append('productCode', currentProduct.productCode);
            if (currentProduct.productName) formData.append('productName', currentProduct.productName);
            if (currentProduct.sellingPrice) formData.append('sellingPrice', currentProduct.sellingPrice);
            if (currentProduct.unit) formData.append('unit', currentProduct.unit);
            if (currentProduct.description) formData.append('description', currentProduct.description);
            if (currentProduct.imageUrl) formData.append('imageUrl', currentProduct.imageUrl);
            if (currentProduct.brandId) formData.append('brandId', currentProduct.brandId);
            if (currentProduct.categoryId) formData.append('categoryId', currentProduct.categoryId);
            if (selectedFile) {
                formData.append('imageFile', selectedFile);
            }
            await ProductService.updateProduct(currentProduct.productId, formData);
            setShowEditModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const handleDeleteProduct = async () => {
        try {
            await ProductService.deleteProduct(currentProduct.productId);
            setShowDeleteModal(false);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (product) => {
        setCurrentProduct({...product});
        setPreviewImage(product.imageUrl ? `${Url}${product.imageUrl}` : '');
        setSelectedFile(null);
        setShowEditModal(true);
    };

    const openDeleteModal = (product) => {
        setCurrentProduct(product);
        setShowDeleteModal(true);
    };

    const getBrandName = (brandId) => {
        const brand = brands.find(b => b.brandId === brandId);
        return brand ? brand.brandName : 'N/A';
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.categoryId === categoryId);
        return category ? category.categoryName : 'N/A';
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Danh sách sản phẩm</h1>
                <button
                    onClick={openAddModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Thêm sản phẩm
                </button>
            </div>
            
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã sản phẩm hoặc tên sản phẩm..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="py-2 px-4 border">#</th>
                        <th className="py-2 px-4 border">Mã sản phẩm</th>
                        <th className="py-2 px-4 border">Tên sản phẩm</th>
                        <th className="py-2 px-4 border">Ảnh</th>
                        <th className="py-2 px-4 border">Giá</th>
                        <th className="py-2 px-4 border">Thương hiệu</th>
                        <th className="py-2 px-4 border">Danh mục</th>
                        <th className="py-2 px-4 border">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((item, index) => (
                        <tr key={item.productId || index} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border">{indexOfFirstItem + index + 1}</td>
                            <td className="py-2 px-4 border">{item.productCode || 'N/A'}</td>
                            <td className="py-2 px-4 border">{item.productName}</td>
                            <td className="py-2 px-4 border">
                                {item.imageUrl ? (
                                    <img className="w-20 h-20 object-cover" src={`${Url}${item.imageUrl}`} alt={item.productName} />
                                ) : (
                                    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500 text-xs">Không có ảnh</span>
                                    </div>
                                )}
                            </td>
                            <td className="py-2 px-4 border">
                                {item.sellingPrice != null ? item.sellingPrice + ' vnd' : 'N/A'}
                            </td>
                            <td className="py-2 px-4 border">{getBrandName(item.brandId)}</td>
                            <td className="py-2 px-4 border">{getCategoryName(item.categoryId)}</td>
                            <td className="py-2 px-4 border">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(item)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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

            {/* Modal Thêm Sản Phẩm */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Thêm sản phẩm mới</h2>
                        <div>
                            <div className="mb-4">
                                <label htmlFor="add-product-code" className="block mb-1 font-medium">Mã sản phẩm</label>
                                <input
                                    id="add-product-code"
                                    type="text"
                                    name="productCode"
                                    value={currentProduct.productCode}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-product-name" className="block mb-1 font-medium">Tên sản phẩm</label>
                                <input
                                    id="add-product-name"
                                    type="text"
                                    name="productName"
                                    value={currentProduct.productName}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-brand" className="block mb-1 font-medium">Thương hiệu</label>
                                <select
                                    id="add-brand"
                                    name="brandId"
                                    value={currentProduct.brandId || ''}
                                    onChange={handleSelectChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loadingBrands}
                                >
                                    <option value="">-- Chọn thương hiệu --</option>
                                    {brands.map(brand => (
                                        <option key={brand.brandId} value={brand.brandId}>
                                            {brand.brandName}
                                        </option>
                                    ))}
                                </select>
                                {loadingBrands && <p className="text-sm text-gray-500 mt-1">Đang tải thương hiệu...</p>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-category" className="block mb-1 font-medium">Danh mục</label>
                                <select
                                    id="add-category"
                                    name="categoryId"
                                    value={currentProduct.categoryId || ''}
                                    onChange={handleSelectChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loadingCategories}
                                >
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(category => (
                                        <option key={category.categoryId} value={category.categoryId}>
                                            {category.categoryName}
                                        </option>
                                    ))}
                                </select>
                                {loadingCategories && <p className="text-sm text-gray-500 mt-1">Đang tải danh mục...</p>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-product-price" className="block mb-1 font-medium">Giá bán (VND)</label>
                                <input
                                    id="add-product-price"
                                    type="number"
                                    name="sellingPrice"
                                    value={currentProduct.sellingPrice || ''}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-product-unit" className="block mb-1 font-medium">Đơn vị</label>
                                <input
                                    id="add-product-unit"
                                    type="text"
                                    name="unit"
                                    value={currentProduct.unit}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-product-description" className="block mb-1 font-medium">Mô tả</label>
                                <textarea
                                    id="add-product-description"
                                    name="description"
                                    value={currentProduct.description}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="add-product-image" className="block mb-1 font-medium">Hình ảnh</label>
                                <input
                                    id="add-product-image"
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    accept="image/*"
                                />
                                {previewImage && (
                                    <div className="mt-2">
                                        <img 
                                            src={previewImage} 
                                            alt="Preview" 
                                            className="w-32 h-32 object-cover border"
                                        />
                                    </div>
                                )}
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
                                    onClick={handleAddProduct}
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Sửa Sản Phẩm */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Sửa sản phẩm</h2>
                        <div>
                            <div className="mb-4">
                                <label htmlFor="edit-product-code" className="block mb-1 font-medium">Mã sản phẩm</label>
                                <input
                                    id="edit-product-code"
                                    type="text"
                                    name="productCode"
                                    value={currentProduct.productCode}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-product-name" className="block mb-1 font-medium">Tên sản phẩm</label>
                                <input
                                    id="edit-product-name"
                                    type="text"
                                    name="productName"
                                    value={currentProduct.productName}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-brand" className="block mb-1 font-medium">Thương hiệu</label>
                                <select
                                    id="edit-brand"
                                    name="brandId"
                                    value={currentProduct.brandId || ''}
                                    onChange={handleSelectChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loadingBrands}
                                >
                                    <option value="">-- Chọn thương hiệu --</option>
                                    {brands.map(brand => (
                                        <option key={brand.brandId} value={brand.brandId}>
                                            {brand.brandName}
                                        </option>
                                    ))}
                                </select>
                                {loadingBrands && <p className="text-sm text-gray-500 mt-1">Đang tải thương hiệu...</p>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-category" className="block mb-1 font-medium">Danh mục</label>
                                <select
                                    id="edit-category"
                                    name="categoryId"
                                    value={currentProduct.categoryId || ''}
                                    onChange={handleSelectChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loadingCategories}
                                >
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(category => (
                                        <option key={category.categoryId} value={category.categoryId}>
                                            {category.categoryName}
                                        </option>
                                    ))}
                                </select>
                                {loadingCategories && <p className="text-sm text-gray-500 mt-1">Đang tải danh mục...</p>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-product-price" className="block mb-1 font-medium">Giá bán (VND)</label>
                                <input
                                    id="edit-product-price"
                                    type="number"
                                    name="sellingPrice"
                                    value={currentProduct.sellingPrice || ''}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-product-unit" className="block mb-1 font-medium">Đơn vị</label>
                                <input
                                    id="edit-product-unit"
                                    type="text"
                                    name="unit"
                                    value={currentProduct.unit}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-product-description" className="block mb-1 font-medium">Mô tả</label>
                                <textarea
                                    id="edit-product-description"
                                    name="description"
                                    value={currentProduct.description}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="edit-product-image" className="block mb-1 font-medium">Hình ảnh</label>
                                <input
                                    id="edit-product-image"
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    accept="image/*"
                                />
                                {previewImage && (
                                    <div className="mt-2">
                                        <img 
                                            src={previewImage} 
                                            alt="Preview" 
                                            className="w-32 h-32 object-cover border"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {selectedFile ? 'Ảnh mới đã chọn' : 'Ảnh hiện tại'}
                                        </p>
                                    </div>
                                )}
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
                                    onClick={handleEditProduct}
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Xóa Sản Phẩm */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
                        <p className="mb-6">
                            Bạn có chắc chắn muốn xóa sản phẩm "{currentProduct.productName}"?
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
                                onClick={handleDeleteProduct}
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

export default Product;