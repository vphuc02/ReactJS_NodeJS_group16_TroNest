import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const ClientLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />
      <main className="grow pt-[76px] sm:pt-[82px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
