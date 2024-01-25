import { UserButton } from "@clerk/nextjs";
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  return (
    <div className={styles.dashboardBg}>
      <p>Dashboard Page (protected)</p>
    </div>
  );
};

export default DashboardPage;
