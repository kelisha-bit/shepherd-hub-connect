import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/contexts/ThemeContext";
import { Moon, Sun, Laptop } from "lucide-react";

interface ThemeCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export function ThemeCard({
  title = "Theme Settings",
  description = "Customize the appearance of the application.",
  className,
}: ThemeCardProps) {
  const { theme, setTheme, isDark } = useThemeContext();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Theme:</span>
            <span className="flex items-center gap-2">
              {theme === "light" && (
                <>
                  <Sun className="h-4 w-4" />
                  <span>Light</span>
                </>
              )}
              {theme === "dark" && (
                <>
                  <Moon className="h-4 w-4" />
                  <span>Dark</span>
                </>
              )}
              {theme === "system" && (
                <>
                  <Laptop className="h-4 w-4" />
                  <span>System</span>
                </>
              )}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
              className="w-full"
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
              className="w-full"
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("system")}
              className="w-full"
            >
              <Laptop className="mr-2 h-4 w-4" />
              System
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {isDark ? "Dark mode is active" : "Light mode is active"}
        </div>
      </CardFooter>
    </Card>
  );
}