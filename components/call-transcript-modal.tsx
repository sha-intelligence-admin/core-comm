"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Copy } from "lucide-react"
import { Fragment, useMemo, useState } from "react"

interface Call {
  id: string
  callerName: string
  callerNumber: string
  date: Date
  duration: string
  status: string
  summary: string
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
      return "bg-green-500/20 text-green-500"
    case "in-progress":
      return "bg-blue-500/20 text-blue-500"
    case "escalated":
      return "bg-purple-500/20 text-purple-500"
    default:
      return "bg-gray-500/20 text-gray-500"
  }
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const parseTranscript = (rawTranscript: string) => {
  const speakerRegex = /^(Customer|AI Assistant):\s*/i

  return rawTranscript
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk, index) => {
      const [firstLine, ...rest] = chunk.split(/\n/)
      const match = firstLine.match(speakerRegex)

      if (!match) {
        return {
          speaker: index % 2 === 0 ? "Customer" : "AI Assistant",
          message: chunk,
        }
      }

      const speaker = match[1]
      const message = [firstLine.replace(match[0], "").trim(), ...rest].join("\n").trim()

      return {
        speaker,
        message,
      }
    })
}

export function CallTranscriptModal({ call, open, onOpenChange }: CallTranscriptModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const callDate = useMemo(() => {
    if (!call) return null

    const parsed = call.date instanceof Date ? call.date : new Date(call.date)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }, [call])

  const transcriptEntries = useMemo(() => {
    if (!call?.transcript) return []

    return parseTranscript(call.transcript)
  }, [call?.transcript])

  if (!call) return null

  const normalizedSearch = searchTerm.trim()

  const renderHighlightedText = (text: string) => {
    if (!normalizedSearch) return text

    try {
      const regex = new RegExp(`(${escapeRegExp(normalizedSearch)})`, "gi")
      const parts = text.split(regex)

      return parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={`${part}-${index}`} className="rounded-sm bg-primary/10 px-1 py-px text-primary">
            {part}
          </mark>
        ) : (
          <Fragment key={`${part}-${index}`}>{part}</Fragment>
        )
      )
    } catch (error) {
      return text
    }
  }

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
      <DialogContent className="flex h-[min(90vh,680px)] w-[min(100vw-2rem,960px)] flex-col overflow-hidden rounded-lg border border-input bg-background p-0 shadow-2xl">
        <DialogHeader className="sticky top-0 z-20 space-y-2 border-b border-input bg-background/95 px-6 py-5 text-left backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <DialogTitle className="flex flex-row items-center justify-between">
            <span className="google-headline-small text-foreground">Call transcript</span>
            <Badge variant="secondary" className={`${getStatusColor(call.status)} text-xs uppercase tracking-wide`}>
              {call.status}
            </Badge>
          </DialogTitle>
          <DialogDescription className="google-body-medium text-muted-foreground">
            {call.callerName} • {call.callerNumber} • {callDate ? callDate.toLocaleString() : "Unknown time"} • {call.duration}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col gap-3 border-b border-input px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-lg">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transcript"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-sm border-input pl-10"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyTranscript}
                className="rounded-sm border-input bg-transparent hover:bg-primary/10"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTranscript}
                className="rounded-sm border-input bg-transparent hover:bg-primary/10"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 px-6 py-5">
            <div className="grid gap-4 rounded-sm border border-dashed border-input bg-muted/40 p-4 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="space-y-1">
                <div className="google-label-medium text-muted-foreground/80">Caller</div>
                <div className="text-foreground">{call.callerName}</div>
                <div>{call.callerNumber}</div>
              </div>
              <div className="space-y-1">
                <div className="google-label-medium text-muted-foreground/80">Duration</div>
                <div className="text-foreground">{call.duration}</div>
                <div>{callDate ? callDate.toLocaleDateString() : "Unknown date"}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="google-title-small text-foreground">Transcript</div>
              <div className="space-y-4">
                {transcriptEntries.length > 0 ? (
                  transcriptEntries.map((entry, index) => {
                    const isCustomer = entry.speaker.toLowerCase().includes("customer")

                    return (
                      <div
                        key={`${entry.speaker}-${index}-${entry.message.slice(0, 12)}`}
                        className={`flex w-full ${isCustomer ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[85%] space-y-2 rounded-md border border-input px-3 py-2 text-sm leading-relaxed shadow-sm ${
                            isCustomer
                              ? "bg-muted/60 text-foreground"
                              : "bg-primary/5 text-foreground border-primary/20"
                          }`}
                        >
                          <div
                            className={`google-label-medium uppercase tracking-wide ${
                              isCustomer ? "text-muted-foreground" : "text-primary"
                            }`}
                          >
                            {entry.speaker}
                          </div>
                          <div className="whitespace-pre-line text-muted-foreground">
                            {renderHighlightedText(entry.message)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="rounded-md border border-dashed border-input bg-card/60 p-4 text-sm text-muted-foreground">
                    {renderHighlightedText(call.transcript || "No transcript available.")}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-input px-6 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>Call Resolution: Automated notes generated for CRM</span>
            <span>MCP Actions: 2 (Summary, transcript export)</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
