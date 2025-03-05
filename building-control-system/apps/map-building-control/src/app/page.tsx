import React from 'react';
import styles from './page.module.scss';
import DashboardCard from '../components/Dashboard/DashboardCard';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Harita Yapı Kontrol Sistemi</h1>
      <div className={styles.dashboard}>
        <DashboardCard 
          title="Toplam Yapı" 
          value="1,245" 
          icon="building" 
          trend={5.2} 
        />
        <DashboardCard 
          title="Aktif Denetimler" 
          value="37" 
          icon="clipboard" 
          trend={-2.1} 
        />
        <DashboardCard 
          title="Tamamlanan Projeler" 
          value="842" 
          icon="check-circle" 
          trend={12.5} 
        />
        <DashboardCard 
          title="Bekleyen Onaylar" 
          value="15" 
          icon="alert-circle" 
          trend={0} 
        />
      </div>
      <div className={styles.content}>
        <p>Hoş geldiniz! Bu dashboard üzerinden tüm yapı ve harita işlemlerinizi yönetebilirsiniz.</p>
      </div>
    </div>
  );
}