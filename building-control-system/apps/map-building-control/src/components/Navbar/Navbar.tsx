import React from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';
import styles from './Navbar.module.scss';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft}>
        <button className={styles.menuButton} onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <h1 className={styles.logo}>MBC</h1>
      </div>
      
      {/* <div className={styles.searchContainer}>
        <Search size={18} className={styles.searchIcon} />
        <input type="text" placeholder="Ara..." className={styles.searchInput} />
      </div> */}
      
      <div className={styles.navRight}>
        <button className={styles.iconButton}>
          <Bell size={20} />
          <span className={styles.badge}>3</span>
        </button>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            <User size={20} />
          </div>
          <span className={styles.userName}>Admin</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;