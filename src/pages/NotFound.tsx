import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MoveLeft, AlertCircle } from "lucide-react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/10 p-4">
      <div className="text-center space-y-6 max-w-md">
        <AlertCircle className="h-16 w-16 text-primary mx-auto animate-pulse" />
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-primary">
            404
          </h1>
          <h2 className="text-2xl font-semibold">
            Oops! Page not found
          </h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
            <br />
            <span className="text-sm">
              Attempted path: <code className="text-primary">{location.pathname}</code>
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="default"
            asChild
            className="gap-2"
          >
            <Link to="/">
              <MoveLeft className="h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
