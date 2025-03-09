'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { settingsService, type AutomationSettings } from "@/lib/services/settings"

export default function LeadsDialerSettings() {
  const [settings, setSettings] = useState<AutomationSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await settingsService.getAutomationSettings()
      setSettings(settings)
    } catch {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    }
  }

  const updateSettings = async () => {
    if (!settings) return

    setLoading(true)
    const { success, error } = await settingsService.updateAllSettings({
      ...settings,
      // Keep automation_enabled unchanged since it's managed elsewhere
      automation_enabled: settings.automation_enabled
    })
    setLoading(false)

    if (!success) {
      toast({
        title: "Error",
        description: error || "Failed to update settings",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Settings updated successfully",
      variant: "default",
    })
  }

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    field: keyof AutomationSettings,
    min: number = 0
  ) => {
    if (!settings) return

    const input = e.target
    const value = input.value.trim()
    
    // If empty, revert to the current setting value
    if (value === '') {
      input.value = settings[field].toString()
      return
    }

    // Otherwise validate and update if it's a valid number
    const numValue = parseInt(value)
    if (isNaN(numValue)) {
      input.value = settings[field].toString()
      return
    }

    // Apply minimum value constraint
    const finalValue = Math.max(min, numValue)
    setSettings({ ...settings, [field]: finalValue })
    input.value = finalValue.toString()
  }

  if (!settings) return <div>Loading...</div>

  return (
    <Card
      className={
        'mb-5 w-full pt-8 pb-6 px-6 dark:border-zinc-800 text-black dark:text-white'
      }
    >
      <div className="mb-5">
        <p className="text-xl font-extrabold text-zinc-950 dark:text-white md:text-3xl">
            Credentials & API Keys
        </p>
        <p className="mb-5 mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-4 md:text-base">
          Here you can change your leads dialer settings
        </p>
        <hr className="my-8" />
      </div>
          <div className="space-y-2">
            <Label htmlFor="max-calls-batch">Maximum Calls per Batch</Label>
            <Input
              id="max-calls-batch"
              type="number"
              min={1}
              defaultValue={settings.max_calls_batch}
              onBlur={(e) => handleBlur(e, 'max_calls_batch', 1)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retry-interval">Retry Interval (minutes)</Label>
            <Input
              id="retry-interval"
              type="number"
              min={0}
              defaultValue={settings.retry_interval}
              onBlur={(e) => handleBlur(e, 'retry_interval', 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-attempts">Maximum Attempts per Lead</Label>
            <Input
              id="max-attempts"
              type="number"
              min={1}
              defaultValue={settings.max_attempts}
              onBlur={(e) => handleBlur(e, 'max_attempts', 1)}
            />
          </div>

          <Button 
            className="mt-6 flex h-full max-h-full w-full items-center justify-center rounded-lg px-4 py-4 text-base font-medium text-white font-semibold bg-green-600 hover:bg-green-700" 
            onClick={updateSettings}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings (activating auto-dialer is still required)'}
          </Button>
    </Card>
  )
}
