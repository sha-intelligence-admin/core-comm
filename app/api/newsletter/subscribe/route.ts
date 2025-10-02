import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const newsletterSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    const validatedData = newsletterSchema.parse({ email })

    // Create Supabase client
    const supabase = await createClient()

    // Check if email already exists
    const { data: existingSubscriber, error: fetchError } = await supabase
      .from('newsletters')
      .select('*')
      .eq('email', validatedData.email)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine
      console.error('Error checking subscriber:', fetchError)
      return NextResponse.json(
        {
          success: false,
          message: 'An error occurred. Please try again later.',
          error: 'DATABASE_ERROR',
        },
        { status: 500 }
      )
    }

    if (existingSubscriber) {
      // If they previously unsubscribed, reactivate
      if (!existingSubscriber.is_active) {
        const { error: updateError } = await supabase
          .from('newsletters')
          .update({
            is_active: true,
            unsubscribed_at: null,
          })
          .eq('email', validatedData.email)

        if (updateError) {
          console.error('Error reactivating subscription:', updateError)
          return NextResponse.json(
            {
              success: false,
              message: 'An error occurred. Please try again later.',
              error: 'UPDATE_ERROR',
            },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
        })
      }

      return NextResponse.json(
        {
          success: false,
          message: 'This email is already subscribed to our newsletter.',
        },
        { status: 400 }
      )
    }

    // Create new subscriber
    const { error: insertError } = await supabase
      .from('newsletters')
      .insert([
        {
          email: validatedData.email,
        },
      ])

    if (insertError) {
      console.error('Error creating subscription:', insertError)
      return NextResponse.json(
        {
          success: false,
          message: 'An error occurred. Please try again later.',
          error: 'INSERT_ERROR',
        },
        { status: 500 }
      )
    }

    // Optional: Send welcome email here
    // await sendWelcomeEmail(validatedData.email)

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed! Check your email for confirmation.',
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.errors[0].message,
          error: 'VALIDATION_ERROR',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred. Please try again later.',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}