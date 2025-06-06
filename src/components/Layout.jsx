import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return <Outlet />;

  return (
    <div>
      <nav style={{ padding: '10px', background: '#f0f0f0' }}>
        <Link to="/home" style={{ marginRight: '10px' }}>Home</Link>
        <Link to="/scan" style={{ marginRight: '10px' }}>Scan</Link>
        <Link to="/profile" style={{ marginRight: '10px' }}>Profile</Link>
        <button onClick={logout}>Logout</button>
      </nav>
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
