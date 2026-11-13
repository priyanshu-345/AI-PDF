import { prisma } from '@ai-pdf/database';
import { NotFoundError, ForbiddenError } from '@ai-pdf/shared';
import { openai, OPENAI_MODELS } from '../config/openai.config';

export interface RetrievedChunk {
  id: string;
  pageNumber: number;
  chunkIndex: number;
  content: string;
  similarity: number;
}

export interface Citation {
  pageNumber: number;
  snippet: string;
  score: number;
}

export class RAGService {
  /**
   * 1. Vector Similarity Search using PostgreSQL pgvector
   */
  public static async searchSimilarChunks(
    documentId: string,
    query: string,
    topK = 4
  ): Promise<RetrievedChunk[]> {
    // Check if chunks exist for this document
    const chunkCount = await prisma.documentChunk.count({ where: { documentId } });
    if (chunkCount === 0) {
      return [];
    }

    let queryEmbedding: number[] = [];

    // Generate query embedding via OpenAI
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('dummy')) {
      const response = await openai.embeddings.create({
        model: OPENAI_MODELS.EMBEDDING,
        input: query.replace(/\n/g, ' '),
        dimensions: 1536,
      });
      queryEmbedding = response.data[0].embedding;
    } else {
      // Fallback zero vector when API key is not configured
      queryEmbedding = new Array(1536).fill(0);
    }

    const vectorString = `[${queryEmbedding.join(',')}]`;

    // Query top K matches using pgvector cosine distance operator (<=>)
    const results = await prisma.$queryRawUnsafe<RetrievedChunk[]>(
      `SELECT id, "pageNumber", "chunkIndex", content,
              (1 - (embedding <=> $1::vector)) AS similarity
       FROM document_chunks
       WHERE "documentId" = $2
       ORDER BY similarity DESC
       LIMIT $3`,
      vectorString,
      documentId,
      topK
    );

    return results;
  }

  /**
   * 2. RAG Conversational Chat with exact page citations
   */
  public static async chatWithDocument(
    userId: string,
    documentId: string,
    message: string,
    conversationId?: string
  ) {
    // Verify document ownership
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, userId: true, fileName: true, isIndexed: true },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    if (document.userId !== userId) {
      throw new ForbiddenError('You do not have access to this document');
    }

    // Retrieve or create Conversation session
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { take: 6, orderBy: { createdAt: 'desc' } } },
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          documentId,
          title: message.substring(0, 40) + '...',
        },
        include: { messages: true },
      });
    }

    // Save user message to database
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'user',
        text: message,
      },
    });

    // Retrieve relevant context chunks via pgvector
    const relevantChunks = await this.searchSimilarChunks(documentId, message, 4);

    // Build context with exact page headers
    const contextText = relevantChunks
      .map((c) => `--- [Page ${c.pageNumber}] ---\n${c.content}`)
      .join('\n\n');

    let assistantAnswer = '';
    let citations: Citation[] = [];

    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('dummy')) {
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODELS.CHAT,
        messages: [
          {
            role: 'system',
            content: `You are an expert AI document assistant analyzing "${document.fileName}".
Answer the user's question accurately using ONLY the provided excerpts.
Always cite the exact page number [Page X] when referencing facts.
If the answer is not contained in the provided excerpts, politely state that the document does not mention it.

Document Excerpts:
${contextText}`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.2,
      });

      assistantAnswer = completion.choices[0].message.content || 'Unable to generate response.';
    } else {
      assistantAnswer = `Based on the document "${document.fileName}", here is the relevant information extracted from Page ${
        relevantChunks[0]?.pageNumber || 1
      }: ${relevantChunks[0]?.content.substring(0, 180) || 'Document content indexed.'}...`;
    }

    // Construct structured citations from retrieved chunks
    citations = relevantChunks.map((c) => ({
      pageNumber: c.pageNumber,
      snippet: c.content.substring(0, 160).trim() + '...',
      score: Number(Number(c.similarity).toFixed(2)),
    }));

    // Save assistant message to database
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'assistant',
        text: assistantAnswer,
        citations: citations as any,
      },
    });

    return {
      conversationId: conversation.id,
      message: {
        id: assistantMessage.id,
        sender: 'assistant',
        text: assistantMessage.text,
        citations,
        createdAt: assistantMessage.createdAt.toISOString(),
      },
    };
  }
}
