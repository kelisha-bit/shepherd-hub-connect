import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeCard } from "@/components/ui/theme-card";
import { useThemeContext } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Laptop, Palette } from "lucide-react";

export default function ThemeDemo() {
  const { isDark } = useThemeContext();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Theme System</h1>
        <p className="text-muted-foreground">
          Customize the appearance of the application with light and dark mode support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ThemeCard className="md:col-span-1" />

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Current Theme</CardTitle>
            <CardDescription>Preview of the current theme settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mode:</span>
                <div className="flex items-center gap-2">
                  {isDark ? (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>Light Mode</span>
                    </>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <Label htmlFor="theme-preview">Preview:</Label>
                <div className="mt-2 p-4 border rounded-md bg-background">
                  <p className="text-foreground mb-2">Text in foreground color</p>
                  <p className="text-muted-foreground mb-2">Text in muted foreground color</p>
                  <div className="flex gap-2 mb-2">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input placeholder="Input field" className="max-w-xs" />
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>UI Components in Current Theme</CardTitle>
          <CardDescription>See how different components look in the current theme</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="buttons">
            <TabsList className="mb-4">
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="inputs">Inputs</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
            </TabsList>
            <TabsContent value="buttons" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button disabled>Disabled</Button>
                <Button variant="outline" size="icon">
                  <Palette className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="inputs" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-input">Default Input</Label>
                  <Input id="default-input" placeholder="Enter text here..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disabled-input">Disabled Input</Label>
                  <Input id="disabled-input" placeholder="Disabled" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="with-button" className="flex items-center gap-2">
                    <span>Toggle</span>
                    <Switch id="with-button" />
                  </Label>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="cards" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card description goes here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>This is the content of the card.</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary text-primary-foreground">
                  <CardHeader>
                    <CardTitle>Primary Card</CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                      With primary background
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Content with primary styling.</p>
                  </CardContent>
                </Card>
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">Alert Card</CardTitle>
                    <CardDescription>
                      With destructive border
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Content with destructive border.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}