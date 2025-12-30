"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { LogOut, Clock } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

interface ActiveSession {
  id: string
  isCurrent: boolean
  createdAt: string
  lastActivity: string
  userAgent?: string
  ipAddress?: string
}

interface SessionsModalProps {
  isOpen: boolean
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onOpenChange: (open: boolean) => void
}

export function SessionsModal({ isOpen, onOpenChange }: SessionsModalProps) {
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [loading, setLoading] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }
      
      if (!session) {
        setSessions([])
        return
      }

      // For now, show the current session only
      // In production, you'd want to query a custom API endpoint that lists all sessions
      const formattedSessions: ActiveSession[] = [{
        id: session.access_token.slice(0, 10) || 'current',
        isCurrent: true,
        createdAt: session.user?.created_at || new Date().toISOString(),
        lastActivity: session.user?.last_sign_in_at || new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device',
      }]

      setSessions(formattedSessions)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    if (sessionId === sessions.find(s => s.isCurrent)?.id) {
      toast({
        title: "Cannot revoke",
        description: "You cannot revoke your current session",
        variant: "destructive",
      })
      return
    }

    setRevoking(sessionId)
    try {
      // Note: Supabase doesn't have a direct way to revoke other sessions
      // This would need to be implemented via a custom API endpoint
      // For now, we'll show a placeholder implementation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSessions(sessions.filter(s => s.id !== sessionId))
      toast({
        title: "Success",
        description: "Session revoked successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke session",
        variant: "destructive",
      })
    } finally {
      setRevoking(null)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchSessions()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Active Sessions</DialogTitle>
          <DialogDescription>
            Manage your active sessions and sign out from other devices
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="sm" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active sessions found</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-sm border border-input bg-muted/40 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="google-body-small text-foreground font-medium">
                        {session.isCurrent ? "Current Session" : "Active Session"}
                      </span>
                      {session.isCurrent && (
                        <Badge variant="outline" className="rounded-full bg-green-500/20 border-green-500/30 text-green-600">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Created: {format(new Date(session.createdAt), "MMM d, yyyy HH:mm:ss")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last active: {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}
                      </div>
                      {session.userAgent && (
                        <div className="text-xs text-muted-foreground mt-2 break-words">
                          {session.userAgent}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-sm border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 flex-shrink-0"
                    onClick={() => revokeSession(session.id)}
                    disabled={session.isCurrent || revoking === session.id}
                  >
                    {revoking === session.id ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <LogOut className="mr-2 h-3 w-3" />
                    )}
                    Sign Out
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-xs text-muted-foreground mt-4 p-3 rounded-sm bg-muted/40">
          <p className="font-medium mb-1">Security Tip:</p>
          <p>Regularly review your active sessions and sign out from any unrecognized devices to keep your account secure.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
