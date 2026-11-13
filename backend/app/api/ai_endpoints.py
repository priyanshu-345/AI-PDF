"""
AI Intelligence Lab API Router
Mounts REST endpoints for Document Chat (RAG), Summarizer, Translator,
Proofreader, Quiz/Flashcards, and Evaluation.
"""

from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from pydantic import BaseModel

try:
    from ..ai.rag_engine import rag_engine
    from ..ai.summarizer import summarize_document
    from ..ai.translator import translate_text_en_hi, generate_translated_docx
    from ..ai.proofreader import proofread_document_text
    from ..ai.quiz import generate_quiz_from_document, export_quiz_to_pdf
    from ..ai.evaluation import run_evaluation_suite
except (ImportError, ValueError):
    from backend.app.ai.rag_engine import rag_engine
    from backend.app.ai.summarizer import summarize_document
    from backend.app.ai.translator import translate_text_en_hi, generate_translated_docx
    from backend.app.ai.proofreader import proofread_document_text
    from backend.app.ai.quiz import generate_quiz_from_document, export_quiz_to_pdf
    from backend.app.ai.evaluation import run_evaluation_suite

router = APIRouter(prefix="/api/ai", tags=["AI Intelligence Lab"])

# -------------------------------------------------------------
# 1. AI DOCUMENT CHAT (RAG)
# -------------------------------------------------------------
@router.post("/chat/index")
async def index_document_for_chat(
    file: UploadFile = File(...),
    doc_id: str = Form(...)
):
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    idx = rag_engine.index_document(doc_id, file.filename or "document.pdf", contents)
    return {
        "success": True,
        "doc_id": doc_id,
        "filename": idx.filename,
        "total_chunks": len(idx.chunks),
        "message": f"Successfully indexed {len(idx.chunks)} semantic chunks."
    }

class ChatQueryRequest(BaseModel):
    doc_id: str
    query: str

@router.post("/chat/query")
async def query_document(req: ChatQueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query string is required.")
    
    res = rag_engine.query(req.doc_id, req.query)
    return res

# -------------------------------------------------------------
# 2. AI SUMMARIZER
# -------------------------------------------------------------
@router.post("/summarize")
async def summarize_endpoint(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    filename: Optional[str] = Form("document.txt"),
    mode: str = Form("executive")
):
    if file:
        contents = await file.read()
        name = file.filename or filename or "document.pdf"
    elif text:
        contents = text.encode("utf-8")
        name = filename or "document.txt"
    else:
        raise HTTPException(status_code=400, detail="Either file upload or text is required.")

    res = summarize_document(contents, name, mode)
    return res

# -------------------------------------------------------------
# 3. AI TRANSLATOR
# -------------------------------------------------------------
class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "en"
    target_lang: str = "hi"
    doc_title: Optional[str] = "Document"

@router.post("/translate")
async def translate_endpoint(req: TranslateRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text to translate is required.")
    
    translated = translate_text_en_hi(req.text, req.source_lang, req.target_lang)
    return {
        "original_text": req.text,
        "translated_text": translated,
        "source_lang": req.source_lang,
        "target_lang": req.target_lang,
        "technical_terms_preserved": True
    }

@router.post("/translate/download-docx")
async def download_translated_docx_endpoint(
    text: str = Form(...),
    title: str = Form("Translated_Document")
):
    docx_bytes = generate_translated_docx(text, title)
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{title}.docx"'}
    )

# -------------------------------------------------------------
# 4. GRAMMAR & PROOFREAD
# -------------------------------------------------------------
class ProofreadRequest(BaseModel):
    text: str

@router.post("/proofread")
async def proofread_endpoint(req: ProofreadRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text to proofread is required.")
    
    res = proofread_document_text(req.text)
    return res

# -------------------------------------------------------------
# 5. AI QUIZ & FLASHCARDS
# -------------------------------------------------------------
@router.post("/quiz/generate")
async def generate_quiz_endpoint(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    filename: Optional[str] = Form("document.pdf"),
    difficulty: str = Form("Medium"),
    count: int = Form(5)
):
    if file:
        contents = await file.read()
        name = file.filename or filename or "document.pdf"
    elif text:
        contents = text.encode("utf-8")
        name = filename or "document.txt"
    else:
        raise HTTPException(status_code=400, detail="Either file upload or text is required.")

    res = generate_quiz_from_document(contents, name, difficulty, count)
    return res

class ExportQuizPdfRequest(BaseModel):
    quiz_data: dict

@router.post("/quiz/export-pdf")
async def export_quiz_pdf_endpoint(req: ExportQuizPdfRequest):
    pdf_bytes = export_quiz_to_pdf(req.quiz_data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="Quiz_Assessment.pdf"'}
    )

# -------------------------------------------------------------
# 6. AUTOMATED MODEL EVALUATION & BENCHMARK
# -------------------------------------------------------------
@router.get("/evaluate")
async def evaluate_models_endpoint():
    res = run_evaluation_suite()
    return res

