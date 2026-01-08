// KB Types matching the database and application logic

export type KbType = 'BYOK' | 'MANAGED';
export type KbStatus = 'READY' | 'IN_PROGRESS' | 'FAILED' | 'VALIDATING';
export type KbProvider = 'qdrant' | 'pinecone' | 'weaviate' | 'elastic' | 'google_vertex' | 'openai' | 'native';

export interface KnowledgeBase {
  id: string;
  company_id: string;
  name: string;
  type: KbType;
  provider: KbProvider;
  status: KbStatus;
  
  // Managed Specific
  domain?: string | null;
  languages?: string[] | null;
  
  // Configuration
  config: Record<string, any>;
  vapi_id?: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface CreateKbParams {
  name: string;
  type: KbType;
  provider: KbProvider;
  config: Record<string, any>; // Stores credentials or index config
  domain?: string;
  languages?: string[];
}

export interface KbSource {
  id: string;
  kb_id: string;
  type: 'file' | 'url' | 'text';
  content: string;
  metadata?: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  chunk_count: number;
  error_message?: string;
}

// Adapter Interface
export interface IKbAdapter {
  /**
   * Validates the configuration (e.g., checks API Key connection)
   */
  validate(config: any): Promise<boolean>;

  /**
   * Performs the query against the provider
   * Used by the Vapi Tool Proxy
   */
  query(query: string, config: any): Promise<string>;
  
  /**
   * Optional: Managed providers implement this to ingest data
   */
  ingest?(source: KbSource): Promise<void>;
}
