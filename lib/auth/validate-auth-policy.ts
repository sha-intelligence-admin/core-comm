import { createClient } from '@/lib/supabase/server';

export interface AuthMethodValidationResult {
  isAllowed: boolean;
  method: string;
  allowedMethods: string[];
  companyName?: string;
}

/**
 * Validates if the authentication method used is allowed by the company's security policy.
 * 
 * @param userId - The user's ID from auth
 * @returns Validation result with allowed status and details
 */
export async function validateAuthMethod(userId: string): Promise<AuthMethodValidationResult> {
  try {
    const supabase = await createClient();

    // Get user's company_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('company_id, companies!inner(name)')
      .eq('id', userId)
      .single();

    if (userError || !user?.company_id) {
      // No company association - allow all methods by default
      return {
        isAllowed: true,
        method: 'unknown',
        allowedMethods: ['all'],
      };
    }

    const companyName = (user.companies as unknown as { name: string })?.name;

    // Get company's security settings
    const { data: settings, error: settingsError } = await supabase
      .from('security_settings')
      .select('allowed_auth_methods')
      .eq('company_id', user.company_id)
      .single();

    if (settingsError || !settings) {
      // No security settings - allow all methods by default
      return {
        isAllowed: true,
        method: 'unknown',
        allowedMethods: ['all'],
        companyName,
      };
    }

    // Get the current session to determine auth method
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return {
        isAllowed: false,
        method: 'none',
        allowedMethods: settings.allowed_auth_methods || [],
        companyName,
      };
    }

    // Determine the auth method used
    const authMethod = determineAuthMethod(session);

    // Check if the method is allowed
    const allowedMethods = settings.allowed_auth_methods || [];
    const isAllowed = allowedMethods.length === 0 || 
                     allowedMethods.includes(authMethod) ||
                     allowedMethods.includes('all');

    return {
      isAllowed,
      method: authMethod,
      allowedMethods,
      companyName,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error validating auth method:', error);
    // On error, allow access (fail open for now)
    return {
      isAllowed: true,
      method: 'error',
      allowedMethods: [],
    };
  }
}

/**
 * Determines the authentication method used based on session data
 */
function determineAuthMethod(session: { user?: { app_metadata?: Record<string, unknown> }; amr?: Array<{ method: string }> }): string {
  // Check app_metadata for OAuth providers
  const appMetadata = session.user?.app_metadata;
  const provider = appMetadata?.provider as string | undefined;

  if (provider === 'google') {
    return 'sso';
  }

  if (provider === 'github') {
    return 'sso';
  }

  // Check if it was email OTP (magic link)
  // Supabase sets aal to 'aal1' for password and OTP
  // We can check the amr (authentication method reference) for more details
  const amr = session.amr || [];
  
  // Check for OTP method
  const hasOtp = amr.some((entry) => entry.method === 'otp');
  if (hasOtp) {
    return 'email_otp';
  }

  // Check for password method
  const hasPassword = amr.some((entry) => entry.method === 'password');
  if (hasPassword) {
    return 'password';
  }

  // Check for TOTP (authenticator app)
  const hasTotp = amr.some((entry) => entry.method === 'totp');
  if (hasTotp) {
    return 'totp';
  }

  // Default to email (covers password-based auth)
  return 'email';
}
