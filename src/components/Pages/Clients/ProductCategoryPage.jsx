import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductService from '../../../Services/ProductService';
import CardProduct from '../Card/CardProduct';

const ProductCategoryPage = () => {
  const { categoryId } = useParams();
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
    <div className="w-full px-4 py-6 min-h-screen bg-gray-50">
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
  );
};

export default ProductCategoryPage;