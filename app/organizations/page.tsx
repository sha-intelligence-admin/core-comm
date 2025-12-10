"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Building2, Users, Calendar, MapPin, Briefcase, ArrowRight, ChevronRight, Globe, Plus, UserPlus, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ThemeToggle } from "@/components/theme-toggle"

interface Company {
  id: string
  name: string
  description: string | null
  industry: string
  company_size: string
  logo_url: string | null
  created_at: string
  updated_at: string
  member_count?: number
  timezone: string
  current_volume: string | null
  // Membership fields
  membership_role?: string
  membership_status?: string
  is_default?: boolean
  joined_at?: string
  last_accessed?: string
}

export default function OrganizationsPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/organizations")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOrganization = async (companyId: string) => {
    try {
      // Store selected organization in session/cookie
      const response = await fetch("/api/organizations/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      })

      if (response.ok) {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Failed to select organization:", error)
    }
  }

  const getCompanySizeLabel = (size: string) => {
    const sizes: Record<string, string> = {
      small: "1-10 employees",
      medium: "11-50 employees",
      large: "51+ employees",
    }
    return sizes[size] || size
  }

  const getCompanySizeBadgeVariant = (size: string): "default" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      small: "outline",
      medium: "secondary",
      large: "default",
    }
    return variants[size] || "outline"
  }

  const getRoleBadgeVariant = (role?: string): "default" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      owner: "default",
      admin: "secondary",
      manager: "secondary",
      member: "outline",
      viewer: "outline",
    }
    return variants[role || "member"] || "outline"
  }

  const getRoleLabel = (role?: string) => {
    const labels: Record<string, string> = {
      owner: "Owner",
      admin: "Admin",
      manager: "Manager",
      member: "Member",
      viewer: "Viewer",
    }
    return labels[role || "member"] || "Member"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col gap-4 items-start justify-between mb-12">
          <div>
            <h1 className="google-headline-medium mb-2">Select Your Organization</h1>
            <p className="text-muted-foreground google-body-medium">
              Choose the organization you want to work with
            </p>
          </div>
          <div className="flex items-center justify-end  w-full gap-3">
            <Button variant="outline" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Join Organization
            </Button>
            <Button onClick={() => router.push("/organizations/create")} className="gap-2">
              <Plus className="h-4 w-4" />
              New Organization
            </Button>
          </div>
        </div>

        {/* Companies Grid */}
        {companies.length === 0 ? (
          <Card className="border-dashed border-input max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Organizations Found</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                You haven't been added to any organizations yet
              </p>
              <div className="flex gap-3">
                <Button onClick={() => router.push("/organizations/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Organization
                </Button>
                <Button variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Join via Invitation
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {companies.map((company) => (
              <Card
                key={company.id}
                className="hover:border-primary/50 border-input transition-all duration-200 hover:shadow-lg cursor-pointer group"
                onClick={() => handleSelectOrganization(company.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={`${company.name} logo`}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Building2 className="h-7 w-7 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-xl">{company.name}</CardTitle>
                          {company.is_default && (
                            <Star className="h-4 w-4 fill-primary text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <CardDescription className="text-xs">
                            {company.industry}
                          </CardDescription>
                          {company.membership_role && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <Badge variant={getRoleBadgeVariant(company.membership_role)} className="text-xs">
                                {getRoleLabel(company.membership_role)}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* {company.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {company.description}
                    </p>
                  )} */}

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Badge variant={getCompanySizeBadgeVariant(company.company_size)}>
                        {getCompanySizeLabel(company.company_size)}
                      </Badge>
                    </div>

                    {company.current_volume && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{company.current_volume} support volume</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>{company.timezone}</span>
                    </div>

                    {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created {formatDistanceToNow(new Date(company.created_at), { addSuffix: true })}</span>
                    </div> */}
                  </div>

                  {/* {company.member_count !== undefined && (
                    <div className="pt-4 border-t border-input">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Team Members</span>
                        <Badge variant="outline">{company.member_count}</Badge>
                      </div>
                    </div>
                  )} */}

                  {/* <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant="outline"
                  >
                    Enter Organization
                  </Button> */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
