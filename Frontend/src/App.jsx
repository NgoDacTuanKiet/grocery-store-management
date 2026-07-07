import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login.jsx'; 
import Register from './pages/Auth/Register.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import Users from './pages/Users/User.jsx';
import Customers from './pages/Customers/Customer.jsx';
import Products from './pages/Products/Product.jsx';
import Categories from './pages/Categories/Category.jsx';

// Component bảo vệ Route: Nếu chưa có Token thì đá văng ra Login
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Cụm Route Private sử dụng AdminLayout */}
        <Route path="/" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            
            {/* Nội dung trang chủ (Tổng quan) */}
            <Route index element={<h2>Màn hình Tổng quan Dashboard (Sẽ code sau)</h2>} />
            
            {/* Nội dung các trang con (Sẽ hiện vào chỗ <Outlet />) */}
            <Route path="users" element={<Users />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="invoices" element={<h2>Khu vực Quản lý Hóa đơn</h2>} />

        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;