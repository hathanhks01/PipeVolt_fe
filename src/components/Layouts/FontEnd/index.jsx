// components/Layouts/FontEnd/ClientLayout.jsx
import React from 'react';
import Navbar from './Navbar';
import MainContent from './MainContent';

export default function index() {
  return (
    <>
      <Navbar />
      <MainContent className="flex-grow" />
    </>
  );
}
