import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const LEGAL_CONTENT = {
  terms: {
    title: 'Terms of Service',
    intro: 'These terms explain the basic rules for using the Rydon24 taxi platform.',
    points: [
      'Drivers and users must provide accurate account, contact, vehicle, and trip information.',
      'Platform access can be limited if an account submits false documents or violates safety rules.',
      'Ride, wallet, payout, and commission flows are governed by the active settings configured by the admin.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'This policy explains how account, location, ride, and document data is handled in the app.',
    points: [
      'We use phone, profile, vehicle, document, and location information to create accounts and operate rides.',
      'Live location is used for dispatch, tracking, safety, and support while the service is active.',
      'Uploaded KYC images are used for verification and admin review.',
    ],
  },
};

const getDocumentType = (pathname = '') => (pathname.toLowerCase().includes('privacy') ? 'privacy' : 'terms');

const LegalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const content = LEGAL_CONTENT[getDocumentType(location.pathname)];

  return (
    <div className="min-h-screen bg-white px-5 py-8 font-sans text-slate-900">
      <div className="mx-auto max-w-sm space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-900 active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>

        <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
            <FileText size={20} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Legal</p>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-tight">{content.title}</h1>
          <p className="mt-3 text-sm font-bold leading-relaxed text-slate-500">{content.intro}</p>
        </div>

        <div className="space-y-3">
          {content.points.map((point) => (
            <div key={point} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[13px] font-bold leading-relaxed text-slate-600">{point}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
          Last updated by admin CMS
        </p>
      </div>
    </div>
  );
};

export default LegalPage;
