import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MFAEnrollment } from '@/components/mfa-enrollment'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}))

// Mock Dialog components since they rely on Radix UI which can be tricky in tests
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>, // Always render children (Trigger + Content)
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
}))

describe('MFAEnrollment', () => {
  const mockToast = jest.fn()
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
      mfa: {
        listFactors: jest.fn(),
        unenroll: jest.fn(),
        enroll: jest.fn(),
        challenge: jest.fn(),
        verify: jest.fn(),
      },
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('shows setup button when not enrolled', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { factors: [] } }
    })

    render(<MFAEnrollment />)

    await waitFor(() => {
      expect(screen.getByText('Setup 2FA')).toBeInTheDocument()
    })
  })

  it('shows enrolled status when already enrolled', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { 
        user: { 
          factors: [{ status: 'verified' }] 
        } 
      }
    })

    render(<MFAEnrollment />)

    await waitFor(() => {
      expect(screen.getByText('2FA is enabled on your account')).toBeInTheDocument()
      expect(screen.queryByText('Setup 2FA')).not.toBeInTheDocument()
    })
  })

  it('starts enrollment flow', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { factors: [] } }
    })

    mockSupabase.auth.mfa.listFactors.mockResolvedValue({
      data: { factors: [] },
      error: null
    })

    mockSupabase.auth.mfa.enroll.mockResolvedValue({
      data: {
        id: 'factor_123',
        totp: {
          qr_code: 'qr_code_svg',
          secret: 'secret_code'
        }
      },
      error: null
    })

    render(<MFAEnrollment />)

    // Wait for initial load
    await waitFor(() => expect(screen.getByText('Setup 2FA')).toBeInTheDocument())

    // Click setup
    fireEvent.click(screen.getByText('Setup 2FA'))

    await waitFor(() => {
      expect(mockSupabase.auth.mfa.listFactors).toHaveBeenCalled()
      expect(mockSupabase.auth.mfa.enroll).toHaveBeenCalledWith(expect.objectContaining({ 
        factorType: 'totp',
        friendlyName: expect.stringContaining('Authenticator App')
      }))
      expect(screen.getByText('secret_code')).toBeInTheDocument()
    })
  })
})
