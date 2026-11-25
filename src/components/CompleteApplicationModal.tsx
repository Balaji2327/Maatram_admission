"use client";

import React from "react";
import {
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface CompleteApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFillDetails: () => void;
  missingSection?: string;
}

export default function CompleteApplicationModal({
  isOpen,
  onClose,
  onFillDetails,
  missingSection,
}: CompleteApplicationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="bg-white rounded-xl border border-black/15 shadow-sm p-6 sm:p-7 max-w-sm sm:max-w-md w-full relative z-10 animate-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-black/65 hover:text-black rounded-full hover:bg-black/5 transition cursor-pointer"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-brand/15 border border-brand/60 rounded-lg flex items-center justify-center mx-auto text-black mb-4">
          <InformationCircleIcon className="w-7 h-7 stroke-[2]" />
        </div>

        <h3 className="font-heading font-bold text-xl sm:text-2xl text-black tracking-tight text-center">
          Complete Your Application
        </h3>
        <p className="font-primary text-xs sm:text-sm text-black mt-2 leading-relaxed text-center">
          Please fill in all mandatory application details before viewing
          documents, status, or profile information.
        </p>

        {missingSection && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-brand/15 border border-brand/60 rounded-md text-xs font-semibold text-black">
            <CheckCircleIcon className="w-4 h-4 shrink-0 text-black" />
            <span>Continue with the {missingSection} section.</span>
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-md text-xs sm:text-sm font-heading font-bold text-black bg-black/5 hover:bg-black/10 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onFillDetails}
            className="flex-1 py-3 px-4 rounded-md text-xs sm:text-sm font-heading font-bold text-black bg-brand hover:brightness-95 transition shadow-sm cursor-pointer"
          >
            Fill Details
          </button>
        </div>
      </div>
    </div>
  );
}
