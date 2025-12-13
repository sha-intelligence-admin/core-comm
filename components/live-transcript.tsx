"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface TranscriptSegment {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  created_at: string
}

interface LiveTranscriptProps {
  callId: string
  fallbackTranscript?: string
}

export function LiveTranscript({ callId, fallbackTranscript }: LiveTranscriptProps) {
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!callId) {
      setLoading(false)
      return
    }

    // 1. Fetch existing segments
    const fetchSegments = async () => {
      const { data } = await supabase
        .from("call_transcript_segments")
        .select("*")
        .eq("call_id", callId)
        .order("created_at", { ascending: true })

      if (data && data.length > 0) {
        setSegments(data)
      }
      setLoading(false)
    }

    fetchSegments()

    // 2. Subscribe to new segments
    const channel = supabase
      .channel(`call-${callId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "call_transcript_segments",
          filter: `call_id=eq.${callId}`,
        },
        (payload) => {
          setSegments((prev) => [...prev, payload.new as TranscriptSegment])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [callId, supabase])

  // Auto-scroll to bottom
  useEffect(() => {
    if (segments.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [segments])

  // If no segments found yet and we have a fallback (static transcript), show that instead
  // This handles legacy calls or calls before this feature was enabled
  if (!loading && segments.length === 0 && fallbackTranscript) {
    return (
      <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
        {fallbackTranscript}
      </div>
    )
  }

  if (loading && segments.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!loading && segments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No transcript available yet.
      </div>
    )
  }

  return (
    <div className="space-y-4 p-1">
      {segments.map((segment) => (
        <div
          key={segment.id}
          className={`flex ${segment.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] rounded-lg p-3 text-sm ${
              segment.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            <p className="font-semibold text-xs mb-1 opacity-70 uppercase">
              {segment.role === "user" ? "Customer" : "AI Assistant"}
            </p>
            <p>{segment.content}</p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
