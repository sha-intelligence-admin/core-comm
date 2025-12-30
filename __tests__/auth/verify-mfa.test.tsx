import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VerifyMFAPage from '@/app/auth/verify-mfa/page'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}))

// Mock LoadingSpinner to avoid import issues if it's complex
jest.mock('@/components/loading-spinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}))

describe('VerifyMFAPage', () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()
  const mockToast = jest.fn()
  const mockSupabase = {
    auth: {
      mfa: {
        listFactors: jest.fn(),
        challenge: jest.fn(),
        verify: jest.fn(),
      },
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
    ;(useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    })
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('renders the verification form', () => {
    render(<VerifyMFAPage />)
    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('000000')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument()
  })

  it('handles successful verification', async () => {
    // Mock successful MFA flow
    mockSupabase.auth.mfa.listFactors.mockResolvedValue({
      data: {
        all: [
          { id: 'factor_123', factor_type: 'totp', status: 'verified' }
        ]
      },
      error: null
    })

    mockSupabase.auth.mfa.challenge.mockResolvedValue({
      data: { id: 'challenge_123' },
      error: null
    })

    mockSupabase.auth.mfa.verify.mockResolvedValue({
      data: { access_token: 'new_token' },
      error: null
    })

    render(<VerifyMFAPage />)

    // Enter code
    const input = screen.getByPlaceholderText('000000')
    fireEvent.change(input, { target: { value: '123456' } })

    // Submit form
    const button = screen.getByRole('button', { name: /verify/i })
    fireEvent.click(button)

    // Verify loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

    await waitFor(() => {
      // Check API calls
      expect(mockSupabase.auth.mfa.listFactors).toHaveBeenCalled()
      expect(mockSupabase.auth.mfa.challenge).toHaveBeenCalledWith({
        factorId: 'factor_123'
      })
      expect(mockSupabase.auth.mfa.verify).toHaveBeenCalledWith({
        factorId: 'factor_123',
        challengeId: 'challenge_123',
        code: '123456'
      })

      // Check success actions
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Success'
      }))
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('handles verification failure', async () => {
    // Mock failure at verify step
    mockSupabase.auth.mfa.listFactors.mockResolvedValue({
      data: {
        all: [
          { id: 'factor_123', factor_type: 'totp', status: 'verified' }
        ]
      },
      error: null
    })

    mockSupabase.auth.mfa.challenge.mockResolvedValue({
      data: { id: 'challenge_123' },
      error: null
    })

    mockSupabase.auth.mfa.verify.mockResolvedValue({
      data: null,
      error: { message: 'Invalid code' }
    })

    render(<VerifyMFAPage />)

    const input = screen.getByPlaceholderText('000000')
    fireEvent.change(input, { target: { value: '123456' } })
    
    const button = screen.getByRole('button', { name: /verify/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error',
        description: 'Invalid code',
        variant: 'destructive'
      }))
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('handles missing verified factor', async () => {
    mockSupabase.auth.mfa.listFactors.mockResolvedValue({
      data: { all: [] }, // No factors
      error: null
    })

    render(<VerifyMFAPage />)

    const input = screen.getByPlaceholderText('000000')
    fireEvent.change(input, { target: { value: '123456' } })
    
    const button = screen.getByRole('button', { name: /verify/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error',
        description: 'No verified 2FA factor found',
        variant: 'destructive'
      }))
    })
  })
})
