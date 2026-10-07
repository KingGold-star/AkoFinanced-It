import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Sliders,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { Lender } from '../../types';
import { api } from '../../lib/api';

interface LendersTabProps {
  lenders: Lender[];
  onRefresh: () => void;
}

export const LendersTab: React.FC<LendersTabProps> = ({ lenders, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLender, setEditingLender] = useState<Lender | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('COMMERCIAL_BANK');
  const [formCustomerTypes, setFormCustomerTypes] = useState('BOTH');
  const [formProducts, setFormProducts] = useState('SME Working Capital, Asset Financing');
  const [formMinAmount, setFormMinAmount] = useState('500000');
  const [formMaxAmount, setFormMaxAmount] = useState('50000000');
  const [formMinIncome, setFormMinIncome] = useState('300000');
  const [formCriteria, setFormCriteria] = useState('Active bank account, registered CAC, min 1 yr turnover');
  const [formReqDocs, setFormReqDocs] = useState('Bank Statement, Government ID, CAC Certificate');
  const [formCoverage, setFormCoverage] = useState('Nationwide (Nigeria)');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formProcessingDays, setFormProcessingDays] = useState('3-5 Business Days');
  const [submitting, setSubmitting] = useState(false);

  const formatNGN = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const handleOpenAdd = () => {
    setEditingLender(null);
    setFormName('');
    setFormType('COMMERCIAL_BANK');
    setFormCustomerTypes('BOTH');
    setFormProducts('SME Working Capital, Asset Financing');
    setFormMinAmount('500000');
    setFormMaxAmount('50000000');
    setFormMinIncome('300000');
    setFormCriteria('Active bank account, registered CAC, min 1 yr turnover');
    setFormReqDocs('Bank Statement, Government ID, CAC Certificate');
    setFormCoverage('Nationwide (Nigeria)');
    setFormEmail('');
    setFormPhone('');
    setFormProcessingDays('3-5 Business Days');
    setShowAddModal(true);
  };

  const handleOpenEdit = (lender: Lender) => {
    setEditingLender(lender);
    setFormName(lender.name.replace(' [DEMO]', ''));
    setFormType(lender.institution_type);
    setFormCustomerTypes(lender.customer_types);
    setFormProducts(lender.products.join(', '));
    setFormMinAmount(String(lender.min_amount));
    setFormMaxAmount(String(lender.max_amount));
    setFormMinIncome(String(lender.min_income_or_revenue));
    setFormCriteria(lender.eligibility_criteria);
    setFormReqDocs(lender.required_documents.join(', '));
    setFormCoverage(lender.geographic_coverage);
    setFormEmail(lender.contact_email);
    setFormPhone(lender.contact_phone);
    setFormProcessingDays(lender.processing_days);
    setShowAddModal(true);
  };

  const handleSubmitLender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formName.trim(),
        institution_type: formType as any,
        customer_types: formCustomerTypes as any,
        products: formProducts.split(',').map((p) => p.trim()).filter(Boolean),
        min_amount: Number(formMinAmount),
        max_amount: Number(formMaxAmount),
        min_income_or_revenue: Number(formMinIncome),
        eligibility_criteria: formCriteria,
        required_documents: formReqDocs.split(',').map((d) => d.trim()).filter(Boolean),
        geographic_coverage: formCoverage,
        contact_email: formEmail,
        contact_phone: formPhone,
        processing_days: formProcessingDays
      };

      if (editingLender) {
        await api.updateLender(editingLender.id, payload);
      } else {
        await api.createLender(payload);
      }

      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save lender partner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLender = async (lenderId: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from active lender network?`)) {
      try {
        await api.deleteLender(lenderId);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Failed to remove lender');
      }
    }
  };

  const handleToggleActive = async (lender: Lender) => {
    try {
      await api.updateLender(lender.id, { active: !lender.active });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const filtered = lenders.filter((l) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!l.name.toLowerCase().includes(q) && !l.institution_type.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (typeFilter !== 'ALL' && l.institution_type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-white rounded-[12px] border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F95A5]" />
          <input
            type="text"
            placeholder="Search lender name or institution type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[10px] text-[#0B0B0F] placeholder-[#8F95A5] focus:outline-none focus:border-[#2D62FF] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-[10px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
          >
            <option value="ALL">All Partner Types</option>
            <option value="COMMERCIAL_BANK">Commercial Bank</option>
            <option value="MICROFINANCE_BANK">Microfinance Bank</option>
            <option value="DIGITAL_LENDER">Digital Lender</option>
            <option value="DFI">Development Finance (DFI)</option>
            <option value="PRIVATE_CREDIT">Private Credit</option>
          </select>

          <button
            onClick={handleOpenAdd}
            id="btn-add-new-lender-partner"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2D62FF] hover:bg-blue-700 text-white text-xs font-bold rounded-[10px] transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lender Partner</span>
          </button>
        </div>
      </div>

      {/* Lender Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((lender) => (
          <div
            key={lender.id}
            className={`bg-white rounded-[12px] border p-5 shadow-xs flex flex-col justify-between transition-all ${
              lender.active ? 'border-slate-200 hover:border-[#2D62FF]' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-[#0B0B0F]">{lender.name}</h3>
                  <span className="inline-block mt-0.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EFF4FF] text-[#2D62FF] border border-blue-100">
                    {lender.institution_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleActive(lender)}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer ${
                    lender.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {lender.active ? 'Active Partner' : 'Inactive'}
                </button>
              </div>

              <div className="space-y-2 text-xs text-[#5A5F71] mt-3.5">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-[#8F95A5]">Financing Ticket</span>
                  <span className="font-bold text-[#0B0B0F]">
                    {formatNGN(lender.min_amount)} - {formatNGN(lender.max_amount)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-[#8F95A5]">Min Monthly Flow</span>
                  <span className="font-semibold text-[#0B0B0F]">{formatNGN(lender.min_income_or_revenue)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-[#8F95A5]">Processing SLA</span>
                  <span className="font-semibold text-[#0B0B0F]">{lender.processing_days}</span>
                </div>
                <div className="py-1.5">
                  <span className="text-[#8F95A5] block text-[11px]">Product Types</span>
                  <p className="font-medium text-[#0B0B0F] line-clamp-1 mt-0.5">{lender.products?.join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3.5 flex items-center justify-between">
              <span className="text-[11px] text-[#8F95A5]">{lender.geographic_coverage}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(lender)}
                  className="p-1.5 text-[#5A5F71] hover:text-[#2D62FF] rounded-[8px] hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Edit Lender Partner"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteLender(lender.id, lender.name)}
                  className="p-1.5 text-[#8F95A5] hover:text-rose-600 rounded-[8px] hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove Partner"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Lender Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-[#0B0B0F]">
                {editingLender ? 'Edit Lender Partner' : 'Register New Partner Lender'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitLender} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zenith Bank Plc"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Institution Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="COMMERCIAL_BANK">Commercial Bank</option>
                    <option value="MICROFINANCE_BANK">Microfinance Bank</option>
                    <option value="DIGITAL_LENDER">Digital Fintech Lender</option>
                    <option value="DFI">Development Finance Institution (DFI)</option>
                    <option value="PRIVATE_CREDIT">Private Credit / Asset Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Min Ticket (NGN)
                  </label>
                  <input
                    type="number"
                    required
                    value={formMinAmount}
                    onChange={(e) => setFormMinAmount(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Max Ticket (NGN)
                  </label>
                  <input
                    type="number"
                    required
                    value={formMaxAmount}
                    onChange={(e) => setFormMaxAmount(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Min Flow (NGN)
                  </label>
                  <input
                    type="number"
                    required
                    value={formMinIncome}
                    onChange={(e) => setFormMinIncome(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Offered Credit Products (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="SME Working Capital, Asset Financing, Trade Credit"
                  value={formProducts}
                  onChange={(e) => setFormProducts(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Required Documents
                </label>
                <input
                  type="text"
                  required
                  placeholder="Bank Statement, Government ID, CAC Certificate"
                  value={formReqDocs}
                  onChange={(e) => setFormReqDocs(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="lender@bank.test"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Processing SLA
                  </label>
                  <input
                    type="text"
                    value={formProcessingDays}
                    onChange={(e) => setFormProcessingDays(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingLender ? 'Update Partner' : 'Register Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
