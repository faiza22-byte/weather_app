import { BrowserRouter as Router, Routes, Route, Navigate , Outlet } from "react-router-dom";
import Signup from "./components/signup";
import Login from "./components/login";
import Body from "./components/Body";
import ForgotPassword from "./components/forgotPassword";
import Dashboard from "./components/dashboard";
import 'leaflet/dist/leaflet.css';

function Layout() {
  // Layout wraps all auth related routes inside Body component with Earth + stars
  return <Body><Outlet /></Body>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Routes inside Body layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/signup" replace />} />
          <Route path="signup" element={<Signup />} />
          <Route path="login" element={<Login />} />
          <Route path="reset-password" element={<ForgotPassword />} />
          {/* other auth related routes here */}
        </Route>

        {/* Dashboard route is outside the Body layout, standalone full page */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </Router>
  );
}
