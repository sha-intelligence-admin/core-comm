export const PRICING_TIERS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 99, // $99/month
    flutterwave_plan_id: 152249,
    limits: {
      voice_minutes: 240,
      sms_messages: 1500,
      emails: 1000,
      phone_numbers: 1,
    },
    features: ['240 Voice Minutes', '1 Phone Number', 'Email support'],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 299, // $299/month
    flutterwave_plan_id: 152250,
    limits: {
      voice_minutes: 600,
      sms_messages: 5000,
      emails: 3000,
      phone_numbers: 2,
    },
    features: ['600 Voice Minutes', '2 Phone Numbers', 'Priority email + chat', 'Call recording storage', 'Basic analytics', 'Human escalation'],
  },
  professional_plus: {
    id: 'professional_plus',
    name: 'Professional+',
    price: 899, // $899/month
    flutterwave_plan_id: 152251,
    limits: {
      voice_minutes: 4000,
      sms_messages: 15000,
      emails: 10000,
      phone_numbers: 5,
    },
    features: ['4,000 Voice Minutes', '5 Phone Numbers', 'Advanced analytics', 'CRM integrations', 'High concurrency', 'Human escalation (up to 5)'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null, // Custom
    flutterwave_plan_id: null,
    limits: {
      voice_minutes: null, // Custom
      sms_messages: null, // Unlimited
      emails: null,
      phone_numbers: null,
    },
    features: ['Custom minutes', 'Dedicated infrastructure', 'White-label', 'SLA guarantees', 'Dedicated account manager'],
  }
} as const;

export const OVERAGE_RATES = {
  voice_minute: 0.35, // $0.35/min
  sms_message: 0.015, // $0.015/message
} as const;

export const ADD_ONS = {
  phone_number: {
    id: 'phone_number',
    name: 'Additional Phone Number',
    price: 15, // $15/month
    limit_increase: { phone_numbers: 1 }
  },
  call_recording: {
    id: 'call_recording',
    name: 'Call Recording Storage',
    price: 29, // $29/month
    limit_increase: {} // Feature flag
  },
  analytics: {
    id: 'analytics',
    name: 'Advanced Analytics',
    price: 49, // $49/month
    limit_increase: {} // Feature flag
  },
  custom_voice_training: {
    id: 'custom_voice_training',
    name: 'Custom Voice Training',
    price: 149, // $149/month
    limit_increase: {}
  },
  priority_support: {
    id: 'priority_support',
    name: 'Priority Support (SLA)',
    price: 99, // $99/month
    limit_increase: {}
  },
  white_label: {
    id: 'white_label',
    name: 'White-label Branding',
    price: 199, // $199/month
    limit_increase: {}
  }
} as const;

export const SERVICES = {
  crm_integration: {
    id: 'crm_integration',
    name: 'CRM Integration Setup',
    price: 199,
    type: 'one_time'
  },
  voice_personality: {
    id: 'voice_personality',
    name: 'Voice Personality Training',
    price: 749,
    type: 'one_time'
  }
} as const;

export type PlanId = keyof typeof PRICING_TIERS;
export type AddOnId = keyof typeof ADD_ONS;
export type ServiceId = keyof typeof SERVICES;
