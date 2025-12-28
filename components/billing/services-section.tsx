
"use client"

import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

const SERVICES = [
  {
    id: 'setup',
    name: 'Setup & Onboarding',
    price: 'Custom',
    description: 'Expert assistance to get your team up and running properly (3-5 hours).',
    period: ''
  },
  {
    id: 'voice_training',
    name: 'Voice Personality Training',
    price: '$749',
    description: 'Train a custom AI voice model based on your specific requirements.',
    period: 'one-time'
  },
  {
    id: 'integration',
    name: 'Custom Integration',
    price: 'Custom',
    description: 'Connect CoreComm with your existing CRM or internal tools (8-20 hours).',
    period: ''
  },
  {
    id: 'migration',
    name: 'Migration Service',
    price: 'Custom',
    description: 'Full migration from your current provider (10-15 hours).',
    period: ''
  }
]

export function ServicesSection() {
  const handleContact = (serviceName: string) => {
    window.location.href = `mailto:sales@corecomm.com?subject=Inquiry about ${serviceName}`
  }

  return (
    <div className="space-y-4">
      <h2 className=" google-headline-medium">Professional Services</h2>
      <div className="bg-card">
        {SERVICES.map((service) => (
          <div key={service.id} className="border border-input hover:border-primary rounded-lg my-2 flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
            <div className="space-y-1">
              <h3 className="google-body-large">{service.name}</h3>
              <p className="text-sm google-body-small text-muted-foreground">{service.description}</p>
            </div>
            <div className="flex items-center gap-4 min-w-[200px] justify-end">
              <div className="text-lg google-body-large">
                {service.price}
                {service.period && <span className="text-sm font-normal text-muted-foreground">/{service.period}</span>}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleContact(service.name)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
