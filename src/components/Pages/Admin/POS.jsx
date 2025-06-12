import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, User, ShoppingCart, Calculator, CreditCard, Printer, X } from 'lucide-react';
import ProductService from '../../../Services/ProductService';// Giả sử đường dẫn đến file service
import ProductCategoryService from '../../../Services/ProductCategoryService';
import CheckoutService from '../../../Services/CheckoutService';
import CustomerService from '../../../Services/CustomerService';
import { Url } from '../../../constants/config';
import { useNavigate } from 'react-router-dom';

const POS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState(1);
  const [customerPaid, setCustomerPaid] = useState('');
  const [discount, setDiscount] = useState(0);
  const [employee, setEmployee] = useState({ id: 1, name: 'Nguyễn Văn A' });
  const navigate = useNavigate();
  
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
    const existingItem = cart.find(item => item.productId === product.productId);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.productId
          ? { ...item, quantity: item.quantity + 1, lineTotal: (item.quantity + 1) * item.unitPrice }
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
        ? { ...item, quantity: newQuantity, lineTotal: newQuantity * item.unitPrice }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
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
        discount: 0 // Nếu có giảm giá từng dòng thì thay đổi ở đây
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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Bán hàng tại quầy</h1>
          
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
                <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <img 
                  src={ `${Url}${product.imageUrl}`}
                    alt={product.productName}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = '/placeholder.png';
                    }}
                  />
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
                  <div key={item.productId} className="border rounded-lg p-3">
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
                    <div className="flex items-center justify-between">
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
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Chọn khách hàng</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Tìm theo SĐT, tên, mã KH..."
              className="w-full mb-3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={customerSearch}
              onChange={e => setCustomerSearch(e.target.value)}
            />
            <div className="space-y-2">
              {filteredCustomers.map(cust => (
                <div
                  key={cust.customerId}
                  onClick={() => selectCustomer(cust)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <p className="font-medium">{cust.customerName}</p>
                  <p className="text-sm text-gray-600">{cust.customerCode}</p>
                  {cust.phone && <p className="text-xs text-gray-500">{cust.phone}</p>}
                </div>
              ))}
              {filteredCustomers.length === 0 && (
                <div className="text-gray-400 text-center py-4">Không tìm thấy khách hàng phù hợp</div>
              )}
            </div>
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
    </div>
  );
};

export default POS;