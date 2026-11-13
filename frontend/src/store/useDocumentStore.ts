import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DocumentItem } from '../types';

interface DocumentStore {
  documents: DocumentItem[];
  selectedDocId: string | null;
  searchQuery: string;
  addDocument: (doc: DocumentItem) => void;
  removeDocument: (id: string) => void;
  setSelectedDocId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  getSelectedDocument: () => DocumentItem | undefined;
  getTotalStorageUsed: () => number;
}

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-enterprise-arch',
    name: 'Enterprise_Cloud_Architecture_2026.pdf',
    size: 3450000,
    pages: 28,
    type: 'application/pdf',
    updatedAt: '2026-11-03T18:30:00Z',
    category: 'technical',
  },
  {
    id: 'doc-financial-q3',
    name: 'Q3_Financial_Performance_Audit.pdf',
    size: 1820000,
    pages: 14,
    type: 'application/pdf',
    updatedAt: '2026-11-02T14:15:00Z',
    category: 'financial',
  },
  {
    id: 'doc-legal-compliance',
    name: 'Global_Data_Compliance_Framework.pdf',
    size: 2150000,
    pages: 22,
    type: 'application/pdf',
    updatedAt: '2026-11-01T09:45:00Z',
    category: 'legal',
  },
  {
    id: 'doc-ai-spec',
    name: 'Neural_RAG_Pipeline_Specification.pdf',
    size: 1420000,
    pages: 18,
    type: 'application/pdf',
    updatedAt: '2026-10-30T11:20:00Z',
    category: 'technical',
  },
];

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      documents: INITIAL_DOCUMENTS,
      selectedDocId: INITIAL_DOCUMENTS[0].id,
      searchQuery: '',
      addDocument: (doc) =>
        set((state) => ({
          documents: [doc, ...state.documents],
          selectedDocId: doc.id,
        })),
      removeDocument: (id) =>
        set((state) => {
          const next = state.documents.filter((d) => d.id !== id);
          return {
            documents: next,
            selectedDocId: state.selectedDocId === id ? (next[0]?.id || null) : state.selectedDocId,
          };
        }),
      setSelectedDocId: (id) => set({ selectedDocId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      getSelectedDocument: () => {
        const { documents, selectedDocId } = get();
        return documents.find((d) => d.id === selectedDocId) || documents[0];
      },
      getTotalStorageUsed: () => {
        return get().documents.reduce((total, doc) => total + (doc.size || 0), 0);
      },
    }),
    {
      name: 'ai-pdf-documents',
    }
  )
);

