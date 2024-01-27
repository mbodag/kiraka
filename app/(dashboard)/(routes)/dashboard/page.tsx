import { UserButton } from "@clerk/nextjs";
import styles from './DashboardPage.module.css';
import Mode1Display from "@/components/mode-1-display";

const DashboardPage = () => {
  return (
    <div
      className={
        styles.dashboardBg + " flex justify-center pt-16 pb-8 min-h-screen"
      }
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto p-8 my-2">
        <Mode1Display />
      </div>
    </div>
  );
};

export default DashboardPage;