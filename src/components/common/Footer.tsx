import { Link } from "react-router-dom";
import { Church } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-primary flex items-center justify-center">
              <Church className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium">ChurchCMS</span>
          </div>
          
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © {currentYear} ChurchCMS. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}