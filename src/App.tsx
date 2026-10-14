import { HashRouter, Routes, Route } from "react-router-dom";
import { StreamProvider } from "./context/StreamContext";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Monitor } from "./pages/Monitor";
import { Deadline } from "./pages/Deadline";
import { Flexnode } from "./pages/Flexnode";
import { Method } from "./pages/Method";

export default function App() {
  return (
    <StreamProvider>
      <HashRouter>
        <div className="min-h-screen">
          <Nav />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/monitor" element={<Monitor />} />
              <Route path="/deadline" element={<Deadline />} />
              <Route path="/flexnode" element={<Flexnode />} />
              <Route path="/method" element={<Method />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </StreamProvider>
  );
}
