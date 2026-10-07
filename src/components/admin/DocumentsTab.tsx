import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  Filter,
  Check,
  AlertTriangle,
  ArrowRight,
  X
} from 'lucide-react';
import { api } from '../../lib/api';
import { Document } from '../../types';

interface DocumentsTabProps {
  onSelectApplication: (appId: string) => void;
  onRefresh: () => void;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ onSelectApplication, onRefresh }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await api.getCentralDocuments({
        search: searchQuery,
        status: statusFilter === 'ALL' ? '' : statusFilter
      });
      if (res && res.documents) {
        setDocuments(res.documents);
      }
    } catch (err) {
      console.error('Failed to load documents repository:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [searchQuery, statusFilter]);

  const handleUpdateStatus = async (docId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => {
    try {
      await api.updateDocumentStatus(docId, { status, notes });
      setRejectingDocId(null);
      setRejectReason('');
      await fetchDocs();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update document');
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header and filters */}
      <div className="bg-white rounded-[12px] border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F95A5]" />
          <input
            type="text"
            placeholder="Search document name, type, applicant name, or reference code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[10px] text-[#0B0B0F] placeholder-[#8F95A5] focus:outline-none focus:border-[#2D62FF] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-[10px] border border-slate-200 shrink-0">
          {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-all cursor-pointer ${
                statusFilter === st ? 'bg-white text-[#2D62FF] shadow-xs' : 'text-[#5A5F71] hover:text-[#0B0B0F]'
              }`}
            >
              {st === 'ALL' ? 'All Files' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#5A5F71] font-semibold select-none">
                <th className="py-3.5 px-4">Document File</th>
                <th className="py-3.5 px-3">Classification</th>
                <th className="py-3.5 px-3">Associated Application</th>
                <th className="py-3.5 px-3">Applicant Name</th>
                <th className="py-3.5 px-3">Audit Status</th>
                <th className="py-3.5 px-3">Uploaded</th>
                <th className="py-3.5 px-4 text-right">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[10px] bg-[#EFF4FF] text-[#2D62FF] border border-blue-100 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-[#0B0B0F]">{doc.name}</p>
                        <span className="text-[10px] text-[#8F95A5]">{doc.size || '1.2 MB'}</span>
                        {doc.notes && (
                          <p className="text-[10px] text-rose-600 italic mt-0.5">Note: {doc.notes}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-[6px] bg-slate-100 text-[#5A5F71] font-medium text-[11px] border border-slate-200">
                      {doc.document_type}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => onSelectApplication(doc.application_id)}
                      className="font-mono font-bold text-[#2D62FF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{doc.reference_number}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-[#0B0B0F]">
                    {doc.applicant_name}
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        doc.status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : doc.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-[#8F95A5] text-[11px]">
                    {new Date(doc.uploaded_at).toLocaleDateString('en-GB')}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {doc.status !== 'VERIFIED' && (
                        <button
                          onClick={() => handleUpdateStatus(doc.id, 'VERIFIED')}
                          className="px-3 py-1.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] transition-colors cursor-pointer shadow-2xs"
                        >
                          Verify
                        </button>
                      )}

                      {doc.status !== 'REJECTED' && (
                        <button
                          onClick={() => {
                            setRejectingDocId(doc.id);
                            setRejectReason('');
                          }}
                          className="px-3 py-1.5 text-[11px] font-bold bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-[8px] transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => onSelectApplication(doc.application_id)}
                        className="p-1.5 text-[#8F95A5] hover:text-[#2D62FF] rounded-[8px] hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Open Case Dossier"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {documents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-xs text-[#8F95A5]">
                    <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-[#0B0B0F]">No documents found in vault</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-[#8F95A5]">
          Displaying <strong>{documents.length}</strong> archived files
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingDocId && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] p-6 max-w-sm w-full shadow-2xl border border-rose-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100 mb-3">
              <h4 className="text-sm font-bold text-rose-900">Reject Document</h4>
              <button
                onClick={() => setRejectingDocId(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-3">Specify why this document is rejected:</p>
            <textarea
              rows={3}
              placeholder="e.g. Missing bank verification stamp or header is cut off."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-[10px] mb-4 focus:outline-none focus:border-rose-500 text-[#0B0B0F]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingDocId(null)}
                className="px-4 py-2 text-xs font-semibold text-[#5A5F71] hover:bg-slate-100 rounded-[8px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(rejectingDocId, 'REJECTED', rejectReason)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-[8px] cursor-pointer shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
