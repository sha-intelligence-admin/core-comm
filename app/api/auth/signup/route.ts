import { NextRequest, NextResponse } from 'next/server';
// You would import the function you created
import { createServerSupabase } from '@/lib/supabase/superbaseClient';

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName, phone } = await req.json();

    if (!userId || !email || !fullName || !phone) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 🚀 Get a fresh client instance by calling the function
    const supabaseServer = createServerSupabase();

    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .insert([{ id: userId, full_name: fullName, phone: phone, email: email }])
      .select()
      .single();

    if (userError) {
      console.error("Error inserting into custom users table:", userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'User profile saved successfully', user: userData },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
