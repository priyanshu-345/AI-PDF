import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ToolsCatalog } from './pages/ToolsCatalog';
import { MergePdf } from './pages/pdf-tools/MergePdf';
import { SplitPdf } from './pages/pdf-tools/SplitPdf';
import { CompressPdf } from './pages/pdf-tools/CompressPdf';
import { RotatePdf } from './pages/pdf-tools/RotatePdf';
import { WatermarkPdf } from './pages/pdf-tools/WatermarkPdf';
import { ImagesToPdf } from './pages/pdf-tools/ImagesToPdf';
import { PageNumbers } from './pages/pdf-tools/PageNumbers';
import { OcrScanner } from './pages/pdf-tools/OcrScanner';
import { ConversionsHub } from './pages/conversions/ConversionsHub';
import { UniversalDashboard } from './pages/conversions/UniversalDashboard';
import { DocumentConversions } from './pages/conversions/DocumentConversions';
import { ImageConversions } from './pages/conversions/ImageConversions';
import { GenericConverter } from './pages/conversions/GenericConverter';
import { AiChat } from './pages/ai/AiChat';
import { AiSummarize } from './pages/ai/AiSummarize';
import { AiTranslate } from './pages/ai/AiTranslate';
import { AiProofread } from './pages/ai/AiProofread';
import { AiQuiz } from './pages/ai/AiQuiz';
import { DocumentsLibrary } from './pages/documents/DocumentsLibrary';
import { UploadHub } from './pages/documents/UploadHub';
import { PdfViewer } from './pages/documents/PdfViewer';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ProfileSettings } from './pages/profile/ProfileSettings';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Standalone Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Main Application Shell with Navbar & Sidebar */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<ToolsCatalog />} />

          {/* Core PDF Manipulation Tools */}
          <Route path="/tools/merge" element={<MergePdf />} />
          <Route path="/tools/split" element={<SplitPdf />} />
          <Route path="/tools/compress" element={<CompressPdf />} />
          <Route path="/tools/rotate" element={<RotatePdf />} />
          <Route path="/tools/watermark" element={<WatermarkPdf />} />
          <Route path="/tools/images-to-pdf" element={<ImagesToPdf />} />
          <Route path="/tools/page-numbers" element={<PageNumbers />} />
          <Route path="/tools/ocr" element={<OcrScanner />} />
          <Route path="/tools/convert" element={<UniversalDashboard />} />

          {/* Dedicated Conversion Suites & Universal Engine */}
          <Route path="/conversions" element={<UniversalDashboard />} />
          <Route path="/conversions/universal" element={<UniversalDashboard />} />
          <Route path="/conversions/hub" element={<ConversionsHub />} />
          <Route path="/conversions/documents" element={<DocumentConversions />} />
          <Route path="/conversions/images" element={<ImageConversions />} />
          <Route path="/conversions/:id" element={<GenericConverter />} />

          {/* AI Intelligence Lab */}
          <Route path="/ai/chat" element={<AiChat />} />
          <Route path="/ai/summarize" element={<AiSummarize />} />
          <Route path="/ai/translate" element={<AiTranslate />} />
          <Route path="/ai/proofread" element={<AiProofread />} />
          <Route path="/ai/quiz" element={<AiQuiz />} />

          {/* Documents & Files */}
          <Route path="/documents" element={<DocumentsLibrary />} />
          <Route path="/upload" element={<UploadHub />} />
          <Route path="/viewer/:id" element={<PdfViewer />} />
          <Route path="/viewer" element={<PdfViewer />} />

          {/* Profile & Settings */}
          <Route path="/profile" element={<ProfileSettings />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
