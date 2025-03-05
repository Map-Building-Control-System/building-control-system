import React from 'react';
import { Building, Clipboard, CheckCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './DashboardCard.module.scss';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: 'building' | 'clipboard' | 'check-circle' | 'alert-circle';
  trend: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, trend }) => {
  const renderIcon = () => {
    switch (icon) {
      case 'building':
        return <Building size={24} />;
      case 'clipboard':
        return <Clipboard size={24} />;
      case 'check-circle':
        return <CheckCircle size={24} />;
      case 'alert-circle':
        return <AlertCircle size={24} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.iconContainer}>
        {renderIcon()}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.value}>{value}</p>
      </div>
      {trend !== 0 && (
        <div className={`${styles.trend} ${trend > 0 ? styles.positive : styles.negative}`}>
          {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
