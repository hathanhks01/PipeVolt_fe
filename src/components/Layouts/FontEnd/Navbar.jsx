import React, { useState, useEffect, useRef } from 'react';
import { Menu, ShoppingCart, LogIn, User, ChevronDown, LogOut, Settings, Search, UserCircle, FileText } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Login from '../../Pages/Auth/Login';
import AuthService from '../../../Services/AuthService';
import JwtUtils from '../../../constants/JwtUtils';
import ProductService from '../../../Services/ProductService';
import { googleLogout } from '@react-oauth/google';
import { Url } from '../../../constants/config';
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);
  const searchTimeout = useRef();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleLoginModal = () => setShowLogin(!showLogin);
  const toggleUserDropdown = () => setShowUserDropdown(!showUserDropdown);
  const isAdmin = JwtUtils.getCurrentUserType();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'username') {
        checkAuthStatus();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const userInfoStr = sessionStorage.getItem('userInfo');
      if (token && userInfoStr && userInfoStr !== 'undefined' && userInfoStr !== 'null') {
        const parsedUser = JSON.parse(userInfoStr);
        setIsLoggedIn(true);
        setUsername(parsedUser.username || parsedUser.Username || parsedUser.email || '');
      } else {
        setIsLoggedIn(false);
        setUsername(null);
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userInfo');
        sessionStorage.removeItem('savedUserName');
        sessionStorage.removeItem('savedPassword');
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUsername(null);
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userInfo');
      sessionStorage.removeItem('savedUserName');
      sessionStorage.removeItem('savedPassword');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.logout(username);
      setIsLoggedIn(false);
      setUsername(null);
       googleLogout();
      setShowUserDropdown(false);
      navigate('/HomePage');
    } catch (error) {
      console.error('Logout error:', error);
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('savedUserName');
      sessionStorage.removeItem('savedPassword');
      setIsLoggedIn(false);
      setUsername(null);
      setShowUserDropdown(false);
      navigate('/HomePage');
    }
  };

  const handleLoginSuccess = (userData) => {
    setTimeout(() => {
      checkAuthStatus();
    }, 100);
    setShowLogin(false);
  };

  // Hàm xử lý tìm kiếm (debounce)
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    clearTimeout(searchTimeout.current);
    if (!value.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const products = await ProductService.searchProducts(value);
        setSearchResults(products);
        setShowResults(true);
      } catch {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 400);
  };

  // Đóng dropdown khi click ngoài
  const searchBoxRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hiệu ứng gạch chân đẹp
  const baseClass = "relative px-4 py-2 text-white transition-all duration-300 ease-in-out group";
  const activeClass = "text-blue-400";
  const normalClass = "hover:text-blue-400";

  // Component cho gạch chân animated
  const UnderlineEffect = ({ isActive }) => (
    <span 
      className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 ease-out ${
        isActive 
          ? 'w-full opacity-100' 
          : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
      }`}
    />
  );

  const UserDropdown = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'relative' : 'absolute right-0 mt-2'} w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200`}>
      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
        <div className="font-medium">{username}</div>
      </div>
      <Link
        to="/profile"
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => setShowUserDropdown(false)}
      >
        <UserCircle className="mr-3 h-4 w-4" />
        Thông tin cá nhân
      </Link>
      <Link
      to="/orders"
      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      onClick={() => setShowUserDropdown(false)}
    >
      <FileText className="mr-3 h-4 w-4" />
      Đơn hàng của tôi
    </Link>
      {(isAdmin == 0 || isAdmin == 1) && (
        <Link
          to="/admin/dashboard"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={() => setShowUserDropdown(false)}
        >
          <Settings className="mr-3 h-4 w-4" />
          Trang quản trị
        </Link>
      )}
      <button
        onClick={handleLogout}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <LogOut className="mr-3 h-4 w-4" />
        Đăng xuất
      </button>
    </div>
  );

  return (
    <>
      <nav className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                PipeVolt
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-2 sm:ml-10 flex items-center space-x-2">
                {[
                  { to: '/HomePage', label: 'Trang chủ' },
                  { to: '/products', label: 'Sản Phẩm' },
                  { to: '/services', label: 'Dịch Vụ' },
                  { to: '/contact', label: 'Liên Hệ' }
                ].map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `${baseClass} ${isActive ? activeClass : normalClass}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {label}
                        <UnderlineEffect isActive={isActive} />
                      </>
                    )}
                  </NavLink>
                ))}

                {/* Search */}
                <div className="relative ml-2 sm:ml-6" ref={searchBoxRef}>
                  <input
                    className="w-32 sm:w-60 md:w-80 lg:w-96 rounded-full px-3 sm:px-5 py-2 pr-10 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow transition-all duration-200 text-xs sm:text-sm"
                    type="text"
                    placeholder="Tìm kiếm sản phẩm, dịch vụ..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow transition-colors"
                    tabIndex={-1}
                    type="button"
                  >
                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                      {searchResults.map(product => (
                        <Link
                          to={`/products/${product.productId}`}
                          key={product.productId}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition"
                          onClick={() => {
                            setShowResults(false);
                            setSearchTerm('');
                            setSearchResults([]);
                          }}
                        >
                          <img
                            src={`${Url}${product.imageUrl}`}
                            alt={product.productName}
                            className="w-10 h-10 object-cover rounded border"
                            onError={e => { e.target.src = '/no-image.png'; }}
                          />
                          <div>
                            <div className="font-medium text-gray-700 text-sm">{product.productName}</div>
                            <div className="text-xs text-gray-500">
                              {product.productCode} - {product.sellingPrice?.toLocaleString('vi-VN')}đ / {product.unit}
                            </div>
                          </div>
                        </Link>
                      ))}
                      {searchResults.length === 0 && (
                        <div className="px-4 py-2 text-gray-500 text-sm">Không tìm thấy sản phẩm phù hợp</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cart */}
                <Link to="/cart" className="relative group ml-4">
                  <button className="hover:bg-gray-800 p-2 rounded-full group-hover:text-blue-400 transition-all duration-200">
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">0</span>
                </Link>
              </div>
            </div>

            {/* User Authentication Section */}
            <div className="hidden md:flex items-center">
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleUserDropdown}
                    className="flex items-center space-x-2 hover:bg-gray-800 px-4 py-2 rounded-md transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">
                      {username}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showUserDropdown && <UserDropdown />}
                </div>
              ) : (
                <button
                  onClick={toggleLoginModal}
                  className="flex items-center space-x-1 hover:bg-gray-800 px-4 py-2 rounded-md transition-colors duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Đăng Nhập</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={toggleMenu} className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 px-2 pt-2 pb-3 space-y-1">
            {[
              { to: '/HomePage', label: 'Trang chủ' },
              { to: '/products', label: 'Sản Phẩm' },
              { to: '/services', label: 'Dịch Vụ' },
              { to: '/contact', label: 'Liên Hệ' }
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md transition-colors relative ${
                    isActive 
                      ? 'text-blue-400 bg-gray-700' 
                      : 'hover:bg-gray-700 hover:text-blue-400'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            <Link to="/cart" className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              <span>Giỏ Hàng</span>
            </Link>

            {/* Mobile User Section */}
            {isLoggedIn ? (
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex items-center space-x-2 px-3 py-2 text-blue-400">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium">
                    {username}
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  <span>Thông tin cá nhân</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button
                onClick={toggleLoginModal}
                className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors"
              >
                Đăng Nhập
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
            <Login
              isModal={true}
              onClose={toggleLoginModal}
              onLoginSuccess={handleLoginSuccess}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;