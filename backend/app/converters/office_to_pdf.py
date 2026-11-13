"""
Office to PDF High-Fidelity Conversion Helpers
Supports DOCX -> PDF, XLSX -> PDF, PPTX -> PDF, CSV/TXT -> PDF
Uses ReportLab with Enterprise Maroon Palette & Professional Typography
"""

import io
import re
from typing import List
import docx
import openpyxl
import pptx
from reportlab.lib.pagesizes import letter, A4, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

MAROON = colors.HexColor("#800020")
DARK_SLATE = colors.HexColor("#1E293B")
MUTED_SLATE = colors.HexColor("#64748B")
LIGHT_BG = colors.HexColor("#FAF9F9")
BORDER_COLOR = colors.HexColor("#CBD5E1")

def clean_text(text: str) -> str:
    if not text:
        return ""
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f\ud800-\udfff\ufffe\uffff]', '', text)
    return cleaned.strip()

def docx_to_pdf(contents: bytes, title: str = "Document") -> bytes:
    """Convert DOCX bytes to formatted PDF bytes using ReportLab."""
    doc = docx.Document(io.BytesIO(contents))
    pdf_buffer = io.BytesIO()
    pdf = SimpleDocTemplate(
        pdf_buffer,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocxTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=MAROON,
        spaceAfter=14
    )
    heading_style = ParagraphStyle(
        'DocxHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=MAROON,
        spaceBefore=12,
        spaceAfter=6
    )
    code_style = ParagraphStyle(
        'DocxCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#0F172A'),
        backColor=colors.HexColor('#F8FAFC'),
        spaceAfter=3,
        leftIndent=8
    )
    body_style = ParagraphStyle(
        'DocxBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=DARK_SLATE,
        spaceAfter=5
    )

    story = [
        Paragraph(clean_text(title), title_style),
        Paragraph("Converted from Microsoft Word Document (.docx)", ParagraphStyle(
            'Sub', fontName='Helvetica-Oblique', fontSize=9, leading=12, textColor=MUTED_SLATE, spaceAfter=14
        ))
    ]

    code_keywords = (
        'import ', 'package ', 'public class ', 'public void ', 'private ', 'protected ',
        'CREATE TABLE', 'CREATE DATABASE', 'INSERT INTO', 'SELECT ', 'WHERE ', 'USE ',
        '@WebServlet', '@Configuration', '@Bean', '@Autowired', '@Component',
        'System.out', 'pstmt.', 'conn.', 'rs.', 'try {', '} catch', '} finally',
        'public static void main', 'String ', 'int ', 'boolean ', 'return '
    )

    for p in doc.paragraphs:
        text = clean_text(p.text)
        if not text:
            story.append(Spacer(1, 4))
            continue

        safe_text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

        # Check if heading or section
        is_heading = (
            p.style.name.startswith('Heading')
            or text.startswith(('Sol.', 'Sol ', 'Solution', 'Sessional', 'Output :', 'Output:'))
            or text.endswith(('.java', '.jsp', '.xml', '.sql'))
            or ('Name' in text and 'Roll No' in text)
        )
        if is_heading:
            story.append(Spacer(1, 4))
            story.append(Paragraph(safe_text, heading_style))
            continue

        # Check if code block
        is_code = any(kw in text for kw in code_keywords) or text.strip().endswith((';', '{', '}'))
        if is_code:
            story.append(Paragraph(safe_text, code_style))
        else:
            story.append(Paragraph(safe_text, body_style))

    # Also extract tables
    for table in doc.tables:
        table_data = []
        for row in table.rows:
            row_data = []
            for cell in row.cells:
                safe_cell = clean_text(cell.text).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                row_data.append(Paragraph(safe_cell[:200], body_style))
            if row_data:
                table_data.append(row_data)

        if table_data:
            rl_table = Table(table_data)
            rl_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), MAROON),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(Spacer(1, 8))
            story.append(rl_table)
            story.append(Spacer(1, 10))

    if len(story) <= 2:
        story.append(Paragraph("[Document contains graphics or no extractable text paragraphs]", body_style))

    pdf.build(story)
    return pdf_buffer.getvalue()

def xlsx_to_pdf(contents: bytes, title: str = "Spreadsheet") -> bytes:
    """Convert XLSX bytes to formatted Landscape PDF bytes."""
    wb = openpyxl.load_workbook(io.BytesIO(contents), data_only=True)
    pdf_buffer = io.BytesIO()
    pdf = SimpleDocTemplate(
        pdf_buffer,
        pagesize=landscape(A4),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'XlsxTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=MAROON,
        spaceAfter=8
    )
    sheet_header_style = ParagraphStyle(
        'SheetHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=MAROON,
        spaceBefore=10,
        spaceAfter=6
    )
    cell_style = ParagraphStyle(
        'CellText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=DARK_SLATE
    )
    header_cell_style = ParagraphStyle(
        'HeaderCellText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    story = [
        Paragraph(clean_text(title), title_style),
        Paragraph("Converted from Microsoft Excel Spreadsheet (.xlsx)", ParagraphStyle(
            'Sub', fontName='Helvetica-Oblique', fontSize=9, leading=12, textColor=MUTED_SLATE, spaceAfter=14
        ))
    ]

    for sheet_idx, sheetname in enumerate(wb.sheetnames[:5]):
        ws = wb[sheetname]
        if sheet_idx > 0:
            story.append(PageBreak())

        story.append(Paragraph(f"Sheet: {clean_text(sheetname)}", sheet_header_style))

        data = []
        max_rows = min(ws.max_row or 1, 80)
        max_cols = min(ws.max_column or 1, 8)

        for r in range(1, max_rows + 1):
            row_vals = []
            has_val = False
            for c in range(1, max_cols + 1):
                val = ws.cell(row=r, column=c).value
                str_val = clean_text(str(val) if val is not None else "")
                if str_val:
                    has_val = True
                safe = str_val.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                cur_style = header_cell_style if r == 1 else cell_style
                row_vals.append(Paragraph(safe[:100], cur_style))
            if has_val:
                data.append(row_vals)

        if data:
            rl_table = Table(data)
            rl_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), MAROON),
                ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ]))
            story.append(rl_table)
            story.append(Spacer(1, 12))

    pdf.build(story)
    return pdf_buffer.getvalue()

def pptx_to_pdf(contents: bytes, title: str = "Presentation") -> bytes:
    """Convert PPTX presentation slides to formatted Landscape PDF bytes."""
    prs = pptx.Presentation(io.BytesIO(contents))
    pdf_buffer = io.BytesIO()
    pdf = SimpleDocTemplate(
        pdf_buffer,
        pagesize=landscape(A4),
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    slide_title_style = ParagraphStyle(
        'SlideTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=MAROON,
        spaceAfter=12
    )
    bullet_style = ParagraphStyle(
        'SlideBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=DARK_SLATE,
        spaceAfter=6
    )

    story = []
    for idx, slide in enumerate(prs.slides):
        if idx > 0:
            story.append(PageBreak())

        slide_texts = []
        for shape in slide.shapes:
            if shape.has_text_frame:
                for para in shape.text_frame.paragraphs:
                    t = clean_text(para.text)
                    if t:
                        slide_texts.append(t)

        stitle = slide_texts[0] if slide_texts else f"Slide {idx + 1}"
        story.append(Paragraph(stitle, slide_title_style))
        story.append(Spacer(1, 8))

        bullets = slide_texts[1:] if len(slide_texts) > 1 else ["[Visual Slide Presentation Content]"]
        for b in bullets[:14]:
            safe_b = b.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            story.append(Paragraph(f"•  {safe_b}", bullet_style))

    if not story:
        story.append(Paragraph(f"Presentation: {clean_text(title)}", slide_title_style))
        story.append(Paragraph("[Empty presentation or no slides found]", bullet_style))

    pdf.build(story)
    return pdf_buffer.getvalue()

def text_to_pdf(contents: bytes, title: str = "Text Document") -> bytes:
    """Convert raw text or CSV to formatted PDF."""
    text_content = clean_text(contents.decode('utf-8', errors='ignore'))
    pdf_buffer = io.BytesIO()
    pdf = SimpleDocTemplate(
        pdf_buffer,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TxtTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=MAROON,
        spaceAfter=14
    )
    body_style = ParagraphStyle(
        'TxtBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=DARK_SLATE,
        spaceAfter=4
    )

    story = [
        Paragraph(clean_text(title), title_style),
        Spacer(1, 8)
    ]

    for line in text_content.splitlines()[:500]:
        clean_l = clean_text(line)
        if not clean_l:
            story.append(Spacer(1, 4))
            continue
        safe_l = clean_l.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        story.append(Paragraph(safe_l, body_style))

    pdf.build(story)
    return pdf_buffer.getvalue()

