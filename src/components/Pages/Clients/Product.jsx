import React, { useEffect, useState, useRef } from 'react';
import CardProduct from '../Card/CardProduct';
import ProductsService from '../../../Services/ProductService';
import CartItemService from '../../../Services/CartItemService';
import JwtUtils from '../../../constants/JwtUtils';
import CardCategory from '../Card/cardCategory'; 
import ProductCategoryService from '../../../Services/ProductCategoryService';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Product = () => {
  const [product, setProduct] = useState([]);
  const [Category, setCategory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const pageSize = 60;
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const fetchProducts = async (page = 1) => {
    try {
      const response = await ProductsService.getAllProducts();
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = response.data.slice(startIndex, endIndex);
      setProduct(paginatedProducts);
      setTotalPages(Math.ceil(response.data.length / pageSize));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await ProductCategoryService.getAllCategories();
      setCategory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategory([]);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const itemData = {
        productId,
        quantity: 1,
      };
      const idUser = JwtUtils.getCurrentUserId();
      if (!idUser) {
        window.location.href = '/login';
      }
      await CartItemService.addCartItem(idUser, itemData);
      alert('Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
      alert('Thêm sản phẩm thất bại!');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update scroll state
  const updateScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setScrollPosition(scrollLeft);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding errors
    }
  };

  // Handle scroll left
  const handleScrollLeft = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth; // Scroll by container width
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollLeft - scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Handle scroll right
  const handleScrollRight = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth; // Scroll by container width
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategory();
  }, []);

  useEffect(() => {
    // Update scroll state when categories change or on mount
    updateScrollState();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateScrollState);
      return () => scrollContainer.removeEventListener('scroll', updateScrollState);
    }
  }, [Category]);

 return (
  <div className="w-full px-16 min-h-screen bg-gray-50">
    <div className="w-full max-w-none px-4 py-6">
      {/* Category Section */}
      {Category.length > 0 && (
        <div className="relative">
          <div>
            <h1>Danh Mục</h1>
            <div
              ref={scrollRef}
              className="overflow-x-hidden whitespace-nowrap"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="grid grid-rows-2 grid-flow-col auto-cols-max gap-0 min-w-[2000px]">
                {Category.map((category) => (
                  <div
                    key={category.categoryId}
                    className="w-32 h-40 inline-block cursor-pointer"
                    onClick={() => navigate(`/products/category/${category.categoryId}`)}
                  >
                    <CardCategory
                      src={category.imageUrl}
                      name={category.categoryName}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Navigation Buttons */}
          {canScrollLeft && (
            <button
              onClick={handleScrollLeft}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={handleScrollRight}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          )}
        </div>
      )}

      {/* All Products Section */}
      {product.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="">SẢN PHẨM</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 gap-x-8 mb-8 ">
            {product.map((product) => (
              <div key={product.productId} className="w-full">
                <CardProduct
                  productId={product.productId}
                  name={product.productName}
                  image={product.imageUrl}
                  description={product.description}
                  sellingPrice={product.sellingPrice}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
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
        </div>
      ) : (
        <div className="text-center py-24 text-gray-500 text-lg">
          Không có sản phẩm nào để hiển thị.
        </div>
      )}
    </div>
  </div>
);
};

export default Product;