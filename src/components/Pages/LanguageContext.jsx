// 1. Đầu tiên, tạo file translations.js để chứa tất cả nội dung đa ngôn ngữ
// src/locales/translations.js

export const translations = {
    vi: {
      // Navbar
      navbar: {
        products: "Sản Phẩm",
        services: "Dịch Vụ",
        contact: "Liên Hệ",
        cart: "Giỏ Hàng",
        login: "Đăng Nhập",
        register: "Đăng Ký",
        search: "Tìm kiếm",
      },
      // Footer
      footer: {
        about: "Về Chúng Tôi",
        policy: "Chính Sách",
        support: "Hỗ Trợ",
        copyright: "© 2025 PipeVolt. Tất cả quyền được bảo lưu.",
      },
      // Home Page
      home: {
        welcome: "Chào mừng đến với PipeVolt",
        featuredProducts: "Sản Phẩm Nổi Bật",
        viewMore: "Xem Thêm",
        trending: "Xu Hướng",
      },
      // Product Page
      product: {
        price: "Giá",
        addToCart: "Thêm vào giỏ",
        description: "Mô tả",
        specifications: "Thông số kỹ thuật",
        reviews: "Đánh giá",
        relatedProducts: "Sản phẩm liên quan",
      },
      // Cart
      cart: {
        yourCart: "Giỏ hàng của bạn",
        empty: "Giỏ hàng trống",
        total: "Tổng cộng",
        checkout: "Thanh toán",
        continueShopping: "Tiếp tục mua sắm",
      },
      // Auth
      auth: {
        email: "Email",
        password: "Mật khẩu",
        confirmPassword: "Xác nhận mật khẩu",
        forgotPassword: "Quên mật khẩu?",
        createAccount: "Tạo tài khoản",
        alreadyHaveAccount: "Đã có tài khoản?",
      },
    },
    en: {
      // Navbar
      navbar: {
        products: "Products",
        services: "Services",
        contact: "Contact",
        cart: "Cart",
        login: "Login",
        register: "Register",
        search: "Search",
      },
      // Footer
      footer: {
        about: "About Us",
        policy: "Policy",
        support: "Support",
        copyright: "© 2025 PipeVolt. All rights reserved.",
      },
      // Home Page
      home: {
        welcome: "Welcome to PipeVolt",
        featuredProducts: "Featured Products",
        viewMore: "View More",
        trending: "Trending",
      },
      // Product Page
      product: {
        price: "Price",
        addToCart: "Add to Cart",
        description: "Description",
        specifications: "Specifications",
        reviews: "Reviews",
        relatedProducts: "Related Products",
      },
      // Cart
      cart: {
        yourCart: "Your Cart",
        empty: "Your cart is empty",
        total: "Total",
        checkout: "Checkout",
        continueShopping: "Continue Shopping",
      },
      // Auth
      auth: {
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        forgotPassword: "Forgot Password?",
        createAccount: "Create Account",
        alreadyHaveAccount: "Already have an account?",
      },
    },
  };
  
  // 2. Tạo Language Context để quản lý ngôn ngữ trong ứng dụng
  // src/contexts/LanguageContext.js
  
  import React, { createContext, useState, useContext, useEffect } from 'react';
  import { translations } from '../locales/translations';
  
  // Tạo context
  const LanguageContext = createContext();
  
  // Custom hook để sử dụng language context dễ dàng
  export const useLanguage = () => useContext(LanguageContext);
  
  // Provider component
  export const LanguageProvider = ({ children }) => {
    // Lấy ngôn ngữ từ localStorage nếu có, mặc định là 'vi'
    const [language, setLanguage] = useState(() => {
      const savedLanguage = localStorage.getItem('language');
      return savedLanguage || 'vi';
    });
  
    // Lấy các cụm từ dịch tương ứng với ngôn ngữ hiện tại
    const t = translations[language];
  
    // Hàm để thay đổi ngôn ngữ
    const changeLanguage = (lang) => {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    };
  
    // Lưu ngôn ngữ vào localStorage khi thay đổi
    useEffect(() => {
      localStorage.setItem('language', language);
    }, [language]);
  
    return (
      <LanguageContext.Provider value={{ language, changeLanguage, t }}>
        {children}
      </LanguageContext.Provider>
    );
  };
  
  // 3. Tạo component LanguageSwitcher để chuyển đổi ngôn ngữ
  // src/components/LanguageSwitcher.js
  
  import React from 'react';
  import { useLanguage } from '../contexts/LanguageContext';
  
  const LanguageSwitcher = () => {
    const { language, changeLanguage } = useLanguage();
  
    return (
      <div className="flex items-center space-x-2">
        <button
          className={`px-2 py-1 rounded ${language === 'vi' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => changeLanguage('vi')}
        >
          VI
        </button>
        <button
          className={`px-2 py-1 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => changeLanguage('en')}
        >
          EN
        </button>
      </div>
    );
  };
  
  export default LanguageSwitcher;