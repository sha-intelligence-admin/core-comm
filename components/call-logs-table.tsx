"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CallTranscriptModal } from "./call-transcript-modal"
import { Eye, Download, ChevronDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const callLogs = [
  {
    id: "1",
    callerName: "Sarah Johnson",
    callerNumber: "+1 (555) 123-4567",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    duration: "3m 45s",
    status: "resolved",
    summary:
      "Customer requested a return label for a headset purchase. AI verified the order and sent the label via email.",
    transcript: `Customer: Hi, I need to return the headset I ordered last week.\n\nAI Assistant: I can help with that. Could you share the order number or email tied to the purchase?\n\nCustomer: The order number is ORD-12345 and the email is sarah.johnson@email.com.\n\nAI Assistant: Thanks! I located your order. Since it's within 30 days, you're eligible for a return. I'll email you a prepaid return label now. Is there anything else you noticed about the product?\n\nCustomer: The sound quality just wasn't what I expected, but it's not broken.\n\nAI Assistant: Understood. The label is on its way to your inbox. Once we receive the headset, expect a refund within 3-5 business days. Anything else I can help with today?\n\nCustomer: Nope, that covers it. Thank you!`,
  },
  {
    id: "2",
    callerName: "Mike Chen",
    callerNumber: "+1 (555) 987-6543",
    date: new Date(Date.now() - 1000 * 60 * 60 * 4),
    duration: "5m 12s",
    status: "escalated",
    summary:
      "Technical installation failed after multiple retries; call escalated to human engineer for hands-on assistance.",
    transcript: `Customer: I'm trying to install the CoreComm desktop agent, but it fails at 42%.\n\nAI Assistant: Thanks for letting me know. Do you see any specific error code when it stops?\n\nCustomer: Yeah, it shows ERR-509 about missing dependencies.\n\nAI Assistant: That usually means the Visual C++ runtime is missing. I can trigger an automated fix. Would you like me to start that?\n\nCustomer: Sure, go ahead.\n\nAI Assistant: Running the repair now. You should see a confirmation window in a few seconds.\n\nCustomer: Okay, I see it installing... wait, it failed again with the same error.\n\nAI Assistant: Since the automated repair didn't complete, I'll escalate this session to a human engineer who can remote in. They'll reach out within 10 minutes.\n\nCustomer: Sounds good, thanks.`,
  },
  {
    id: "3",
    callerName: "Emily Davis",
    callerNumber: "+1 (555) 456-7890",
    date: new Date(Date.now() - 1000 * 60 * 60 * 6),
    duration: "2m 15s",
    status: "resolved",
    summary: "Clarified a monthly subscription renewal charge and emailed a receipt summary to the customer.",
    transcript: `Customer: Hi, can you explain the $49 charge on my statement?\n\nAI Assistant: Sure thing. Let me open your billing history. I see the $49 is for the CoreComm Pro monthly renewal on September 12.\n\nCustomer: Oh right, that makes sense. Could you send me the receipt?\n\nAI Assistant: Absolutely. I've just emailed the receipt to emily.davis@email.com. Anything else I can help with?\n\nCustomer: Nope, thanks!`,
  },
  {
    id: "4",
    callerName: "Robert Wilson",
    callerNumber: "+1 (555) 321-0987",
    date: new Date(Date.now() - 1000 * 60 * 60 * 8),
    duration: "4m 33s",
    status: "pending",
    summary: "Walked through IVR menu changes; customer still needs to confirm a routing rule before completion.",
    transcript: `Customer: I'm updating our IVR so that after-hours calls go to voicemail.\n\nAI Assistant: I can help configure that. Are you using the Support or Sales flow?\n\nCustomer: Support flow.\n\nAI Assistant: Great. I've scheduled a rules update to route Support calls to voicemail between 6pm and 8am. Do you want a fallback to the on-call manager?\n\nCustomer: Let me check with the team first.\n\nAI Assistant: No problem. I've saved the draft changes. When you're ready, just confirm and I'll publish the update.`,
  },
  {
    id: "5",
    callerName: "Lisa Anderson",
    callerNumber: "+1 (555) 654-3210",
    date: new Date(Date.now() - 1000 * 60 * 60 * 12),
    duration: "1m 58s",
    status: "resolved",
    summary: "Shared live tracking link and confirmed delivery ETA for a replacement router shipment.",
    transcript: `Customer: I'm checking on the status of my replacement router.\n\nAI Assistant: Let me pull that up. The replacement shipped yesterday via FedEx and is scheduled to arrive tomorrow by 5pm.\n\nCustomer: Great, can you send me the tracking link?\n\nAI Assistant: Done! The link is now in your email and via SMS. Anything else I can help with?\n\nCustomer: That's all, thanks!`,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "resolved":
      return "bg-green-500/20 text-green-500"
    case "in-progress":
      return "bg-blue-500/20 text-blue-500"
    case "escalated":
      return "bg-purple-500/20 text-purple-500"
    default:
      return "bg-gray-500/20 text-gray-500"
  }
}

const formatStatus = (status: string) => status.charAt(0).toUpperCase() + status.slice(1)

export function CallLogsTable() {
  const [selectedCall, setSelectedCall] = useState<(typeof callLogs)[0] | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const toggleCardExpansion = (id: string) => {
    setExpandedCard((current) => (current === id ? null : id))
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-3">
          {callLogs.map((call) => {
            const isExpanded = expandedCard === call.id
            const expandedBodyId = `call-card-details-${call.id}`

            return (
              <div key={call.id} className="rounded-sm border border-input bg-card p-4 shadow-sm transition-all duration-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="google-title-medium text-foreground">{call.callerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(call.date, { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(call.status)} transition-all duration-200`}
                    >
                      {formatStatus(call.status)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full border transition-colors duration-200 ${isExpanded ? "border-primary bg-primary/5 text-primary" : "border-transparent"
                        }`}
                      onClick={() => toggleCardExpansion(call.id)}
                      aria-expanded={isExpanded}
                      aria-controls={expandedBodyId}
                      aria-label={`${isExpanded ? "Hide" : "Show"} call actions`}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                          }`}
                      />
                    </Button>
                  </div>
                </div>

                <div
                  id={expandedBodyId}
                  className={`grid transition-[grid-template-rows,opacity,margin,visibility] duration-300 ease-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
                    }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="space-y-4 border-t border-input pt-4 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-foreground">Phone</span>
                        <span className="text-right">{call.callerNumber}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-foreground">Duration</span>
                        <span className="text-right text-foreground">{call.duration}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Summary</span>
                        <p className="mt-1 leading-5 text-muted-foreground">{call.summary}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCall(call)}
                          className="rounded-sm border-input hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View transcript
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-sm border-input bg-transparent hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export call
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="hidden rounded-sm border border-input bg-card">
          <div className="w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-primary/5 transition-colors duration-200">
                  <TableHead>Caller</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callLogs.map((call) => (
                  <TableRow
                    key={call.id}
                    className="hover:bg-primary/5 transition-all duration-300 hover:shadow-sm cursor-pointer group"
                  >
                    <TableCell className="font-medium group-hover:text-primary transition-colors duration-200">
                      {call.callerName}
                    </TableCell>
                    <TableCell className="group-hover:text-foreground transition-colors duration-200">
                      {call.callerNumber}
                    </TableCell>
                    <TableCell className="group-hover:text-foreground transition-colors duration-200">
                      {formatDistanceToNow(call.date, { addSuffix: true })}
                    </TableCell>
                    <TableCell className="group-hover:text-foreground transition-colors duration-200">
                      {call.duration}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(call.status)} transition-all duration-200 group-hover:scale-105`}
                      >
                        {formatStatus(call.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCall(call)}
                          className="rounded-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-sm bg-transparent hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <CallTranscriptModal
        call={selectedCall}
        open={!!selectedCall}
        onOpenChange={(open) => !open && setSelectedCall(null)}
      />
    </>
  )
}
