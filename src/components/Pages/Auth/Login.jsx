import { Check, X, Eye, EyeOff } from 'lucide-react'; // Thêm icon Eye, EyeOff
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../../Services/AuthService';
import JwtUtils from '../../../constants/JwtUtils';
import { GoogleLogin, googleLogout } from '@react-oauth/google';

const Login = ({ isModal = false, onClose, onLoginSuccess }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Thêm state này
  const navigate = useNavigate();

  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: ''
  });
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const savedUserName = sessionStorage.getItem('savedUserName');
    const savedPassword = sessionStorage.getItem('savedPassword');
    if (savedUserName && savedPassword) {
      setUserName(savedUserName);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!userName || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await AuthService.login({ username: userName, password });
      if (response.success) {
        // Save authentication data
        sessionStorage.setItem('authToken', response.token);
        sessionStorage.setItem('userInfo', JSON.stringify(response.user));
        
        if (rememberMe) {
          sessionStorage.setItem('savedUserName', userName);
          sessionStorage.setItem('savedPassword', password);
        } else {
          sessionStorage.removeItem('savedUserName');
          sessionStorage.removeItem('savedPassword');
        }

        // Call success callback if provided (for navbar update)
        if (onLoginSuccess) {
          onLoginSuccess(response.user);
        }

        if (isModal && onClose) {
          onClose();
        }
        
        var checkAccess=JwtUtils.getCurrentUserType();
        if (checkAccess!=null && checkAccess==0 ) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setIsRegistering(true);

    if (!registerData.username || !registerData.password || !registerData.confirmPassword || !registerData.email) {
      setRegisterError('Vui lòng điền đầy đủ thông tin.');
      setIsRegistering(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Mật khẩu xác nhận không khớp.');
      setIsRegistering(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setRegisterError('Email không hợp lệ.');
      setIsRegistering(false);
      return;
    }

    try {
      const response = await AuthService.register({
        username: registerData.username,
        password: registerData.password,
        email: registerData.email,
        fullName: registerData.fullName
      });

      if (response.success) {
        setRegisterSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
        setUserName(registerData.username);
        setPassword('');
        setTimeout(() => {
          setShowRegisterModal(false);
          setRegisterData({
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            fullName: ''
          });
        }, 2000);
      } else {
        setRegisterError(response.message);
      }
    } catch (err) {
      setRegisterError(err.message || 'Đăng ký thất bại.');
    } finally {
      setIsRegistering(false);
    }
  };

  const containerClasses = isModal
    ? 'p-8 rounded-lg shadow-lg w-full max-w-md relative'
    : 'min-h-screen bg-gray-100 flex justify-center items-center';

  const formContainerClasses = isModal ? '' : 'bg-white p-8 rounded-lg shadow-lg w-full sm:w-96';

  return (
    <div className={containerClasses}>
      <div className={formContainerClasses}>
        {isModal && (
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        )}
        <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
              Tên đăng nhập:
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập tên đăng nhập"
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mật khẩu:
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                placeholder="Nhập mật khẩu"
                disabled={isLoading}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
              Lưu mật khẩu
            </label>
          </div>

          <button
            type="submit"
            className={`w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <div className="mt-4 text-center">
            <a
              href="#"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              onClick={(e) => {
                e.preventDefault();
                setShowRegisterModal(true);
              }}
            >
              Bạn chưa có tài khoản?
            </a>
          </div>
        </form>

        <div className="mt-4 flex flex-col items-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const response = await AuthService.googleLogin(credentialResponse.credential);
                if (response.success) {
                  sessionStorage.setItem('authToken', response.token);
                  const userObj = {
                    username: response.username,
                    userType: response.userType,
                    userId: response.userId
                  };
                  sessionStorage.setItem('userInfo', JSON.stringify(userObj));
                  if (onLoginSuccess) onLoginSuccess(userObj);
                  if (isModal && onClose) onClose();
                  var checkAccess = JwtUtils.getCurrentUserType();
                  if (checkAccess !== null && checkAccess === 0) {
                    navigate('/admin/dashboard');
                  } else {
                    navigate('/');
                  }
                } else {
                  setError(response.message);
                }
              } catch (err) {
                setError('Đăng nhập Google thất bại.');
              }
            }}
            onError={() => setError('Đăng nhập Google thất bại.')}
            useOneTap
          />
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setShowRegisterModal(false)}
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-center mb-6">Đăng ký tài khoản</h2>

            {registerError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {registerError}
              </div>
            )}

            {registerSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
                <Check size={20} className="mr-2" />
                {registerSuccess}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              <div className="mb-4">
                <label htmlFor="register-username" className="block text-sm font-medium text-gray-700">
                  Tên đăng nhập:
                </label>
                <input
                  type="text"
                  id="register-username"
                  name="username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập tên đăng nhập"
                  disabled={isRegistering}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
                  Mật khẩu:
                </label>
                <input
                  type="password"
                  id="register-password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập mật khẩu"
                  disabled={isRegistering}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu:
                </label>
                <input
                  type="password"
                  id="register-confirm-password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập lại mật khẩu"
                  disabled={isRegistering}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
                  Email:
                </label>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập email"
                  disabled={isRegistering}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="register-fullname" className="block text-sm font-medium text-gray-700">
                  Họ và tên:
                </label>
                <input
                  type="text"
                  id="register-fullname"
                  name="fullName"
                  value={registerData.fullName}
                  onChange={handleRegisterChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập họ và tên"
                  disabled={isRegistering}
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isRegistering ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isRegistering}
              >
                {isRegistering ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;