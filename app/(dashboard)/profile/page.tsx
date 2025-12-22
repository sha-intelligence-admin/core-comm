"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserProfile } from "@/hooks/use-user-profile"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, User, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ProfilePage() {
  const { profile, loading, getInitials, updateProfile } = useUserProfile()
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    avatar_url: ""
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        avatar_url: profile.avatar_url || ""
      })
    }
  }, [profile])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    if (!profile) {
      setUpdateMessage({ type: 'error', message: 'Profile not loaded' })
      return
    }

    const file = e.target.files[0]

    if (file.size > 5 * 1024 * 1024) {
      setUpdateMessage({ type: 'error', message: 'File size must be less than 5MB' })
      return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${profile?.id}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    setIsUploading(true)
    setUpdateMessage(null)

    console.log('Starting upload...', { fileName, fileSize: file.size, fileType: file.type })

    try {
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      console.log('Upload successful:', data)

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      console.log('Public URL:', publicUrl)

      setFormData({ ...formData, avatar_url: publicUrl })
      setUpdateMessage({ type: 'success', message: 'Avatar uploaded successfully. Click Save Changes to persist.' })
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      setUpdateMessage({ type: 'error', message: error.message || 'Error uploading avatar' })
    } finally {
      console.log('Upload finished, setting isUploading to false')
      setIsUploading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setUpdateMessage(null)

    const { error } = await updateProfile({
      full_name: formData.full_name,
      phone: formData.phone,
      avatar_url: formData.avatar_url
    })

    if (error) {
      setUpdateMessage({ type: 'error', message: error })
    } else {
      setUpdateMessage({ type: 'success', message: 'Profile updated successfully' })
    }
    setIsUpdating(false)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border border-input p-6">
          <div className="mb-4">
            <h1 className="text-xl google-headline-small mb-1">Personal Information</h1>
            <p className="text-google-body-medium text-muted-foreground">
              Update your personal details and public profile.
            </p>
          </div>
          <div>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {updateMessage && (
                <Alert variant={updateMessage.type === 'error' ? "destructive" : "default"} className={updateMessage.type === 'success' ? "border-green-500 text-green-600" : ""}>
                  {updateMessage.type === 'success' && <CheckCircle className="h-4 w-4 mr-2" />}
                  <AlertDescription>
                    {updateMessage.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={formData.avatar_url || "/placeholder-user.jpg"} />
                  <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="avatar_url">Avatar</Label>
                  <div className="flex gap-2">
                    <Input
                      id="avatar_url"
                      placeholder="https://example.com/avatar.jpg"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      className="flex-1"
                    />
                    <div className="relative">
                      <Input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={isUploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading}
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      >
                        {isUploading ? <LoadingSpinner size="sm" /> : <Upload className="h-4 w-4" />}
                        <span className="sr-only">Upload</span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a URL or upload a picture for your profile.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed.
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <LoadingSpinner className="mr-2" size="sm" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="rounded-lg border border-input p-6">
          <div className="mb-4">
            <h1 className="google-headline-small mb-1">Account Details</h1>
            <p className="text-google-body-medium text-muted-foreground">
              View your account role and status.
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="p-2 border border-input rounded-md bg-muted capitalize">
                  {profile?.role || "Member"}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="p-2 border border-input rounded-md bg-muted capitalize flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${profile?.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                  {profile?.is_active ? "Active" : "Inactive"}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="p-2 border border-input rounded-md bg-muted">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}
                </div>
              </div>
              <div className="space-y-2">
                <Label>User ID</Label>
                <div className="p-2 border border-input rounded-md bg-muted font-mono text-xs truncate">
                  {profile?.id || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
