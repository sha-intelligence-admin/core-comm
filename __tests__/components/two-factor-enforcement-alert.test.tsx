import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { TwoFactorEnforcementAlert } from '@/components/two-factor-enforcement-alert'
import { useSecuritySettings } from '@/hooks/use-security-settings'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/hooks/use-security-settings', () => ({
  useSecuritySettings: jest.fn(),
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock AlertDialog components
jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
}))

describe('TwoFactorEnforcementAlert', () => {
  const mockPush = jest.fn()
  const mockGetUser = jest.fn()
  const mockSupabase = {
    auth: {
      getUser: mockGetUser,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('does not render when loading', () => {
    (useSecuritySettings as jest.Mock).mockReturnValue({
      settings: null,
      isLoading: true,
    })
    render(<TwoFactorEnforcementAlert />)
    expect(screen.queryByText(/Security Action Required/i)).not.toBeInTheDocument()
  })

  it('does not render when 2FA is not enforced', async () => {
    (useSecuritySettings as jest.Mock).mockReturnValue({
      settings: { two_factor_enabled: false },
      isLoading: false,
    })
    
    mockGetUser.mockResolvedValue({
      data: { user: { factors: [] } }
    })

    render(<TwoFactorEnforcementAlert />)
    
    await waitFor(() => {
      expect(screen.queryByText(/Security Action Required/i)).not.toBeInTheDocument()
    })
  })

  it('does not render when user already has verified factors', async () => {
    (useSecuritySettings as jest.Mock).mockReturnValue({
      settings: { two_factor_enabled: true },
      isLoading: false,
    })

    mockGetUser.mockResolvedValue({
      data: { 
        user: { 
          factors: [{ status: 'verified' }] 
        } 
      }
    })

    render(<TwoFactorEnforcementAlert />)

    await waitFor(() => {
      expect(screen.queryByText(/Security Action Required/i)).not.toBeInTheDocument()
    })
  })

  it('renders when 2FA is enforced and user has no verified factors', async () => {
    (useSecuritySettings as jest.Mock).mockReturnValue({
      settings: { two_factor_enabled: true },
      isLoading: false,
    })

    mockGetUser.mockResolvedValue({
      data: { 
        user: { 
          factors: [] // No factors
        } 
      }
    })

    render(<TwoFactorEnforcementAlert />)

    await waitFor(() => {
      expect(screen.getByText(/Security Action Required/i)).toBeInTheDocument()
    })
  })

  it('redirects to setup-mfa page when button is clicked', async () => {
    (useSecuritySettings as jest.Mock).mockReturnValue({
      settings: { two_factor_enabled: true },
      isLoading: false,
    })

    mockGetUser.mockResolvedValue({
      data: { 
        user: { 
          factors: [] 
        } 
      }
    })

    render(<TwoFactorEnforcementAlert />)

    await waitFor(() => {
      expect(screen.getByText(/Security Action Required/i)).toBeInTheDocument()
    })

    const link = screen.getByRole('link', { name: /Setup 2FA Now/i })
    expect(link).toHaveAttribute('href', '/auth/setup-mfa')
  })
})
