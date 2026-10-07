import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  User,
  ExternalLink,
  Search,
  Check,
  X
} from 'lucide-react';
import { FollowUp, Application } from '../../types';
import { api } from '../../lib/api';

interface FollowupsTabProps {
  followups: {
    due_today: FollowUp[];
    overdue: FollowUp[];
    upcoming: FollowUp[];
    completed: FollowUp[];
  };
  applications: Application[];
  onSelectApplication: (appId: string) => void;
  onRefresh: () => void;
}

export const FollowupsTab: React.FC<FollowupsTabProps> = ({
  followups,
  applications,
  onSelectApplication,
  onRefresh
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'due_today' | 'overdue' | 'upcoming' | 'completed'>('due_today');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Followup Form
  const [selectedAppId, setSelectedAppId] = useState(applications[0]?.id || '');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskType, setTaskType] = useState('BORROWER_CALL');
  const [taskNotes, setTaskNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !dueDate || !taskNotes.trim()) return;
    try {
      setSubmitting(true);
      await api.createFollowUp(selectedAppId, {
        due_date: dueDate,
        type: taskType,
        notes: taskNotes.trim()
      });
      setShowScheduleModal(false);
      setTaskNotes('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (fId: string) => {
    const outcome = prompt('Enter follow-up outcome note:', 'Call completed successfully with applicant.');
    if (outcome !== null) {
      try {
        await api.updateFollowUp(fId, { completed: true, outcome });
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Failed to mark task complete');
      }
    }
  };

  const currentList = followups[activeSubTab] || [];
  const filtered = currentList.filter((f) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.customer_name.toLowerCase().includes(q) ||
        f.application_ref.toLowerCase().includes(q) ||
        f.notes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header & Quick Actions */}
      <div className="bg-white rounded-[12px] border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Sub-tab pills with counts */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-[10px] border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('due_today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'due_today'
                ? 'bg-white text-[#2D62FF] shadow-xs'
                : 'text-[#5A5F71] hover:text-[#0B0B0F]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Due Today ({followups.due_today?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('overdue')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'overdue'
                ? 'bg-rose-50 text-rose-700 font-bold shadow-xs'
                : 'text-[#5A5F71] hover:text-rose-600'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Overdue ({followups.overdue?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('upcoming')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'upcoming'
                ? 'bg-white text-[#2D62FF] shadow-xs'
                : 'text-[#5A5F71] hover:text-[#0B0B0F]'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Upcoming ({followups.upcoming?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'completed'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-[#5A5F71] hover:text-[#0B0B0F]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed ({followups.completed?.length || 0})</span>
          </button>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          id="btn-schedule-new-followup"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2D62FF] hover:bg-blue-700 text-white text-xs font-bold rounded-[10px] transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Task</span>
        </button>
      </div>

      {/* Task Cards Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((task) => (
          <div
            key={task.id}
            className={`bg-white rounded-[12px] border p-4.5 shadow-xs flex flex-col justify-between transition-all ${
              task.completed
                ? 'border-slate-200 bg-slate-50/70 opacity-75'
                : activeSubTab === 'overdue'
                ? 'border-rose-300 bg-rose-50/30'
                : 'border-slate-200 hover:border-[#2D62FF]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <button
                  onClick={() => onSelectApplication(task.application_id)}
                  className="font-mono text-xs font-bold text-[#2D62FF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{task.application_ref}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-[#5A5F71] border border-slate-200">
                  {task.type.replace(/_/g, ' ')}
                </span>
              </div>

              <h4 className="text-xs font-bold text-[#0B0B0F]">{task.customer_name}</h4>
              <p className="text-[11px] text-[#8F95A5] flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" />
                <span>{task.customer_phone}</span>
              </p>

              <p className="text-xs text-[#0B0B0F] mt-2.5 p-2.5 rounded-[8px] bg-slate-50 border border-slate-100 leading-relaxed">
                {task.notes}
              </p>

              {task.outcome && (
                <div className="mt-2 p-2.5 rounded-[8px] bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800">
                  <strong>Outcome:</strong> {task.outcome}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3.5 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#8F95A5]">
                Due: <strong className="text-[#0B0B0F]">{task.due_date}</strong>
              </span>

              {!task.completed ? (
                <button
                  onClick={() => handleComplete(task.id)}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] transition-colors cursor-pointer shadow-2xs"
                >
                  Complete Task
                </button>
              ) : (
                <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </span>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-14 text-center text-xs text-[#8F95A5] bg-white rounded-[12px] border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-[#0B0B0F]">No tasks in this category</p>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-[#0B0B0F]">Schedule Operational Follow-up</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-[#8F95A5] hover:text-[#0B0B0F] p-1 cursor-pointer rounded-[8px] hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Link to Loan Application *
                </label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {applications.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.reference_number} - {a.applicant_info.first_name} {a.applicant_info.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Follow-up Action Type
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="BORROWER_CALL">Borrower Outreach Call</option>
                  <option value="DOCUMENT_REQUEST">Document Clarification</option>
                  <option value="LENDER_CHECK">Partner Lender Follow-up</option>
                  <option value="SANCTION_DELIVERY">Sanction / Offer Briefing</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Task Objectives & Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify task agenda or check required..."
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl cursor-pointer shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
