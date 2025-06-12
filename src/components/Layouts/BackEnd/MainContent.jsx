import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Customer from '../../Pages/Admin/Customer';
import Product from '../../Pages/Admin/Product';
import Brand from '../../Pages/Admin/Brand';
import Employee from '../../Pages/Admin/Employee';
import Warehouse from '../../Pages/Admin/Warehouse';
import ProductCategory from '../../Pages/Admin/ProductCategory';
import UserAccount from '../../Pages/Admin/UserAccount';
import Inventory from '../../Pages/Admin/Inventory';
import SalesOrder from '../../Pages/Admin/SalesOrder';
import PurchaseOrder from '../../Pages/Admin/PurchaseOrder';
import Supplier from '../../Pages/Admin/Supplier';
import ChatAdmin from '../../Pages/Admin/ChatAdmin';
import POS from '../../Pages/Admin/POS';
import PrintBill from '../../Pages/Admin/PrintBill';
const MainContent = () => {
  return (
    <Routes>
      <Route path="/admin" element={<Product />} />
      <Route path="/Customer" element={<Customer />} />
      <Route path="/Products" element={<Product />} />
      <Route path="/Brand" element={<Brand />} />
      <Route path="/Employee" element={<Employee />} />
      <Route path="/Warehouse" element={<Warehouse />} />
      <Route path="/Inventory" element={<Inventory />} />
      <Route path="/ProductCategory" element={<ProductCategory />} />
      <Route path="/UserAccounts" element={<UserAccount />} />
      <Route path="/Orders" element={<SalesOrder />} />
      <Route path="/PurchaseOrders" element={<PurchaseOrder />} />
      <Route path="/Suppliers" element={<Supplier />} />
      <Route path="/chat" element={<ChatAdmin />} />
      <Route path="/pos" element={<POS />} />
      <Route path="/print-bill/:orderId" element={PrintBill} />
    </Routes>

  )
}

export default MainContent