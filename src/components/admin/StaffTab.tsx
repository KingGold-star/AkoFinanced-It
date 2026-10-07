import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  ShieldCheck,
  Edit,
  Mail,
  Phone,
  Check,
  X,
  Lock,
  FileSpreadsheet
} from 'lucide-react';
import { User, Role } from '../../types';
import { api } from '../../lib/api';

interface StaffTabProps {
  staffMembers: User[];
  onRefresh: () => void;
}

export const StaffTab: React.FC<StaffTabProps> = ({ staffMembers, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<Role>('LOAN_OFFICER');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('LOAN_OFFICER');
    setShowAddModal(true);
  };

  const handleOpenEdit = (staff: User) => {
    setEditingStaff(staff);
    setFormName(staff.full_name);
    setFormEmail(staff.email);
    setFormPhone(staff.phone || '');
    setFormRole(staff.role);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formName.trim()) return;

    try {
      setSubmitting(true);
      if (editingStaff) {
        await api.updateStaff(editingStaff.id, {
          full_name: formName.trim(),
          phone: formPhone.trim(),
          role: formRole
        });
      } else {
        await api.createStaff({
          email: formEmail.trim(),
          full_name: formName.trim(),
          phone: formPhone.trim(),
          role: formRole
        });
      }
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ADMIN':
        return { label: 'Admin', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'LOAN_OFFICER':
        return { label: 'Loan Officer', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'REVIEWER':
        return { label: 'Reviewer', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: role, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  // Permissions matrix
  const permissionsMatrix = [
    { module: 'View Applications & Financial Dossiers', superAdmin: true, admin: true, loanOfficer: true, reviewer: true },
    { module: 'Update Application Stages & Workflow', superAdmin: true, admin: true, loanOfficer: true, reviewer: false },
    { module: 'Verify & Reject Financial Documents', superAdmin: true, admin: true, loanOfficer: true, reviewer: true },
    { module: 'Run Automated Lender Match Engine', superAdmin: true, admin: true, loanOfficer: true, reviewer: true },
    { module: 'Record Formal Lender Sanction & Terms', superAdmin: true, admin: true, loanOfficer: true, reviewer: false },
    { module: 'Add Private Internal Staff Notes', superAdmin: true, admin: true, loanOfficer: true, reviewer: true },
    { module: 'Add & Edit Partner Lenders', superAdmin: true, admin: true, loanOfficer: false, reviewer: false },
    { module: 'Staff Directory & Role Assignments', superAdmin: true, admin: true, loanOfficer: false, reviewer: false },
    { module: 'Access Immutable Audit Logs', superAdmin: true, admin: true, loanOfficer: true, reviewer: false },
    { module: 'Modify Platform & Financial Settings', superAdmin: true, admin: false, loanOfficer: false, reviewer: false }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header and Add Action */}
      <div className="bg-white rounded-[12px] border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#0B0B0F]">Staff Officers & Operational Roles</h2>
          <p className="text-xs text-[#8F95A5] mt-0.5">Manage underwriting staff, case allocations, and access privileges</p>
        </div>

        <button
          onClick={handleOpenAdd}
          id="btn-invite-staff"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#2D62FF] hover:bg-blue-700 text-white text-xs font-bold rounded-[10px] transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#5A5F71] font-semibold select-none">
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-3">Role & Access Tier</th>
                <th className="py-3.5 px-3">Contact Email</th>
                <th className="py-3.5 px-3">Phone</th>
                <th className="py-3.5 px-3">Assigned Active Cases</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffMembers.map((staff: any) => {
                const roleBadge = getRoleBadge(staff.role);
                return (
                  <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#2D62FF] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {staff.full_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-[#0B0B0F]">{staff.full_name}</p>
                          <span className="text-[10px] text-[#8F95A5] font-mono">ID: {staff.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${roleBadge.bg}`}>
                        {roleBadge.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-[#0B0B0F]">
                      {staff.email}
                    </td>

                    <td className="py-3.5 px-3 text-[#5A5F71]">
                      {staff.phone || 'N/A'}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-[#0B0B0F] px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
                        {staff.active_cases_count !== undefined ? `${staff.active_cases_count} Cases` : 'Active'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(staff)}
                        className="px-3 py-1.5 text-xs font-bold text-[#5A5F71] hover:text-[#2D62FF] hover:bg-slate-100 rounded-[8px] transition-colors cursor-pointer"
                      >
                        Edit Role
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role & Permissions Matrix */}
      <div className="bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs">
        <div className="pb-3.5 border-b border-slate-100 mb-3.5 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2D62FF]" />
          <h3 className="text-xs font-bold text-[#0B0B0F]">Fintech Security & Permissions Governance Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[#8F95A5] font-semibold">
                <th className="pb-2.5 font-medium">Capability / Operational Module</th>
                <th className="pb-2.5 text-center">Super Admin</th>
                <th className="pb-2.5 text-center">Admin</th>
                <th className="pb-2.5 text-center">Loan Officer</th>
                <th className="pb-2.5 text-center">Reviewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((row) => (
                <tr key={row.module} className="hover:bg-slate-50">
                  <td className="py-3 font-medium text-[#0B0B0F]">{row.module}</td>
                  <td className="py-3 text-center">
                    {row.superAdmin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 text-center">
                    {row.admin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 text-center">
                    {row.loanOfficer ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 text-center">
                    {row.reviewer ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-[#0B0B0F]">
                {editingStaff ? 'Edit Staff Details' : 'Add New Staff Member'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#8F95A5] hover:text-[#0B0B0F] p-1.5 rounded-[8px] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adebayo Ogunlesi"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Corporate Email Address *
                </label>
                <input
                  type="email"
                  required
                  disabled={Boolean(editingStaff)}
                  placeholder="officer@akofinanced.it"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white disabled:opacity-50 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+234 800 000 0000"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Assigned Operational Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as Role)}
                  className="w-full py-2.5 px-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Authority)</option>
                  <option value="ADMIN">ADMIN (Operations & Lender Governance)</option>
                  <option value="LOAN_OFFICER">LOAN_OFFICER (Underwriting & Sanctions)</option>
                  <option value="REVIEWER">REVIEWER (Document Audit Specialist)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs text-slate-600 font-semibold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl cursor-pointer shadow-xs"
                >
                  {submitting ? 'Saving...' : editingStaff ? 'Save Changes' : 'Invite Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
