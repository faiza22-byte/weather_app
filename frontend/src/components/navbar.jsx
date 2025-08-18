import logo from '../assets/logo.jpg'; // Put your logo image in the same folder or adjust path
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <img src={logo} alt="Weather App Logo" className="logo" />
        <span className="app-name">WeatherApp</span>
      </div>
    </nav>
  );
};

export default Navbar;
