import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductService from '../../../Services/ProductService';
import CardProduct from '../Card/CardProduct';
import { ArrowLeft } from 'lucide-react';

const ProductCategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await ProductService.getProductsByCategory(categoryId);
        setProducts(data);
      } catch (e) {
        setProducts([]);
      }
    };
    fetch();
  }, [categoryId]);

  return (
    <div className="w-full px-16 py-6 min-h-screen bg-gray-50">
      <div className="w-full max-w-none px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 font-medium group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Quay lại trang chính
        </button>
        <h1 className="text-xl font-bold mb-4">Sản phẩm theo danh mục</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <CardProduct
              key={product.productId}
              productId={product.productId}
              name={product.productName}
              image={product.imageUrl}
              description={product.description}
              sellingPrice={product.sellingPrice}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCategoryPage;