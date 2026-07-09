"use client";

import { useEffect, useState } from "react";
import {
  getReminderSettings,
  saveReminderSettings,
} from "@/app/reminders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Australia/Sydney",
];

export function ReminderSettings() {
  const [timezone, setTimezone] = useState("UTC");
  const [time, setTime] = useState("08:00");
  const [channel, setChannel] = useState<"email" | "push" | "both" | "none">(
    "email"
  );
  const [enabled, setEnabled] = useState(true);
  const [nextRun, setNextRun] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await getReminderSettings();
      if (res.ok && res.data) {
        setTimezone(res.data.timezone || "UTC");
        setTime(res.data.dailyReminderTime || "08:00");
        setChannel(
          (res.data.reminderChannel as typeof channel) || "email"
        );
        setEnabled(res.data.enabled || Boolean(res.data.dailyReminderTime));
        setNextRun(res.data.nextRunAt);
      } else if (res.error) {
        setMsg(res.error);
      }
      setLoading(false);
    })();
  }, []);

  async function onSave() {
    setSaving(true);
    setMsg(null);
    const res = await saveReminderSettings({
      timezone,
      dailyReminderTime: time,
      reminderChannel: channel,
      enabled,
    });
    if (!res.ok) {
      setMsg(res.error ?? "Save failed");
    } else {
      setMsg("Reminder preferences saved.");
      const refreshed = await getReminderSettings();
      if (refreshed.ok && refreshed.data) {
        setNextRun(refreshed.data.nextRunAt);
      }
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading reminders…</p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily prayer reminder</CardTitle>
        <CardDescription>
          Cron checks every 5 minutes on Vercel. Email needs Resend keys; push
          needs VAPID (optional).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Enable daily reminder
        </label>

        <div className="grid gap-2 max-w-xs">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={!enabled}
          />
        </div>

        <div className="grid gap-2 max-w-xs">
          <Label htmlFor="tz">Timezone</Label>
          <select
            id="tz"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={!enabled}
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2 max-w-xs">
          <Label htmlFor="channel">Channel</Label>
          <select
            id="channel"
            value={channel}
            onChange={(e) =>
              setChannel(e.target.value as typeof channel)
            }
            disabled={!enabled}
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none"
          >
            <option value="email">Email</option>
            <option value="push">Push (needs VAPID)</option>
            <option value="both">Email + push</option>
            <option value="none">None</option>
          </select>
        </div>

        {nextRun && (
          <p className="text-xs text-muted-foreground">
            Next scheduled: {new Date(nextRun).toLocaleString()}
          </p>
        )}

        <Button
          type="button"
          onClick={() => void onSave()}
          disabled={saving}
          className="w-full sm:w-fit"
        >
          {saving ? "Saving…" : "Save reminders"}
        </Button>

        {msg && (
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
            {msg}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
