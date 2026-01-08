import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeBaseService } from '@/lib/knowledge-base/service';
import { createClient } from '@/lib/supabase/server';
import mammoth from 'mammoth';

const pdf = require('pdf-parse');

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    let type, content, metadata;

    if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        type = 'file';
        metadata = { filename: file.name, size: file.size, type: file.type };
        
        const buffer = Buffer.from(await file.arrayBuffer());

        try {
            if (file.type === 'application/pdf') {
                const data = await pdf(buffer);
                content = data.text;
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
                 const result = await mammoth.extractRawText({ buffer });
                 content = result.value;
            } else {
                 // Fallback for text files sent as form data
                 content = await file.text();
            }
        } catch (parseError) {
             console.error("File parsing error:", parseError);
             return NextResponse.json({ error: 'Failed to parse file content.' }, { status: 400 });
        }

    } else {
        const body = await req.json();
        
        // Manual Validation to bypass Zod error
        type = body.type;
        content = body.content;
        metadata = body.metadata;
    }
    
    if (!type || !['file', 'url', 'text'].includes(type)) {
         return NextResponse.json(
            { error: 'Invalid type. Must be file, url, or text' },
            { status: 400 }
        );
    }

    if (!content || typeof content !== 'string') {
         return NextResponse.json(
            { error: 'Invalid content. Must be a string' },
            { status: 400 }
        );
    }
    
    // TODO: Verify ownership of KB (should be handled by Service or RLS conceptually, 
    // but Service.addSource fetches the KB. We should probably verify company_id match)

    const source = await KnowledgeBaseService.addSource(params.id, type, content, metadata);

    return NextResponse.json(source, { status: 201 });

  } catch (error: any) {
    console.error('Error ingesting source:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
