// components/Layouts/FontEnd/ClientLayout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

export default function index() {
  return (
    <div className="flex h-screen">
  <Sidebar />  
  <main className="flex-1 bg-gray-100 p-6 overflow-auto">
    <MainContent/>
  </main>
</div>

  );
}
