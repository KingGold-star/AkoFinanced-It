import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo';
import {
  Home,
  FileText,
  Folder,
  History,
  MessageSquare,
  User as UserIcon,
  LogOut,
  Bell,
  ChevronDown,
  Copy,
  Check,
  CreditCard,
  Search,
  FileCheck,
  Calendar,
  Settings,
  Building,
  Building2,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Headphones,
  UploadCloud,
  Send,
  Loader2,
  X,
  Target,
  Plus,
  RefreshCw,
  Eye,
  ExternalLink,
  AlertTriangle,
  MoreHorizontal,
  Sparkles,
  BookOpen,
  Shield,
  ShieldCheck,
  KeyRound,
  Smartphone,
  Mail,
  MessageCircle,
  Download,
  Trash2,
  AlertOctagon,
  Lock,
  Globe,
  Radio,
  FileCheck2,
  CheckCircle,
  HelpCircle,
  Edit2,
  Menu,
  Camera,
  RotateCw,
  Sliders,
  Receipt,
  PhoneCall
} from 'lucide-react';
import { CameraDocumentCaptureModal, CapturedDocumentData } from './CameraDocumentCaptureModal';
import { DocumentPreSubmissionModal, PreSubmissionDocument } from './DocumentPreSubmissionModal';
import { api } from '../lib/api';
import { Application, ApplicationStatus, Document, DocumentRequirement, Message, User } from '../types';

interface CustomerDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateHome: () => void;
  onStartApplication?: (type: 'INDIVIDUAL' | 'BUSINESS') => void;
}

type TabType = 'overview' | 'application' | 'documents' | 'keeptab' | 'messages' | 'profile' | 'notifications';

// Helper to convert number to Nigerian Naira words (approximate)
function amountInWords(amount: number): string {
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    if (millions === 1) return 'One Million Naira';
    if (millions === 2) return 'Two Million Naira';
    if (millions === 5) return 'Five Million Naira';
    if (millions === 10) return 'Ten Million Naira';
    if (millions === 20) return 'Twenty Million Naira';
    if (millions === 50) return 'Fifty Million Naira';
    return `${millions} Million Naira`;
  }
  if (amount >= 1000) {
    const thousands = amount / 1000;
    return `${thousands} Thousand Naira`;
  }
  return `₦${amount.toLocaleString()}`;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user,
  onLogout,
  onNavigateHome,
  onStartApplication
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Application detailed state
  const [appDetail, setAppDetail] = useState<Application | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docRequirements, setDocRequirements] = useState<DocumentRequirement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // UI States
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [showBottomBanner, setShowBottomBanner] = useState<boolean>(true);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [notificationsList, setNotificationsList] = useState([
    {
      id: 'n1',
      title: 'Tariq has sent you a message!',
      time: '04 days ago.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
      unread: true,
    },
    {
      id: 'n2',
      title: 'Johan just joined your platform!',
      time: '20 minutes ago.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      unread: true,
    },
    {
      id: 'n3',
      title: 'You have a new message from Cate!',
      time: '35 minutes ago.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      unread: false,
    },
    {
      id: 'n4',
      title: 'Stefan Jones has reached out to you!',
      time: '01 days ago.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      unread: false,
    },
    {
      id: 'n5',
      title: 'Need to approve',
      time: '1 days ago.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      unread: false,
    },
  ]);

  // Notifications Page State
  const [allNotificationsTab, setAllNotificationsTab] = useState<'unread' | 'read'>('unread');
  const [notificationSearch, setNotificationSearch] = useState<string>('');
  const [fullNotifications, setFullNotifications] = useState([
    {
      id: 'fn-1',
      title: 'Blocker Detected in Sprint Planning',
      description: 'Backend integration issues may delay the onboarding release.',
      category: 'Critical Blocker',
      time: 'Just now',
      unread: true,
    },
    {
      id: 'fn-2',
      title: 'Task Overdue',
      description: '"Finalize UI design for onboarding flow" is overdue.',
      category: 'Critical Blocker',
      time: 'Today, 11:20 AM',
      unread: true,
    },
    {
      id: 'fn-3',
      title: 'Timeline Risk Identified',
      description: 'AI detected potential delays in the current sprint timeline.',
      category: 'Critical Blocker',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 'fn-4',
      title: 'New Task Assigned',
      description: "You've been assigned: \"Prepare client presentation deck.\"",
      category: 'Critical Blocker',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 'fn-5',
      title: 'Recurring Issue Detected',
      description: '"User onboarding confusion" has been discussed in multiple meetings.',
      category: 'Critical Blocker',
      time: '20 minutes ago',
      unread: true,
    },
    {
      id: 'fn-6',
      title: 'Upcoming Meeting',
      description: '"Weekly Product Sync" starts in 15 minutes.',
      category: 'Critical Blocker',
      time: '2 days ago',
      unread: false,
    },
    {
      id: 'fn-7',
      title: 'New Task Assigned',
      description: "You've been assigned: \"Prepare client presentation deck.\"",
      category: 'Critical Blocker',
      time: '1 hour ago',
      unread: false,
    },
    {
      id: 'fn-8',
      title: 'Recurring Issue Detected',
      description: '"User onboarding confusion" has been discussed in multiple meetings.',
      category: 'Critical Blocker',
      time: '20 minutes ago',
      unread: false,
    },
    {
      id: 'fn-9',
      title: 'Recurring Issue Detected',
      description: '"User onboarding confusion" has been discussed in multiple meetings.',
      category: 'Critical Blocker',
      time: '20 minutes ago',
      unread: false,
    },
  ]);

  // New message modal / state
  const [newMsgText, setNewMsgText] = useState<string>('');
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);
  const [showMsgModal, setShowMsgModal] = useState<boolean>(false);

  // Upload modal / state
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedDocType, setSelectedDocType] = useState<string>('6 Months Official Bank Statement');
  const [docNameInput, setDocNameInput] = useState<string>('');
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [selectedFileObj, setSelectedFileObj] = useState<{ name: string; size: string; dataUrl?: string } | null>(null);

  // Camera capture modal & preview states
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [cameraTargetDocType, setCameraTargetDocType] = useState<string>('Government Issued ID (NIN/Passport)');
  const [cameraTargetDocName, setCameraTargetDocName] = useState<string>('');
  const [previewDocModal, setPreviewDocModal] = useState<Document | null>(null);

  // Pre-submission preview modal state (for previewing before submission)
  const [preSubmissionDoc, setPreSubmissionDoc] = useState<PreSubmissionDocument | null>(null);
  const [isPreSubmissionSubmitting, setIsPreSubmissionSubmitting] = useState<boolean>(false);

  // Link reference code state
  const [linkRefInput, setLinkRefInput] = useState<string>('');
  const [linkingRef, setLinkingRef] = useState<boolean>(false);
  const [linkRefMsg, setLinkRefMsg] = useState<string | null>(null);

  // Profile edit state
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileFullName, setProfileFullName] = useState<string>(currentUser.full_name || user.full_name || '');
  const [profilePhone, setProfilePhone] = useState<string>(currentUser.phone || user.phone || '');
  const [profileMethod, setProfileMethod] = useState<string>(currentUser.preferred_contact_method || user.preferred_contact_method || 'Email');
  const [profileAddress, setProfileAddress] = useState<string>(currentUser.address || user.address || '');
  const [profileDob, setProfileDob] = useState<string>(currentUser.dob || user.dob || '1992-04-18');
  const [profileCity, setProfileCity] = useState<string>(currentUser.city || user.city || 'Ikeja');
  const [profileState, setProfileState] = useState<string>(currentUser.state || user.state || 'Lagos State');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Notification Preferences State
  const [notifPrefEmail, setNotifPrefEmail] = useState<boolean>(true);
  const [notifPrefSms, setNotifPrefSms] = useState<boolean>(true);
  const [notifPrefWhatsapp, setNotifPrefWhatsapp] = useState<boolean>(true);

  // Security & 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(true);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  // Danger Zone Modals
  const [showDeactivateModal, setShowDeactivateModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');
  const [privacyConsentOpen, setPrivacyConsentOpen] = useState<boolean>(false);
  const [marketingConsent, setMarketingConsent] = useState<boolean>(true);
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(true);

  // Fetch user's applications
  const fetchMyApps = async () => {
    setLoading(true);
    try {
      const res = await api.getMyApplications();
      setMyApplications(res.applications);
      if (res.applications.length > 0) {
        if (!selectedAppId || !res.applications.some(a => a.id === selectedAppId)) {
          setSelectedAppId(res.applications[0].id);
        }
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  // Fetch full details of selected application
  const fetchDetail = async (appId: string) => {
    try {
      const res = await api.getApplicationDetail(appId);
      setAppDetail(res.application);
      setTimelineEvents(res.timeline || []);
      setDocuments(res.documents || []);
      setDocRequirements(res.document_requirements || []);
      setMessages(res.messages || []);
    } catch (err) {
      console.error('Failed to load application details', err);
    }
  };

  useEffect(() => {
    fetchMyApps();
  }, []);

  useEffect(() => {
    if (selectedAppId) {
      fetchDetail(selectedAppId);
    }
  }, [selectedAppId]);

  // Copy reference code to clipboard
  const handleCopyRef = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // 6-stage application progress tracker as shown in screenshot:
  // 1. Application Received (Checkmark / Date)
  // 2. Assessment (Search icon / In Progress)
  // 3. Processing (Gear icon)
  // 4. Documents Required (File icon)
  // 5. Lender Review (Bank / Building icon)
  // 6. Decision (Trophy / Award icon)
  const getStageIndex = (status?: ApplicationStatus): number => {
    if (!status) return 1; // Default to Assessment
    switch (status) {
      case 'UNDER_REVIEW':
        return 1; // Application Received completed, Assessment active
      case 'INITIAL_ASSESSMENT':
        return 1; // Assessment active
      case 'PROCESSING':
      case 'LENDER_MATCHED':
        return 2; // Processing active
      case 'DOCUMENTS_REQUIRED':
        return 3; // Documents Required active
      case 'SUBMITTED_TO_LENDER':
      case 'LENDER_REVIEW':
        return 4; // Lender Review active
      case 'APPROVED':
      case 'DECLINED':
        return 5; // Decision
      default:
        return 1;
    }
  };

  const currentStageIndex = getStageIndex(appDetail?.status);

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim() || !selectedAppId) return;

    setSendingMsg(true);
    try {
      const res = await api.sendMessage(selectedAppId, newMsgText.trim());
      setMessages((prev) => [...prev, res.message]);
      setNewMsgText('');
      setSendingMsg(false);
      setShowMsgModal(false);
    } catch (err) {
      setSendingMsg(false);
    }
  };

  // Open camera scanner with custom type/name
  const handleOpenDeviceCamera = (type?: string, name?: string) => {
    setCameraTargetDocType(type || selectedDocType || 'Government Issued ID (NIN/Passport)');
    setCameraTargetDocName(name || '');
    setShowCameraModal(true);
    setShowUploadModal(false);
  };

  // Handle completed camera capture
  const handleCaptureComplete = async (captured: CapturedDocumentData) => {
    if (!selectedAppId) return;

    setUploadingDoc(true);
    try {
      await api.uploadDocument(selectedAppId, {
        document_type: captured.document_type,
        name: captured.name,
        file_data: captured.file_data,
        file_size: captured.file_size
      });
      setUploadingDoc(false);
      setUploadSuccessMsg('Document successfully scanned and uploaded!');
      fetchDetail(selectedAppId);
      setTimeout(() => {
        setUploadSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to upload captured document:', err);
      setUploadingDoc(false);
    }
  };

  // Open pre-submission preview modal
  const handleOpenPreSubmissionPreview = (customDoc?: { name: string; size: string; dataUrl?: string }) => {
    const targetObj = customDoc || selectedFileObj;
    const docName = docNameInput.trim() || targetObj?.name || `${selectedDocType}.jpg`;
    const dataUrl = targetObj?.dataUrl || '/samples/demo_document.pdf';
    const fileSize = targetObj?.size || '1.4 MB';

    setPreSubmissionDoc({
      name: docName,
      category: selectedDocType,
      fileSize: fileSize,
      dataUrl: dataUrl
    });
  };

  // Confirm and submit document directly from pre-submission preview modal
  const handleConfirmPreSubmissionSubmit = async () => {
    if (!selectedAppId || !preSubmissionDoc) return;

    setIsPreSubmissionSubmitting(true);
    try {
      await api.uploadDocument(selectedAppId, {
        document_type: preSubmissionDoc.category,
        name: preSubmissionDoc.name,
        file_data: preSubmissionDoc.dataUrl,
        file_size: preSubmissionDoc.fileSize
      });
      setIsPreSubmissionSubmitting(false);
      setPreSubmissionDoc(null);
      setUploadSuccessMsg('Document successfully verified and submitted!');
      setDocNameInput('');
      setSelectedFileObj(null);
      fetchDetail(selectedAppId);
      setShowUploadModal(false);
      setTimeout(() => {
        setUploadSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      console.error('Pre-submission upload failed:', err);
      setIsPreSubmissionSubmitting(false);
    }
  };

  // Upload document handler
  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !docNameInput.trim()) return;

    setUploadingDoc(true);
    setUploadSuccessMsg(null);

    try {
      await api.uploadDocument(selectedAppId, {
        document_type: selectedDocType,
        name: docNameInput.trim(),
        file_data: selectedFileObj?.dataUrl || '/samples/demo_document.pdf',
        file_size: selectedFileObj?.size || '1.4 MB'
      });
      setUploadingDoc(false);
      setUploadSuccessMsg('Document successfully uploaded!');
      setDocNameInput('');
      setSelectedFileObj(null);
      fetchDetail(selectedAppId);
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccessMsg(null);
      }, 1200);
    } catch (err) {
      setUploadingDoc(false);
    }
  };

  // Link reference handler
  const handleLinkReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkRefInput.trim()) return;

    setLinkingRef(true);
    setLinkRefMsg(null);

    try {
      const res = await api.login({
        email: user.email,
        pending_reference_number: linkRefInput.trim()
      });
      setLinkingRef(false);
      setLinkRefMsg(res.message || 'Reference code linked successfully!');
      setLinkRefInput('');
      fetchMyApps();
    } catch (err: any) {
      setLinkingRef(false);
      setLinkRefMsg(err.message || 'Could not link reference code. Please verify.');
    }
  };

  // Save profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg(null);

    try {
      const res = await api.updateProfile({
        full_name: profileFullName,
        phone: profilePhone,
        preferred_contact_method: profileMethod,
        address: profileAddress,
        dob: profileDob,
        city: profileCity,
        state: profileState
      });
      setCurrentUser(res.user);
      setIsEditingProfile(false);
      setSavingProfile(false);
      setProfileSuccessMsg('Profile updated successfully!');
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    } catch (err) {
      setSavingProfile(false);
    }
  };

  // User first name & full display name
  const userFullName = currentUser.full_name || user.full_name || 'John Doe';
  const userFirstName = userFullName.split(' ')[0] || 'John';

  const requestedAmount = appDetail?.requested_amount || 2000000;
  const refNumber = appDetail?.reference_number || 'AKO-104582';
  const appliedDate = appDetail?.created_at ? new Date(appDetail.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'May 12, 2025';

  const requiredCount = docRequirements.filter(d => d.status === 'OUTSTANDING').length || 2;
  const uploadedCount = documents.length || 2;
  const pendingCount = docRequirements.filter(d => d.status === 'IN_REVIEW').length || 1;

  // Unread messages count
  const unreadMsgCount = 2;

  // Navigation Items exactly matching screenshot layout:
  // Overview (with home icon)
  // My Application
  // Documents
  // Keep Tab
  // Messages (with badge 3)
  // Profile
  // Log Out
  const navItems: { id: TabType; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'application', label: 'My Application', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'keeptab', label: 'Keep Tab', icon: History },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#0B0B0F] flex flex-col md:flex-row font-sans antialiased">
      
      {/* ================= LEFT SIDEBAR (Desktop) ================= */}
      <aside className="hidden md:flex md:w-64 md:h-screen md:sticky md:top-0 bg-white border-r border-slate-200/80 shrink-0 flex-col justify-between p-6 z-20 overflow-y-auto">
        <div className="flex flex-col">
          {/* Brand Logo */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2.5 cursor-pointer text-left"
            >
              <BrandLogo size={32} showText={true} textClassName="text-lg font-black text-[#0B0B0F]" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-[12px] text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#EEF4FF] text-[#2D62FF] font-semibold'
                      : 'text-[#475467] hover:bg-slate-50 hover:text-[#0B0B0F]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#2D62FF] fill-[#2D62FF]/10' : 'text-[#667085]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="w-5 h-5 rounded-full bg-[#2D62FF] text-white text-xs font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Divider between Profile and Log Out */}
            <div className="pt-2 pb-1">
              <hr className="border-t border-slate-100" />
            </div>

            {/* Log Out */}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-[12px] text-sm font-medium text-[#475467] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5 text-[#667085]" />
              <span>Log Out</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* ================= MOBILE DRAWER (Slide-out on mobile) ================= */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileNavOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-6 overflow-y-auto">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <BrandLogo size={28} showText={true} textClassName="text-base font-black text-[#0B0B0F]" />
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileNavOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-[12px] text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#EEF4FF] text-[#2D62FF] font-semibold'
                          : 'text-[#475467] hover:bg-slate-50 hover:text-[#0B0B0F]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#2D62FF]' : 'text-[#667085]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="w-5 h-5 rounded-full bg-[#2D62FF] text-white text-xs font-bold flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="pt-2 pb-1">
                  <hr className="border-t border-slate-100" />
                </div>

                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-[12px] text-sm font-medium text-[#475467] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5 text-[#667085]" />
                  <span>Log Out</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* ================= RIGHT MAIN WRAPPER ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ================= TOP BAR ================= */}
        <header className="h-16 sm:h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4 shrink-0 sticky top-0 z-30">
          
          {/* Mobile Left: Hamburger + Logo */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-6 h-6" />
            </button>
            <BrandLogo size={26} showText={true} textClassName="text-base font-bold text-[#0B0B0F]" />
          </div>

          {/* Desktop Left / Spacer */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-[#0B0B0F] font-bold">Customer Portal</span>
            <span>/</span>
            <span className="text-[#2D62FF] capitalize">{activeTab}</span>
          </div>

          {/* Right Controls: Notifications + Profile */}
          <div className="flex items-center gap-3 sm:gap-6">
          {/* Notification Bell & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                if (userMenuOpen) setUserMenuOpen(false);
              }}
              className={`relative p-2 sm:p-2.5 rounded-full hover:bg-slate-100 text-[#5A5F71] transition-colors cursor-pointer ${
                notificationOpen ? 'bg-slate-100 text-[#2D62FF]' : ''
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationsList.filter(n => n.unread).length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#2D62FF] text-white text-[10px] font-bold flex items-center justify-center">
                  {notificationsList.filter(n => n.unread).length}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu (matching reference image) */}
            {notificationOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-[360px] bg-white rounded-[22px] border border-slate-100 shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-5 z-50 animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base sm:text-lg font-bold text-[#101828]">Notifications</h3>
                  {notificationsList.some(n => n.unread) && (
                    <button
                      onClick={() => setNotificationsList(prev => prev.map(n => ({ ...n, unread: false })))}
                      className="text-[11px] font-medium text-[#2D62FF] hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="py-2 divide-y divide-slate-100/80">
                  {notificationsList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setNotificationsList(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
                      }}
                      className="py-3 flex items-start gap-3.5 hover:bg-slate-50/70 p-2 rounded-[14px] transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-100">
                        <img
                          src={item.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#101828] leading-snug">
                          {item.title}
                        </p>
                        <span className="text-[11px] text-[#98A2B3] mt-0.5 block">
                          {item.time}
                        </span>
                      </div>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-[#2D62FF] shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      setNotificationOpen(false);
                    }}
                    className="text-xs font-semibold text-[#475467] hover:text-[#2D62FF] transition-colors cursor-pointer block w-full text-center"
                  >
                    Show all notification
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-1.5 rounded-[12px] hover:bg-slate-50 cursor-pointer transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#E2E8F0] overflow-hidden border border-slate-200 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt={userFullName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-[#8F95A5] leading-tight">Welcome back,</p>
                <p className="text-sm font-bold text-[#0B0B0F] leading-tight">{userFullName}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-[#8F95A5]" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-[12px] border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-[#0B0B0F]">{userFullName}</p>
                  <p className="text-[11px] text-[#8F95A5] truncate">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => { setActiveTab('profile'); setUserMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-[#5A5F71] hover:bg-slate-50 hover:text-[#0B0B0F] flex items-center gap-2 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Profile Settings</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
          </div>
        </header>

        {/* Mobile Horizontal Quick Tab Bar */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2.5 bg-white border-b border-slate-200/80 scrollbar-none sticky top-16 z-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#2D62FF] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= MAIN DASHBOARD BODY ================= */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1300px] w-full mx-auto space-y-6 sm:space-y-8">
          
          {/* ================= TAB 1: OVERVIEW (EXACT PIXEL REPLICA OF SCREENSHOT) ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8 animate-fadeIn">
              
              {/* Top Welcome Title & Ref Number Block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-[28px] font-black text-[#0B0B0F] tracking-tight flex items-center gap-2">
                    <span>Welcome back, {userFirstName}!</span>
                    <span className="text-xl sm:text-2xl">👋</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5A5F71] mt-1 font-medium">
                    Here's what's happening with your application.
                  </p>
                </div>

                {/* Top-Right Application Reference Pill */}
                <div className="bg-white rounded-[14px] border border-slate-200/90 shadow-xs p-3 sm:p-4 flex items-center justify-between gap-4 sm:gap-6 w-full sm:w-auto min-w-[220px]">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#8F95A5] block">
                      Application Reference
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#2D62FF] font-mono tracking-tight block">
                      {refNumber}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-[#8F95A5] block mt-0.5">
                      Applied on {appliedDate}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyRef(refNumber)}
                    className="p-2 text-[#8F95A5] hover:text-[#2D62FF] hover:bg-blue-50 rounded-[8px] transition-colors cursor-pointer"
                    title="Copy Reference"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 4 Summary Metric Cards (Horizontal Row) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                
                {/* 1. Amount Requested */}
                <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs p-4 sm:p-5 flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] bg-[#EEF4FF] text-[#2D62FF] flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#8F95A5]">Amount Requested</span>
                    <h3 className="text-lg sm:text-xl font-black text-[#0B0B0F] mt-0.5 tracking-tight">
                      ₦{requestedAmount.toLocaleString()}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#5A5F71] mt-0.5">{amountInWords(requestedAmount)}</p>
                  </div>
                </div>

                {/* 2. Current Status */}
                <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs p-4 sm:p-5 flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] bg-[#EEF4FF] text-[#2D62FF] flex items-center justify-center shrink-0">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#8F95A5]">Current Status</span>
                    <h3 className="text-lg sm:text-xl font-black text-[#2D62FF] mt-0.5 tracking-tight">
                      Under Review
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#5A5F71] mt-0.5">Your application is being assessed</p>
                  </div>
                </div>

                {/* 3. Next Step */}
                <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs p-4 sm:p-5 flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] bg-[#EEFBF4] text-[#12B76A] flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#8F95A5]">Next Step</span>
                    <h3 className="text-lg sm:text-xl font-black text-[#0B0B0F] mt-0.5 tracking-tight">
                      Upload documents
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#5A5F71] mt-0.5 leading-snug">
                      Upload your last 3 months' bank statements
                    </p>
                  </div>
                </div>

                {/* 4. Expected Update */}
                <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs p-4 sm:p-5 flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] bg-[#F4F1FD] text-[#7F56D9] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#8F95A5]">Expected Update</span>
                    <h3 className="text-lg sm:text-xl font-black text-[#0B0B0F] mt-0.5 tracking-tight">
                      2 - 3 Business Days
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#5A5F71] mt-0.5 leading-snug">
                      We'll notify you via email and dashboard
                    </p>
                  </div>
                </div>

              </div>

              {/* ================= APPLICATION PROGRESS TRACKER ================= */}
              {/* Application Received → Assessment → Processing → Documents Required → Lender Review → Decision */}
              <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <h3 className="text-sm sm:text-base font-black text-[#0B0B0F]">Application Progress</h3>

                <div className="relative pt-2 pb-2 overflow-x-auto scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0">
                  <div className="grid grid-cols-6 min-w-[580px] sm:min-w-0 gap-x-2 items-center relative z-10">
                    
                    {/* Stage 1: Application Received (Completed) */}
                    <div className="flex flex-col items-center text-center relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#2D62FF] text-white flex items-center justify-center shadow-md">
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-[#0B0B0F] mt-2 sm:mt-3 leading-tight">Application<br />Received</span>
                      <span className="text-[10px] sm:text-[11px] text-[#8F95A5] mt-0.5 sm:mt-1">{appliedDate}</span>
                    </div>

                    {/* Stage 2: Assessment (Active / In Progress) */}
                    <div className="flex flex-col items-center text-center relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#2D62FF] text-white flex items-center justify-center shadow-md shadow-[#2D62FF]/20 ring-3 sm:ring-4 ring-blue-100">
                        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-[#0B0B0F] mt-2 sm:mt-3 leading-tight">Assessment</span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#2D62FF] mt-0.5 sm:mt-1">In Progress</span>
                    </div>

                    {/* Stage 3: Processing (Pending) */}
                    <div className="flex flex-col items-center text-center relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F4F6FA] text-[#8F95A5] border border-slate-200/80 flex items-center justify-center">
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-medium text-[#5A5F71] mt-2 sm:mt-3 leading-tight">Processing</span>
                    </div>

                    {/* Stage 4: Documents Required (Pending) */}
                    <div className="flex flex-col items-center text-center relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F4F6FA] text-[#8F95A5] border border-slate-200/80 flex items-center justify-center">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-medium text-[#5A5F71] mt-2 sm:mt-3 leading-tight">Documents<br />Required</span>
                    </div>

                    {/* Stage 5: Lender Review (Pending) */}
                    <div className="flex flex-col items-center text-center relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F4F6FA] text-[#8F95A5] border border-slate-200/80 flex items-center justify-center">
                        <Building className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-medium text-[#5A5F71] mt-2 sm:mt-3 leading-tight">Lender Review</span>
                    </div>

                    {/* Stage 6: Decision (Pending) */}
                    <div className="flex flex-col items-center text-center relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F4F6FA] text-[#8F95A5] border border-slate-200/80 flex items-center justify-center">
                        <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-medium text-[#5A5F71] mt-2 sm:mt-3 leading-tight">Decision</span>
                    </div>

                  </div>
                </div>
              </div>

              {/* ================= 3-COLUMN CARDS ROW (Keep Tab | Documents | Messages) ================= */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN 1: Keep Tab Timeline Card */}
                <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-black text-[#0B0B0F]">Keep Tab</h3>
                      <button
                        onClick={() => setActiveTab('keeptab')}
                        className="text-xs font-bold text-[#2D62FF] hover:underline cursor-pointer"
                      >
                        View all
                      </button>
                    </div>

                    {/* Timeline List */}
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-3 before:w-0.5 before:bg-blue-200">
                      
                      {/* Item 1 */}
                      <div className="relative">
                        <div className="absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#2D62FF] ring-4 ring-white" />
                        <span className="text-[11px] text-[#8F95A5] block">May 12, 2025 • 10:24 AM</span>
                        <h4 className="text-xs font-bold text-[#0B0B0F] mt-0.5">Application Submitted</h4>
                        <p className="text-xs text-[#5A5F71] mt-0.5">Your application has been received successfully.</p>
                      </div>

                      {/* Item 2 */}
                      <div className="relative">
                        <div className="absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#2D62FF] ring-4 ring-white" />
                        <span className="text-[11px] text-[#8F95A5] block">May 13, 2025 • 02:15 PM</span>
                        <h4 className="text-xs font-bold text-[#0B0B0F] mt-0.5">Initial Assessment Completed</h4>
                        <p className="text-xs text-[#5A5F71] mt-0.5">We are assessing the information you provided.</p>
                      </div>

                      {/* Item 3 */}
                      <div className="relative">
                        <div className="absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#2D62FF] ring-4 ring-white" />
                        <span className="text-[11px] text-[#8F95A5] block">May 14, 2025 • 09:40 AM</span>
                        <h4 className="text-xs font-bold text-[#0B0B0F] mt-0.5">Documents Requested</h4>
                        <p className="text-xs text-[#5A5F71] mt-0.5">Please upload the requested documents to proceed.</p>
                      </div>

                      {/* Item 4 (Pending) */}
                      <div className="relative">
                        <div className="absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                        <span className="text-[11px] text-[#8F95A5] block">—</span>
                        <h4 className="text-xs font-bold text-[#8F95A5] mt-0.5">Pending</h4>
                        <p className="text-xs text-[#8F95A5] mt-0.5">We will notify you once there is an update.</p>
                      </div>

                    </div>
                  </div>
                </div>

                {/* COLUMN 2: Documents Card */}
                <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-black text-[#0B0B0F]">Documents</h3>
                      <button
                        onClick={() => setActiveTab('documents')}
                        className="text-xs font-bold text-[#2D62FF] hover:underline cursor-pointer"
                      >
                        View all
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Required */}
                      <div className="p-3.5 rounded-[12px] bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-[10px] bg-[#EEF4FF] text-[#2D62FF] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#0B0B0F]">Required</h4>
                            <p className="text-[11px] text-[#8F95A5]">3 documents</p>
                          </div>
                        </div>
                        <span className="w-7 h-7 rounded-full bg-blue-50 text-[#2D62FF] text-xs font-bold flex items-center justify-center">
                          {requiredCount}
                        </span>
                      </div>

                      {/* Uploaded */}
                      <div className="p-3.5 rounded-[12px] bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-[10px] bg-[#EEFBF4] text-[#12B76A] flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#0B0B0F]">Uploaded</h4>
                            <p className="text-[11px] text-[#8F95A5]">2 documents</p>
                          </div>
                        </div>
                        <span className="w-7 h-7 rounded-full bg-emerald-50 text-[#12B76A] text-xs font-bold flex items-center justify-center">
                          {uploadedCount}
                        </span>
                      </div>

                      {/* Pending */}
                      <div className="p-3.5 rounded-[12px] bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-[10px] bg-[#FEF6EE] text-[#F79009] flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#0B0B0F]">Pending</h4>
                            <p className="text-[11px] text-[#8F95A5]">1 document</p>
                          </div>
                        </div>
                        <span className="w-7 h-7 rounded-full bg-amber-50 text-[#F79009] text-xs font-bold flex items-center justify-center">
                          {pendingCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Camera Scan & File Upload */}
                  <div className="mt-5 space-y-2">
                    <button
                      onClick={() => handleOpenDeviceCamera('6 Months Official Bank Statement')}
                      className="w-full py-2.5 px-4 rounded-[12px] bg-[#2D62FF] hover:bg-[#1a4edf] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-[#2D62FF]/20"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Scan with Camera</span>
                    </button>

                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="w-full py-2 px-4 rounded-[12px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                      <span>Upload File</span>
                    </button>
                  </div>
                </div>

                {/* COLUMN 3: Messages Card */}
                <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-black text-[#0B0B0F]">Messages</h3>
                      <button
                        onClick={() => setActiveTab('messages')}
                        className="text-xs font-bold text-[#2D62FF] hover:underline cursor-pointer"
                      >
                        View all
                      </button>
                    </div>

                    <div className="space-y-3">
                      
                      {/* Message 1 */}
                      <div
                        onClick={() => setActiveTab('messages')}
                        className="p-3 rounded-[12px] bg-[#F8FAFC] hover:bg-blue-50/50 border border-slate-200/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#2D62FF] text-white flex items-center justify-center text-[10px] font-black">
                              A
                            </div>
                            <span className="text-xs font-bold text-[#0B0B0F]">AkoFinanced It Team</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#8F95A5]">10:30 AM</span>
                            <span className="w-2 h-2 rounded-full bg-[#2D62FF]" />
                          </div>
                        </div>
                        <p className="text-xs text-[#5A5F71] mt-1.5 line-clamp-1">
                          We have reviewed your application and need a few more documents...
                        </p>
                      </div>

                      {/* Message 2 */}
                      <div
                        onClick={() => setActiveTab('messages')}
                        className="p-3 rounded-[12px] bg-[#F8FAFC] hover:bg-slate-100/70 border border-slate-200/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#E2E8F0] text-[#5A5F71] flex items-center justify-center text-[10px] font-bold">
                              <UserIcon className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-bold text-[#0B0B0F]">Customer Support</span>
                          </div>
                          <span className="text-[10px] text-[#8F95A5]">May 13</span>
                        </div>
                        <p className="text-xs text-[#5A5F71] mt-1.5 line-clamp-1">
                          Hello John, thank you for your application. We are here to help...
                        </p>
                      </div>

                      {/* Message 3 */}
                      <div
                        onClick={() => setActiveTab('messages')}
                        className="p-3 rounded-[12px] bg-[#F8FAFC] hover:bg-slate-100/70 border border-slate-200/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#E2E8F0] text-[#5A5F71] flex items-center justify-center text-[10px] font-bold">
                              <Building className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-bold text-[#0B0B0F]">AkoFinanced It Team</span>
                          </div>
                          <span className="text-[10px] text-[#8F95A5]">May 12</span>
                        </div>
                        <p className="text-xs text-[#5A5F71] mt-1.5 line-clamp-1">
                          Welcome to AkoFinanced It! Your application has been received...
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* New Message Outlined Button */}
                  <div className="mt-5">
                    <button
                      onClick={() => setShowMsgModal(true)}
                      className="w-full py-3 px-4 rounded-[12px] bg-white border border-[#2D62FF] hover:bg-blue-50 text-[#2D62FF] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                    >
                      <Send className="w-4 h-4" />
                      <span>New Message</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* ================= BOTTOM NOTIFICATION BANNER (Complete the next step...) ================= */}
              {showBottomBanner && (
                <div className="rounded-[16px] bg-[#EEF4FF] border border-[#2D62FF]/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white text-[#2D62FF] border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#0B0B0F]">
                        Complete the next step to keep your application moving.
                      </h4>
                      <p className="text-xs text-[#5A5F71] mt-0.5">
                        Upload your last 3 months' bank statements to proceed.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="px-5 py-2.5 rounded-[12px] bg-[#2D62FF] hover:bg-[#1a4edf] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Now</span>
                    </button>
                    <button
                      onClick={() => setShowBottomBanner(false)}
                      className="p-2 text-[#8F95A5] hover:text-[#0B0B0F] cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================= TAB 2: MY APPLICATION ================= */}
          {activeTab === 'application' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* ================= APPLY FOR A NEW LOAN CARD ================= */}
              <div className="bg-white rounded-[12px] border border-slate-200/90 shadow-xs p-6 sm:p-7 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:border-blue-300/80">
                <div className="space-y-2.5 max-w-2xl relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#2D62FF] border border-blue-100/80">
                    <Sparkles className="w-3.5 h-3.5 text-[#2D62FF]" />
                    <span>Instant Loan Application</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#0B0B0F] tracking-tight">
                    Apply for a New Loan
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5A5F71] leading-relaxed">
                    Need additional capital for personal needs or business expansion? Access fast, flexible financing from ₦50,000 to ₦50,000,000 with monthly rates from 2.5% and rapid 24-hour approval.
                  </p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 text-xs text-[#5A5F71] font-medium">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      24-Hour Approval
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      1 - 36 Months Tenure
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Zero Hidden Fees
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto relative z-10">
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="px-6 py-3 rounded-[12px] bg-[#2D62FF] hover:bg-[#1a4edf] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Apply Now</span>
                  </button>
                </div>
              </div>

              {/* Multiple Applications Switcher dropdown */}
              {myApplications.length > 1 && (
                <div className="bg-white rounded-[12px] border border-slate-200/90 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2D62FF] animate-pulse" />
                    <span className="text-xs font-bold text-[#0B0B0F]">Switch Between Your Active Applications:</span>
                  </div>
                  <select
                    value={selectedAppId || ''}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="px-3.5 py-2 rounded-[10px] bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B0B0F] outline-none focus:border-[#2D62FF] transition-colors cursor-pointer"
                  >
                    {myApplications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.reference_number} — ₦{app.requested_amount.toLocaleString()} ({app.status.replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* My Application Details Card */}
              <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs p-6 lg:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#0B0B0F]">My Application Details</h2>
                    <p className="text-xs text-[#5A5F71] mt-0.5">Full financial specifications and declaration</p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-blue-50 text-[#2D62FF] border border-blue-200 text-xs font-bold">
                    Reference: {refNumber}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-4 rounded-[12px] bg-[#F8FAFC] border border-slate-200/80">
                    <span className="text-xs font-semibold text-[#8F95A5]">Amount Requested</span>
                    <p className="text-xl font-black text-[#2D62FF] mt-1">₦{requestedAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-[12px] bg-[#F8FAFC] border border-slate-200/80">
                    <span className="text-xs font-semibold text-[#8F95A5]">Financing Type</span>
                    <p className="text-sm font-bold text-[#0B0B0F] mt-1">{appDetail?.applicant_type === 'BUSINESS' ? 'Business Loan' : 'Individual Personal Loan'}</p>
                  </div>
                  <div className="p-4 rounded-[12px] bg-[#F8FAFC] border border-slate-200/80">
                    <span className="text-xs font-semibold text-[#8F95A5]">Submission Date</span>
                    <p className="text-sm font-bold text-[#0B0B0F] mt-1">{appliedDate}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-[#0B0B0F]">Applicant Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                      <span className="text-[#8F95A5] block">Full Name:</span>
                      <span className="font-bold text-[#0B0B0F] text-sm">
                        {appDetail?.applicant_info ? `${appDetail.applicant_info.first_name} ${appDetail.applicant_info.last_name}` : userFullName}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                      <span className="text-[#8F95A5] block">Email Address:</span>
                      <span className="font-bold text-[#0B0B0F] text-sm">
                        {appDetail?.applicant_info?.email || currentUser.email}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                      <span className="text-[#8F95A5] block">Phone Number:</span>
                      <span className="font-bold text-[#0B0B0F] text-sm">
                        {appDetail?.applicant_info?.phone || currentUser.phone || '+234 801 234 5678'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                      <span className="text-[#8F95A5] block">Applicant Category:</span>
                      <span className="font-bold text-[#0B0B0F] text-sm">
                        {appDetail?.applicant_type || 'Individual'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Loan Fields */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-[#0B0B0F]">Financing Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                      <span className="text-[#8F95A5] block">State Location:</span>
                      <span className="font-bold text-[#0B0B0F] text-sm">
                        {appDetail?.applicant_info?.state_location || 'Lagos State'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                      <span className="text-[#8F95A5] block">Financing Purpose:</span>
                      <span className="font-bold text-[#0B0B0F] text-sm">
                        {appDetail?.applicant_info?.financing_purpose || 'Personal / Working Capital'}
                      </span>
                    </div>

                    {appDetail?.applicant_type === 'INDIVIDUAL' || !appDetail ? (
                      <>
                        <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                          <span className="text-[#8F95A5] block">Employment Status:</span>
                          <span className="font-bold text-[#0B0B0F] text-sm">
                            {appDetail?.applicant_info?.employment_status || 'Salaried'}
                          </span>
                        </div>
                        {appDetail?.applicant_info?.employer_name && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                            <span className="text-[#8F95A5] block">Employer Name:</span>
                            <span className="font-bold text-[#0B0B0F] text-sm">
                              {appDetail.applicant_info.employer_name}
                            </span>
                          </div>
                        )}
                        <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                          <span className="text-[#8F95A5] block">Estimated Monthly Income:</span>
                          <span className="font-bold text-[#0B0B0F] text-sm">
                            {appDetail?.applicant_info?.monthly_income 
                              ? `₦${appDetail.applicant_info.monthly_income.toLocaleString()}` 
                              : '₦250,000'}
                          </span>
                        </div>
                        {appDetail?.applicant_info?.staff_id_or_job_role && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                            <span className="text-[#8F95A5] block">Job Role / Staff ID:</span>
                            <span className="font-semibold text-[#0B0B0F] text-sm">
                              {appDetail.applicant_info.staff_id_or_job_role}
                            </span>
                          </div>
                        )}
                        {appDetail?.applicant_info?.loan_tenor && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                            <span className="text-[#8F95A5] block">Repayment Tenor:</span>
                            <span className="font-bold text-[#2D62FF] text-sm">
                              {appDetail.applicant_info.loan_tenor}
                            </span>
                          </div>
                        )}
                        {appDetail?.applicant_info?.salary_bank_name && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                            <span className="text-[#8F95A5] block">Salary Bank:</span>
                            <span className="font-bold text-[#0B0B0F] text-sm">
                              {appDetail.applicant_info.salary_bank_name} ({appDetail.applicant_info.salary_account_number || 'NUBAN'})
                            </span>
                          </div>
                        )}
                        {appDetail?.applicant_info?.nearest_landmark && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60 sm:col-span-2">
                            <span className="text-[#8F95A5] block">Nearest Landmark:</span>
                            <span className="font-medium text-[#0B0B0F] text-xs">
                              {appDetail.applicant_info.nearest_landmark}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {appDetail?.applicant_info?.business_name && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                            <span className="text-[#8F95A5] block">Business Name:</span>
                            <span className="font-bold text-[#0B0B0F] text-sm">
                              {appDetail.applicant_info.business_name}
                            </span>
                          </div>
                        )}
                        {appDetail?.applicant_info?.cac_number && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                            <span className="text-[#8F95A5] block">CAC Registration Number:</span>
                            <span className="font-bold text-[#0B0B0F] text-sm">
                              {appDetail.applicant_info.cac_number}
                            </span>
                          </div>
                        )}
                        <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                          <span className="text-[#8F95A5] block">Estimated Monthly Revenue:</span>
                          <span className="font-bold text-[#0B0B0F] text-sm">
                            {appDetail?.applicant_info?.monthly_revenue 
                              ? `₦${appDetail.applicant_info.monthly_revenue.toLocaleString()}` 
                              : '₦1,200,000'}
                          </span>
                        </div>
                        {appDetail?.applicant_info?.nature_of_business && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60 sm:col-span-2">
                            <span className="text-[#8F95A5] block">Nature of Business:</span>
                            <span className="font-semibold text-[#0B0B0F] text-xs sm:text-sm">
                              {appDetail.applicant_info.nature_of_business}
                            </span>
                          </div>
                        )}
                        {appDetail?.applicant_info?.business_period_years && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                            <span className="text-[#8F95A5] block">Business Period:</span>
                            <span className="font-bold text-[#0B0B0F] text-sm">
                              {appDetail.applicant_info.business_period_years} Years in Operation
                            </span>
                          </div>
                        )}
                        {appDetail?.applicant_info?.premises_status && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                            <span className="text-[#8F95A5] block">Premises Status:</span>
                            <span className="font-bold text-[#0B0B0F] text-sm">
                              {appDetail.applicant_info.premises_status}
                            </span>
                          </div>
                        )}
                        {appDetail?.applicant_info?.business_address && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60 sm:col-span-2">
                            <span className="text-[#8F95A5] block">Business Address:</span>
                            <span className="font-medium text-[#0B0B0F] text-xs">
                              {appDetail.applicant_info.business_address}
                            </span>
                          </div>
                        )}
                        {appDetail?.applicant_info?.commercial_bank && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                            <span className="text-[#8F95A5] block">Commercial Bank:</span>
                            <span className="font-bold text-[#0B0B0F] text-sm">
                              {appDetail.applicant_info.commercial_bank}
                            </span>
                          </div>
                        )}
                        {appDetail?.applicant_info?.account_number && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                            <span className="text-[#8F95A5] block">Operating Account:</span>
                            <span className="font-mono font-bold text-[#0B0B0F] text-sm">
                              {appDetail.applicant_info.account_number} ({appDetail.applicant_info.account_name || 'Verified'})
                            </span>
                          </div>
                        )}
                        {appDetail?.applicant_info?.guarantor_nin && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                            <span className="text-[#8F95A5] block">Guarantor's NIN:</span>
                            <span className="font-mono font-bold text-[#0B0B0F] text-sm">
                              {appDetail.applicant_info.guarantor_nin}
                            </span>
                          </div>
                        )}
                        {appDetail?.applicant_info?.next_of_kin_name && (
                          <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/60">
                            <span className="text-[#8F95A5] block">Next of Kin:</span>
                            <span className="font-bold text-[#0B0B0F] text-sm">
                              {appDetail.applicant_info.next_of_kin_name} ({appDetail.applicant_info.next_of_kin_relationship || 'Contact'})
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= TAB 3: DOCUMENTS ================= */}
          {activeTab === 'documents' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Top Card */}
              <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-xl font-black text-[#0B0B0F]">Documents Center</h2>
                    <p className="text-xs text-[#5A5F71] mt-0.5">
                      Upload and manage verification records required for your application loan assessment
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleOpenDeviceCamera()}
                      className="px-4 py-2.5 rounded-[12px] bg-[#2D62FF] hover:bg-[#1a4edf] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-[#2D62FF]/20 transition-all hover:scale-[1.02]"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Scan with Camera</span>
                    </button>

                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="px-4 py-2.5 rounded-[12px] bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload File</span>
                    </button>
                  </div>
                </div>

                {/* Device Camera Scanner Highlight Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white relative overflow-hidden shadow-md">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Smart Optical Capture</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        Scan ID & Bank Statements Directly with Your Device Camera
                      </h3>
                      <p className="text-xs text-blue-100 leading-relaxed">
                        Use your smartphone or webcam with automatic edge guidance, anti-glare filters, and encrypted 256-bit submission directly into your underwriting file.
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenDeviceCamera()}
                      className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-black flex items-center gap-2 shrink-0 cursor-pointer shadow-lg transition-transform active:scale-95"
                    >
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>Open Camera Scanner</span>
                    </button>
                  </div>
                </div>

                {/* Required Verification Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#0B0B0F]">Required Verification Documents</h3>
                    <span className="text-xs text-slate-500 font-medium">Auto-synced with loan officer requirements</span>
                  </div>

                  <div className="space-y-3">
                    {/* Item 1: Bank Statement */}
                    <div className="p-4 rounded-[12px] bg-slate-50/80 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-[10px] bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#0B0B0F]">6 Months Official Bank Statement</h4>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              Action Required
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5A5F71] mt-0.5">
                            Official stamped bank statement showing your recent turnover and cashflow.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenDeviceCamera('6 Months Official Bank Statement', 'Bank_Statement_Scan.jpg')}
                          className="px-3 py-1.5 rounded-[10px] bg-blue-50 hover:bg-blue-100 text-[#2D62FF] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Scan</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDocType('6 Months Official Bank Statement');
                            setShowUploadModal(true);
                          }}
                          className="px-3 py-1.5 rounded-[10px] bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload</span>
                        </button>
                      </div>
                    </div>

                    {/* Item 2: Government ID */}
                    <div className="p-4 rounded-[12px] bg-slate-50/80 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-[10px] bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#0B0B0F]">Government Issued ID (NIN / Passport / Driver's License)</h4>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              ID Ready
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5A5F71] mt-0.5">
                            Valid government identification with clear photograph and full legal name.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenDeviceCamera('Government Issued ID (NIN/Passport)', 'Government_ID_Scan.jpg')}
                          className="px-3 py-1.5 rounded-[10px] bg-blue-50 hover:bg-blue-100 text-[#2D62FF] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Scan</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDocType('Government Issued ID');
                            setShowUploadModal(true);
                          }}
                          className="px-3 py-1.5 rounded-[10px] bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload</span>
                        </button>
                      </div>
                    </div>

                    {/* Item 3: Utility Bill */}
                    <div className="p-4 rounded-[12px] bg-slate-50/80 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-[10px] bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#0B0B0F]">Proof of Address (Recent Utility Bill)</h4>
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                              Optional
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5A5F71] mt-0.5">
                            Electricity (IKEDC/EKEDC), water, or waste management bill dated within last 3 months.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenDeviceCamera('Utility Bill / Proof of Address', 'Utility_Bill_Scan.jpg')}
                          className="px-3 py-1.5 rounded-[10px] bg-blue-50 hover:bg-blue-100 text-[#2D62FF] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Scan</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDocType('Utility Bill / Proof of Address');
                            setShowUploadModal(true);
                          }}
                          className="px-3 py-1.5 rounded-[10px] bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents Repository */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#0B0B0F]">Uploaded Document Repository</h3>
                      <p className="text-xs text-slate-500">
                        {documents.length} document{documents.length === 1 ? '' : 's'} recorded on this application
                      </p>
                    </div>
                    {documents.length > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Synced with Underwriting
                      </span>
                    )}
                  </div>

                  {documents && documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.map((doc) => {
                        const isCapturedImage = doc.file_data?.startsWith('data:image') || doc.file_data?.includes('.jpg') || doc.file_data?.includes('.png');
                        return (
                          <div
                            key={doc.id}
                            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-xs flex flex-col justify-between gap-3 group"
                          >
                            <div className="flex items-start gap-3">
                              {isCapturedImage ? (
                                <div
                                  onClick={() => setPreviewDocModal(doc)}
                                  className="w-14 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200 cursor-pointer relative group/thumb"
                                >
                                  <img
                                    src={doc.file_data}
                                    alt={doc.name}
                                    className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <Eye className="w-4 h-4" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                  <FileText className="w-6 h-6" />
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-[#0B0B0F] truncate">{doc.name}</h4>
                                </div>
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                  {doc.document_type}
                                </span>
                                <div className="flex items-center gap-2 text-[11px] text-[#8F95A5] mt-1">
                                  <span>{doc.file_size || '1.2 MB'}</span>
                                  <span>•</span>
                                  <span>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Just now'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  doc.status === 'VERIFIED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : doc.status === 'REJECTED'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {doc.status || 'VERIFIED'}
                              </span>

                              <div className="flex items-center gap-2">
                                {isCapturedImage && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewDocModal(doc)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Preview</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleOpenDeviceCamera(doc.document_type, doc.name)}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Rescan with Camera"
                                >
                                  <Camera className="w-3 h-3" />
                                  <span>Rescan</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-3 bg-slate-50/50">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">No documents captured or uploaded yet</h4>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          Take a photo using your device camera or upload PDF/JPG files to complete your loan verification.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-3 pt-1">
                        <button
                          onClick={() => handleOpenDeviceCamera()}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Scan with Camera</span>
                        </button>
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: KEEP TAB ================= */}
          {activeTab === 'keeptab' && (
            <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs p-6 lg:p-8 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-[#0B0B0F]">Keep Tab — Live Timeline</h2>
                  <p className="text-xs text-[#5A5F71] mt-0.5">Real-time chronology of all stages and verification updates</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-[#5A5F71]">Live Tracking Active</span>
                </div>
              </div>

              {/* Full Timeline */}
              <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-3 before:w-0.5 before:bg-blue-200">
                <div className="relative">
                  <div className="absolute -left-[37px] top-1 w-3.5 h-3.5 rounded-full bg-[#2D62FF] ring-4 ring-white" />
                  <span className="text-xs font-bold text-[#2D62FF] block">May 14, 2025 • 09:40 AM</span>
                  <h4 className="text-sm font-black text-[#0B0B0F] mt-0.5">Documents Requested</h4>
                  <p className="text-xs text-[#5A5F71] mt-1 max-w-xl">
                    Underwriting team requested latest 3 months official bank statement to complete institutional ratios.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[37px] top-1 w-3.5 h-3.5 rounded-full bg-[#2D62FF] ring-4 ring-white" />
                  <span className="text-xs font-bold text-[#2D62FF] block">May 13, 2025 • 02:15 PM</span>
                  <h4 className="text-sm font-black text-[#0B0B0F] mt-0.5">Initial Assessment Completed</h4>
                  <p className="text-xs text-[#5A5F71] mt-1 max-w-xl">
                    Loan officer Chioma Okeke evaluated initial debt service ratios and categorized profile.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[37px] top-1 w-3.5 h-3.5 rounded-full bg-[#2D62FF] ring-4 ring-white" />
                  <span className="text-xs font-bold text-[#2D62FF] block">May 12, 2025 • 10:24 AM</span>
                  <h4 className="text-sm font-black text-[#0B0B0F] mt-0.5">Application Submitted</h4>
                  <p className="text-xs text-[#5A5F71] mt-1 max-w-xl">
                    Application reference #{refNumber} successfully registered into our institutional intake system.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: MESSAGES ================= */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-xs p-6 lg:p-8 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-[#0B0B0F]">Messages & Advisor Support</h2>
                  <p className="text-xs text-[#5A5F71] mt-0.5">Direct chat with your assigned loan officer</p>
                </div>
                <button
                  onClick={() => setShowMsgModal(true)}
                  className="px-4 py-2 rounded-[12px] bg-[#2D62FF] hover:bg-[#1a4edf] text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </div>

              {/* Chat Thread */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                <div className="p-4 rounded-[12px] bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B0B0F]">AkoFinanced It Team (Chioma Okeke)</span>
                    <span className="text-[10px] text-[#8F95A5]">May 14 • 10:30 AM</span>
                  </div>
                  <p className="text-xs text-[#5A5F71] mt-1 leading-relaxed">
                    Hello {userFirstName}, we reviewed your preliminary loan application. Please upload your latest official PDF bank statements so we can finalize lender submission.
                  </p>
                </div>

                <div className="p-4 rounded-[12px] bg-blue-50/50 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D62FF]">Customer Support</span>
                    <span className="text-[10px] text-[#8F95A5]">May 13 • 03:00 PM</span>
                  </div>
                  <p className="text-xs text-[#5A5F71] mt-1 leading-relaxed">
                    Hello {userFirstName}, thank you for your application. We are here to help if you have any questions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: PROFILE ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-4xl animate-fadeIn pb-12">
              
              {/* 1. PROFILE HEADER */}
              <div className="bg-white rounded-[12px] border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2D62FF] to-[#1E40AF] text-white text-xl font-bold flex items-center justify-center shadow-xs border-2 border-white">
                      {userFullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-bold text-[#0B0B0F]">{userFullName}</h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Verified Account
                      </span>
                    </div>
                    <p className="text-xs text-[#5A5F71] mt-0.5">{currentUser.email}</p>
                    <p className="text-[11px] text-[#8F95A5] mt-0.5">Member since {new Date(currentUser.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* Profile Header without redundant button */}
              </div>

              {profileSuccessMsg && (
                <div className="p-4 rounded-[12px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {/* 2. PERSONAL INFORMATION */}
              <div className="bg-white rounded-[12px] border border-slate-200/80 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B0B0F]">Personal Information</h3>
                    <p className="text-xs text-[#5A5F71] mt-0.5">Your personal identity and contact location details</p>
                  </div>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="text-xs font-semibold text-[#2D62FF] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#0B0B0F] mb-1">Full Name</label>
                      <input
                        type="text"
                        disabled={!isEditingProfile}
                        value={profileFullName}
                        onChange={(e) => setProfileFullName(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-[12px] text-xs text-[#0B0B0F] border transition-all ${
                          isEditingProfile
                            ? 'bg-white border-slate-300 focus:border-[#2D62FF] outline-none ring-2 ring-blue-500/10'
                            : 'bg-slate-50 border-slate-200/80 text-[#5A5F71] cursor-default'
                        }`}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-[#0B0B0F] mb-1">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full px-3.5 py-2.5 rounded-[12px] bg-slate-100 border border-slate-200/80 text-xs text-[#8F95A5] cursor-not-allowed"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-[#0B0B0F] mb-1">Phone Number</label>
                      <input
                        type="text"
                        disabled={!isEditingProfile}
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-[12px] text-xs text-[#0B0B0F] border transition-all ${
                          isEditingProfile
                            ? 'bg-white border-slate-300 focus:border-[#2D62FF] outline-none ring-2 ring-blue-500/10'
                            : 'bg-slate-50 border-slate-200/80 text-[#5A5F71] cursor-default'
                        }`}
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs font-bold text-[#0B0B0F] mb-1">Date of Birth</label>
                      <input
                        type="date"
                        disabled={!isEditingProfile}
                        value={profileDob}
                        onChange={(e) => setProfileDob(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-[12px] text-xs text-[#0B0B0F] border transition-all ${
                          isEditingProfile
                            ? 'bg-white border-slate-300 focus:border-[#2D62FF] outline-none ring-2 ring-blue-500/10'
                            : 'bg-slate-50 border-slate-200/80 text-[#5A5F71] cursor-default'
                        }`}
                      />
                    </div>

                    {/* Residential Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#0B0B0F] mb-1">Residential Address</label>
                      <input
                        type="text"
                        disabled={!isEditingProfile}
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                        className={`w-full px-3.5 py-2.5 rounded-[12px] text-xs text-[#0B0B0F] border transition-all ${
                          isEditingProfile
                            ? 'bg-white border-slate-300 focus:border-[#2D62FF] outline-none ring-2 ring-blue-500/10'
                            : 'bg-slate-50 border-slate-200/80 text-[#5A5F71] cursor-default'
                        }`}
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-xs font-bold text-[#0B0B0F] mb-1">City</label>
                      <input
                        type="text"
                        disabled={!isEditingProfile}
                        value={profileCity}
                        onChange={(e) => setProfileCity(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-[12px] text-xs text-[#0B0B0F] border transition-all ${
                          isEditingProfile
                            ? 'bg-white border-slate-300 focus:border-[#2D62FF] outline-none ring-2 ring-blue-500/10'
                            : 'bg-slate-50 border-slate-200/80 text-[#5A5F71] cursor-default'
                        }`}
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-bold text-[#0B0B0F] mb-1">State</label>
                      <input
                        type="text"
                        disabled={!isEditingProfile}
                        value={profileState}
                        onChange={(e) => setProfileState(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-[12px] text-xs text-[#0B0B0F] border transition-all ${
                          isEditingProfile
                            ? 'bg-white border-slate-300 focus:border-[#2D62FF] outline-none ring-2 ring-blue-500/10'
                            : 'bg-slate-50 border-slate-200/80 text-[#5A5F71] cursor-default'
                        }`}
                      />
                    </div>
                  </div>

                  {isEditingProfile && (
                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 rounded-[12px] border border-slate-200 text-xs font-semibold text-[#5A5F71] hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-5 py-2 rounded-[12px] bg-[#2D62FF] hover:bg-[#1a4edf] text-white text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center gap-2"
                      >
                        {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* 3. PREFERRED CONTACT METHOD & NOTIFICATION PREFERENCES */}
              <div className="bg-white rounded-[12px] border border-slate-200/80 p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#0B0B0F]">Communication & Notification Preferences</h3>
                  <p className="text-xs text-[#5A5F71] mt-0.5">Control how and where you receive application updates and alerts</p>
                </div>

                {/* Preferred Contact Method */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#0B0B0F]">Preferred Contact Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'Email', label: 'Email', icon: Mail, desc: 'Receive in-depth updates via inbox' },
                      { id: 'Phone', label: 'Phone Call', icon: Smartphone, desc: 'Direct calls for urgent follow-ups' },
                      { id: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle, desc: 'Instant status alerts & messaging' },
                    ].map((method) => (
                      <div
                        key={method.id}
                        onClick={() => {
                          setProfileMethod(method.id);
                          api.updateProfile({ preferred_contact_method: method.id });
                        }}
                        className={`p-3.5 rounded-[12px] border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          profileMethod === method.id
                            ? 'bg-blue-50/50 border-[#2D62FF] ring-1 ring-[#2D62FF]'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <method.icon className={`w-4 h-4 ${profileMethod === method.id ? 'text-[#2D62FF]' : 'text-[#5A5F71]'}`} />
                            <span className="text-xs font-bold text-[#0B0B0F]">{method.label}</span>
                          </div>
                          {profileMethod === method.id && (
                            <span className="w-2 h-2 rounded-full bg-[#2D62FF]" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#8F95A5]">{method.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Channels Toggle */}
                <div className="pt-2 space-y-3">
                  <label className="block text-xs font-bold text-[#0B0B0F]">Active Notification Channels</label>
                  
                  <div className="divide-y divide-slate-100 rounded-[12px] border border-slate-200/80 bg-slate-50/50 p-1">
                    {/* Email */}
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-[#5A5F71]">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0B0B0F]">Email Notifications</p>
                          <p className="text-[11px] text-[#8F95A5]">Milestone progress, required documents, and approval notices</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifPrefEmail(!notifPrefEmail)}
                        className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          notifPrefEmail ? 'bg-[#2D62FF]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          notifPrefEmail ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* SMS */}
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-[#5A5F71]">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0B0B0F]">SMS Text Alerts</p>
                          <p className="text-[11px] text-[#8F95A5]">Instant SMS for critical security codes and verification alerts</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifPrefSms(!notifPrefSms)}
                        className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          notifPrefSms ? 'bg-[#2D62FF]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          notifPrefSms ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-[#5A5F71]">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0B0B0F]">WhatsApp Updates</p>
                          <p className="text-[11px] text-[#8F95A5]">Chat directly with your assigned loan officer</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifPrefWhatsapp(!notifPrefWhatsapp)}
                        className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          notifPrefWhatsapp ? 'bg-[#2D62FF]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          notifPrefWhatsapp ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. ACCOUNT & SECURITY */}
              <div className="bg-white rounded-[12px] border border-slate-200/80 p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#0B0B0F]">Account & Security</h3>
                  <p className="text-xs text-[#5A5F71] mt-0.5">Manage authentication credentials, 2-factor security, and active devices</p>
                </div>

                <div className="space-y-4">
                  {/* Verification Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0B0B0F]">Email Verified</p>
                          <p className="text-[11px] text-[#8F95A5]">{currentUser.email}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Verified
                      </span>
                    </div>

                    <div className="p-3.5 rounded-[12px] bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0B0B0F]">Phone Verified</p>
                          <p className="text-[11px] text-[#8F95A5]">{profilePhone || '+234 801 234 5678'}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Password & 2FA controls */}
                  <div className="divide-y divide-slate-100 rounded-[12px] border border-slate-200/80 bg-white">
                    {/* Change Password */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#5A5F71]">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#0B0B0F]">Account Password</h4>
                          <p className="text-[11px] text-[#8F95A5]">Last changed 3 months ago</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                        className="px-3.5 py-1.5 rounded-[10px] border border-slate-200 text-xs font-semibold text-[#0B0B0F] hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                      >
                        Change Password
                      </button>
                    </div>

                    {/* 2FA */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#5A5F71]">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#0B0B0F]">Two-Factor Authentication (2FA)</h4>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Enabled
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8F95A5]">Adds an extra layer of security on every login</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          twoFactorEnabled ? 'bg-[#2D62FF]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          twoFactorEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Active Sessions */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#5A5F71]">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#0B0B0F]">Active Sessions</h4>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          </div>
                          <p className="text-[11px] text-[#8F95A5]">Chrome on macOS • Lagos, Nigeria (Current)</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert('All other sessions terminated.')}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                      >
                        Log out other devices
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. PRIVACY & DATA */}
              <div className="bg-white rounded-[12px] border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#0B0B0F]">Privacy & Data Governance</h3>
                  <p className="text-xs text-[#5A5F71] mt-0.5">Control how your data is handled in accordance with NDPR & GDPR regulations</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href="#privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Redirecting to AkoFinanced It Official Privacy Policy.');
                    }}
                    className="p-3.5 rounded-[12px] border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-[#5A5F71]" />
                      <span className="text-xs font-bold text-[#0B0B0F]">Privacy Policy</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#8F95A5]" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      alert('Your data archive is being prepared. You will receive an encrypted download link via email.');
                    }}
                    className="p-3.5 rounded-[12px] border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="w-4 h-4 text-[#5A5F71]" />
                      <span className="text-xs font-bold text-[#0B0B0F]">Download My Data</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8F95A5]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrivacyConsentOpen(true)}
                    className="p-3.5 rounded-[12px] border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck2 className="w-4 h-4 text-[#5A5F71]" />
                      <span className="text-xs font-bold text-[#0B0B0F]">Manage Consent</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8F95A5]" />
                  </button>
                </div>

                {privacyConsentOpen && (
                  <div className="p-4 rounded-[12px] bg-slate-50 border border-slate-200/80 space-y-3 mt-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0B0B0F]">Consent Preferences</span>
                      <button
                        onClick={() => setPrivacyConsentOpen(false)}
                        className="text-[11px] text-[#5A5F71] hover:text-[#0B0B0F] cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                    <div className="space-y-2 text-xs">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-[#5A5F71]">Product Analytics & Improvement</span>
                        <input
                          type="checkbox"
                          checked={analyticsConsent}
                          onChange={(e) => setAnalyticsConsent(e.target.checked)}
                          className="rounded text-[#2D62FF]"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-[#5A5F71]">Marketing & Partner Newsletters</span>
                        <input
                          type="checkbox"
                          checked={marketingConsent}
                          onChange={(e) => setMarketingConsent(e.target.checked)}
                          className="rounded text-[#2D62FF]"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. DANGER ZONE */}
              <div className="bg-white rounded-[12px] border border-rose-200 p-6 shadow-xs space-y-4">
                <div className="border-b border-rose-100 pb-3 flex items-center gap-2 text-rose-700">
                  <AlertOctagon className="w-4 h-4" />
                  <div>
                    <h3 className="text-sm font-bold">Danger Zone</h3>
                    <p className="text-xs text-[#5A5F71] mt-0.5">Irreversible actions regarding your account ownership and profile</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-[12px] bg-rose-50/40 border border-rose-100">
                  <div>
                    <h4 className="text-xs font-bold text-[#0B0B0F]">Deactivate Account</h4>
                    <p className="text-[11px] text-[#5A5F71] mt-0.5">Temporarily disable your profile and pause all notifications.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmText('');
                      setShowDeactivateModal(true);
                    }}
                    className="px-4 py-2 rounded-[10px] border border-rose-300 text-rose-700 hover:bg-rose-100/60 text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Deactivate
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-[12px] bg-rose-50/40 border border-rose-100">
                  <div>
                    <h4 className="text-xs font-bold text-rose-700">Delete Account Permanently</h4>
                    <p className="text-[11px] text-[#5A5F71] mt-0.5">Permanently delete your profile and personal data. This cannot be undone.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmText('');
                      setShowDeleteModal(true);
                    }}
                    className="px-4 py-2 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Delete Account
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Change Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-[12px] border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#0B0B0F] flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#2D62FF]" />
                    Change Account Password
                  </h3>
                  <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {passwordChangeSuccess && (
                  <div className="p-3 rounded-[10px] bg-emerald-50 text-emerald-800 text-xs font-bold">
                    {passwordChangeSuccess}
                  </div>
                )}
                {passwordChangeError && (
                  <div className="p-3 rounded-[10px] bg-rose-50 text-rose-800 text-xs font-bold">
                    {passwordChangeError}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0B0B0F] mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-[10px] border border-slate-200 text-xs outline-none focus:border-[#2D62FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0B0B0F] mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-3 py-2 rounded-[10px] border border-slate-200 text-xs outline-none focus:border-[#2D62FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0B0B0F] mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3 py-2 rounded-[10px] border border-slate-200 text-xs outline-none focus:border-[#2D62FF]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 rounded-[10px] border border-slate-200 text-xs font-semibold text-[#5A5F71] hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!currentPasswordInput || !newPasswordInput) {
                        setPasswordChangeError('Please fill out all fields.');
                        return;
                      }
                      if (newPasswordInput !== confirmPasswordInput) {
                        setPasswordChangeError('New passwords do not match.');
                        return;
                      }
                      setPasswordChangeError(null);
                      setPasswordChangeSuccess('Password changed successfully!');
                      setTimeout(() => {
                        setShowPasswordModal(false);
                        setPasswordChangeSuccess(null);
                        setCurrentPasswordInput('');
                        setNewPasswordInput('');
                        setConfirmPasswordInput('');
                      }, 1500);
                    }}
                    className="px-4 py-2 rounded-[10px] bg-[#2D62FF] hover:bg-[#1a4edf] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Deactivate Modal */}
          {showDeactivateModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-[12px] border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3 text-amber-600 border-b border-slate-100 pb-3">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-[#0B0B0F]">Deactivate Account</h3>
                </div>
                <p className="text-xs text-[#5A5F71] leading-relaxed">
                  Are you sure you want to deactivate your account? Your applications will remain on hold and you won't receive marketing communications.
                </p>
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setShowDeactivateModal(false)}
                    className="px-4 py-2 rounded-[10px] border border-slate-200 text-xs font-semibold text-[#5A5F71] hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert('Account has been deactivated. Logging out.');
                      setShowDeactivateModal(false);
                      onLogout();
                    }}
                    className="px-4 py-2 rounded-[10px] bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Confirm Deactivation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Account Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-[12px] border border-rose-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3 text-rose-600 border-b border-slate-100 pb-3">
                  <AlertOctagon className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-rose-700">Delete Account Permanently</h3>
                </div>
                <p className="text-xs text-[#5A5F71] leading-relaxed">
                  This action is permanent and cannot be undone. To confirm, please type <strong className="text-[#0B0B0F]">DELETE</strong> below:
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-3 py-2 rounded-[10px] border border-slate-300 text-xs outline-none focus:border-rose-600"
                />
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded-[10px] border border-slate-200 text-xs font-semibold text-[#5A5F71] hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={confirmText !== 'DELETE'}
                    onClick={() => {
                      alert('Your account has been deleted. You will now be redirected.');
                      setShowDeleteModal(false);
                      onLogout();
                    }}
                    className="px-4 py-2 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer"
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 7: NOTIFICATIONS (Full Page) ================= */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold text-[#101828]">Notifications</h1>
                <div className="flex items-center gap-2.5">
                  <button
                    className="w-9 h-9 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 flex items-center justify-center transition-colors cursor-pointer border border-purple-100"
                    title="AI Insights"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border border-slate-200/60"
                    title="View Docs"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-[#F79009] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'J'}
                  </div>
                </div>
              </div>

              {/* Sub Navigation: Unread / Read */}
              <div className="flex items-center gap-6 border-b border-slate-100">
                <button
                  onClick={() => setAllNotificationsTab('unread')}
                  className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                    allNotificationsTab === 'unread'
                      ? 'text-[#6941C6] border-b-2 border-[#6941C6]'
                      : 'text-[#667085] hover:text-[#101828]'
                  }`}
                >
                  <span>Unread</span>
                  {fullNotifications.filter(n => n.unread).length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-[#6941C6] font-bold">
                      {fullNotifications.filter(n => n.unread).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setAllNotificationsTab('read')}
                  className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                    allNotificationsTab === 'read'
                      ? 'text-[#6941C6] border-b-2 border-[#6941C6]'
                      : 'text-[#667085] hover:text-[#101828]'
                  }`}
                >
                  <span>Read</span>
                </button>
              </div>

              {/* Search & Actions Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={notificationSearch}
                    onChange={(e) => setNotificationSearch(e.target.value)}
                    placeholder="Search for notification"
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs text-[#101828] placeholder-[#98A2B3] outline-none focus:border-[#6941C6] focus:bg-white transition-all"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/80 text-xs font-medium text-[#344054] bg-white cursor-pointer hover:bg-slate-50">
                    <span>Date and time</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#667085]" />
                  </div>
                  <button
                    onClick={() => {
                      setFullNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                      setNotificationsList(prev => prev.map(n => ({ ...n, unread: false })));
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-200/80 text-xs font-semibold text-[#344054] bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Mark all as read
                  </button>
                </div>
              </div>

              {/* Notification Items List */}
              <div className="divide-y divide-slate-100 pt-2">
                {fullNotifications
                  .filter(n => {
                    const matchesTab = allNotificationsTab === 'unread' ? n.unread : !n.unread;
                    const matchesSearch = notificationSearch.trim() === '' ||
                      n.title.toLowerCase().includes(notificationSearch.toLowerCase()) ||
                      n.description.toLowerCase().includes(notificationSearch.toLowerCase());
                    return matchesTab && matchesSearch;
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setFullNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: !n.unread } : n));
                      }}
                      className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 px-3 rounded-xl transition-colors cursor-pointer group"
                    >
                      {/* Left: Indicator + Title + Description */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="pt-1.5 shrink-0">
                          {item.unread ? (
                            <span className="block w-2 h-2 rounded-full bg-rose-500" />
                          ) : (
                            <span className="block w-2 h-2 rounded-full bg-transparent" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-[#101828] group-hover:text-[#6941C6] transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[#475467] mt-0.5 font-normal">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Right metadata: Tag + Time + Action */}
                      <div className="flex items-center gap-6 sm:gap-8 shrink-0 pl-5 sm:pl-0">
                        {/* Category Badge */}
                        <div className="flex items-center gap-1.5 text-xs font-medium text-[#344054]">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#344054] fill-black/5" />
                          <span>{item.category}</span>
                        </div>

                        {/* Timestamp */}
                        <span className="text-xs text-[#667085] min-w-[90px] text-left sm:text-right">
                          {item.time}
                        </span>

                        {/* Three dots action */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-1 text-[#98A2B3] hover:text-[#101828] cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                {fullNotifications.filter(n => allNotificationsTab === 'unread' ? n.unread : !n.unread).length === 0 && (
                  <div className="py-16 text-center text-slate-400 space-y-2">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No {allNotificationsTab} notifications</p>
                    <p className="text-xs text-slate-400">You're completely caught up!</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ================= UPLOAD DOCUMENT MODAL ================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#0B0B0F]">Upload Document</h3>
                <p className="text-xs text-[#5A5F71]">Add verification records to your loan file</p>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFileObj(null);
                }}
                className="p-1 text-[#8F95A5] hover:text-[#0B0B0F] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Switch to Camera Scanner */}
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-950">Have document physically with you?</h4>
                  <p className="text-[11px] text-blue-700">Scan instantly using your device camera</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenDeviceCamera(selectedDocType, docNameInput)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs transition-colors"
              >
                Use Camera
              </button>
            </div>

            {uploadSuccessMsg ? (
              <div className="p-4 rounded-[12px] bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-900">{uploadSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleUploadDoc} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B0B0F] mb-1">Document Type</label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] bg-slate-50 border border-slate-200 text-xs text-[#0B0B0F] outline-none focus:border-[#2D62FF]"
                  >
                    <option value="6 Months Official Bank Statement">6 Months Official Bank Statement</option>
                    <option value="Government Issued ID (NIN/Passport)">Government Issued ID (NIN/Passport)</option>
                    <option value="Utility Bill / Proof of Address">Utility Bill / Proof of Address</option>
                    <option value="CAC Certificate / Business Registration">CAC Certificate / Business Registration</option>
                    <option value="Salary Slip / Proof of Income">Salary Slip / Proof of Income</option>
                    <option value="Other Verification Document">Other Verification Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B0B0F] mb-1">Document File Name</label>
                  <input
                    type="text"
                    required
                    value={docNameInput}
                    onChange={(e) => setDocNameInput(e.target.value)}
                    placeholder="e.g. GTBank_Statement_Jan_Jun_2025.pdf"
                    className="w-full px-3.5 py-2.5 rounded-[12px] bg-slate-50 border border-slate-200 text-xs text-[#0B0B0F] outline-none focus:border-[#2D62FF]"
                  />
                </div>

                {/* File Dropzone & Pre-Submission Preview */}
                <div className="space-y-2.5">
                  <label className="block p-4 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-[14px] text-center bg-slate-50/50 hover:bg-blue-50/20 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
                        const reader = new FileReader();
                        reader.onload = () => {
                          const fileDataUrl = reader.result as string;
                          const fileObj = {
                            name: file.name,
                            size: `${sizeInMb} MB`,
                            dataUrl: fileDataUrl
                          };
                          setSelectedFileObj(fileObj);
                          if (!docNameInput) {
                            setDocNameInput(file.name);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <UploadCloud className="w-7 h-7 text-[#2D62FF] mx-auto mb-1.5" />
                    {selectedFileObj ? (
                      <div>
                        <p className="text-xs font-bold text-emerald-700 truncate max-w-[280px] mx-auto">
                          {selectedFileObj.name}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{selectedFileObj.size} • Click to select a different file</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-[#0B0B0F]">Click or drag PDF / image file here</p>
                        <p className="text-[11px] text-[#8F95A5] mt-0.5">Supports PDF, PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>

                  {/* Pre-Submission Preview Trigger Card */}
                  {selectedFileObj && (
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-3 animate-in fade-in">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {selectedFileObj.dataUrl?.startsWith('data:image') ? (
                          <img
                            src={selectedFileObj.dataUrl}
                            alt="Staged Preview"
                            className="w-10 h-10 rounded-lg object-cover border border-blue-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-blue-950 truncate max-w-[150px]">
                              {selectedFileObj.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-200/80 text-blue-800 text-[9px] font-bold shrink-0">
                              Staged
                            </span>
                          </div>
                          <p className="text-[11px] text-blue-700">Ready for visual preview inspection</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenPreSubmissionPreview()}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Preview</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={!selectedFileObj}
                    onClick={() => handleOpenPreSubmissionPreview()}
                    className="w-full py-2.5 rounded-[12px] bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>Preview First</span>
                  </button>

                  <button
                    type="submit"
                    disabled={uploadingDoc}
                    className="w-full py-2.5 rounded-[12px] bg-[#2D62FF] hover:bg-[#1a4edf] text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-[#2D62FF]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploadingDoc && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{uploadingDoc ? 'Uploading...' : 'Confirm & Upload'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= PRE-SUBMISSION DOCUMENT PREVIEW MODAL ================= */}
      <DocumentPreSubmissionModal
        isOpen={!!preSubmissionDoc}
        onClose={() => setPreSubmissionDoc(null)}
        document={preSubmissionDoc}
        onConfirmSubmit={handleConfirmPreSubmissionSubmit}
        onChangeFile={() => {
          setPreSubmissionDoc(null);
          setShowUploadModal(true);
        }}
        onOpenScanner={() => {
          setPreSubmissionDoc(null);
          handleOpenDeviceCamera(selectedDocType, docNameInput);
        }}
        isSubmitting={isPreSubmissionSubmitting}
      />

      {/* ================= SMART CAMERA DOCUMENT CAPTURE MODAL ================= */}
      <CameraDocumentCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCaptureComplete={handleCaptureComplete}
        initialDocumentType={cameraTargetDocType}
        initialDocumentName={cameraTargetDocName}
      />

      {/* ================= DOCUMENT PREVIEW LIGHTBOX MODAL ================= */}
      {previewDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="min-w-0 pr-4">
                <h3 className="text-sm font-bold text-white truncate">{previewDocModal.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {previewDocModal.document_type} • {previewDocModal.file_size || '1.2 MB'}
                </p>
              </div>
              <button
                onClick={() => setPreviewDocModal(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center flex-1 overflow-auto max-h-[65vh]">
              {previewDocModal.file_data?.startsWith('data:image') || previewDocModal.file_data?.includes('.jpg') || previewDocModal.file_data?.includes('.png') ? (
                <img
                  src={previewDocModal.file_data}
                  alt={previewDocModal.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="text-center text-slate-300 py-12 space-y-3">
                  <FileText className="w-16 h-16 mx-auto text-blue-400" />
                  <p className="text-sm font-medium text-white">{previewDocModal.name}</p>
                  <p className="text-xs text-slate-400">PDF document ready for underwriting review</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Uploaded: {new Date(previewDocModal.uploaded_at || Date.now()).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const docToRescan = previewDocModal;
                    setPreviewDocModal(null);
                    handleOpenDeviceCamera(docToRescan.document_type, docToRescan.name);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Rescan with Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDocModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= APPLY FOR A NEW LOAN MODAL ================= */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0B0B0F]">Apply for a New Loan</h3>
                <p className="text-xs text-[#5A5F71] mt-0.5">Select the loan product that fits your current financial requirements</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 text-[#8F95A5] hover:text-[#0B0B0F] cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Individual Loan */}
              <div
                onClick={() => {
                  setShowApplyModal(false);
                  if (onStartApplication) {
                    onStartApplication('INDIVIDUAL');
                  } else {
                    onNavigateHome();
                  }
                }}
                className="p-4 rounded-[12px] border-2 border-slate-200 hover:border-[#2D62FF] hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="w-10 h-10 rounded-[10px] bg-blue-50 text-[#2D62FF] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#0B0B0F] group-hover:text-[#2D62FF] transition-colors">
                    Individual Loan
                  </h4>
                  <p className="text-xs text-[#5A5F71] mt-1 leading-relaxed">
                    For salary earners, personal goals, medical bills, or emergency needs.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2D62FF]">
                  <span>Up to ₦5,000,000</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 2: Business Loan */}
              <div
                onClick={() => {
                  setShowApplyModal(false);
                  if (onStartApplication) {
                    onStartApplication('BUSINESS');
                  } else {
                    onNavigateHome();
                  }
                }}
                className="p-4 rounded-[12px] border-2 border-slate-200 hover:border-[#2D62FF] hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="w-10 h-10 rounded-[10px] bg-blue-50 text-[#2D62FF] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#0B0B0F] group-hover:text-[#2D62FF] transition-colors">
                    Business Loan
                  </h4>
                  <p className="text-xs text-[#5A5F71] mt-1 leading-relaxed">
                    For working capital, inventory, equipment, purchase orders, or expansion.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2D62FF]">
                  <span>Up to ₦50,000,000</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-[10px] border border-slate-200/80 flex items-center gap-2.5 text-xs text-[#5A5F71]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Applying will link directly to your verified profile for faster approval.</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW MESSAGE MODAL ================= */}
      {showMsgModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#0B0B0F]">Send Message to Loan Officer</h3>
              <button
                onClick={() => setShowMsgModal(false)}
                className="p-1 text-[#8F95A5] hover:text-[#0B0B0F] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1">Your Message</label>
                <textarea
                  required
                  rows={4}
                  value={newMsgText}
                  onChange={(e) => setNewMsgText(e.target.value)}
                  placeholder="Type your inquiry or message here..."
                  className="w-full p-3.5 rounded-[12px] bg-slate-50 border border-slate-200 text-xs text-[#0B0B0F] outline-none focus:border-[#2D62FF] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sendingMsg}
                className="w-full py-3 rounded-[12px] bg-[#2D62FF] hover:bg-[#1a4edf] text-white text-xs font-bold cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
              >
                {sendingMsg && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
