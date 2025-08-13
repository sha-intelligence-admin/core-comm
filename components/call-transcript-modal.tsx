"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Copy } from "lucide-react"

interface CallTranscriptModalProps {
  call: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CallTranscriptModal({ call, open, onOpenChange }: CallTranscriptModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  if (!call) return null

  const mockTranscript = [
    { speaker: "AI", time: "00:00", text: "Hello! Thank you for calling CoreComm support. How can I help you today?" },
    {
      speaker: "Customer",
      time: "00:05",
      text: "Hi, I'm having trouble with my account billing. I was charged twice this month.",
    },
    {
      speaker: "AI",
      time: "00:12",
      text: "I understand your concern about the duplicate billing. Let me look into your account right away. Can you please provide your account number?",
    },
    { speaker: "Customer", time: "00:20", text: "Sure, it's AC-12345678." },
    {
      speaker: "AI",
      time: "00:25",
      text: "Thank you. I can see your account now. I notice there were indeed two charges on January 10th. This appears to be a processing error. Let me initiate a refund for the duplicate charge right away.",
    },
    { speaker: "Customer", time: "00:40", text: "That would be great, thank you. How long will it take?" },
    {
      speaker: "AI",
      time: "00:45",
      text: "The refund has been processed and should appear in your account within 3-5 business days. I've also added a note to prevent this from happening again. Is there anything else I can help you with today?",
    },
    { speaker: "Customer", time: "00:58", text: "No, that covers everything. Thank you so much for your help!" },
    {
      speaker: "AI",
      time: "01:02",
      text: "You're very welcome! Have a great day and thank you for choosing CoreComm.",
    },
  ]

  const filteredTranscript = mockTranscript.filter((entry) =>
    entry.text.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "escalated":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Call Transcript - {call.callerName}</span>
            <Badge variant="outline" className={getStatusColor(call.status)}>
              {call.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {call.date} at {call.time} • Duration: {call.duration} • {call.callerNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {filteredTranscript.map((entry, index) => (
            <div key={index} className="flex space-x-4">
              <div className="flex-shrink-0 w-20 text-xs text-muted-foreground pt-1">{entry.time}</div>
              <div className="flex-shrink-0 w-20">
                <Badge variant={entry.speaker === "AI" ? "default" : "secondary"} className="text-xs">
                  {entry.speaker}
                </Badge>
              </div>
              <div className="flex-1 text-sm">
                {searchTerm && entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: entry.text.replace(new RegExp(searchTerm, "gi"), '<mark class="bg-yellow-200">$&</mark>'),
                    }}
                  />
                ) : (
                  entry.text
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
