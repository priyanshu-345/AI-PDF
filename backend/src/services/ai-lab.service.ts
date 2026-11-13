import { prisma } from '@ai-pdf/database';
import { NotFoundError, ForbiddenError } from '@ai-pdf/shared';
import { openai, OPENAI_MODELS } from '../config/openai.config';

export class AILabService {
  /**
   * Helper: Fetches concatenated text of document pages
   */
  private static async getDocumentText(documentId: string, maxPages = 15): Promise<string> {
    const pages = await prisma.documentPage.findMany({
      where: { documentId },
      orderBy: { pageNumber: 'asc' },
      take: maxPages,
    });

    if (pages.length === 0) {
      throw new NotFoundError('No extracted text found for this document. Please wait for indexing to finish.');
    }

    return pages.map((p) => `[Page ${p.pageNumber}]\n${p.extractedText}`).join('\n\n');
  }

  /**
   * 1. AI Summarizer (Executive, Bullet points, or Deep dive)
   */
  public static async summarizeDocument(
    userId: string,
    documentId: string,
    summaryType: 'EXECUTIVE' | 'BULLET_POINTS' | 'DEEP_DIVE' = 'EXECUTIVE',
    language = 'English'
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    const docText = await this.getDocumentText(documentId);

    const typePrompts = {
      EXECUTIVE: 'Provide a concise, high-impact Executive Summary (under 300 words) highlighting the core purpose, findings, and conclusions.',
      BULLET_POINTS: 'Provide an actionable, structured bulleted summary categorized by Key Takeaways, Important Data Points, and Action Items.',
      DEEP_DIVE: 'Provide an exhaustive, in-depth analytical summary covering all major sections with detailed insights and critical context.',
    };

    let summary = '';

    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('dummy')) {
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODELS.CHAT,
        messages: [
          {
            role: 'system',
            content: `You are an elite document summarizer. Respond in ${language}. ${typePrompts[summaryType]}`,
          },
          {
            role: 'user',
            content: `Document Excerpts:\n${docText.substring(0, 15000)}`,
          },
        ],
        temperature: 0.3,
      });

      summary = completion.choices[0].message.content || 'Unable to generate summary.';
    } else {
      summary = `[${summaryType} Summary in ${language}]: The document "${document.fileName}" covers essential topics across ${document.pageCount || 1} pages with key findings and operational points.`;
    }

    // Cache summary on document
    await prisma.document.update({
      where: { id: documentId },
      data: { summary },
    });

    return {
      documentId,
      summaryType,
      language,
      summary,
    };
  }

  /**
   * 2. Document Translation
   */
  public static async translateDocument(
    userId: string,
    documentId: string,
    targetLanguage: string
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    const docText = await this.getDocumentText(documentId, 8);

    let translatedText = '';

    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('dummy')) {
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODELS.CHAT,
        messages: [
          {
            role: 'system',
            content: `You are a professional document translator. Translate the following document text accurately into ${targetLanguage}. Maintain paragraph structure and preserve technical terminology.`,
          },
          {
            role: 'user',
            content: docText.substring(0, 12000),
          },
        ],
        temperature: 0.1,
      });

      translatedText = completion.choices[0].message.content || 'Translation unavailable.';
    } else {
      translatedText = `[Translated to ${targetLanguage}]:\n${docText.substring(0, 500)}`;
    }

    return {
      documentId,
      targetLanguage,
      translatedContent: translatedText,
    };
  }

  /**
   * 3. AI Quiz & Flashcard Generator
   */
  public static async generateQuiz(
    userId: string,
    documentId: string,
    questionCount = 5,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM'
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    const docText = await this.getDocumentText(documentId);

    let questions = [];

    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('dummy')) {
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODELS.CHAT,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an educational quiz creator. Generate a ${difficulty} difficulty quiz with ${questionCount} multiple-choice questions based on the document text.
Output MUST be a valid JSON object matching this schema:
{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIndex": 0,
      "explanation": "string",
      "pageReference": 1
    }
  ]
}`,
          },
          {
            role: 'user',
            content: `Document Content:\n${docText.substring(0, 15000)}`,
          },
        ],
        temperature: 0.4,
      });

      const parsed = JSON.parse(completion.choices[0].message.content || '{"questions": []}');
      questions = parsed.questions || [];
    } else {
      questions = [
        {
          question: `What is the primary focus of "${document.fileName}"?`,
          options: [
            'Operational & Strategic Guidelines',
            'Technical Hardware Architecture',
            'Historical Context',
            'Financial Disclosures',
          ],
          correctAnswerIndex: 0,
          explanation: 'The initial chapters outline core operational processes.',
          pageReference: 1,
        },
      ];
    }

    return {
      documentId,
      difficulty,
      questions,
    };
  }

  /**
   * 4. Grammar & Tone Proofreader
   */
  public static async proofreadText(text: string) {
    let correctedText = text;
    let suggestions: string[] = [];

    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('dummy')) {
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODELS.CHAT,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an expert editor. Proofread the text for grammar, punctuation, clarity, and tone.
Output valid JSON:
{
  "correctedText": "string",
  "suggestions": ["string"]
}`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      });

      const parsed = JSON.parse(completion.choices[0].message.content || '{}');
      correctedText = parsed.correctedText || text;
      suggestions = parsed.suggestions || [];
    }

    return {
      originalText: text,
      correctedText,
      suggestions,
    };
  }

  /**
   * 5. Document Semantic Comparison
   */
  public static async compareDocuments(userId: string, docId1: string, docId2: string) {
    const [doc1, doc2] = await Promise.all([
      prisma.document.findUnique({ where: { id: docId1, userId } }),
      prisma.document.findUnique({ where: { id: docId2, userId } }),
    ]);

    if (!doc1 || !doc2) {
      throw new NotFoundError('One or both documents not found');
    }

    const [text1, text2] = await Promise.all([
      this.getDocumentText(docId1, 6),
      this.getDocumentText(docId2, 6),
    ]);

    let comparison = '';

    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('dummy')) {
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODELS.CHAT,
        messages: [
          {
            role: 'system',
            content: `Compare Document 1 (${doc1.fileName}) and Document 2 (${doc2.fileName}). Identify key differences, modified terms, agreements, or discrepancies. Format with clear headings.`,
          },
          {
            role: 'user',
            content: `Document 1:\n${text1.substring(0, 7000)}\n\nDocument 2:\n${text2.substring(0, 7000)}`,
          },
        ],
      });

      comparison = completion.choices[0].message.content || 'Comparison unavailable.';
    } else {
      comparison = `Semantic comparison between "${doc1.fileName}" and "${doc2.fileName}": Both documents share related themes, with distinct variations in scope and details.`;
    }

    return {
      document1: doc1.fileName,
      document2: doc2.fileName,
      comparison,
    };
  }
}
