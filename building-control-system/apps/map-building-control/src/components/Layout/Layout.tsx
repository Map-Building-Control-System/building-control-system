'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkIfMobile();
    
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.layout}>
      <Navbar toggleSidebar={toggleSidebar} />
      <div className={styles.container}>
        <Sidebar open={sidebarOpen} isMobile={isMobile} closeSidebar={() => setSidebarOpen(false)} />
        <main className={`${styles.content} ${sidebarOpen ? '' : styles.expanded}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;