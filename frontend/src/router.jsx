import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import MemberList from "./pages/MemberList";
import NotFound from "./pages/NotFound";
import ViewBook from "./pages/ViewBook";
import ResetPassword from "./pages/ResetPassword";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/browse" replace />,
      },
      {
        path: "browse",
        element: <Home />,
      },
      {
        path: "books/:isbn",
        element: <ViewBook />,
      },
      {
        path: "member/dashboard",
        element: (
          <ProtectedRoute>
            <MemberDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/dashboard",
        element: (
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/member-list",
        element: (
          <ProtectedRoute adminOnly>
            <MemberList />
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
