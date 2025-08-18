"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Copy } from "lucide-react"
import { useState } from "react"

interface Call {
  id: string
  callerName: string
  callerNumber: string
  date: Date
  duration: string
  status: string
  transcript: string
}

interface CallTranscriptModalProps {
  call: Call | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "resolved":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "escalated":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function CallTranscriptModal({ call, open, onOpenChange }: CallTranscriptModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  if (!call) return null

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(call.transcript)
  }

  const handleDownloadTranscript = () => {
    const element = document.createElement("a")
    const file = new Blob([call.transcript], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `transcript-${call.id}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Call Transcript - {call.callerName}</span>
            <Badge variant="secondary" className={getStatusColor(call.status)}>
              {call.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {call.callerNumber} • {call.date.toLocaleDateString()} • {call.duration}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transcript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Button variant="outline" onClick={handleCopyTranscript} className="rounded-xl bg-transparent">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handleDownloadTranscript} className="rounded-xl bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="border rounded-xl p-4 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-600 mb-1">Customer</div>
                  <div className="text-sm">Hi, I need help with returning a product I purchased last week.</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary mb-1">AI Assistant</div>
                  <div className="text-sm">
                    I'd be happy to help you with your return. Can you please provide me with your order number or the
                    email address associated with your purchase?
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-600 mb-1">Customer</div>
                  <div className="text-sm">
                    Sure, my order number is ORD-12345 and my email is sarah.johnson@email.com
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary mb-1">AI Assistant</div>
                  <div className="text-sm">
                    Thank you! I found your order. I can see you purchased a wireless headset. Our return policy allows
                    returns within 30 days of purchase. Since your order was placed last week, you're well within the
                    return window. I'll email you a prepaid return label right now. Is there anything specific wrong
                    with the product?
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-600 mb-1">Customer</div>
                  <div className="text-sm">
                    The sound quality isn't what I expected. It's not defective, just not what I was looking for.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary mb-1">AI Assistant</div>
                  <div className="text-sm">
                    I understand completely. I've sent the return label to your email address. Once you ship the item
                    back to us, your refund will be processed within 3-5 business days. Is there anything else I can
                    help you with today?
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-600 mb-1">Customer</div>
                  <div className="text-sm">That's perfect, thank you so much for your help!</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Call Resolution: Automated return process completed successfully</span>
            <span>MCP Actions: 2 (Order lookup, Return label generation)</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
