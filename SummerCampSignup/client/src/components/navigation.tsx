import { Link, useLocation } from "wouter";

import images from "@assets/images.jpg";

export default function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <img 
                src={images} 
                alt="Gokuldham Temple Logo" 
                className="h-12 w-auto"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-temple-darkblue">Gokuldham Temple</h1>
              <p className="text-sm text-temple-orange font-semibold">Build Our Future</p>
            </div>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={`nav-link transition-colors duration-200 ${
                isActive("/") 
                  ? "text-temple-orange font-semibold" 
                  : "text-temple-blue hover:text-temple-orange"
              }`}
            >
              Home
            </Link>
            <Link 
              href="/registration" 
              className={`nav-link transition-colors duration-200 ${
                isActive("/registration") 
                  ? "text-temple-orange font-semibold" 
                  : "text-temple-blue hover:text-temple-orange"
              }`}
            >
              Register
            </Link>
            <Link 
              href="/check-registration" 
              className={`nav-link transition-colors duration-200 ${
                isActive("/check-registration") 
                  ? "text-temple-orange font-semibold" 
                  : "text-temple-blue hover:text-temple-orange"
              }`}
            >
              Check Status
            </Link>
            <Link 
              href="/admin" 
              className={`nav-link transition-colors duration-200 ${
                isActive("/admin") 
                  ? "text-temple-orange font-semibold" 
                  : "text-temple-blue hover:text-temple-orange"
              }`}
            >
              Admin
            </Link>
          </div>
          
          <button className="md:hidden text-temple-blue">
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}
