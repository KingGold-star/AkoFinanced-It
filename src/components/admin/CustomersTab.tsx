import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  User,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';
import { api } from '../../lib/api';
import { CustomerSummary } from '../../types';

interface CustomersTabProps {
  onSelectApplication?: (appId: string) => void;
  onRefresh: () => void;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({ onSelectApplication }) => {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [kycFilter, setKycFilter] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  const formatNGN = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomers({ search: searchQuery });
      if (res && res.customers) {
        setCustomers(res.customers);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  const filtered = customers.filter((c) => {
    if (kycFilter !== 'ALL' && c.kyc_status !== kycFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header filter bar */}
      <div className="bg-white rounded-[12px] border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F95A5]" />
          <input
            type="text"
            placeholder="Search customers by full name, email, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[10px] text-[#0B0B0F] placeholder-[#8F95A5] focus:outline-none focus:border-[#2D62FF] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-[10px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
          >
            <option value="ALL">All KYC Tiers</option>
            <option value="VERIFIED">KYC Verified (Tier 2)</option>
            <option value="TIER_1">Tier 1 Basic</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#5A5F71] font-semibold select-none">
                <th className="py-3.5 px-4">Borrower Name & Contact</th>
                <th className="py-3.5 px-3">Borrower Profile</th>
                <th className="py-3.5 px-3">Location / State</th>
                <th className="py-3.5 px-3">Applications Count</th>
                <th className="py-3.5 px-3">Total Requested Volume</th>
                <th className="py-3.5 px-3">KYC Verification</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#EFF4FF] text-[#2D62FF] border border-blue-100 font-bold text-xs flex items-center justify-center shrink-0">
                        {c.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-[#0B0B0F] group-hover:text-[#2D62FF] transition-colors">
                          {c.full_name}
                        </p>
                        <p className="text-[11px] text-[#8F95A5] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-[#8F95A5]" />
                          <span>{c.email}</span>
                        </p>
                        <p className="text-[10px] text-[#8F95A5] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#8F95A5]" />
                          <span>{c.phone}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-1 text-[10px] font-semibold rounded-[6px] ${
                        c.applicant_type === 'BUSINESS'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-[#EFF4FF] text-[#2D62FF] border border-blue-200'
                      }`}
                    >
                      {c.applicant_type}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-[#5A5F71]">
                    <div className="flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-[#8F95A5]" />
                      <span>{c.state || 'Nigeria'}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-[#0B0B0F] px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
                      {c.total_applications} {c.total_applications === 1 ? 'Loan' : 'Loans'}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-bold text-[#0B0B0F]">
                    {formatNGN(c.total_requested_amount)}
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                        c.kyc_status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {c.kyc_status === 'VERIFIED' ? 'Verified Tier 2' : 'Tier 1 Standard'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(c);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-[#2D62FF] bg-[#EFF4FF] hover:bg-[#2D62FF] hover:text-white rounded-[8px] transition-colors cursor-pointer"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-xs text-[#8F95A5]">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-[#0B0B0F]">No customers found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-[#8F95A5]">
          Displaying <strong>{filtered.length}</strong> active borrower dossiers
        </div>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#2D62FF] text-white font-bold text-base flex items-center justify-center shadow-xs">
                  {selectedCustomer.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B0B0F]">{selectedCustomer.full_name}</h3>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedCustomer.kyc_status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-[#8F95A5] hover:text-[#0B0B0F] p-1.5 rounded-[8px] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-[10px] bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[#8F95A5] block text-[11px]">Total Loans Requested</span>
                  <strong className="text-base font-bold text-[#0B0B0F]">
                    {formatNGN(selectedCustomer.total_requested_amount)}
                  </strong>
                </div>
                <div>
                  <span className="text-[#8F95A5] block text-[11px]">Active Applications</span>
                  <strong className="text-base font-bold text-[#2D62FF]">
                    {selectedCustomer.total_applications} Case(s)
                  </strong>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-[#5A5F71]">Email</span>
                  <span className="font-semibold text-[#0B0B0F]">{selectedCustomer.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-semibold text-slate-900">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Applicant Type</span>
                  <span className="font-semibold text-slate-900">{selectedCustomer.applicant_type}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">State / Region</span>
                  <span className="font-semibold text-slate-900">{selectedCustomer.state || 'Nigeria'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3.5 border-t border-slate-100">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
