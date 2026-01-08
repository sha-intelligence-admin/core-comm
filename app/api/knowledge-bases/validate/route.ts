import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeBaseService } from '@/lib/knowledge-base/service';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { provider, config } = body;

    // Manual Validation
    const VALID_PROVIDERS = ['qdrant', 'pinecone', 'weaviate', 'elastic', 'google_vertex', 'openai', 'native'];
    
    if (!provider || !VALID_PROVIDERS.includes(provider)) {
       return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }
    
    if (!config || typeof config !== 'object') {
       return NextResponse.json({ error: 'Invalid config' }, { status: 400 });
    }

    try {
        const isValid = await KnowledgeBaseService.validateConnection(provider as any, config);
        
        return NextResponse.json({ 
            valid: isValid,
            message: isValid ? 'Connection successful' : 'Connection failed' 
        });
    } catch (err) {
        console.error("Validation logic error:", err);
        return NextResponse.json({ 
            valid: false, 
            message: 'Validation failed due to server error' 
        }, { status: 200 }); // Return 200 so frontend can handle as a "validation result" rather than HTTP error
    }

  } catch (error: any) {
    console.error('Error validating knowledge base connection:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
