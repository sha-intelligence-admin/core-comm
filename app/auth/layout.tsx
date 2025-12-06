"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { caseStudies } from "@/app/constants/CaseStudies"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col items-center justify-start relative w-full">
      <div className="flex w-full min-h-screen items-center justify-center">
        {/* Left: content */}
        <div className="lg:px-20 px-4 w-full flex flex-1 flex-col justify-center items-center h-full">
          {/* Top-left logo */}
          <div className="absolute top-4 left-4 flex w-full space-x-2 items-center justify-start text-foreground font-semibold">
            <img src="/logo.webp" alt="CoreComm" className="w-10" />
            <Link href="/" className="google-body-medium">CoreComm</Link>
          </div>
          {/* Main content container */}
          <div className="w-full max-w-md mx-auto space-y-6">
            {children}
          </div>
        </div>

        {/* Right: promo / theme toggle */}
        <div className="hidden min-h-screen flex-1 lg:flex flex-col w-full bg-gradient-to-br from-primary/10 text-start items-center justify-center px-20 relative">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <div className="max-w-3xl mx-auto text-start items-start justify-start">
            <svg className="w-20 h-20 text-primary mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
            </svg>
            <blockquote className="google-headline-small text-google-primary italic">
              "{caseStudies[0].testimonial}"
            </blockquote>
            <div className="flex py-8 mt-6 space-x-4 items-center justify-start">
              <img src={caseStudies[0].avatar} alt="" className="rounded-full w-14" />
              <div>
                <p className="text-xs google-title-medium text-muted-foreground">{caseStudies[0].name}</p>
                <div className="flex space-x-1">
                  <p className="text-xs google-body-medium text-muted-foreground text-google-secondary mt-1">
                    {caseStudies[0].position}
                  </p>
                  <span className="text-muted-foreground"> • </span>
                  <p className="text-xs google-label-large text-muted-foreground text-google-tertiary mt-1">
                    {caseStudies[0].title}
                  </p>
                </div>
              </div>
            </div>
            <Link className="text-primary pt-6 google-title-small" href={`https://corecomm-website.onrender.com/case-studies/${caseStudies[0].id}`}>
              Read full Case Study
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
