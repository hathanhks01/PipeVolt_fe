import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import {
  Home,
  Users,
  ShoppingCart,
  Package,
  Tag,
  Warehouse,
  FileText,
  Truck,
  BarChart2,
  LogOut,
  KeyRound,
  ClipboardList,
  Layers,
  Database,
  BookOpen,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import AuthService from '../../../Services/AuthService';
const Sidebar = () => {
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});

  const handleLogout = async () => {
    const username = sessionStorage.getItem('username');
    try {
      if (username) {
        // Gọi API logout backend
        await AuthService.logout(JSON.parse(username));
        googleLogout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      navigate('/login');
    }
  };

  const toggleSubMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const menuItems = [
    { name: 'Về trang Client', icon: <Home size={20} />, to: '/' },
    {
      name: 'Quản lý sản phẩm',
      icon: <Package size={20} />,
      children: [
        { name: 'Sản phẩm', to: '/admin/Products' },
        { name: 'Loại sản phẩm', to: '/admin/ProductCategory' },
        { name: 'Thương hiệu', to: '/admin/Brand' },
      ],
    },
    {
      name: 'Quản lý đơn hàng',
      icon: <ShoppingCart size={20} />,
      children: [
        { name: 'Đơn hàng', to: '/admin/Orders' },
        { name: 'Bán tại quầy', to: '/admin/pos' },
        { name: 'Bảo hành', to: '/admin/Warranties' },
      ],
    },
    {
      name: 'Quản lý kho',
      icon: <Warehouse size={20} />,
      children: [
        { name: 'Kho hàng', to: '/admin/Warehouse' },
        { name: 'Tồn kho', to: '/admin/Inventory' },
      ],
    },
    {
      name: 'Quản lý mua hàng',
      icon: <Truck size={20} />,
      children: [
        { name: 'Nhập hàng', to: '/admin/PurchaseOrders' },
        { name: 'Nhà cung cấp', to: '/admin/Suppliers' },
      ],
    },
    { name: 'Khách hàng', icon: <Users size={20} />, to: '/admin/Customer' },
    { name: 'Nhân viên', icon: <Users size={20} />, to: '/admin/Employee' },
    { name: 'Tài khoản & Quyền', icon: <KeyRound size={20} />, to: '/admin/UserAccounts' },
    { name: 'Báo cáo', icon: <BarChart2 size={20} />, to: '/admin/Reports' },
    { name: 'Nhật ký hệ thống', icon: <Database size={20} />, to: '/admin/SystemLogs' },
    { name: 'Chăm sóc khách hàng', icon: <BookOpen size={20} />, to: '/admin/chat' }, // Thêm dòng này
  ];

  // Thiết lập sẵn tối đa 1 submenu mở cùng lúc
  const handleToggleSubMenu = (menuName) => {
    setOpenMenus((prev) => {
      // Nếu menu này đã mở, đóng nó
      if (prev[menuName]) {
        return {
          ...prev,
          [menuName]: false
        };
      }
      // Nếu menu này chưa mở, đóng tất cả và mở menu này
      return {
        ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
        [menuName]: true
      };
    });
  };

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col shadow-lg ">
      {/* Header cố định */}
      <div className="px-6 py-5 border-b border-gray-700 text-2xl font-bold">
        📦 PipeVolt
      </div>

      {/* Nội dung scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <nav className="px-4 py-4">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => handleToggleSubMenu(item.name)}
                    className="flex items-center justify-between w-full px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white mb-1"
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.name}
                    </span>
                    {openMenus[item.name] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  {openMenus[item.name] && (
                    <div className="pl-8">
                      {item.children.map((child, childIndex) => (
                        <NavLink
                          key={childIndex}
                          to={child.to}
                          className={({ isActive }) =>
                            `block px-2 py-1 rounded-lg mb-1 text-sm transition-colors duration-200 ${isActive ? 'bg-gray-700 text-white font-semibold' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                          }
                        >
                          {child.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition-colors duration-200 ${isActive ? 'bg-gray-700 text-white font-semibold' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer cố định */}
      {/* <div className="px-4 py-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 w-full bg-red-600 hover:bg-red-700 rounded-lg transition"
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div> */}
    </div>
  );
};

export default Sidebar;