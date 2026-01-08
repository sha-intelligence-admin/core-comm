import { createClient } from '@/lib/supabase/server';
import { CreateKbParams, KnowledgeBase, KbProvider, KbSource } from './types';
import { getAdapter } from './registry';
import './adapters'; // Ensure adapters are registered
import { generateEmbedding } from '@/lib/ai/embeddings';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// Define Vapi Tool Interface locally or import if available
interface VapiFunctionTool {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: "object";
            properties: Record<string, any>;
            required?: string[];
        };
    };
    server: {
        url: string;
    };
}

export class KnowledgeBaseService {
  /**
   * Generates the Tool Definition needed to attach this KB to a Vapi Assistant.
   * Step 7 (Final Output).
   */
  static getVapiToolDefinition(kb: KnowledgeBase): VapiFunctionTool {
     const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL || 'https://corecomm.vercel.app';
     const webhookUrl = `${baseUrl}/api/webhooks/vapi/kb-proxy?kb_id=${kb.id}`;
     
     // Sanitize name for function definition (alphanumeric + underscores only)
     const functionName = `search_kb_${kb.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`;

     return {
        type: "function",
        function: {
            name: functionName,
            description: `Search the ${kb.name} knowledge base for specific information. Use this whenever the user asks about ${kb.name} or related topics.`,
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The specific question or keywords to search for."
                    }
                },
                required: ["query"]
            }
        },
        server: {
            url: webhookUrl
        }
     };
  }

  /**
   * Validates the connection configuration for a specific provider.
   * Step A2 in the flow.
   */
  static async validateConnection(provider: KbProvider, config: any): Promise<boolean> {
    const adapter = getAdapter(provider);
    return adapter.validate(config);
  }

  /**
   * Creates a new Knowledge Base record in the database.
   * Step A3 (BYOK) & B1 (Managed).
   */
  static async createKnowledgeBase(userId: string, params: CreateKbParams, overrideCompanyId?: string): Promise<KnowledgeBase> {
    const supabase = await createClient();
    
    let companyId = overrideCompanyId;

    if (!companyId) {
        // 1. Get Company ID for the user
        const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single();

        if (userError || !userData?.company_id) {
            throw new Error('User does not belong to a company');
        }
        companyId = userData.company_id;
    }

    // 2. Validate configuration if it's BYOK
    if (params.type === 'BYOK') {
      const isValid = await this.validateConnection(params.provider, params.config);
      if (!isValid) {
        throw new Error(`Connection validation failed for provider ${params.provider}`);
      }
    }

    // 3. Create Record
    const { data: kb, error: insertError } = await supabase
      .from('knowledge_bases')
      .insert({
        company_id: companyId,
        name: params.name,
        type: params.type,
        provider: params.provider,
        config: params.config, // Ideally encrypt sensitive fields here
        domain: params.domain,
        languages: params.languages,
        status: params.type === 'BYOK' ? 'READY' : 'IN_PROGRESS', 
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create Knowledge Base: ${insertError.message}`);
    }

    return kb as KnowledgeBase;
  }

  /**
   * Creates a Source record and triggers ingestion (Managed only).
   * Step B2/B3.
   */
  static async addSource(kbId: string, type: 'file' | 'url' | 'text', content: string, metadata: any = {}) {
     const supabase = await createClient();

     // 1. Fetch KB to check type
     const { data: kb, error: kbError } = await supabase
        .from('knowledge_bases')
        .select('*')
        .eq('id', kbId)
        .single();
    
    if (kbError || !kb) throw new Error('Knowledge Base not found');
    if (kb.type !== 'MANAGED') throw new Error('Cannot add sources to BYOK Knowledge Base');

     // 2. Create Source Record
     const { data: source, error: sourceError } = await supabase
        .from('knowledge_base_sources')
        .insert({
            kb_id: kbId,
            type,
            content,
            metadata,
            status: 'pending' 
        })
        .select()
        .single();

      if (sourceError) throw new Error(`Failed to create source: ${sourceError.message}`);
      
      // 3. Trigger Processing
      // We await it here for the MVP to ensure feedback.
      await this.processSource(source.id);
      
      return { ...source, status: 'completed' };
  }

  /**
   * Processes a source: chunks text and generates embeddings.
   * Step B3 implementation.
   */
  static async processSource(sourceId: string) {
    const supabase = await createClient();
    
    // 1. Fetch source
    const { data: source, error: sourceError } = await supabase
        .from('knowledge_base_sources')
        .select('*')
        .eq('id', sourceId)
        .single();
    if (sourceError || !source) throw new Error('Source not found');

    try {
        // 2. Split text
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const docs = await splitter.createDocuments([source.content]);

        // 3. Generate Embeddings & Store
        const documentsToInsert = [];
        for (const doc of docs) {
            const embedding = await generateEmbedding(doc.pageContent);
            documentsToInsert.push({
                kb_id: source.kb_id,
                source_id: source.id,
                content: doc.pageContent,
                embedding,
                metadata: { ...source.metadata, loc: doc.metadata.loc }
            });
        }

        // Insert documents
        if (documentsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from('kb_documents')
                .insert(documentsToInsert);
            
            if (insertError) throw insertError;
        }

        // 4. Update Source Status
        await supabase
            .from('knowledge_base_sources')
            .update({ status: 'completed' })
            .eq('id', sourceId);

    } catch (err: any) {
        console.error('Processing failed', err);
        await supabase
            .from('knowledge_base_sources')
            .update({ status: 'failed', metadata: { ...source.metadata, error: err.message } })
            .eq('id', sourceId);
        // Throw so the caller knows it failed
        throw err;
    }
  }

  /**
   * Lists Knowledge Bases for a user.
   */
  static async listKnowledgeBases(userId: string): Promise<KnowledgeBase[]> {
      const supabase = await createClient();

      // 1. Get Company ID for the user
      const { data: userData, error: userError } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', userId)
          .single();

      if (userError || !userData?.company_id) {
          throw new Error('User does not belong to a company');
      }

      // 2. Fetch KBs
      const { data: kbs, error: kbError } = await supabase
          .from('knowledge_bases')
          .select('*')
          .eq('company_id', userData.company_id)
          .order('created_at', { ascending: false });

      if (kbError) throw new Error(`Failed to list Knowledge Bases: ${kbError.message}`);

      return kbs as KnowledgeBase[];
  }
}
// End of Service
