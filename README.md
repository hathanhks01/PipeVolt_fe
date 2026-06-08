# PipeVolt - Frontend

Frontend React/Vite cho hệ thống quản lý bán hàng điện nước. Cung cấp giao diện người dùng để tương tác với backend API PipeVolt.

## Mục lục

- [Tính năng](#tính-năng)
- [Công nghệ](#công-nghệ)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt và chạy local](#cài-đặt-và-chạy-local)
- [Cấu hình](#cấu-hình)
- [Linting & Code Quality](#linting--code-quality)
- [Build & Deploy](#build--deploy)
- [Tích hợp API](#tích-hợp-api)
- [Xác thực & phân quyền](#xác-thực--phân-quyền)
- [Chat & Realtime](#chat--realtime)
- [Scripts tiện ích](#scripts-tiện-ích)

## Tính năng

| Nhóm | Mô tả |
|------|--------|
| **Xác thực** | Đăng ký, đăng nhập JWT; đăng nhập Google OAuth |
| **Bảng điều khiển** | Dashboard tổng quan, thống kê |
| **Sản phẩm** | Danh sách, chi tiết, tìm kiếm, lọc theo danh mục |
| **Giỏ hàng** | Thêm/xóa sản phẩm, cập nhật số lượng |
| **Thanh toán** | Checkout, chọn phương thức thanh toán (SePay) |
| **Đơn hàng** | Xem lịch sử đơn bán, chi tiết đơn, trạng thái |
| **Bảo hành** | Theo dõi bảo hành sản phẩm |
| **Chat hỗ trợ** | Chat realtime với nhân viên (SignalR) |
| **Chatbot AI** | Tư vấn sản phẩm bằng chatbot AI |
| **Quản lý tài khoản** | Cập nhật thông tin cá nhân, đổi mật khẩu |
| **Quản lý (Admin)** | Quản lý sản phẩm, đơn hàng, nhân viên, khách hàng, báo cáo |

## Công nghệ

- [React 19](https://react.dev/)
- [Vite 6](https://vitejs.dev/) - Build tool siêu nhanh
- [React Router v7](https://reactrouter.com/) - Routing
- [Axios](https://axios-http.com/) - HTTP client
- [Tailwind CSS 3](https://tailwindcss.com/) - Styling utility-first
- [SignalR Client](https://learn.microsoft.com/en-us/aspnet/core/signalr/) - Realtime communication
- [JWT Decode](https://github.com/auth0/jwt-decode) - JWT token parsing
- [Google OAuth](https://www.npmjs.com/package/@react-oauth/google) - Social login
- [Lucide React](https://lucide.dev/) + [Heroicons](https://heroicons.com/) - Icon libraries
- [ESLint 9](https://eslint.org/) - Code linting
- [PostCSS](https://postcss.org/) - CSS processing

## Cấu trúc thư mục

```
PipeVolt_fe/
├── src/
│   ├── main.jsx                    # Entry point
│   ├── App.jsx                     # Root component
│   ├── App.css & index.css         # Global styles
│   │
│   ├── components/                 # React components (UI)
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CartItem.jsx
│   │   ├── ChatWindow.jsx
│   │   └── ... (other components)
│   │
│   ├── pages/                      # Page components (routes)
│   │   ├── HomePage.jsx
│   │   ├── ProductListPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── AdminPage.jsx
│   │   └── ... (other pages)
│   │
│   ├── Services/                   # API clients & services
│   │   ├── api.js                  # Axios instance & interceptors
│   │   ├── authService.js          # Authentication API
│   │   ├── productService.js       # Product API
│   │   ├── cartService.js          # Cart API
│   │   ├── orderService.js         # Order API
│   │   ├── chatService.js          # Chat & SignalR
│   │   └── ... (other services)
│   │
│   ├── common/                     # Shared utilities & helpers
│   │   ├── constants.js            # Constants
│   │   ├── auth.js                 # Auth helpers
│   │   ├── useAuth.js              # Custom hooks
│   │   ├── ProtectedRoute.jsx      # Route guard
│   │   └── ... (other utilities)
│   │
│   ├── constants/                  # Application constants
│   │   ├── API_URL.js
│   │   ├── ROLES.js
│   │   └── ... (other constants)
│   │
│   └── assets/                     # Static assets (images, fonts)
│
├── public/                         # Public assets
├── index.html                      # HTML template
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── eslint.config.js                # ESLint configuration
├── package.json                    # Dependencies
└── README.md                       # Tài liệu này
```

## Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) 18.0.0 trở lên
- [npm](https://www.npmjs.com/) 9.0.0 trở lên (hoặc yarn/pnpm)
- Backend API PipeVolt chạy ở `http://localhost:5000` (hoặc URL khác trong `.env`)

## Cài đặt và chạy local

### 1. Clone repository (nếu chưa có)

```bash
git clone <url-repo>
cd PipeVolt_fe
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình environment

Tạo file `.env.local` ở root của `PipeVolt_fe/`:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_APP_NAME=PipeVolt
```

**Giải thích:**
- `VITE_API_URL`: Base URL của backend API
- `VITE_GOOGLE_CLIENT_ID`: Client ID từ Google Cloud Console (để Google OAuth login)
- `VITE_APP_NAME`: Tên ứng dụng

### 4. Chạy development server

```bash
npm run dev
```

Frontend sẽ chạy ở `http://localhost:5173`

### 5. Xem ứng dụng

Mở trình duyệt và truy cập:
```
http://localhost:5173
```

## Cấu hình

### Biến Environment (.env.local)

| Biến | Mô tả | Ví dụ |
|------|--------|--------|
| `VITE_API_URL` | Base URL của backend API | `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `abc123...apps.googleusercontent.com` |
| `VITE_APP_NAME` | Tên ứng dụng | `PipeVolt` |

### API Configuration (src/Services/api.js)

```javascript
// Cấu hình Axios với base URL và interceptors
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

// Interceptor: Thêm JWT token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## Linting & Code Quality

### Chạy ESLint

```bash
npm run lint
```

### Fix linting issues

```bash
npx eslint . --fix
```

## Build & Deploy

### Build production

```bash
npm run build
```

Output được tạo ở thư mục `dist/`

### Preview build

```bash
npm run preview
```

### Deploy

Sao chép toàn bộ thư mục `dist/` lên server web (nginx, Apache, Vercel, Netlify, v.v.)

**Lưu ý:** Cấu hình routing cho SPA (Single Page Application) sao cho tất cả route đều trả về `index.html`

## Tích hợp API

Tất cả request API được quản lý trong `src/Services/` bằng Axios.

### Ví dụ: AuthService

```javascript
// src/Services/authService.js
import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};
```

### Ví dụ: ProductService

```javascript
// src/Services/productService.js
import api from './api';

export const getProducts = async (page = 1, pageSize = 10) => {
  const response = await api.get('/api/products', {
    params: { page, pageSize },
  });
  return response.data;
};

export const getProductDetail = async (id) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};
```

### Response Interceptor

```javascript
// Xử lý lỗi từ API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn, đăng xuất
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Xác thực & Phân quyền

### JWT Token Management

Token lưu trong `localStorage`:

```javascript
// Login
localStorage.setItem('token', response.data.token);

// Lấy token
const token = localStorage.getItem('token');

// Logout
localStorage.removeItem('token');
```

### Custom Hook: useAuth

```javascript
// src/common/useAuth.js
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
      setRole(decoded.role);
    }
  }, []);

  return { user, role, isAuthenticated: !!user };
};
```

### Protected Routes

```javascript
// src/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};
```

### Sử dụng ProtectedRoute

```javascript
// App.jsx
import { ProtectedRoute } from './common/ProtectedRoute';

<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    }
  />
  <Route
    path="/admin"
    element={
      <ProtectedRoute requiredRole="Admin">
        <AdminPage />
      </ProtectedRoute>
    }
  />
</Routes>
```

## Chat & Realtime

### SignalR Connection

```javascript
// src/Services/chatService.js
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${import.meta.env.VITE_API_URL}/chathub`, {
    accessTokenFactory: () => localStorage.getItem('token'),
  })
  .withAutomaticReconnect()
  .build();

export const startChat = async () => {
  try {
    await connection.start();
    console.log('Chat connected');
  } catch (err) {
    console.error('Chat connection error:', err);
  }
};

export const sendMessage = (message) => {
  connection.invoke('SendMessage', message);
};

export const onMessageReceived = (callback) => {
  connection.on('ReceiveMessage', callback);
};

export const stopChat = async () => {
  await connection.stop();
};
```

### Sử dụng Chat Component

```javascript
// src/components/ChatWindow.jsx
import { useEffect, useState } from 'react';
import * as chatService from '../Services/chatService';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    chatService.startChat();
    chatService.onMessageReceived((message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      chatService.stopChat();
    };
  }, []);

  const handleSendMessage = (text) => {
    chatService.sendMessage(text);
  };

  return (
    <div>
      {messages.map((msg, idx) => (
        <div key={idx}>{msg}</div>
      ))}
      <input onSend={handleSendMessage} />
    </div>
  );
}
```

## Scripts tiện ích

### Trong package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

| Script | Mô tả |
|--------|--------|
| `npm run dev` | Chạy development server (hot reload) |
| `npm run build` | Build production (minified) |
| `npm run lint` | Kiểm tra lỗi code với ESLint |
| `npm run preview` | Xem preview production build |

## Troubleshooting

### Lỗi: "Cannot find module" hoặc "API not found"

**Giải pháp:**
- Kiểm tra backend API đang chạy ở `http://localhost:5000`
- Xác nhận `VITE_API_URL` trong `.env.local` đúng
- Clear cache: `npm cache clean --force`

### Lỗi: "CORS error"

**Giải pháp:**
- Backend phải cấu hình CORS cho frontend URL:
  ```csharp
  // Trong PipeVolt_Api/Program.cs
  builder.Services.AddCors(options =>
  {
      options.AddPolicy("AllowFrontend", policy =>
      {
          policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
      });
  });
  ```

### Lỗi: "Token expired"

**Giải pháp:**
- Token hết hạn sẽ tự động chuyển hướng đến login
- Refresh token nên được implement ở backend (nếu có)

## Lưu ý bảo mật

- ⚠️ **Không commit `.env.local`** vào git (đã add vào `.gitignore`)
- ⚠️ **Không lưu sensitive data** ở localStorage (chỉ dùng cho JWT)
- ⚠️ **Validate input** trước khi gửi API
- ⚠️ **HTTPS** bắt buộc ở production
- ⚠️ **Google Client ID** chỉ dùng cho localhost & production domain được phép

## Liên hệ & Hỗ trợ

Nếu gặp vấn đề hoặc có câu hỏi, liên hệ:
- Backend Dev: [Backend README](../PipeVolt/README.md)
- API Docs: `http://localhost:5000/swagger/`
