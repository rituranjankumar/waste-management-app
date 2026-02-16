
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/providers/page";
import Navbar from "@/components/common/navbar";
import ReduxProvider from "@/store/reduxProvider";
import AuthSync from "@/utils/authSync";

export const metadata = {
  title: "Waste Management App",
  description: "App for managing the waste ",
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning lang="en">
      <body

      >
        <Providers>


          <ReduxProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>

              <AuthSync />
              {/* providers will help to access the useSession in client component */}
              <div>
                <Navbar />
                <main className="pt-20">

                  {children}

                </main>
              </div>

              <Toaster />
            </ThemeProvider>
          </ReduxProvider>
        </Providers>
      </body>
    </html>
  );
}
