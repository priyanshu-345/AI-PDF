import React, { useState } from 'react';
import {
  Languages,
  FileText,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';

export const AiTranslate: React.FC = () => {
  const { documents, selectedDocId, setSelectedDocId, getSelectedDocument } = useDocumentStore();
  const selectedDoc = getSelectedDocument();

  const [targetLang, setTargetLang] = useState('Spanish');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const languages = [
    { name: 'Hindi', native: 'हिंदी' },
    { name: 'Spanish', native: 'Español' },
    { name: 'French', native: 'Français' },
    { name: 'German', native: 'Deutsch' },
    { name: 'Japanese', native: '日本語' },
    { name: 'Chinese', native: '中文' },
    { name: 'Arabic', native: 'العربية' },
    { name: 'Portuguese', native: 'Português' },
  ];

  const handleTranslate = () => {
    setIsTranslating(true);
    setTranslatedContent(null);

    setTimeout(() => {
      let mock = '';
      if (targetLang === 'Hindi') {
        mock = `दस्तावेज़ अनुवाद: ${selectedDoc?.name || 'पीडीएफ'}
अनुवादित भाषा: हिंदी (Hindi)

1. कार्यकारी सारांश
यह दस्तावेज़ उद्यम स्तर के उच्च-प्रदर्शन पीडीएफ प्रसंस्करण प्रणालियों के लिए परिचालन दिशा-निर्देश और वास्तुकला संबंधी प्राथमिकताओं को स्पष्ट करता है।

2. डेटा सुरक्षा और गोपनीयता
सभी दस्तावेज़ संचालन सीधे ब्राउज़र मेमोरी के भीतर निष्पादित होते हैं, जिससे उपयोगकर्ता का डेटा पूरी तरह से सुरक्षित और गोपनीय रहता है।

3. कोर निष्कर्ष
- कम विलंबता के लिए असमकालिक कार्यकर्ता कतारें (Worker queues)
- संपूर्ण क्रिप्टोग्राफ़िक सत्यापन और SHA-256 अखंडता जांच`;
      } else if (targetLang === 'Spanish') {
        mock = `Traducción del documento: ${selectedDoc?.name || 'PDF'}
Idioma de destino: Español (Spanish)

1. RESUMEN EJECUTIVO
Este documento describe el marco operativo y las prioridades estratégicas para la infraestructura empresarial y los canales de procesamiento de documentos PDF de alto rendimiento.

2. SEGURIDAD Y PRIVACIDAD
Todas las manipulaciones de documentos se ejecutan directamente en la memoria local del navegador, garantizando que ningún dato salga del dispositivo del cliente.

3. CONCLUSIONES CLAVE
- Arquitectura desacoplada para minimizar la latencia.
- Verificación criptográfica rigurosa mediante firmas SHA-256.`;
      } else if (targetLang === 'French') {
        mock = `Traduction du document: ${selectedDoc?.name || 'PDF'}
Langue cible: Français (French)

1. RÉSUMÉ OPÉRATIONNEL
Ce document détaille le cadre opérationnel et les priorités stratégiques pour l'infrastructure d'entreprise et les pipelines de traitement PDF à haut débit.

2. SÉCURITÉ ET CONFORMITÉ
Toutes les opérations documentaires sont exécutées localement dans le navigateur, assurant une confidentialité totale et la souveraineté des données.`;
      } else {
        mock = `Translated Document (${targetLang}): ${selectedDoc?.name || 'PDF'}
Target Language: ${targetLang}

1. EXECUTIVE OVERVIEW
The operational framework guarantees zero-latency stream processing across all vectorized page fragments.

2. DATA PRIVACY & COMPLIANCE
All transformations occur purely in-browser without remote third-party transmission.`;
      }

      setTranslatedContent(mock);
      setIsTranslating(false);
    }, 1100);
  };

  const handleCopy = () => {
    if (!translatedContent) return;
    navigator.clipboard.writeText(translatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5 pb-2">
        <div className="w-12 h-12 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center">
          <Languages className="w-6 h-6 text-maroon-700" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Multilingual Translator</h1>
          <p className="text-xs text-slate-500 font-medium">
            Translate technical documents, agreements, or articles across 10+ global languages with structural fidelity.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-xs space-y-6">
        {/* Document & Language Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
              Source Document
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
              <FileText className="w-4 h-4 text-maroon-700" />
              <select
                value={selectedDoc?.id || ''}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="text-xs font-extrabold text-slate-900 bg-transparent outline-none cursor-pointer w-full truncate"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.pages}p)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
              Target Language
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
              <Languages className="w-4 h-4 text-maroon-700" />
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="text-xs font-extrabold text-slate-900 bg-transparent outline-none cursor-pointer w-full"
              >
                {languages.map((l) => (
                  <option key={l.name} value={l.name}>
                    {l.name} ({l.native})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Trigger */}
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:bg-slate-200 text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isTranslating ? `Translating to ${targetLang}...` : `Translate to ${targetLang}`}</span>
        </button>

        {/* Translation Output Side-by-Side */}
        {translatedContent && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Bilingual Document Output ({targetLang})
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Translation'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Original Source (English)
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  Enterprise documentation indicates that asynchronous job workers decouple heavy rendering operations from client interfaces. Data ingestion adheres to strict cryptographic verification with SHA-256 integrity checks. All processed files remain entirely strictly local to browser volatile RAM.
                </p>
              </div>

              {/* Translated */}
              <div className="bg-maroon-50/40 border border-maroon-200 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-extrabold text-maroon-800 uppercase tracking-wider block">
                  Translated Text ({targetLang})
                </span>
                <div className="text-xs text-slate-900 leading-relaxed font-sans whitespace-pre-line">
                  {translatedContent}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
