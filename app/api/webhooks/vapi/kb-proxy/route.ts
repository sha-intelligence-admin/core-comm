import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeBaseService } from '@/lib/knowledge-base/service';
import { getAdapter } from '@/lib/knowledge-base/registry';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse Query Params to get KB ID
    const url = new URL(req.url);
    const kbId = url.searchParams.get('kb_id');

    if (!kbId) {
      return NextResponse.json({ error: 'Missing kb_id parameter' }, { status: 400 });
    }

    // 2. Parse Body (Vapi Tool Call Payload)
    const body = await req.json();
    const toolCall = body.toolCall || body.message?.toolCalls?.[0];

    if (!toolCall) {
      return NextResponse.json({ error: 'Invalid payload: No tool call found' }, { status: 400 });
    }

    const { id, function: func } = toolCall;
    const args = typeof func.arguments === 'string' ? JSON.parse(func.arguments) : func.arguments;
    const query = args.query;

    if (!query) {
      return NextResponse.json({ 
        results: [{ toolCallId: id, result: "Error: No query provided." }] 
      });
    }

    console.log(`[KB Proxy] Querying KB ${kbId} for: "${query}"`);

    // 3. Fetch KB Configuration
    const supabase = await createClient();
    const { data: kb, error: kbError } = await supabase
        .from('knowledge_bases')
        .select('*')
        .eq('id', kbId)
        .single();
    
    if (kbError || !kb) {
        return NextResponse.json({ 
            results: [{ toolCallId: id, result: "Error: Knowledge Base not found." }] 
        });
    }

    // 4. Get Adapter and Query
    // We map internal DB validation of 'provider' to the factory registry
    // Note: 'native' provider in DB maps to 'native' in registry
    let result = "";
    try {
        const adapter = getAdapter(kb.provider as any);
        // Inject ID into config for NativeManagedAdapter
        const runConfig = { ...kb.config, kb_id: kb.id, id: kb.id };
        
        result = await adapter.query(query, runConfig);
    } catch (err: any) {
        console.error(`[KB Proxy] Adapter Error:`, err);
        result = "Error searching knowledge base. Please try again later.";
    }

    // 5. Return Vapi-compatible response
    return NextResponse.json({
        results: [
            {
                toolCallId: id,
                result: result
            }
        ]
    });

  } catch (error: any) {
    console.error('[KB Proxy] System Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
