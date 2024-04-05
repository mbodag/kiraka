import { UserButton, auth, currentUser } from "@clerk/nextjs";
import styles from "./DashboardPage.module.css";
import DashboardLayout from "../layout";
import Mode1Display from "@/components/mode-1/mode-1-display";

// const DashboardPage: React.FC = () => {
//   return (
//     <DashboardLayout navbarType="standard-manual">
//       <div
//         className={
//           styles.dashboardBg + " flex justify-center pt-10 pb-8 min-h-screen"
//         }
//       >
//         <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto p-8 pt-2 my-2">
//           <Mode1Display />
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default DashboardPage;

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    return <div>loading...</div>;
  }

  const user = await currentUser();
  console.log(user);

  const userData = async () => {
    const user = await currentUser();

    try {
      const response = await fetch("/api/get_info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <DashboardLayout navbarType="standard-manual">
      <div
        className={
          styles.dashboardBg + " flex justify-center pt-10 pb-8 min-h-screen"
        }
      >
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto p-8 pt-2 my-2">
          <Mode1Display />
        </div>
      </div>
    </DashboardLayout>
  );
}
