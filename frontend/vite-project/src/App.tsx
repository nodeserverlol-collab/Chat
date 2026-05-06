// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Profile from './pages/profile';
import Login from './pages/Login';
import Navbar from './pages/Navbar';
import Home from './pages/Home'
import About from "./pages/About.tsx";
import Price from "./pages/Price.tsx";
import Chat from "./pages/chat.tsx"
import { useEffect, useState } from 'react';

function App() {
  const [paddingTop, setPaddingTop] = useState('80px');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setPaddingTop('100px');
      } else {
        setPaddingTop('80px');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ paddingTop }}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/Docs" element={<About />} />
          <Route path="/Price" element={ < Price  />}></Route>
          <Route path="/Chat" element={ < Chat  />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;