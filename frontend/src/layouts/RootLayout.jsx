import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout() {
  const { loading } = useContext(AuthContext);
  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <Toaster />
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
