import React from 'react'
import { Routes, Route } from 'react-router-dom';
import HomePage from '../../Pages/Clients/HomePage'
import Product from '../../Pages/Clients/Product';
import CartItemList from '../../Pages/Clients/Cart';
import ProductDetail from '../../Pages/Clients/ProductDetail';
import ProductCategoryPage from '../../Pages/Clients/ProductCategoryPage';
import Profile from '../../Pages/Clients/Profile';
import Contact from '../../Pages/Clients/Contact';
import CheckoutPage from '../../Pages/Clients/CheckoutPage';
import OrderConfirmation from'../../Pages/Clients/OrderConfirmation';
import MyOrders from '../../Pages/Clients/MyOrders';
const MainContent = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} /> {/* Trang khởi đầu là Discover */}
            <Route path="/HomePage" element={<HomePage />} />
            <Route path="/Products" element={<Product />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartItemList />} />
            <Route path="/products/category/:categoryId" element={<ProductCategoryPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/orders" element={<MyOrders />} />
        </Routes>
    )
}

export default MainContent