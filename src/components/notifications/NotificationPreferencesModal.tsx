"use client";

import * as React from "react";
import { Bell, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NotificationPreferences } from "@/types/notifications";

interface NotificationPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: NotificationPreferences;
  onPreferencesChange: (preferences: Partial<NotificationPreferences>) => void;
}

export function NotificationPreferencesModal({
  open,
  onOpenChange,
  preferences,
  onPreferencesChange,
}: NotificationPreferencesModalProps) {
  const [localPreferences, setLocalPreferences] = React.useState(preferences);

  React.useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleSave = () => {
    onPreferencesChange(localPreferences);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalPreferences(preferences);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new episodes from your shows
              </p>
            </div>
            <Switch
              checked={localPreferences.enabled}
              onCheckedChange={(checked: boolean) =>
                setLocalPreferences(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          <Separator />

          {/* Notification Sources */}
          <div className="space-y-4">
            <Label className="text-base flex items-center gap-2">
              <List className="h-4 w-4" />
              Notify for shows in:
            </Label>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="watching-notifications" className="text-sm">
                Currently Watching
              </Label>
              <Switch
                id="watching-notifications"
                checked={localPreferences.notifyForWatching}
                onCheckedChange={(checked: boolean) =>
                  setLocalPreferences(prev => ({ ...prev, notifyForWatching: checked }))
                }
                disabled={!localPreferences.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="watchlist-notifications" className="text-sm">
                Watchlist
              </Label>
              <Switch
                id="watchlist-notifications"
                checked={localPreferences.notifyForWatchlist}
                onCheckedChange={(checked: boolean) =>
                  setLocalPreferences(prev => ({ ...prev, notifyForWatchlist: checked }))
                }
                disabled={!localPreferences.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="watched-notifications" className="text-sm">
                Watched TV Shows
              </Label>
              <Switch
                id="watched-notifications"
                checked={localPreferences.notifyForWatched}
                onCheckedChange={(checked: boolean) =>
                  setLocalPreferences(prev => ({ ...prev, notifyForWatched: checked }))
                }
                disabled={!localPreferences.enabled}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
