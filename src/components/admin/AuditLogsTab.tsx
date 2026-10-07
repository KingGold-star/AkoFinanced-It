import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  Clock,
  User,
  Activity,
  FileCheck2,
  Building2,
  MessageSquare,
  Lock
} from 'lucide-react';
import { api } from '../../lib/api';
import { AuditLog } from '../../types';

export const AuditLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAuditLogs({
        action: actionFilter === 'ALL' ? '' : actionFilter,
        search: searchQuery
      });
      if (res && res.logs) {
        setLogs(res.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchQuery, actionFilter]);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Timestamp,Staff Name,Role,Action,Entity Type,Entity ID,Details,IP Address\n' +
      logs
        .map(
          (l) =>
            `"${l.id}","${l.timestamp}","${l.user_name}","${l.user_role}","${l.action}","${l.entity_type}","${l.entity_id}","${(l.details || '').replace(/"/g, '""')}","${l.ip_address || ''}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AkoFinanced_AuditLogs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: string) => {
    if (action.includes('STATUS')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('DOCUMENT')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('LENDER')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (action.includes('DELETE') || action.includes('REJECT')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-[#5A5F71]/10 text-[#5A5F71] border-[#8F95A5]/20';
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header and Filter */}
      <div className="bg-white rounded-[12px] border border-[#8F95A5]/20 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F95A5]" />
          <input
            type="text"
            placeholder="Search audit trail by actor, application ID, or action description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#5A5F71]/5 border border-[#8F95A5]/20 rounded-[10px] text-[#0B0B0F] placeholder-[#8F95A5] focus:outline-none focus:border-[#2D62FF] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="py-2 px-3 text-xs bg-[#5A5F71]/5 border border-[#8F95A5]/20 rounded-[10px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
          >
            <option value="ALL">All Event Actions</option>
            <option value="APPLICATION_STATUS_UPDATE">Status Stage Updates</option>
            <option value="LENDER_ASSIGNED">Lender Submissions</option>
            <option value="OFFER_RECORDED">Lender Offers</option>
            <option value="DOCUMENT_VERIFIED">Document Verification</option>
            <option value="DOCUMENT_REJECTED">Document Rejections</option>
            <option value="INTERNAL_NOTE_ADDED">Internal Notes</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#5A5F71]/10 hover:bg-[#5A5F71]/15 text-[#0B0B0F] text-xs font-semibold rounded-[10px] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-[12px] border border-[#8F95A5]/20 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#5A5F71]/5 border-b border-[#8F95A5]/20 text-[#5A5F71] font-semibold">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-3">Staff Actor</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-4">Operational Event Details</th>
                <th className="py-3 px-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8F95A5]/10">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#5A5F71]/5 transition-colors">
                  <td className="py-3 px-4 text-[#5A5F71] whitespace-nowrap font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString('en-GB')}
                  </td>

                  <td className="py-3 px-3 font-bold text-[#0B0B0F]">
                    {log.user_name}
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#5A5F71]/10 text-[#5A5F71]">
                      {log.user_role}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getActionBadge(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-[#0B0B0F] max-w-md">
                    <p className="line-clamp-2">{log.details}</p>
                    {log.entity_id && (
                      <span className="text-[10px] text-[#8F95A5] font-mono mt-0.5 block">
                        Entity: {log.entity_type} #{log.entity_id}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 font-mono text-[10px] text-[#8F95A5]">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#8F95A5]">
                    <ShieldAlert className="w-8 h-8 text-[#8F95A5]/40 mx-auto mb-2" />
                    <p className="font-semibold text-[#5A5F71]">No audit log entries matching criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#5A5F71]/5 border-t border-[#8F95A5]/15 text-xs text-[#8F95A5]">
          Displaying <strong>{logs.length}</strong> immutable compliance events
        </div>
      </div>
    </div>
  );
};
