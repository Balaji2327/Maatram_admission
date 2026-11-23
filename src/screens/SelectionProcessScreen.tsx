"use client";

import { redirectAdmittedApplicant, useAdmissionHandoff } from "../lib/portal";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SignOutModal from "../components/SignOutModal";
import { applicationApi } from "../lib/api";
import {
  ArrowLeftOnRectangleIcon,
  CheckIcon,
  ArrowLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function SelectionProcessScreen() {
  useAdmissionHandoff();
  const router = useRouter();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [appNumber, setAppNumber] = useState("MF-2025-001");
  const [status, setStatus] = useState("submitted");
  const [directInterviewLocation, setDirectInterviewLocation] = useState("");
  const [stageStatus, setStageStatus] = useState("In Progress");
  const [rejectionStage, setRejectionStage] = useState(1);

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await applicationApi.getStatus();
        if (res.success && redirectAdmittedApplicant(res.data?.status || res.status)) return;
        const appNum = res.data?.applicationNumber || res.applicationNumber || "MF-2025-001";
        setAppNumber(appNum);
        setDirectInterviewLocation(res.data?.directInterviewLocation || res.directInterviewLocation || "");
        if (res.data?.status || res.status) setStatus(res.data?.status || res.status);
        if (res.data?.stageStatus || res.stageStatus) setStageStatus(res.data?.stageStatus || res.stageStatus);

        const rStage =
          res.data?.rejectionStage ||
          res.rejectionStage ||
          (typeof window !== "undefined"
            ? (window.localStorage.getItem(`maatram_application_rejection_stage_${appNum}`)
                ? parseInt(window.localStorage.getItem(`maatram_application_rejection_stage_${appNum}`)!, 10)
                : undefined) ||
              (window.localStorage.getItem("maatram_application_rejection_stage_latest")
                ? parseInt(window.localStorage.getItem("maatram_application_rejection_stage_latest")!, 10)
                : 1)
            : 1);
        setRejectionStage(rStage);
      } catch (err) {
        console.warn("Failed to load status:", err);
      }
    }
    loadStatus();
  }, []);

  const statusLevelMap: Record<string, number> = {
    draft: 0,
    submitted: 1,
    under_review: 1,
    telephonic_done: 2,
    televerification_done: 2,
    physical_verification_in_progress: 2,
    physical_verification_done: 3,
    home_visit_done: 3,
    video_interview_in_progress: 3,
    video_interview_done: 4,
    shortlisted: 4,
    direct_interview_in_progress: 4,
    direct_interview_done: 5,
    selected: 6,

    rejected: -1,
  };

  const currentLevel = statusLevelMap[status] ?? 1;

  const flowSteps = [
    {
      id: 1,
      title: "Application Applied & Received",
      desc: "Your complete application, family details, and academic marks have been registered in the Maatram Portal.",
      completed: currentLevel >= 1,
      isCurrentWaiting: currentLevel === 0,
      waitingText: "Complete application form and submit to initiate review",
    },
    {
      id: 2,
      title: "First Phase: Televerification",
      desc: "Telephonic verification conducted by assigned volunteer counselor to verify student academic interest, family circumstances, and contact details.",
      completed: currentLevel >= 2,
      isCurrentWaiting: currentLevel === 1,
      waitingText: "Telephonic verification in progress. Our assigned volunteer counselor will contact you over phone.",
    },
    {
      id: 3,
      title: "Second Phase: Physical Verification",
      desc: "In-person/home verification conducted by field verification team to inspect student residential and socioeconomic conditions.",
      completed: currentLevel >= 3,
      isCurrentWaiting: currentLevel === 2,
      waitingText: "Waiting for physical verification / field visit by Maatram verification team.",
    },
    {
      id: 4,
      title: "Third Phase: Video Call Interview",
      desc: "Virtual panel interaction and academic counseling conducted with the Maatram advisory committee.",
      completed: currentLevel >= 4,
      isCurrentWaiting: currentLevel === 3,
      waitingText: "Waiting for video call interview scheduling. Advisory panel will send the interview video link.",
    },
    {
      id: 5,
      title: "Fourth Phase: Direct Interview (Final Stage)",
      desc: "In-person direct panel interview with senior trustees, academic leaders, and corporate sponsors.",
      completed: currentLevel >= 5,
      isCurrentWaiting: currentLevel === 4,
      waitingText: directInterviewLocation ? `Direct interview location: ${directInterviewLocation}` : "Waiting for direct interview details.",
    },
    {
      id: 6,
      title: "Final Selection and Admission",
      desc: "Approved by Board of Trustees. Official 100% free higher education sponsorship admission letter granted (College tuition, hostel & books fully funded).",
      completed: currentLevel >= 6,
      isCurrentWaiting: currentLevel === 5,
      waitingText: "Waiting for final trustee committee approval & college seat allotment.",
    },
  ];

  let visibleSteps: Array<{
    id: number;
    title: string;
    desc: string;
    completed?: boolean;
    isCurrentWaiting?: boolean;
    waitingText?: string;
    isRejected?: boolean;
  }> = [];

  if (status === "rejected") {
    const reasonText = "Application not shortlisted based on verification criteria.";

    if (rejectionStage === 5) {
      // Case 5: Rejected during/after Fourth Phase (Direct Interview)
      visibleSteps = [
        {
          id: 1,
          title: "Application Applied & Received",
          desc: "Your complete application and academic marks were received and registered.",
          completed: true,
          isRejected: false,
        },
        {
          id: 2,
          title: "First Phase: Televerification - Completed",
          desc: "Telephonic verification successfully verified student eligibility and background.",
          completed: true,
          isRejected: false,
        },
        {
          id: 3,
          title: "Second Phase: Physical Verification - Completed",
          desc: "Physical and residential verification verified by field team.",
          completed: true,
          isRejected: false,
        },
        {
          id: 4,
          title: "Third Phase: Video Call Interview - Completed",
          desc: "Virtual interaction with advisory committee completed.",
          completed: true,
          isRejected: false,
        },
        {
          id: 5,
          title: "Fourth Phase: Direct Interview (Final Stage) - Not Shortlisted",
          desc: reasonText,
          completed: false,
          isRejected: true,
        },
      ];
    } else if (rejectionStage === 4) {
      // Case 4: Rejected during/after Third Phase (Video Call Interview)
      visibleSteps = [
        {
          id: 1,
          title: "Application Applied & Received",
          desc: "Your complete application and academic marks were received and registered.",
          completed: true,
          isRejected: false,
        },
        {
          id: 2,
          title: "First Phase: Televerification - Completed",
          desc: "Telephonic verification successfully verified student eligibility and background.",
          completed: true,
          isRejected: false,
        },
        {
          id: 3,
          title: "Second Phase: Physical Verification - Completed",
          desc: "Physical and residential verification verified by field team.",
          completed: true,
          isRejected: false,
        },
        {
          id: 4,
          title: "Third Phase: Video Call Interview - Not Shortlisted",
          desc: reasonText,
          completed: false,
          isRejected: true,
        },
      ];
    } else if (rejectionStage === 3) {
      // Case 3: Rejected during/after Second Phase (Physical Verification)
      visibleSteps = [
        {
          id: 1,
          title: "Application Applied & Received",
          desc: "Your complete application and academic marks were received and registered.",
          completed: true,
          isRejected: false,
        },
        {
          id: 2,
          title: "First Phase: Televerification - Completed",
          desc: "Telephonic verification successfully verified student eligibility and background.",
          completed: true,
          isRejected: false,
        },
        {
          id: 3,
          title: "Second Phase: Physical Verification - Not Shortlisted",
          desc: reasonText,
          completed: false,
          isRejected: true,
        },
      ];
    } else if (rejectionStage === 2) {
      // Case 2: Rejected during/after First Phase (Televerification)
      visibleSteps = [
        {
          id: 1,
          title: "Application Applied & Received",
          desc: "Your complete application and academic marks were received and registered.",
          completed: true,
          isRejected: false,
        },
        {
          id: 2,
          title: "First Phase: Televerification - Not Shortlisted",
          desc: reasonText,
          completed: false,
          isRejected: true,
        },
      ];
    } else {
      // Case 1: Rejected at initial application review
      visibleSteps = [
        {
          id: 1,
          title: "Application Submitted",
          desc: "Your complete application and academic marks were received and registered.",
          completed: true,
          isRejected: false,
        },
        {
          id: 2,
          title: "Application Not Shortlisted",
          desc: reasonText,
          completed: false,
          isRejected: true,
        },
      ];
    }
  } else {
    visibleSteps = flowSteps.filter((s) => s.completed || s.isCurrentWaiting);
  }

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-[#0F172A] font-primary selection:bg-[#F7BC0F] selection:text-black">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link href="/dashboard" className="flex items-center focus:outline-none">
              <Image
                src="/assets/images/logo.png"
                alt="Maatram Foundation"
                width={170}
                height={80}
                priority
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </Link>
            <div className="hidden md:block h-7 w-px bg-slate-200" />
            <div className="hidden md:flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xs text-slate-900 tracking-tight">
                  Student Application Portal
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-100/80 text-[10px] font-bold text-amber-900 border border-amber-300/60">
                  2025–26
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-primary">
                Transforming Lives Through Free Higher Education
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              href="/dashboard?tab=status"
              className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-slate-700 hover:text-slate-950 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowSignOutModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-slate-600 hover:text-red-600 px-3 py-2 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50/80 transition cursor-pointer"
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Process Content */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Admission Track 2025 - 2026
              </span>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 mt-2">
                Application Progress Tracker
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real-time step-by-step verification milestones for your application.
              </p>
            </div>
            <div className="flex flex-col sm:items-end bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs space-y-1 shrink-0">
              <span className="text-slate-500">Application Number:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{appNumber}</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {stageStatus || "In Progress"}
              </span>
            </div>
          </div>

          {/* Sequential Process Circles Flow */}
          <div className="mt-8 pt-4">
            {visibleSteps.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                Submit your application to start tracking your verification progress.
              </div>
            ) : (
              <div className="flex flex-col max-w-lg mx-auto sm:mx-4">
                {visibleSteps.map((step, idx) => {
                  const isLast = idx === visibleSteps.length - 1;

                  return (
                    <div key={step.id} className="flex items-start group">
                      <div className="flex flex-col items-center mr-4 sm:mr-5 shrink-0">
                        {step.isRejected ? (
                          <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-700/20 ring-4 ring-rose-50 transition-all duration-300">
                            <XMarkIcon className="w-6 h-6 stroke-[3]" />
                          </div>
                        ) : step.completed ? (
                          <div className="w-10 h-10 rounded-full bg-[#107c41] text-white flex items-center justify-center shadow-md shadow-emerald-700/20 ring-4 ring-emerald-50 transition-all duration-300">
                            <CheckIcon className="w-6 h-6 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white border-2 border-dashed border-slate-400 text-slate-500 flex items-center justify-center shadow-xs ring-4 ring-slate-100 animate-pulse">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          </div>
                        )}

                        {!isLast && (
                          <div
                            className={`w-[3.5px] min-h-[56px] sm:min-h-[64px] transition-all duration-300 ${
                              step.completed
                                ? "bg-[#107c41]"
                                : step.isRejected
                                  ? "bg-rose-300"
                                  : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>

                      <div className={`pb-7 pt-1 ${isLast ? "pb-2" : ""}`}>
                        {step.isRejected ? (
                          <div>
                            <h4 className="font-heading font-black text-sm sm:text-base text-rose-700 leading-snug">
                              {step.title}
                            </h4>
                            <p className="text-xs text-rose-600 mt-0.5 leading-relaxed font-medium">
                              {step.desc}
                            </p>
                          </div>
                        ) : step.completed ? (
                          <div>
                            <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 leading-snug">
                              {step.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                              {step.desc}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3 sm:p-3.5 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                              <h4 className="font-heading font-black text-xs sm:text-sm text-amber-950">
                                {step.waitingText}
                              </h4>
                            </div>
                            <p className="text-[11px] text-amber-900/80 leading-relaxed pl-4">
                              Next stage in progress. Once this process is completed by our counseling team, the verification circle will activate and progress automatically.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={() => {
          setShowSignOutModal(false);
          router.push("/");
        }}
      />
    </div>
  );
}
