import styles from '../dashboard/DashboardPage.module.css';
import DashboardLayout from '../layout';
import Mode2Display from "@/components/mode-2/mode-2-display";

const WebgazerPage: React.FC = () => {
  return (
    <DashboardLayout navbarType="standard-auto">
      <div
        className={
          styles.dashboardBg + " flex flex-col  justify-center w-full pt-8 pb-10 min-h-screen"
        }
      >
        <div className="bg-white rounded-lg shadow-lg mx-auto p-8 pt-2 my-2" style={{
            width: '90%', height: '30vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Mode2Display />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WebgazerPage;

