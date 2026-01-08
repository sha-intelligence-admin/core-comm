import { IKbAdapter, KbSource } from '../../types';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/ai/embeddings';

export class NativeManagedAdapter implements IKbAdapter {
  async validate(config: any): Promise<boolean> {
    return true;
  }

  async query(query: string, config: any): Promise<string> {
    const supabase = await createClient();
    
    // Config should contain the kb_id if we passed it.
    const kbId = config.id || config.kb_id;

    if (!kbId) { 
        return "Internal Error: KB ID missing in adapter config.";
    }

    try {
        // 1. Generate Query Embedding
        const embedding = await generateEmbedding(query);

        // 2. Vector Search (RPC)
        const { data: documents, error } = await supabase
            .rpc('match_documents', {
                query_embedding: embedding,
                match_threshold: 0.3, // Lower threshold to ensure some results
                match_count: 5,
                filter_kb_id: kbId
            });

        if (error) {
            console.error("Vector Search RPC Error:", error);
            throw error; // Trigger fallback or catch block
        }

        if (!documents || documents.length === 0) {
            return "I couldn't find specific information about that in my knowledge base.";
        }

        // 3. Format Context
        const snippets = documents.map((doc: any) => doc.content).join("\n\n---\n\n");
        return `Here is the relevant information found:\n${snippets}`;

    } catch (err) {
        console.error("Native Search Error:", err);

        // Fallback: Simple Keyword Search
        const { data: sources } = await supabase
            .from('knowledge_base_sources')
            .select('content')
            .eq('kb_id', kbId)
            .ilike('content', `%${query}%`)
            .limit(3);
        
        if (sources && sources.length > 0) {
             const snippets = sources.map(s => s.content.substring(0, 500) + "...").join("\n\n");
             return `(Fallback Search) Found:\n${snippets}`;
        }

        return "I encountered an error searching the knowledge base.";
    }
  }

  async ingest(source: KbSource): Promise<void> {
      console.log(`[NativeAdapter] Ingesting source ${source.id} of type ${source.type}`);
  }
}
