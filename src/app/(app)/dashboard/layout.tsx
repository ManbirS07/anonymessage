import AuthProvider from "@/src/context/AuthProvider";
import Navbar from "@/src/app/components/navbar";
export default function Layout({ children }: { children: React.ReactNode }) {

  return <>
    <AuthProvider>
    <Navbar />
        {children}
    </AuthProvider>
  </>;
}
