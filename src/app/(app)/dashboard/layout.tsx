import Navbar from "@/src/app/components/navbar";
export default function Layout({ children }: { children: React.ReactNode }) {

  return <>
    <Navbar />
    {children}
  </>;
}
