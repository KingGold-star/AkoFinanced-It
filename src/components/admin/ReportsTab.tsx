import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Download,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  Users,
  FileText,
  Loader2
} from 'lucide-react';
import { api } from '../../lib/api';

export const ReportsTab: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);

  const formatNGN = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminReports();
      if (res) {
        setReportData(res);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const COLORS = ['#64748B', '#2563EB', '#8B5CF6', '#F59E0B', '#06B6D4', '#3B82F6', '#10B981', '#EF4444'];

  const handleExportExecutiveReport = async () => {
    try {
      setExportingPdf(true);
      const { fetchAllPlatformData, generateExecutivePdfReport } = await import('../../lib/pdfReportGenerator');
      const fullData = await fetchAllPlatformData();
      generateExecutivePdfReport(fullData);
    } catch (err) {
      console.error('Failed to generate executive report PDF:', err);
      alert('Failed to generate comprehensive PDF. Please retry.');
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading || !reportData) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="font-semibold text-slate-700">Compiling analytics & performance metrics...</p>
      </div>
    );
  }

  const { metrics, monthly_trends, status_breakdown, category_breakdown, lender_distribution, staff_performance } =
    reportData;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn font-sans">
      {/* Header Bar */}
      <div className="bg-white rounded-[12px] border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#0B0B0F]">Executive Operations & Loan Volume Dashboard</h2>
          <p className="text-xs text-[#8F95A5] mt-0.5">Real-time underwriting throughput, approval ratios, and lender distribution</p>
        </div>

        <button
          onClick={handleExportExecutiveReport}
          disabled={exportingPdf}
          id="btn-export-executive-report"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EFF4FF] hover:bg-[#2D62FF] hover:text-white text-[#2D62FF] text-xs font-bold rounded-[10px] transition-all cursor-pointer border border-blue-200/80 shadow-xs active:scale-[0.99] disabled:opacity-50"
        >
          {exportingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{exportingPdf ? 'Compiling PDF Dossier...' : 'Export Executive Report'}</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-[12px] border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#8F95A5] mb-1">
            <span className="font-semibold">Total Pipeline Requested</span>
            <DollarSign className="w-4 h-4 text-[#2D62FF]" />
          </div>
          <p className="text-xl font-bold text-[#0B0B0F]">{formatNGN(metrics.total_volume_requested)}</p>
          <span className="text-[11px] text-[#8F95A5] mt-1 block">Across {metrics.total_applications} loan applications</span>
        </div>

        <div className="bg-white p-4.5 rounded-[12px] border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#8F95A5] mb-1">
            <span className="font-semibold">Sanctioned / Approved Volume</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-600">{formatNGN(metrics.total_volume_approved)}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Formal lender offers issued</span>
        </div>

        <div className="bg-white p-4.5 rounded-[12px] border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#8F95A5] mb-1">
            <span className="font-semibold">Approval Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-bold text-indigo-600">{metrics.approval_rate_percent}%</p>
          <span className="text-[11px] text-[#8F95A5] mt-1 block">Submission to offer ratio</span>
        </div>

        <div className="bg-white p-4.5 rounded-[12px] border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#8F95A5] mb-1">
            <span className="font-semibold">Avg Turnaround Time</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600">{metrics.avg_turnaround_days} Days</p>
          <span className="text-[11px] text-[#8F95A5] mt-1 block">From intake to lender offer</span>
        </div>
      </div>

      {/* Main Charts: 6-Month Volume Trends & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Volume Trends (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#0B0B0F]">Monthly Financing Volume (NGN)</h3>
              <p className="text-[11px] text-[#8F95A5]">Comparison between requested loan demand and approved sanctions</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly_trends} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(v) => `₦${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value: any) => formatNGN(Number(value))}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="volume_requested" name="Volume Requested (₦)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="volume_approved" name="Volume Approved (₦)" fill="#2D62FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs">
          <div className="pb-3.5 border-b border-slate-100 mb-4">
            <h3 className="text-xs font-bold text-[#0B0B0F]">Application Status Distribution</h3>
            <p className="text-[11px] text-[#8F95A5]">Current breakdown across operational pipeline</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={status_breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {status_breakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2 text-xs">
            {status_breakdown.slice(0, 5).map((item: any, idx: number) => (
              <div key={item.name} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-[#5A5F71]">{item.name}</span>
                </div>
                <strong className="text-[#0B0B0F]">{item.count} cases</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lender Distribution & Staff Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lender Partner Routing */}
        <div className="bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs">
          <div className="pb-3.5 border-b border-slate-100 mb-3.5">
            <h3 className="text-xs font-bold text-[#0B0B0F] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#2D62FF]" />
              <span>Lender Partner Allocation & Volume</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[#8F95A5] font-semibold select-none">
                  <th className="pb-2.5">Partner Name</th>
                  <th className="pb-2.5">Type</th>
                  <th className="pb-2.5">Assigned Dossiers</th>
                  <th className="pb-2.5 text-right">Volume Routed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lender_distribution.map((len: any) => (
                  <tr key={len.name} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-[#0B0B0F]">{len.name}</td>
                    <td className="py-3 text-[#5A5F71]">{len.type.replace(/_/g, ' ')}</td>
                    <td className="py-3 font-semibold text-[#0B0B0F]">{len.assigned_count} Cases</td>
                    <td className="py-3 text-right font-bold text-[#2D62FF]">{formatNGN(len.volume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff Underwriting Workload */}
        <div className="bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs">
          <div className="pb-3.5 border-b border-slate-100 mb-3.5">
            <h3 className="text-xs font-bold text-[#0B0B0F] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2D62FF]" />
              <span>Staff Underwriting Workload & Throughput</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[#8F95A5] font-semibold select-none">
                  <th className="pb-2.5">Officer Name</th>
                  <th className="pb-2.5">Role</th>
                  <th className="pb-2.5">Active Assigned Cases</th>
                  <th className="pb-2.5 text-right">Completed Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff_performance.map((st: any) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-[#0B0B0F]">{st.name}</td>
                    <td className="py-3 text-[#5A5F71]">{st.role}</td>
                    <td className="py-3 font-semibold text-[#0B0B0F]">{st.assigned_cases} Active</td>
                    <td className="py-3 text-right font-bold text-emerald-600">{st.completed_tasks} Tasks</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
