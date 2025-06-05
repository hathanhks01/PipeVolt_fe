import React, { useState, useEffect } from 'react';
import ProductsService from '../../../Services/ProductService';
import PendantClusterCard from '../Card/PendantClusterCard';
import Banner from '../../Layouts/FontEnd/banner';
const HomePage = () => {
  const [Popularproduct, setPopularproduct] = useState([]);

  const fetchProducts = async (page = 1) => {
    try {
      const PopularList = await ProductsService.GetPopularList();
      setPopularproduct(PopularList.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
       <Banner />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Popularproduct.map((product, index) => (
              <PendantClusterCard
                key={product.productId}
                name={product.productName}
                image={product.imageUrl}
                sellingPrice={product.sellingPrice}
              />
            ))}
      </div>
    </div>
  );
};

export default HomePage;
