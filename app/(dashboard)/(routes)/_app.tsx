import { AppProps } from 'next/app';
import { SelectedTextProvider } from "../../../contexts/SelectedTextContext"; // Adjust the import path if necessary
import DashboardLayout from "./layout"; // Adjust the import path if necessary

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SelectedTextProvider>
      {/* Include DashboardLayout only if it's a global layout for all pages */}
      <DashboardLayout>
        <Component {...pageProps} />
      </DashboardLayout>
    </SelectedTextProvider>
  );
}

export default MyApp;
