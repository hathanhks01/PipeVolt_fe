import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, User, ShoppingCart, Calculator, CreditCard, Printer, X, AlertCircle, Users2, Tag, Package } from 'lucide-react';
import ProductService from '../../../Services/ProductService';
import ProductCategoryService from '../../../Services/ProductCategoryService';
import CheckoutService from '../../../Services/CheckoutService';
import CustomerService from '../../../Services/CustomerService';
import InventoryService from '../../../Services/InventoryService';
import EmployeeService from '../../../Services/EmployeeService';
import { Url } from '../../../constants/config';
import { useNavigate } from 'react-router-dom';
import JwtUtils from '../../../constants/JwtUtils';

const POS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState(1);
  const [customerPaid, setCustomerPaid] = useState('');
  const [discount, setDiscount] = useState(0);
  const [employee, setEmployee] = useState(null);
  const [inventories, setInventories] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    customerName: '',
    phone: '',
    address: '',
    customerCode: ''
  });
  const [selectedLineItem, setSelectedLineItem] = useState(null);
  const [lineItemDiscountModals, setLineItemDiscountModals] = useState({});
  const [showInventoryAlert, setShowInventoryAlert] = useState(null);
  const navigate = useNavigate();
  
  // Walk-in customer constant
  const walkInCustomer = {
    customerId: 0,
    customerName: 'Khách lẻ',
    customerCode: 'WALK-IN',
    phone: '',
    address: ''
  };

  // Mock data - trong thực tế sẽ lấy từ API
  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);
  
  // Add loading state for categories
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [paymentMethods] = useState([
    { paymentMethodId: 1, methodName: 'Tiền mặt', isOnline: false },
    { paymentMethodId: 2, methodName: 'Chuyển khoản', isOnline: true },
    { paymentMethodId: 3, methodName: 'Thẻ tín dụng', isOnline: true },
  ]);

  useEffect(() => {
    // Set khách lẻ làm mặc định
    setCustomer(customers[0]);
  }, []);

  // Fetch employee from JWT token
  useEffect(() => {
    const fetchEmployeeFromToken = async () => {
      try {
        const decodedToken = JwtUtils.getDecodedToken();
        if (decodedToken?.sub) {
          const employeeData = await EmployeeService.getEmployeeById(decodedToken.sub);
          setEmployee(employeeData);
        }
      } catch (error) {
        console.error('Error fetching employee from token:', error);
      }
    };
    fetchEmployeeFromToken();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await ProductService.getAllProducts();
        setProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sửa lại effect khi chọn category
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let productsRes;
        if (selectedCategory === 'all') {
          const response = await ProductService.getAllProducts();
          productsRes = response.data || response || [];
        } else {
          const response = await ProductService.getProductsByCategory(selectedCategory);
          productsRes = response.data || response || [];
        }
        setProducts(productsRes);
      } catch (error) {
        setError('Không thể tải sản phẩm');
        setProducts([]);
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductsByCategory();
  }, [selectedCategory]);

  // Add useEffect to fetch categories
  useEffect(() => {
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

    fetchCategories();
  }, []);

  // Fetch inventories for stock checking
  useEffect(() => {
    const fetchInventories = async () => {
      try {
        const response = await InventoryService.getAllInventories();
        setInventories(response || []);
      } catch (error) {
        console.error('Error fetching inventories:', error);
      }
    };

    fetchInventories();
  }, []);

  // Sửa lại hàm filter
  const filteredProducts = products.filter(product => {
    // Log để debug
    console.log('Filtering product:', product);
    
    if (!product) return false;
    
    const matchesSearch = product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.productCode?.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesCategory = selectedCategory === 'all' || 
                         product.categoryId?.toString() === selectedCategory;
  
    // Log kết quả filter
    console.log('Matches search:', matchesSearch);
    console.log('Matches category:', matchesCategory);
  
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    // Check inventory before adding to cart
    const inventory = inventories.find(inv => inv.productId === product.productId);
    if (!inventory || inventory.quantity < 1) {
      setShowInventoryAlert({
        productName: product.productName,
        available: inventory?.quantity || 0
      });
      return;
    }

    const existingItem = cart.find(item => item.productId === product.productId);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.productId
          ? { ...item, quantity: item.quantity + 1, lineTotal: (item.quantity + 1) * item.unitPrice, lineDiscount: item.lineDiscount || 0 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.productId,
        productCode: product.productCode,
        productName: product.productName,
        quantity: 1,
        unitPrice: product.sellingPrice,
        lineTotal: product.sellingPrice,
        lineDiscount: 0,
        unit: product.unit
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.productId === productId
        ? { 
            ...item, 
            quantity: newQuantity, 
            lineTotal: newQuantity * item.unitPrice * (1 - (item.lineDiscount || 0) / 100)
          }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateLineDiscount = (productId, discountPercent) => {
    setCart(cart.map(item =>
      item.productId === productId
        ? {
            ...item,
            lineDiscount: discountPercent,
            lineTotal: item.quantity * item.unitPrice * (1 - discountPercent / 100)
          }
        : item
    ));
    setLineItemDiscountModals({ ...lineItemDiscountModals, [productId]: false });
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
    const discountAmount = subtotal * (discount / 100);
    const taxAmount = (subtotal - discountAmount) * 0.1; // VAT 10%
    const total = subtotal - discountAmount + taxAmount;
    return { subtotal, discountAmount, taxAmount, total };
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateTotal();

  const handlePayment = () => {
    if (cart.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    const paid = parseFloat(customerPaid) || 0;
    if (paid < total) {
      alert('Số tiền thanh toán không đủ!');
      return;
    }

    try {
      // Chuẩn bị dữ liệu gửi lên API POS
      const items = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.lineDiscount || 0 // Giảm giá từng dòng (%)
      }));

      const customerInfo = {
        customerId: customer?.customerId,
        customerName: customer?.customerName,
        customerPhone: customer?.phone,
        customerAddress: customer?.address,
        customerTaxCode: customer?.customerCode
      };

      // Gọi API POS Checkout
      const orderId = await CheckoutService.posCheckout({
        items,
        paymentMethodId: paymentMethod,
        customerInfo,
        cashierId: employee?.id,
        discountPercent: discount // giảm giá tổng đơn hàng (%)
      });

      // Reset form sau khi thanh toán thành công
      setCart([]);
      setCustomer(customers[0]);
      setDiscount(0);
      setCustomerPaid('');
      setShowPaymentModal(false);

      alert(`Thanh toán thành công! Mã đơn hàng: ${orderId}\nTiền thừa: ${(paid - total).toLocaleString('vi-VN')} VNĐ`);
      // window.open(`/print-bill/${orderId}`, '_blank');
      navigate(`/print-bill/${orderId}`);
    } catch (error) {
      alert('Thanh toán thất bại: ' + (error?.response?.data || error.message));
    }
  };

  const selectCustomer = (selectedCustomer) => {
    setCustomer(selectedCustomer);
    setShowCustomerModal(false);
  };

  const handleCreateCustomer = async () => {
    try {
      // Validate required fields
      if (!newCustomer.customerName || !newCustomer.phone) {
        alert('Vui lòng nhập tên khách hàng và số điện thoại!');
        return;
      }

      // Create new customer object for API
      const createCustomerDto = {
        customerName: newCustomer.customerName,
        phone: newCustomer.phone,
        address: newCustomer.address || '',
        customerCode: `CUST-${Date.now()}` // Generate unique code
      };

      // Call API to create customer
      const response = await CustomerService.createCustomer(createCustomerDto);
      
      // Add new customer to list
      const createdCustomer = response.data || response;
      setCustomers([...customers, createdCustomer]);
      
      // Select the new customer
      setCustomer(createdCustomer);
      
      // Close modal and reset form
      setShowCreateCustomerModal(false);
      setNewCustomer({ customerName: '', phone: '', address: '', customerCode: '' });
      
      alert('Tạo khách hàng thành công!');
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Lỗi khi tạo khách hàng: ' + (error.response?.data?.message || error.message));
    }
  };

  // Lấy danh sách khách hàng từ API khi load trang
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await CustomerService.getAllCustomers();
        // response.data nếu API trả về { data: [...] }, còn nếu trả về mảng thì dùng response
        setCustomers(response.data || response || []);
        setCustomer((response.data && response.data[0]) || (response[0]) || null); // chọn mặc định khách đầu tiên
      } catch (error) {
        setCustomers([]);
        setCustomer(null);
      }
    };
    fetchCustomers();
  }, []);

  const [customerSearch, setCustomerSearch] = useState('');
  const filteredCustomers = customers.filter(cust =>
    cust.phone?.toLowerCase().includes(customerSearch.toLowerCase())
    || cust.customerName?.toLowerCase().includes(customerSearch.toLowerCase())
    || cust.customerCode?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Bán hàng tại quầy</h1>
              {employee && (
                <p className="text-sm text-gray-600 mt-1">
                  👤 Nhân viên: <span className="font-semibold">{employee.employeeName}</span>
                </p>
              )}
            </div>
          </div>
          
          {/* Search và Category Filter */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={loadingCategories}
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId.toString()}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.productId}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer transition-shadow border"
                onClick={() => addToCart(product)}
              >
                <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  <img 
                  src={ `${Url}${product.imageUrl}`}
                    alt={product.productName}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <svg 
                    className="w-full h-full text-gray-400 p-8 hidden" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.productName}</h3>
                <p className="text-xs text-blue-600 mb-2">{product.productCode}</p>
                <p className="text-lg font-bold text-green-600">
                  {Number(product.sellingPrice).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} VNĐ
                </p>
                <p className="text-xs text-gray-500">/{product.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 bg-white border-l flex flex-col">
        {/* Customer Info */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Khách hàng:</span>
            <button
              onClick={() => setShowCustomerModal(true)}
              className="flex items-center gap-1 px-3 py-1 border border-blue-500 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition"
              title="Chọn khách hàng"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-semibold">Chọn</span>
            </button>
          </div>
          <p className="text-sm text-gray-600">{customer?.customerName || 'Chưa chọn'}</p>
          {customer?.phone && <p className="text-xs text-gray-500">{customer.phone}</p>}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">Giỏ hàng ({cart.length})</span>
            </div>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Giỏ hàng trống</p>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.productId} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm line-clamp-2 flex-1">{item.productName}</h4>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{item.productCode}</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {Number(item.lineTotal).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} VNĐ
                      </span>
                    </div>

                    {/* Line Discount Display and Control */}
                    <div className="bg-white rounded p-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-orange-500" />
                        <span className="text-gray-600">Giảm giá:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-orange-600">{item.lineDiscount || 0}%</span>
                        <button
                          onClick={() => setLineItemDiscountModals({ ...lineItemDiscountModals, [item.productId]: true })}
                          className="px-2 py-1 bg-orange-100 text-orange-600 rounded hover:bg-orange-200 text-xs font-medium"
                        >
                          Sửa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Discount */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4" />
            <label className="text-sm font-medium">Giảm giá (%):</label>
          </div>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
          />
        </div>

        {/* Order Summary */}
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{Number(subtotal).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} VNĐ</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Giảm giá ({discount}%):</span>
                <span>-{Number(discountAmount).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} VNĐ</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>VAT (10%):</span>
              <span>{Number(taxAmount).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} VNĐ</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Tổng cộng:</span>
              <span className="text-green-600">
                {Number(total).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} VNĐ
              </span>
            </div>
          </div>
          
          <button
            onClick={handlePayment}
            disabled={cart.length === 0}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Thanh toán
          </button>
        </div>
      </div>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Users2 className="w-5 h-5" />
                Chọn khách hàng
              </h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Walk-in Customer Option */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-semibold">LỰA CHỌN NHANH</p>
              <div
                onClick={() => selectCustomer(walkInCustomer)}
                className="p-3 mb-4 border-2 border-blue-500 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition"
              >
                <p className="font-bold text-blue-700 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  👥 Khách lẻ (bán lẻ không lưu thông tin)
                </p>
                <p className="text-xs text-blue-600 mt-1">Nhanh chóng cho giao dịch tạm thời</p>
              </div>
            </div>

            {/* Search Box */}
            <p className="text-xs text-gray-500 mb-2 font-semibold">TÌM KHÁCH HÀNG CÓ SẴN</p>
            <input
              type="text"
              placeholder="Tìm theo SĐT, tên, mã KH..."
              className="w-full mb-3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={customerSearch}
              onChange={e => setCustomerSearch(e.target.value)}
            />

            {/* Customer List */}
            <div className="space-y-2 mb-4">
              {filteredCustomers.map(cust => (
                <div
                  key={cust.customerId}
                  onClick={() => selectCustomer(cust)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition"
                >
                  <p className="font-medium">{cust.customerName}</p>
                  <p className="text-sm text-gray-600">{cust.customerCode}</p>
                  {cust.phone && <p className="text-xs text-gray-500">{cust.phone}</p>}
                </div>
              ))}
              {filteredCustomers.length === 0 && customerSearch && (
                <div className="text-gray-400 text-center py-4">Không tìm thấy khách hàng phù hợp</div>
              )}
            </div>

            {/* Create New Customer Button */}
            <button
              onClick={() => {
                setShowCustomerModal(false);
                setShowCreateCustomerModal(true);
              }}
              className="w-full py-2 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 font-medium transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo khách hàng mới
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Thanh toán</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phương thức thanh toán:</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(parseInt(e.target.value))}
                >
                  {paymentMethods.map(method => (
                    <option key={method.paymentMethodId} value={method.paymentMethodId}>
                      {method.methodName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tổng tiền: <span className="text-green-600 font-bold">{total.toLocaleString('vi-VN')} VNĐ</span>
                </label>
                <input
                  type="number"
                  placeholder="Nhập số tiền khách trả"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customerPaid}
                  onChange={(e) => setCustomerPaid(e.target.value)}
                />
              </div>
              
              {customerPaid && parseFloat(customerPaid) >= total && (
                <div className="text-sm text-green-600">
                  Tiền thừa: {(parseFloat(customerPaid) - total).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} VNĐ
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={processPayment}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Thanh toán & In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Customer Modal */}
      {showCreateCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Tạo khách hàng mới</h3>
              <button
                onClick={() => setShowCreateCustomerModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên khách hàng *</label>
                <input
                  type="text"
                  placeholder="Nhập tên khách hàng"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCustomer.customerName}
                  onChange={(e) => setNewCustomer({...newCustomer, customerName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Số điện thoại *</label>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Địa chỉ</label>
                <input
                  type="text"
                  placeholder="Nhập địa chỉ (tuỳ chọn)"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateCustomerModal(false);
                    setNewCustomer({ customerName: '', phone: '', address: '', customerCode: '' });
                  }}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateCustomer}
                  disabled={!newCustomer.customerName || !newCustomer.phone}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Tạo khách hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Line Item Discount Modal */}
      {Object.entries(lineItemDiscountModals).map(([productId, isOpen]) => 
        isOpen && (
          <div key={productId} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Tag className="w-5 h-5 text-orange-500" />
                  Giảm giá từng dòng
                </h3>
                <button
                  onClick={() => setLineItemDiscountModals({ ...lineItemDiscountModals, [productId]: false })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phần trăm giảm giá (0-100%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Nhập phần trăm"
                      defaultValue={cart.find(item => item.productId === parseInt(productId))?.lineDiscount || 0}
                      className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      id={`discount-input-${productId}`}
                    />
                    <span className="text-xl font-bold text-gray-400">%</span>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded p-3">
                  <p className="text-sm text-orange-700">
                    💡 Áp dụng giảm giá cho mặt hàng này
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setLineItemDiscountModals({ ...lineItemDiscountModals, [productId]: false })}
                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      const input = document.getElementById(`discount-input-${productId}`);
                      const discount = parseFloat(input.value) || 0;
                      updateLineDiscount(parseInt(productId), Math.min(100, Math.max(0, discount)));
                    }}
                    className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Inventory Alert Modal */}
      {showInventoryAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-bold">Không đủ hàng tồn</h3>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-gray-700">
                <span className="font-semibold">{showInventoryAlert.productName}</span>
              </p>
              <p className="text-sm text-gray-600">
                Tồn kho hiện tại: <span className="font-bold text-red-600">{showInventoryAlert.available}</span> sản phẩm
              </p>
            </div>

            <button
              onClick={() => setShowInventoryAlert(null)}
              className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;