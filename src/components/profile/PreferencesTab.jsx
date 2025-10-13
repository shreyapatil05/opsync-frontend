import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Moon, Sun, Bell, Mail, Globe, Calendar } from "lucide-react";
import { useTheme } from "next-themes";

export function PreferencesTab() {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    weeklyReports: true,
    language: "en",
    timezone: "America/Los_Angeles",
    dateFormat: "MM/DD/YYYY",
  });

  const handleSave = () => {
    toast.success("Preferences saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Theme Card */}
      <Card className="p-6 shadow-card border bg-gradient-card">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-1">Appearance</h3>
          <p className="text-sm text-muted-foreground">
            Customize how Opsync looks on your device
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-primary" />
              )}
              <div>
                <Label className="text-base font-medium">Theme Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Light</span>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
              <span className="text-sm text-muted-foreground">Dark</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications Card */}
      <Card className="p-6 shadow-card border bg-gradient-card">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage how you receive notifications
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Label className="text-base font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates via email
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, emailNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Label className="text-base font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get push notifications in browser
              </p>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, pushNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Label className="text-base font-medium">Task Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminders for upcoming tasks
              </p>
            </div>
            <Switch
              checked={preferences.taskReminders}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, taskReminders: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <Label className="text-base font-medium">Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly performance summaries
              </p>
            </div>
            <Switch
              checked={preferences.weeklyReports}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, weeklyReports: checked })
              }
            />
          </div>
        </div>
      </Card>

      {/* Localization Card */}
      <Card className="p-6 shadow-card border bg-gradient-card">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Localization
          </h3>
          <p className="text-sm text-muted-foreground">
            Set your language and regional preferences
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={preferences.language}
              onValueChange={(value) =>
                setPreferences({ ...preferences, language: value })
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) =>
                setPreferences({ ...preferences, timezone: value })
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Los_Angeles">
                  Pacific Time (PT)
                </SelectItem>
                <SelectItem value="America/New_York">
                  Eastern Time (ET)
                </SelectItem>
                <SelectItem value="Europe/London">
                  London (GMT)
                </SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Format
            </Label>
            <Select
              value={preferences.dateFormat}
              onValueChange={(value) =>
                setPreferences({ ...preferences, dateFormat: value })
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-gradient-primary hover:opacity-90"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
}