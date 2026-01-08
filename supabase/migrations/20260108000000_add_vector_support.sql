-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your document chunks and their embeddings
create table if not exists kb_documents (
  id uuid primary key default gen_random_uuid(),
  kb_id uuid references knowledge_bases(id) on delete cascade not null,
  source_id uuid references knowledge_base_sources(id) on delete cascade not null,
  
  content text not null,                -- The text chunk
  embedding vector(1536),               -- OpenAI 'text-embedding-3-small' output
  metadata jsonb default '{}'::jsonb,   -- Page number, section, etc.
  
  created_at timestamptz default now()
);

-- Enable RLS
alter table kb_documents enable row level security;

-- Policies (Inherit from KB)
create policy "Users can view KBs documents for their company"
    on kb_documents for select
    using (
        kb_id in (
            select id from knowledge_bases 
            where company_id in (select company_id from users where auth.uid() = id)
        )
    );

create policy "Admins can manage KBs documents"
    on kb_documents for all
    using (
        kb_id in (
            select id from knowledge_bases 
            where company_id in (select company_id from users where auth.uid() = id and role = 'admin')
        )
    );

-- Create an HNSW index for fast similarity search
create index on kb_documents using hnsw (embedding vector_cosine_ops);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_kb_id uuid
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    kb_documents.id,
    kb_documents.content,
    kb_documents.metadata,
    1 - (kb_documents.embedding <=> query_embedding) as similarity
  from kb_documents
  where kb_documents.kb_id = filter_kb_id
  and 1 - (kb_documents.embedding <=> query_embedding) > match_threshold
  order by kb_documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
