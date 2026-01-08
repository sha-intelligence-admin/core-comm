import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeBaseService } from '@/lib/knowledge-base/service';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kbs = await KnowledgeBaseService.listKnowledgeBases(user.id);
    return NextResponse.json({ data: kbs });
  } catch (error: any) {
    console.error('Error listing knowledge bases:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Manual Validation
    const { name, type, provider, config, domain, languages, validate } = body;

    if (!name || typeof name !== 'string') return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    if (!type || !['BYOK', 'MANAGED'].includes(type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    
    // Allow extended provider list
    const VALID_PROVIDERS = ['qdrant', 'pinecone', 'weaviate', 'elastic', 'google_vertex', 'openai', 'native'];
    if (!provider || !VALID_PROVIDERS.includes(provider)) return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    
    if (!config || typeof config !== 'object') return NextResponse.json({ error: 'Invalid config' }, { status: 400 });

    const params: any = {
        name, type, provider, config, domain, languages, validate
    };

    // Optional explicit validation step before creation
    // (Note: Service.createKnowledgeBase for BYOK auto-validates anyway, but this flag allows flexibility)
    if (params.validate && params.type === 'BYOK') {
      const isValid = await KnowledgeBaseService.validateConnection(params.provider, params.config);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Connection validation failed. Please check your credentials.' },
          { status: 400 }
        );
      }
    }

    const kb = await KnowledgeBaseService.createKnowledgeBase(user.id, params);

    return NextResponse.json(kb, { status: 201 });
  } catch (error: any) {
    console.error('Error creating knowledge base:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
