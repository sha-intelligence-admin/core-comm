import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UsageStatsProps {
  voiceMinutesUsed: number
  voiceMinutesLimit: number | null
  smsUsed: number
  smsLimit: number | null
  emailsUsed: number
  emailsLimit: number | null
}

export function UsageStats({ 
  voiceMinutesUsed, voiceMinutesLimit,
  smsUsed, smsLimit,
  emailsUsed, emailsLimit
}: UsageStatsProps) {
  
  const calculatePercentage = (used: number, limit: number | null) => {
    if (!limit) return 0;
    return Math.min(100, (used / limit) * 100);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Period Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Voice Minutes</span>
            <span className="text-muted-foreground">
              {voiceMinutesUsed} / {voiceMinutesLimit ? voiceMinutesLimit : '∞'}
            </span>
          </div>
          <Progress value={calculatePercentage(voiceMinutesUsed, voiceMinutesLimit)} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>SMS Messages</span>
            <span className="text-muted-foreground">
              {smsUsed} / {smsLimit ? smsLimit : '∞'}
            </span>
          </div>
          <Progress value={calculatePercentage(smsUsed, smsLimit)} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Emails</span>
            <span className="text-muted-foreground">
              {emailsUsed} / {emailsLimit ? emailsLimit : '∞'}
            </span>
          </div>
          <Progress value={calculatePercentage(emailsUsed, emailsLimit)} />
        </div>
      </CardContent>
    </Card>
  )
}
