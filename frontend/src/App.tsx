import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { TableProvider } from './context/TableContext.js';
import { CartProvider } from './context/CartContext.js';
import { EventsProvider } from './context/EventsContext.js';

import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { PwaInstallPrompt } from './components/PwaInstallPrompt.js';

import { HomePage } from './pages/HomePage.js';
import { MenuPage } from './pages/MenuPage.js';
import { ScanPage } from './pages/ScanPage.js';
import { TablePage } from './pages/TablePage.js';
import { DrinkBuilderPage } from './pages/DrinkBuilderPage.js';
import { AiBaristaPage } from './pages/AiBaristaPage.js';
import { CartPage } from './pages/CartPage.js';
import { OrdersHistoryPage } from './pages/OrdersHistoryPage.js';
import { OrderTrackingPage } from './pages/OrderTrackingPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { AdminTablesPage } from './pages/AdminTablesPage.js';
import { KitchenKDSPage } from './pages/KitchenKDSPage.js';
import { GalleryPage } from './pages/GalleryPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { AiLabPage } from './pages/AiLabPage.js';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isKds = location.pathname === '/kitchen';

  return (
    <div className="flex flex-col min-h-screen">
      {!isKds && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/table/:tableId" element={<TablePage />} />
          <Route path="/build" element={<DrinkBuilderPage />} />
          <Route path="/ai-barista" element={<AiBaristaPage />} />
          <Route path="/order" element={<CartPage />} />
          <Route path="/orders" element={<OrdersHistoryPage />} />
          <Route path="/order/:orderId" element={<OrderTrackingPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/tables" element={<AdminTablesPage />} />
          <Route path="/kitchen" element={<KitchenKDSPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/ai-lab" element={<AiLabPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <PwaInstallPrompt />
      {!isKds && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <TableProvider>
          <CartProvider>
            <EventsProvider>
              <BrowserRouter>
                <AppLayout />
              </BrowserRouter>
            </EventsProvider>
          </CartProvider>
        </TableProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
