import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Home, Map, Building, Clipboard, Settings, HelpCircle } from 'lucide-react';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  open: boolean;
  isMobile: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, isMobile, closeSidebar }) => {
  const pathname = usePathname();
  
  const menuItems = [
    { path: '/', label: 'Ana Sayfa', icon: <Home size={20} /> },
    { path: '/maps', label: 'Haritalar', icon: <Map size={20} /> },
    { path: '/buildings', label: 'Yapılar', icon: <Building size={20} /> },
    { path: '/inspections', label: 'Denetimler', icon: <Clipboard size={20} /> },
    { path: '/settings', label: 'Ayarlar', icon: <Settings size={20} /> },
    { path: '/about', label: 'Yardım', icon: <HelpCircle size={20} /> },
  ];

  if (isMobile && !open) {
    return null;
  }

  return (
    <>
      {isMobile && open && (
        <div className={styles.overlay} onClick={closeSidebar}></div>
      )}
      <aside className={`${styles.sidebar} ${open ? styles.open : styles.closed}`}>
        {isMobile && (
          <button className={styles.closeButton} onClick={closeSidebar}>
            <X size={24} />
          </button>
        )}
        
        <div className={styles.logoContainer}>
          <h2 className={styles.logoText}>MBC</h2>
        </div>
        
        <nav className={styles.nav}>
          <ul className={styles.menu}>
            {menuItems.map((item) => (
              <li key={item.path} className={styles.menuItem}>
                <Link href={item.path} className={`${styles.menuLink} ${pathname === item.path ? styles.active : ''}`}>
                  <span className={styles.menuIcon}>{item.icon}</span>
                  <span className={styles.menuLabel}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className={styles.footer}>
          <span className={styles.version}>v1.0.0</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;