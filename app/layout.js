import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/custom/Navbar";
import { Fade } from "react-awesome-reveal";
import { AuthProvider } from "@/contexts/useAuth";
import 'react-toastify/dist/ReactToastify.css';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    template: '%s | EduManager',
    default: 'EduManager',
  },
  description: "Sistema de Gestión Escolar",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="h-screen">
            <Navbar />
            <div className="h-11/12">
              <Fade className="h-full" triggerOnce>
                {children}
              </Fade>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
