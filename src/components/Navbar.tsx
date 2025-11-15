import { NavLink } from "@/components/NavLink";
import { Building2 } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-xl font-bold text-primary no-underline">
            <Building2 className="w-6 h-6" />
            VISHWAKARMA AI
          </NavLink>
          
          <div className="flex items-center gap-8">
            <NavLink to="/" className="nav-link">
              Home
            </NavLink>
            <NavLink to="/converter" className="nav-link">
              2D → 3D Converter
            </NavLink>
            <NavLink to="/vastu" className="nav-link">
              Vastu AI
            </NavLink>
            <NavLink 
              to="/login" 
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:shadow-purple transition-smooth"
            >
              Login
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
