// pages/webgazer.tsx or a similar file
import React from 'react';
import styles from '../dashboard/DashboardPage.module.css';
import DashboardLayout from '../layout';
import Mode2Display from "@/components/mode-2/mode-2-display";
import { SelectedTextProvider } from '../../../../contexts/SelectedTextContext'; // Adjust the import path if necessary
import { auth, currentUser } from "@clerk/nextjs";

// const WebgazerPage: React.FC = () => {
//   return (
//     <SelectedTextProvider>
//       <DashboardLayout navbarType="standard-auto">
//         <div
//           className={
//             styles.dashboardBg + " flex flex-col justify-start w-full pt-8 pb-10 min-h-screen"
//           }
//           style={{ paddingTop: '150px' }}
//         >
//           <div className="bg-white rounded-lg shadow-lg mx-auto p-8 pt-2 my-2" style={{
//               width: '90%', height: '25vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
//             <Mode2Display />
//           </div>
//         </div>
//       </DashboardLayout>
//     </SelectedTextProvider>
//   );
// };

// export default WebgazerPage;

export default async function DashboardPage() {
  const { userId } = auth();

  const user = await currentUser();
  const data = JSON.stringify({ user_id: user?.id });
  console.log(data);

  if (userId) {
    try {
      const response = await fetch(
        "http://localhost:3000/api/store-user-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: user?.id }),
        }
      );

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <SelectedTextProvider>
      <DashboardLayout navbarType="standard-auto">
        <div
          className={
            styles.dashboardBg +
            " flex flex-col justify-start w-full pt-8 pb-10 min-h-screen"
          }
          style={{ paddingTop: "150px" }}
        >
          <div
            className="bg-white rounded-lg shadow-lg mx-auto p-8 pt-2 my-2"
            style={{
              width: "90%",
              height: "25vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Mode2Display />
          </div>
        </div>
      </DashboardLayout>
    </SelectedTextProvider>
  );
}

export const config = {
  runtime: "edge",
};