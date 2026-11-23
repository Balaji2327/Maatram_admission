"use client";

import { redirectAdmittedApplicant, useAdmissionHandoff } from "../lib/portal";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SignOutModal from "../components/SignOutModal";
import CompleteApplicationModal from "../components/CompleteApplicationModal";
import StudentSidebar, { StudentNavTab } from "../components/StudentSidebar";
import { applicationApi, authApi, getAuthToken, getStoredUser } from "../lib/api";
import {
  UserIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  HomeModernIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  ArrowLeftOnRectangleIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  PhoneIcon,
  InformationCircleIcon,
  BuildingLibraryIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
  EyeIcon,
  PrinterIcon,
  PencilSquareIcon,
  XMarkIcon,
  XCircleIcon,
  VideoCameraIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  SparklesIcon,
  IdentificationIcon,
  CheckBadgeIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

export type ApplicationTabType =
  | "personal"
  | "family"
  | "siblings"
  | "address"
  | "educational"
  | "financial"
  | "background"
  | "documents";

function getDraftOwnerKey() {
  if (typeof window === "undefined") return "anonymous";
  try {
    const storedUser = getStoredUser();
    return (
      storedUser?.email ||
      storedUser?.id ||
      storedUser?.user_id ||
      storedUser?._id ||
      storedUser?.mobileNumber ||
      storedUser?.mobile_number ||
      "anonymous"
    );
  } catch {
    return "anonymous";
  }
}

export default function DashboardScreen() {
  useAdmissionHandoff();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ApplicationTabType>("personal");
  const hasLoadedDraft = useRef(false);
  const [studentNavTab, setStudentNavTab] = useState<StudentNavTab>("dashboard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingApplication, setIsLoadingApplication] = useState(true);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [missingApplicationField, setMissingApplicationField] = useState<string | null>(null);
  const [previewDocModal, setPreviewDocModal] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
  } | null>(null);

  // Authentication Guard: Ensure user has signed in with credentials
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/?loginRequired=true");
    }
    // Support URL tab selection e.g. /dashboard?tab=status
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "status" || tabParam === "profile") {
        setStudentNavTab(tabParam as StudentNavTab);
      }
    }
  }, [router]);

  // Initial state empty with comprehensive fields covering Sections A to H
  const [formData, setFormData] = useState({
    applicationNumber: "",

    // A. Personal Information
    fullName: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    mobileNumber: "",
    whatsappNumber: "",
    altMobileNumber: "",
    email: "",
    aadhaarNumber: "",
    community: "",
    nationality: "Indian",

    // B. Family Information
    fatherName: "",
    fatherOccupation: "",
    fatherMonthlyIncome: "",
    fatherEmploymentStatus: "",
    motherName: "",
    motherOccupation: "",
    motherMonthlyIncome: "",
    motherEmploymentStatus: "",
    annualIncome: "",
    familyMembersCount: "",
    familyType: "Nuclear",
    familySituation: "Both parents",
    guardianName: "",
    guardianOccupation: "",
    guardianMonthlyIncome: "",
    guardianRelation: "",

    // C. Siblings Information
    siblingCount: "",
    siblingsStudyingCount: "",

    // D. Address Information
    permanentAddress: "",
    currentAddress: "",
    sameAsPermanent: true,
    address: "",
    villageTown: "",
    district: "",
    state: "Tamil Nadu",
    pincode: "",
    residenceType: "Own",
    rentAmount: "",

    // E. Educational Information
    tenthSchool: "",
    tenthBoard: "State Board",
    tenthYear: "",
    tenthTotalMarks: "",
    tenthPercentage: "",
    tenthSchoolAddress: "",

    eleventhSchool: "",
    eleventhBoard: "State Board",
    eleventhYear: "",
    eleventhStream: "",
    eleventhTotalMarks: "",

    twelfthSchool: "",
    twelfthBoard: "State Board",
    twelfthYear: "",
    twelfthStream: "",
    twelfthTotalMarks: "",
    twelfthCutoff: "",
    twelfthPercentage: "",
    twelfthSchoolAddress: "",
    mediumOfInstruction: "Tamil",
    firstGraduate: "Yes",
    preferredDegree: "",
    preferredBranch: "",
    secondBranch: "",
    preferredCollegeLocation: "",
    hostelRequired: "Yes",
    careerGoal: "",

    // F. Financial Information
    monthlyFamilyIncome: "",
    incomeSources: "",
    familyDebts: "",
    educationLoans: "",
    financialDifficulties: "",
    whyNeedSupport: "",
    affordabilityWithoutSupport: "Cannot afford at all",

    // G. Personal and Background Information
    orphan: "No",
    singleParent: "No",
    firstGenerationLearner: "Yes",
    specialCircumstances: "",
    careerAmbition: "",
    higherEducationReason: "",
    willingToRelocateTN: "Yes",
    futureGoals: "",

    // H. Document Uploads
    studentPhoto: "",
    document10thMarksheet: "",
    document11thMarksheet: "",
    document12thMarksheet: "",
    documentCommunityCertificate: "",
    documentIncomeCertificate: "",
    documentAadhaarCard: "",
    documentParentIdProof: "",

    // Declaration
    declarationAgreed: false,
  });

  const requiredApplicationFields = [
    "fullName",
    "dob",
    "gender",
    "bloodGroup",
    "mobileNumber",
    "whatsappNumber",
    "email",
    "community",
    "fatherName",
    "fatherOccupation",
    "fatherMonthlyIncome",
    "fatherEmploymentStatus",
    "motherName",
    "motherOccupation",
    "motherMonthlyIncome",
    "motherEmploymentStatus",
    "annualIncome",
    "familyMembersCount",
    "siblingCount",
    "siblingsStudyingCount",
    "permanentAddress",
    "villageTown",
    "district",
    "pincode",
    "tenthSchool",
    "tenthBoard",
    "tenthYear",
    "tenthTotalMarks",
    "eleventhSchool",
    "eleventhBoard",
    "eleventhYear",
    "eleventhStream",
    "eleventhTotalMarks",
    "tenthPercentage",
    "twelfthSchool",
    "twelfthBoard",
    "twelfthYear",
    "twelfthStream",
    "twelfthTotalMarks",
    "twelfthPercentage",
    "preferredDegree",
    "preferredBranch",
    "secondBranch",
    "preferredCollegeLocation",
    "monthlyFamilyIncome",
    "incomeSources",
    "familyDebts",
    "educationLoans",
    "affordabilityWithoutSupport",
    "financialDifficulties",
    "whyNeedSupport",
    "careerAmbition",
    "higherEducationReason",
    "futureGoals",
    "specialCircumstances",
  ] as const;

  const applicationFieldTabs: Record<string, ApplicationTabType> = {
    fullName: "personal",
    dob: "personal",
    gender: "personal",
    bloodGroup: "personal",
    mobileNumber: "personal",
    whatsappNumber: "personal",
    email: "personal",
    community: "personal",
    fatherName: "family",
    fatherOccupation: "family",
    fatherMonthlyIncome: "family",
    fatherEmploymentStatus: "family",
    motherName: "family",
    motherOccupation: "family",
    motherMonthlyIncome: "family",
    motherEmploymentStatus: "family",
    annualIncome: "family",
    familyMembersCount: "family",
    siblingCount: "siblings",
    siblingsStudyingCount: "siblings",
    permanentAddress: "address",
    currentAddress: "address",
    rentAmount: "address",
    villageTown: "address",
    district: "address",
    pincode: "address",
    tenthSchool: "educational",
    tenthBoard: "educational",
    tenthYear: "educational",
    tenthTotalMarks: "educational",
    eleventhSchool: "educational",
    eleventhBoard: "educational",
    eleventhYear: "educational",
    eleventhStream: "educational",
    eleventhTotalMarks: "educational",
    tenthPercentage: "educational",
    twelfthSchool: "educational",
    twelfthBoard: "educational",
    twelfthYear: "educational",
    twelfthStream: "educational",
    twelfthTotalMarks: "educational",
    twelfthPercentage: "educational",
    twelfthCutoff: "educational",
    preferredDegree: "educational",
    preferredBranch: "educational",
    secondBranch: "educational",
    preferredCollegeLocation: "educational",
    monthlyFamilyIncome: "financial",
    incomeSources: "financial",
    familyDebts: "financial",
    educationLoans: "financial",
    affordabilityWithoutSupport: "financial",
    financialDifficulties: "financial",
    whyNeedSupport: "financial",
    careerAmbition: "background",
    higherEducationReason: "background",
    futureGoals: "background",
    specialCircumstances: "background",
    studentPhoto: "documents",
    document10thMarksheet: "documents",
    document12thMarksheet: "documents",
    declarationAgreed: "documents",
  };

  const getMissingApplicationField = () => {
    const missingField = requiredApplicationFields.find(
      (field) => !getCalculatedEducationValue(field).trim()
    );

    if (missingField) return missingField;

    if (!formData.sameAsPermanent && !formData.currentAddress.trim()) {
      return "currentAddress";
    }

    if (formData.residenceType === "Rented" && !formData.rentAmount.trim()) {
      return "rentAmount";
    }

    if (isCutoffDegree(formData.preferredDegree) && !formData.twelfthCutoff.trim()) {
      return "preferredDegree";
    }

    if (Number(formData.siblingCount) > 0) {
      const hasIncompleteSibling = siblings.some(
        (sibling) =>
          !sibling.name.trim() ||
          !sibling.relationship.trim() ||
          !sibling.age.trim() ||
          !sibling.education.trim() ||
          !sibling.institution.trim()
      );
      if (hasIncompleteSibling || siblings.length !== Number(formData.siblingCount)) {
        return "siblingCount";
      }
    }

    const hasIncompleteSubject = [...tenthSubjects, ...eleventhSubjects, ...twelfthSubjects].some(
      (subject) =>
        !subject.subjectName.trim() ||
        !subject.maxMarks.trim() ||
        !subject.marksObtained.trim()
    );
    if (hasIncompleteSubject) return "twelfthSchool";

    const requiredDocuments = [
      "studentPhoto",
      "document10thMarksheet",
      "document12thMarksheet",
      "documentAadhaarCard",
    ] as const;
    const missingDocument = requiredDocuments.find((field) => !formData[field]);
    if (missingDocument) return missingDocument;
    if (!formData.declarationAgreed) return "declarationAgreed";

    return null;
  };

  // Siblings list state
  const [siblings, setSiblings] = useState<Array<{
    id: string;
    name: string;
    relationship: string;
    age: string;
    education: string;
    institution: string;
  }>>([]);

  const handleAddSibling = () => {
    setSiblings((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        relationship: "",
        age: "",
        education: "",
        institution: "",
      },
    ]);
  };

  const handleRemoveSibling = (id: string) => {
    setSiblings((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSiblingChange = (id: string, field: string, value: string) => {
    setSiblings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // 11th Standard Subject-wise Marks State
  const [eleventhSubjects, setEleventhSubjects] = useState<Array<{
    id: string;
    subjectName: string;
    maxMarks: string;
    marksObtained: string;
  }>>([
    { id: "11-1", subjectName: "Language (Tamil / Hindi / Other)", maxMarks: "100", marksObtained: "" },
    { id: "11-2", subjectName: "English", maxMarks: "100", marksObtained: "" },
    { id: "11-3", subjectName: "", maxMarks: "100", marksObtained: "" },
    { id: "11-4", subjectName: "", maxMarks: "100", marksObtained: "" },
    { id: "11-5", subjectName: "", maxMarks: "100", marksObtained: "" },
    { id: "11-6", subjectName: "", maxMarks: "100", marksObtained: "" },
  ]);

  const handleAdd11thSubject = () => {
    setEleventhSubjects((prev) => [
      ...prev,
      { id: Date.now().toString(), subjectName: "", maxMarks: "100", marksObtained: "" },
    ]);
  };

  const handleRemove11thSubject = (id: string) => {
    setEleventhSubjects((prev) => {
      const nextSubjects = prev.filter((s) => s.id !== id);
      const total = nextSubjects.reduce((sum, subject) => sum + (parseFloat(subject.marksObtained) || 0), 0);
      setFormData((current) => ({ ...current, eleventhTotalMarks: total ? String(total) : "" }));
      return nextSubjects;
    });
  };

  const handle11thSubjectChange = (id: string, field: "subjectName" | "maxMarks" | "marksObtained", value: string) => {
    const normalizedValue = field === "marksObtained" || field === "maxMarks"
      ? value === "" ? "" : String(Math.min(100, Math.max(0, Number(value))))
      : value;
    setEleventhSubjects((prev) => {
      const nextSubjects = prev.map((s) => (s.id === id ? { ...s, [field]: normalizedValue } : s));
      const total = nextSubjects.reduce((sum, subject) => sum + (parseFloat(subject.marksObtained) || 0), 0);
      setFormData((current) => ({ ...current, eleventhTotalMarks: total ? String(total) : "" }));
      return nextSubjects;
    });
  };

  const calc11thTotal = () => {
    const total = eleventhSubjects.reduce((acc, curr) => acc + (parseFloat(curr.marksObtained) || 0), 0);
    const max = eleventhSubjects.reduce((acc, curr) => acc + (parseFloat(curr.maxMarks) || 0), 0);
    return { total, max };
  };

  const [tenthSubjects, setTenthSubjects] = useState<Array<{
    id: string;
    subjectName: string;
    maxMarks: string;
    marksObtained: string;
  }>>([
    { id: "10-1", subjectName: "", maxMarks: "100", marksObtained: "" },
    { id: "10-2", subjectName: "", maxMarks: "100", marksObtained: "" },
    { id: "10-3", subjectName: "", maxMarks: "100", marksObtained: "" },
    { id: "10-4", subjectName: "", maxMarks: "100", marksObtained: "" },
    { id: "10-5", subjectName: "", maxMarks: "100", marksObtained: "" },
  ]);

  const calcTenthTotal = () => ({
    total: tenthSubjects.reduce((sum, subject) => sum + (parseFloat(subject.marksObtained) || 0), 0),
    max: tenthSubjects.reduce((sum, subject) => sum + (parseFloat(subject.maxMarks) || 0), 0),
  });

  const handleTenthSubjectChange = (
    id: string,
    field: "subjectName" | "maxMarks" | "marksObtained",
    value: string
  ) => {
    const normalizedValue = field === "marksObtained" || field === "maxMarks"
      ? value === "" ? "" : String(Math.min(100, Math.max(0, Number(value))))
      : value;
    setTenthSubjects((prev) => prev.map((subject) => (
      subject.id === id ? { ...subject, [field]: normalizedValue } : subject
    )));
    if (field === "marksObtained" || field === "maxMarks") {
      const nextSubjects = tenthSubjects.map((subject) => (
        subject.id === id ? { ...subject, [field]: normalizedValue } : subject
      ));
      const total = nextSubjects.reduce((sum, subject) => sum + (parseFloat(subject.marksObtained) || 0), 0);
      const max = nextSubjects.reduce((sum, subject) => sum + (parseFloat(subject.maxMarks) || 0), 0);
      setFormData((prev) => ({
        ...prev,
        tenthTotalMarks: total ? String(total) : "",
        tenthPercentage: total && max ? ((total / max) * 100).toFixed(2) : "",
      }));
    }
  };

  const handleAddTenthSubject = () => {
    setTenthSubjects((prev) => [
      ...prev,
      { id: Date.now().toString(), subjectName: "", maxMarks: "100", marksObtained: "" },
    ]);
  };

  const handleRemoveTenthSubject = (id: string) => {
    setTenthSubjects((prev) => {
      const nextSubjects = prev.filter((subject) => subject.id !== id);
      const total = nextSubjects.reduce((sum, subject) => sum + (parseFloat(subject.marksObtained) || 0), 0);
      const max = nextSubjects.reduce((sum, subject) => sum + (parseFloat(subject.maxMarks) || 0), 0);
      setFormData((current) => ({
        ...current,
        tenthTotalMarks: total ? String(total) : "",
        tenthPercentage: total && max ? ((total / max) * 100).toFixed(2) : "",
      }));
      return nextSubjects;
    });
  };

  // 12th Standard Subject-wise Marks State
  const [twelfthSubjects, setTwelfthSubjects] = useState<Array<{
    id: string;
    subjectName: string;
    maxMarks: string;
    marksObtained: string;
  }>>([
    { id: "12-1", subjectName: "Language (Tamil / Hindi / Other)", maxMarks: "100", marksObtained: "" },
    { id: "12-2", subjectName: "English", maxMarks: "100", marksObtained: "" },
    { id: "12-3", subjectName: "", maxMarks: "100", marksObtained: "" },
    { id: "12-4", subjectName: "", maxMarks: "100", marksObtained: "" },
    { id: "12-5", subjectName: "", maxMarks: "100", marksObtained: "" },
    { id: "12-6", subjectName: "", maxMarks: "100", marksObtained: "" },
  ]);

  const handleAdd12thSubject = () => {
    setTwelfthSubjects((prev) => [
      ...prev,
      { id: Date.now().toString(), subjectName: "", maxMarks: "100", marksObtained: "" },
    ]);
  };

  const handleRemove12thSubject = (id: string) => {
    setTwelfthSubjects((prev) => {
      const nextSubjects = prev.filter((s) => s.id !== id);
      updateCalculatedEducation(nextSubjects);
      return nextSubjects;
    });
  };

  const handle12thSubjectChange = (id: string, field: "subjectName" | "maxMarks" | "marksObtained", value: string) => {
    const normalizedValue = field === "marksObtained" || field === "maxMarks"
      ? value === "" ? "" : String(Math.min(100, Math.max(0, Number(value))))
      : value;
    setTwelfthSubjects((prev) => {
      const nextSubjects = prev.map((s) => (s.id === id ? { ...s, [field]: normalizedValue } : s));
      updateCalculatedEducation(nextSubjects);
      return nextSubjects;
    });
  };

  const calc12thTotal = () => {
    const total = twelfthSubjects.reduce((acc, curr) => acc + (parseFloat(curr.marksObtained) || 0), 0);
    const max = twelfthSubjects.reduce((acc, curr) => acc + (parseFloat(curr.maxMarks) || 0), 0);
    return { total, max };
  };

  const getCalculatedEducationValue = (field: string) => {
    const tenth = calcTenthTotal();
    const eleventh = calc11thTotal();
    const twelfth = calc12thTotal();
    const calculatedValues: Record<string, string> = {
      tenthTotalMarks: tenth.total ? String(tenth.total) : "",
      tenthPercentage: tenth.total && tenth.max ? ((tenth.total / tenth.max) * 100).toFixed(2) : "",
      eleventhTotalMarks: eleventh.total ? String(eleventh.total) : "",
      twelfthTotalMarks: twelfth.total ? String(twelfth.total) : "",
      twelfthPercentage: twelfth.total && twelfth.max ? ((twelfth.total / twelfth.max) * 100).toFixed(2) : "",
    };
    if (field === "affordabilityWithoutSupport") {
      return String(formData.affordabilityWithoutSupport || "Cannot afford at all");
    }
    return calculatedValues[field] || String(formData[field as keyof typeof formData] ?? "");
  };

  const isCutoffDegree = (degree: string) =>
    degree.startsWith("Engineering") || degree.startsWith("Nursing");

  const getSubjectMarks = (subjects: typeof twelfthSubjects, patterns: (string | RegExp)[]) => {
    const subject = subjects.find((item) => {
      const name = item.subjectName.trim().toLowerCase();
      return patterns.some((p) => {
        if (typeof p === "string") {
          return name.includes(p.toLowerCase());
        }
        return p.test(name);
      });
    });
    if (!subject || !subject.marksObtained.trim()) return null;
    const obtained = parseFloat(subject.marksObtained);
    const max = parseFloat(subject.maxMarks) || 100;
    if (isNaN(obtained) || max <= 0) return null;
    // Normalize to out of 100 in case maxMarks is e.g. 200, 50, etc.
    return (obtained / max) * 100;
  };

  const calculateEngineeringCutoff = (subjects: typeof twelfthSubjects) => {
    // Matches math, maths, mathematics, mathemetics, business maths, etc.
    const mathematics = getSubjectMarks(subjects, [/math/i]);
    const physics = getSubjectMarks(subjects, [/phys/i]);
    const chemistry = getSubjectMarks(subjects, [/chem/i]);
    if (mathematics === null || physics === null || chemistry === null) return "";
    return (mathematics + physics / 2 + chemistry / 2).toFixed(2);
  };

  const isComputerScienceStudent = (subjects: typeof twelfthSubjects, streamName = formData.twelfthStream) => {
    // Check if stream is explicitly CS or Computer Science without Biology
    const streamIsCS = /computer|cs\b/i.test(streamName);
    const hasCS = subjects.some((item) => /computer|cs\b/i.test(item.subjectName));
    const hasBio = subjects.some((item) => /bio|botan|zool/i.test(item.subjectName));
    return (streamIsCS || hasCS) && !hasBio;
  };

  const calculateParamedicalCutoff = (subjects: typeof twelfthSubjects) => {
    // Computer Science students do not have paramedical cutoff
    if (isComputerScienceStudent(subjects)) return null;

    const physics = getSubjectMarks(subjects, [/phys/i]);
    const chemistry = getSubjectMarks(subjects, [/chem/i]);
    if (physics === null || chemistry === null) return "";

    // Check for combined Biology first
    let biology = getSubjectMarks(subjects, [/bio/i]);

    // If no single Biology, check for Botany and Zoology
    if (biology === null) {
      const botany = getSubjectMarks(subjects, [/botan/i]);
      const zoology = getSubjectMarks(subjects, [/zool/i]);
      if (botany !== null && zoology !== null) {
        biology = (botany + zoology) / 2;
      } else if (botany !== null) {
        biology = botany;
      } else if (zoology !== null) {
        biology = zoology;
      }
    }

    if (biology === null) return "";
    return (biology + physics / 2 + chemistry / 2).toFixed(2);
  };

  const calculateCutoff = (subjects: typeof twelfthSubjects, degree: string) => {
    if (degree.startsWith("Engineering")) {
      return calculateEngineeringCutoff(subjects);
    }
    if (degree.startsWith("Nursing")) {
      return calculateParamedicalCutoff(subjects) || "";
    }
    return calculateEngineeringCutoff(subjects) || calculateParamedicalCutoff(subjects) || "";
  };

  const updateCalculatedEducation = (
    nextSubjects: typeof twelfthSubjects,
    degree = formData.preferredDegree
  ) => {
    const { total, max } = nextSubjects.reduce(
      (result, subject) => ({
        total: result.total + (parseFloat(subject.marksObtained) || 0),
        max: result.max + (parseFloat(subject.maxMarks) || 0),
      }),
      { total: 0, max: 0 }
    );
    setFormData((prev) => ({
      ...prev,
      twelfthTotalMarks: total ? String(total) : "",
      twelfthPercentage: total && max ? ((total / max) * 100).toFixed(2) : "",
      twelfthCutoff: calculateCutoff(nextSubjects, degree),
    }));
  };

  // Live Application Tracking Stage Data
  const [applicationStatusData, setApplicationStatusData] = useState<{
    status: string;
    currentStage: string;
    stageStatus: string;
    submittedAt?: string;
    rejectionReason?: string;
    rejectionStage?: number;
    videoInterviewLink?: string;
    directInterviewLocation?: string;
    videoInterviewTime?: string;
  }>({
    status: "draft",
    currentStage: "Draft",
    stageStatus: "In Progress",
  });

  const isApplicationFormComplete = !getMissingApplicationField();

  const openApplicationSection = (field: string) => {
    setMissingApplicationField(null);
    setStudentNavTab("dashboard");
    setActiveTab(applicationFieldTabs[field] || "personal");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showIncompleteApplicationModal = (field: string) => {
    setMissingApplicationField(field);
  };

  const tabOrder: ApplicationTabType[] = [
    "personal",
    "family",
    "siblings",
    "address",
    "educational",
    "financial",
    "background",
    "documents",
  ];

  const sectionRequiredFields: Record<ApplicationTabType, readonly string[]> = {
    personal: requiredApplicationFields.filter((field) => applicationFieldTabs[field] === "personal"),
    family: requiredApplicationFields.filter((field) => applicationFieldTabs[field] === "family"),
    siblings: requiredApplicationFields.filter((field) => applicationFieldTabs[field] === "siblings"),
    address: requiredApplicationFields.filter((field) => applicationFieldTabs[field] === "address"),
    educational: requiredApplicationFields.filter((field) => applicationFieldTabs[field] === "educational"),
    financial: requiredApplicationFields.filter((field) => applicationFieldTabs[field] === "financial"),
    background: requiredApplicationFields.filter((field) => applicationFieldTabs[field] === "background"),
    documents: [],
  };

  const getMissingSectionField = (tab: ApplicationTabType) => {
    const missingField = sectionRequiredFields[tab].find(
      (field) => !getCalculatedEducationValue(field).trim()
    );

    if (missingField) return missingField;
    if (tab === "siblings" && Number(formData.siblingCount) > 0) {
      const hasIncompleteSibling = siblings.some(
        (sibling) =>
          !sibling.name.trim() ||
          !sibling.relationship.trim() ||
          !sibling.age.trim() ||
          !sibling.education.trim() ||
          !sibling.institution.trim()
      );
      if (hasIncompleteSibling || siblings.length !== Number(formData.siblingCount)) {
        return "siblingCount";
      }
    }

    if (tab === "address" && !formData.sameAsPermanent && !formData.currentAddress.trim()) {
      return "currentAddress";
    }

    if (tab === "educational") {
      const hasIncompleteSubject = [...tenthSubjects, ...eleventhSubjects, ...twelfthSubjects].some(
        (subject) =>
          !subject.subjectName.trim() ||
          !subject.maxMarks.trim() ||
          !subject.marksObtained.trim()
      );
      if (hasIncompleteSubject) return "twelfthSchool";
    }

    if (tab === "documents") {
      const requiredDocuments = [
        "studentPhoto",
        "document10thMarksheet",
        "document12thMarksheet",
        "documentAadhaarCard",
      ] as const;
      const missingDocument = requiredDocuments.find((field) => !formData[field]);
      if (missingDocument) return missingDocument;
      if (!formData.declarationAgreed) return "declarationAgreed";
    }

    return null;
  };

  const isSectionComplete = (tab: ApplicationTabType) => !getMissingSectionField(tab);

  const getFirstIncompleteStep = () =>
    tabOrder.find((tab) => !isSectionComplete(tab)) || "documents";

  const handleSectionChange = (targetTab: ApplicationTabType) => {
    const targetIndex = tabOrder.indexOf(targetTab);
    const firstIncompleteTab = getFirstIncompleteStep();
    const firstIncompleteIndex = tabOrder.indexOf(firstIncompleteTab);

    if (targetIndex > firstIncompleteIndex || (targetIndex === 7 && !isSectionComplete("background"))) {
      const missingField = getMissingSectionField(firstIncompleteTab);
      if (missingField) showIncompleteApplicationModal(missingField);
      return;
    }

    setActiveTab(targetTab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "preferredDegree"
          ? {
            twelfthCutoff: calculateCutoff(twelfthSubjects, value),
            twelfthTotalMarks: calc12thTotal().total ? String(calc12thTotal().total) : "",
            twelfthPercentage: calc12thTotal().total && calc12thTotal().max
              ? ((calc12thTotal().total / calc12thTotal().max) * 100).toFixed(2)
              : "",
          }
          : {}),
      }));
    }
  };

  const handleFileUpload = (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: reader.result,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Load previously saved application from Supabase database on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    const draftOwner =
      storedUser?.email ||
      storedUser?.id ||
      storedUser?.user_id ||
      "anonymous";
    const draftStorageKey = `maatram_application_draft_${draftOwner}`;

    let localDraft: {
      formData?: Partial<typeof formData>;
      siblings?: typeof siblings;
      eleventhSubjects?: typeof eleventhSubjects;
      twelfthSubjects?: typeof twelfthSubjects;
      tenthSubjects?: typeof tenthSubjects;
      activeTab?: ApplicationTabType;
    } | null = null;

    try {
      const savedDraft = window.localStorage.getItem(draftStorageKey);
      localDraft = savedDraft ? JSON.parse(savedDraft) : null;
    } catch (err) {
      console.warn("Could not restore saved application draft:", err);
    }

    async function loadSavedApplication() {
      try {
        const res = await applicationApi.getMyApplication();
        const application = res.success ? res.data : null;
        if (redirectAdmittedApplicant(application?.status)) return;
        const userProfile = storedUser || {};
        const nonEmptyDraftData = Object.fromEntries(
          Object.entries(localDraft?.formData || {}).filter(
            ([, value]) => value !== "" && value !== null && value !== undefined
          )
        );

        setFormData((prev) => ({
          ...prev,
          ...(application || {}),
          ...(userProfile.fullName || userProfile.full_name || userProfile.name
            ? {
              fullName:
                userProfile.fullName ||
                userProfile.full_name ||
                userProfile.name,
            }
            : {}),
          ...(userProfile.email ? { email: userProfile.email } : {}),
          ...(userProfile.mobileNumber || userProfile.mobile_number
            ? {
              mobileNumber:
                userProfile.mobileNumber || userProfile.mobile_number,
            }
            : {}),
          ...nonEmptyDraftData,
        }));

        if (localDraft?.siblings) setSiblings(localDraft.siblings);
        if (localDraft?.eleventhSubjects) setEleventhSubjects(localDraft.eleventhSubjects);
        if (localDraft?.twelfthSubjects) setTwelfthSubjects(localDraft.twelfthSubjects);
        if (localDraft?.tenthSubjects) setTenthSubjects(localDraft.tenthSubjects);
        if (localDraft?.activeTab) setActiveTab(localDraft.activeTab);

        if (res.success && res.data) {
          const d = res.data;
          if (!localDraft?.siblings && d.siblings && d.siblings.length > 0) setSiblings(d.siblings);
          if (!localDraft?.eleventhSubjects && d.eleventhSubjects && d.eleventhSubjects.length > 0) setEleventhSubjects(d.eleventhSubjects);
          if (!localDraft?.twelfthSubjects && d.twelfthSubjects && d.twelfthSubjects.length > 0) setTwelfthSubjects(d.twelfthSubjects);
          if (!localDraft?.tenthSubjects && d.tenthSubjects && d.tenthSubjects.length > 0) setTenthSubjects(d.tenthSubjects);
          const owner = getDraftOwnerKey();
          if (d.status && d.status !== "draft") {
            setIsSubmitted(true);
            window.localStorage.setItem(`maatram_application_submitted_${owner}`, "true");
            window.localStorage.setItem(`maatram_application_status_${owner}`, d.status);
            window.localStorage.setItem(`maatram_application_stage_${owner}`, d.currentStage || "Stage 01");
            window.localStorage.setItem(`maatram_application_stagestatus_${owner}`, d.stageStatus || "In Progress");
          } else {
            setIsSubmitted(false);
            window.localStorage.removeItem(`maatram_application_submitted_${owner}`);
            window.localStorage.setItem(`maatram_application_status_${owner}`, "draft");
          }
          const reason =
            d.rejectionReason ||
            window.localStorage.getItem(`maatram_application_rejection_reason_${owner}`) ||
            window.localStorage.getItem("maatram_application_rejection_reason_latest") ||
            "";
          if (reason) {
            window.localStorage.setItem(`maatram_application_rejection_reason_${owner}`, reason);
          }
          const stage =
            d.rejectionStage ||
            (window.localStorage.getItem(`maatram_application_rejection_stage_${owner}`)
              ? parseInt(window.localStorage.getItem(`maatram_application_rejection_stage_${owner}`)!, 10)
              : undefined) ||
            (window.localStorage.getItem("maatram_application_rejection_stage_latest")
              ? parseInt(window.localStorage.getItem("maatram_application_rejection_stage_latest")!, 10)
              : 1);
          setApplicationStatusData({
            status: d.status || "draft",
            currentStage: d.currentStage || "Stage 01",
            stageStatus: d.stageStatus || "In Progress",
            submittedAt: d.submittedAt,
            rejectionReason: reason || undefined,
            rejectionStage: stage,
            videoInterviewLink: d.video_interview_link || d.videoInterviewLink || undefined,
            directInterviewLocation: d.directInterviewLocation,
            videoInterviewTime: d.video_interview_time || d.videoInterviewTime || undefined,
          });
        }

        // Also fetch live stage tracking status
        try {
          const statusRes = await applicationApi.getStatus();
          if (statusRes && (statusRes.status || statusRes.data?.status)) {
            const s = statusRes.data || statusRes;
            if (redirectAdmittedApplicant(s.status)) return;
            const owner = getDraftOwnerKey();
            const liveReason =
              s.rejectionReason ||
              window.localStorage.getItem(`maatram_application_rejection_reason_${owner}`) ||
              window.localStorage.getItem("maatram_application_rejection_reason_latest") ||
              "";
            if (liveReason) {
              window.localStorage.setItem(`maatram_application_rejection_reason_${owner}`, liveReason);
            }
            const liveStage =
              s.rejectionStage ||
              (window.localStorage.getItem(`maatram_application_rejection_stage_${owner}`)
                ? parseInt(window.localStorage.getItem(`maatram_application_rejection_stage_${owner}`)!, 10)
                : undefined) ||
              (window.localStorage.getItem("maatram_application_rejection_stage_latest")
                ? parseInt(window.localStorage.getItem("maatram_application_rejection_stage_latest")!, 10)
                : 1);
            setApplicationStatusData({
              status: s.status || "draft",
              currentStage: s.currentStage || "Stage 01",
              stageStatus: s.stageStatus || "In Progress",
              submittedAt: s.submittedAt,
              rejectionReason: liveReason || undefined,
              rejectionStage: liveStage,
              videoInterviewLink: s.videoInterviewLink || s.video_interview_link || undefined,
              directInterviewLocation: s.directInterviewLocation,
              videoInterviewTime: s.videoInterviewTime || s.video_interview_time || undefined,
            });
            if (s.status && s.status !== "draft") {
              setIsSubmitted(true);
              window.localStorage.setItem(`maatram_application_submitted_${owner}`, "true");
              window.localStorage.setItem(`maatram_application_status_${owner}`, s.status);
              window.localStorage.setItem(`maatram_application_stage_${owner}`, s.currentStage || "Stage 01");
              window.localStorage.setItem(`maatram_application_stagestatus_${owner}`, s.stageStatus || "In Progress");
            }
          }
        } catch { }
      } catch (err) {
        console.warn("Load application error:", err);
      } finally {
        hasLoadedDraft.current = true;
        setIsLoadingApplication(false);
      }
    }
    loadSavedApplication();
  }, []);

  useEffect(() => {
    if (!hasLoadedDraft.current) return;

    try {
      const storedUser = getStoredUser();
      const draftOwner =
        storedUser?.email ||
        storedUser?.id ||
        storedUser?.user_id ||
        "anonymous";
      window.localStorage.setItem(
        `maatram_application_draft_${draftOwner}`,
        JSON.stringify({
          formData,
          siblings,
          eleventhSubjects,
          twelfthSubjects,
          tenthSubjects,
          activeTab,
        })
      );
    } catch (err) {
      console.warn("Could not save application draft:", err);
    }
  }, [formData, siblings, tenthSubjects, eleventhSubjects, twelfthSubjects, activeTab]);

  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    const missingField = getMissingApplicationField();
    if (missingField) {
      showIncompleteApplicationModal(missingField);
      return;
    }
    setIsReviewOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalSubmit = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setShowSubmitConfirmation(false);
    setIsSubmitting(true);
    try {
      const res = await applicationApi.submitApplication({
        ...formData,
        siblings,
        tenthSubjects,
        eleventhSubjects,
        twelfthSubjects,
      });
      if (!res.success) throw new Error(res.message || "Application submission failed.");
      if (res.data?.applicationNumber) {
        setFormData((prev: any) => ({ ...prev, applicationNumber: res.data.applicationNumber }));
      }
      const owner = getDraftOwnerKey();
      window.localStorage.setItem(`maatram_application_submitted_${owner}`, "true");
      window.localStorage.setItem(`maatram_application_status_${owner}`, "submitted");
      window.localStorage.setItem(`maatram_application_stage_${owner}`, "Stage 01");
      window.localStorage.setItem(`maatram_application_stagestatus_${owner}`, "Submitted");
      setApplicationStatusData({
        status: "submitted",
        currentStage: "Stage 01",
        stageStatus: "Submitted",
        submittedAt: new Date().toISOString(),
      });
      setIsReviewOpen(false);
      setIsSubmitted(true);
      setIsLoadingApplication(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Application submission failed. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-primary flex">
      {/* 1. Student Sidebar matching Admin Portal */}
      <StudentSidebar
        activeTab={studentNavTab}
        onTabChange={(tab) => {
          if (tab !== "dashboard" && !isApplicationFormComplete && !isSubmitted) {
            const missingField = getMissingApplicationField();
            if (missingField) showIncompleteApplicationModal(missingField);
            return;
          }
          setStudentNavTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onSignOutClick={() => setShowSignOutModal(true)}
        applicationNumber={formData.applicationNumber}
        studentName={formData.fullName}
        studentPhoto={formData.studentPhoto}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* ================= TOP NAVIGATION BAR ================= */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
          <div className="w-full px-4 sm:px-8 lg:px-10 h-16 flex items-center justify-between gap-4">

            {/* Left: Section Indicator & Batch Tag */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-xs text-slate-900 tracking-tight uppercase">
                    {studentNavTab === "profile"
                      ? "Student Profile"
                      : "Student Dashboard"}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-primary hidden sm:inline">
                  Maatram Foundation • 100% Free Higher Education Sponsorship
                </span>
              </div>
            </div>

          </div>
        </header>

        {/* ================= CONDITIONAL CONTENT VIEWS ================= */}
        {isLoadingApplication ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center p-16 min-h-[450px]">
            <div className="w-10 h-10 border-3 border-[#F7BC0F]/30 border-t-[#F7BC0F] rounded-full animate-spin" />
            <p className="mt-4 text-xs font-semibold text-slate-500 font-heading tracking-wide">
              Loading application details...
            </p>
          </div>
        ) : studentNavTab !== "profile" && (isSubmitted || studentNavTab === "status") && !isReviewOpen ? (
          /* ================= VIEW: SELECTION PROCESS & TIMELINE (ON DASHBOARD AFTER SUBMISSION) ================= */
          <main className="w-full px-4 sm:px-8 lg:px-10 py-6 sm:py-8 space-y-6 flex-1">
            {/* 1. Welcome & Status Header Strip */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-heading font-black text-xl sm:text-2xl text-slate-900">
                    Welcome, {formData.fullName || "Student Applicant"}!
                  </h1>
                  {applicationStatusData.status === "rejected" ? (
                    <span className="inline-flex items-center gap-1.5 font-bold text-xs px-2.5 py-0.5 rounded-full border text-rose-800 bg-rose-50 border-rose-200">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Application Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-bold text-xs px-2.5 py-0.5 rounded-full border text-emerald-800 bg-emerald-50 border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Application Submitted
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                  <span>Application Number: <strong className="font-mono text-slate-900 font-bold">{formData.applicationNumber || "MF-2025-001"}</strong></span>
                  <span>•</span>
                  <span>Admission Track 2025 - 2026</span>
                </p>
              </div>
            </div>

            {/* 2. Key Status & Academic Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Status</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      applicationStatusData.status === "rejected" ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                  />
                  <strong className="text-slate-900 text-sm font-heading truncate">
                    {applicationStatusData.status === "telephonic_done"
                      ? "Televerification Completed"
                      : applicationStatusData.status === "home_visit_done"
                        ? "Physical Verification Completed"
                        : applicationStatusData.status === "video_interview_done" || applicationStatusData.status === "shortlisted"
                          ? "Video Interview Completed"
                          : applicationStatusData.status === "selected" || applicationStatusData.status === "scholarship_awarded"
                            ? "Support Awarded"
                            : applicationStatusData.status === "rejected"
                              ? "Application Rejected"
                              : "Counselor Verification"}
                  </strong>
                </div>
                <p className={`text-[11px] truncate ${applicationStatusData.status === "rejected" ? "text-rose-600 font-medium" : "text-slate-500"}`}>
                  {applicationStatusData.status === "rejected"
                    ? applicationStatusData.rejectionReason || "Not shortlisted"
                    : applicationStatusData.status === "telephonic_done"
                      ? "Next: Video Call Interview"
                      : applicationStatusData.stageStatus || "Official review underway"}
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Degree</span>
                <div className="flex items-center gap-2">
                  <AcademicCapIcon className="w-4 h-4 text-[#F7BC0F] shrink-0" />
                  <strong className="text-slate-900 text-sm font-heading truncate">
                    {formData.preferredDegree || "Not Specified"}
                  </strong>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {formData.preferredBranch || "Branch preference open"}
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">12th Standard Cutoff</span>
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900 font-mono text-base font-bold">
                    {formData.twelfthCutoff || "—"}
                  </strong>
                  <span className="text-[11px] text-slate-500">/ 200</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {formData.twelfthPercentage ? `${formData.twelfthPercentage}% Score` : "Marks recorded"}
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verification Team</span>
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <strong className="text-slate-900 text-sm font-heading truncate">Maatram Trust</strong>
                </div>
                <p className="text-[11px] text-slate-500 truncate">Chennai Central Office</p>
              </div>
            </div>

            {/* Phase 3 Video Call Interview Live Meeting Card for New Student */}
            {(applicationStatusData.status === "physical_verification_done" ||
              applicationStatusData.status === "home_visit_done" ||
              applicationStatusData.status === "video_interview_in_progress") && (
              <div className="bg-gradient-to-r from-blue-500/10 via-indigo-50/70 to-emerald-500/10 border-2 border-indigo-400/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <VideoCameraIcon className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-300">
                          Phase 3 Active
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Virtual Advisory Panel</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-heading font-black text-slate-950 mt-0.5">
                        Your Google Meet Video Interview is Scheduled!
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Congratulations on clearing Physical Verification! Please join the Google Meet call below at your scheduled time.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    <a
                      href={applicationStatusData.videoInterviewLink || (formData as any).video_interview_link || "https://meet.google.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-heading font-black uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition active:scale-98 cursor-pointer"
                    >
                      <VideoCameraIcon className="w-5 h-5 stroke-[2.5]" />
                      <span>Join Google Meet</span>
                    </a>
                  </div>
                </div>

                <div className="p-3.5 bg-white/90 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-slate-700 shrink-0">Meeting Link:</span>
                    <a
                      href={applicationStatusData.videoInterviewLink || (formData as any).video_interview_link || "https://meet.google.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-indigo-700 hover:text-indigo-900 underline truncate block"
                    >
                      {applicationStatusData.videoInterviewLink || (formData as any).video_interview_link || "https://meet.google.com/mtr-vid-room"}
                    </a>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium shrink-0">
                    Camera & microphone required
                  </span>
                </div>
              </div>
            )}

            {/* 3. Main Two-Column Layout: Live Selection Flow Tracker & Application Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (Primary): Live Selection Flow Tracker */}
              <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-2">
                  <div>
                    <h2 className="font-heading font-black text-lg sm:text-xl text-slate-900">
                      Admission Verification & Selection Timeline
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Each verification circle and process updates in real time as your application moves forward.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono font-bold text-slate-700 shrink-0 self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Tracking</span>
                  </div>
                </div>

                {/* Vertical Process Steps */}
                {(() => {
                  const currentAppStatus = applicationStatusData.status || (isSubmitted ? "submitted" : "draft");

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
                    scholarship_awarded: 6,
                    rejected: -1,
                  };

                  const currentLevel = statusLevelMap[currentAppStatus] ?? (isSubmitted ? 1 : 0);

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
                      waitingText: applicationStatusData.directInterviewLocation ? `Direct interview location: ${applicationStatusData.directInterviewLocation}` : "Waiting for direct interview details.",
                    },
                    {
                      id: 6,
                      title: "Final Selection & 100% Free Scholarship Awarded",
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

                  if (currentAppStatus === "rejected") {
                    const rejectionStage = applicationStatusData.rejectionStage ?? 1;
                    const reasonText =
                      applicationStatusData.rejectionReason || "Application not shortlisted based on verification criteria.";

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
                    <div className="pt-2 pb-2">
                      {visibleSteps.length === 0 ? (
                        <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                          Submit your application to start tracking your verification progress.
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {visibleSteps.map((step, idx) => {
                            const isLast = idx === visibleSteps.length - 1;

                            return (
                              <div key={step.id} className="flex items-start group">
                                {/* Left Line & Circle Column */}
                                <div className="flex flex-col items-center mr-4 sm:mr-5 shrink-0">
                                  {/* Step Circle */}
                                  {step.isRejected ? (
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-700/20 ring-4 ring-rose-50 transition-all duration-300">
                                      <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                                    </div>
                                  ) : step.completed ? (
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#107c41] text-white flex items-center justify-center shadow-md shadow-emerald-700/20 ring-4 ring-emerald-50 transition-all duration-300">
                                      <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                                    </div>
                                  ) : (
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-dashed border-slate-400 text-slate-500 flex items-center justify-center shadow-xs ring-4 ring-slate-100 animate-pulse">
                                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                    </div>
                                  )}

                                  {/* Vertical Connecting Line */}
                                  {!isLast && (
                                    <div
                                      className={`w-[3.5px] min-h-[52px] sm:min-h-[58px] transition-all duration-300 ${
                                        step.completed
                                          ? "bg-[#107c41]"
                                          : step.isRejected
                                            ? "bg-rose-300"
                                            : "bg-slate-200"
                                      }`}
                                    />
                                  )}
                                </div>

                                {/* Right Content Column */}
                                <div className={`pb-6 sm:pb-7 pt-1 ${isLast ? "pb-2" : ""}`}>
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
                  );
                })()}
              </div>

              {/* Right Column: Application Overview & Notifications */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                {/* Summary Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4 text-[#F7BC0F]" />
                      Application Summary
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReviewOpen(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                      <span>Full View</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500">Applicant Name</span>
                      <strong className="text-slate-900 font-semibold text-right">{formData.fullName || "—"}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500">Primary Mobile</span>
                      <strong className="text-slate-900 font-mono text-right">{formData.mobileNumber || "—"}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500">Email Address</span>
                      <strong className="text-slate-900 truncate max-w-[170px] text-right">{formData.email || "—"}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500">District & State</span>
                      <strong className="text-slate-900 text-right">{formData.district || "—"}, {formData.state || "Tamil Nadu"}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500">First Graduate</span>
                      <strong className="text-slate-900 text-right">{formData.firstGraduate || "Yes"}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500">Community</span>
                      <strong className="text-slate-900 text-right">{formData.community || "—"}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500">Annual Income</span>
                      <strong className="text-slate-900 font-mono text-right">{formData.annualIncome ? `₹${formData.annualIncome}` : "—"}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Submission Date</span>
                      <strong className="text-emerald-700 font-semibold text-right">Application Received</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        ) : studentNavTab === "profile" ? (
          /* ================= VIEW 3: STUDENT PROFILE (ALL DETAILS) ================= */
          <main className="w-full px-6 sm:px-8 lg:px-10 py-6 sm:py-8 space-y-6 flex-1">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-7">

              {/* Profile Header Card */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4 sm:gap-5">
                  {/* Student Photo Thumbnail / Avatar */}
                  <div className="relative group cursor-pointer" onClick={() => formData.studentPhoto && setPreviewDocModal({ isOpen: true, title: "Student Photograph", url: formData.studentPhoto })}>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#F7BC0F] to-amber-300 text-slate-950 font-heading font-black text-2xl flex items-center justify-center shadow-md border-2 border-amber-300 overflow-hidden shrink-0">
                      {formData.studentPhoto ? (
                        <img
                          src={formData.studentPhoto}
                          alt={formData.fullName || "Student Profile"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{formData.fullName ? formData.fullName.trim().charAt(0).toUpperCase() : "S"}</span>
                      )}
                    </div>
                    {formData.studentPhoto && (
                      <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white p-1 rounded-full text-[10px] shadow-sm" title="Click to view photo">
                        <EyeIcon className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900">
                        {formData.fullName || "Student Applicant"}
                      </h1>
                      <span
                        className={`inline-block text-[11px] font-heading font-black uppercase px-2.5 py-0.5 rounded-full border ${isSubmitted
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                      >
                        {isSubmitted ? "Submitted & Under Review" : "Draft Application"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {formData.applicationNumber || "MF-2025-001"}
                      </span>
                      <span>•</span>
                      <span>{formData.mobileNumber || "No mobile"}</span>
                      <span>•</span>
                      <span>{formData.email || "No email"}</span>
                      <span>•</span>
                      <span>{formData.district ? `${formData.district}, ${formData.state || "Tamil Nadu"}` : "Tamil Nadu"}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setStudentNavTab("dashboard");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-4 py-2 bg-[#F7BC0F] hover:bg-[#e5ad0c] text-slate-950 font-heading font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmitted ? (
                      <>
                        <ArrowRightIcon className="w-4 h-4 stroke-[2.5] rotate-180" />
                        <span>Back to Selection Process</span>
                      </>
                    ) : (
                      <>
                        <PencilSquareIcon className="w-4 h-4 stroke-[2.5]" />
                        <span>Edit Application</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReviewOpen(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-heading font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <EyeIcon className="w-4 h-4 text-slate-600" />
                    <span>Full Document View</span>
                  </button>
                </div>
              </div>

              {/* Summary KPIs Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">12th Cutoff</span>
                  <div className="flex items-baseline gap-1">
                    <strong className="text-slate-950 font-heading font-black text-lg">
                      {formData.twelfthCutoff || "—"}
                    </strong>
                    <span className="text-[11px] text-amber-700 font-medium">/ 200</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">12th Total</span>
                  <strong className="text-slate-900 font-heading font-black text-lg">
                    {formData.twelfthTotalMarks || calc12thTotal().total || "—"}
                  </strong>
                  <span className="text-[10px] text-slate-500 block">
                    {formData.twelfthPercentage ? `${formData.twelfthPercentage}% Score` : "Score Recorded"}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">10th Score</span>
                  <strong className="text-slate-900 font-heading font-black text-lg">
                    {formData.tenthTotalMarks || "—"}
                  </strong>
                  <span className="text-[10px] text-slate-500 block">
                    {formData.tenthPercentage ? `${formData.tenthPercentage}% SSLC` : "SSLC Marksheet"}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Target Degree</span>
                  <strong className="text-slate-900 font-heading font-bold text-sm truncate block" title={formData.preferredDegree}>
                    {formData.preferredDegree ? formData.preferredDegree.split(" ")[0] : "Open"}
                  </strong>
                  <span className="text-[10px] text-slate-500 block truncate" title={formData.preferredBranch}>
                    {formData.preferredBranch || "Branch choice open"}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Annual Income</span>
                  <strong className="text-slate-900 font-mono font-black text-base truncate block">
                    {formData.annualIncome ? `₹${formData.annualIncome}` : "—"}
                  </strong>
                  <span className="text-[10px] text-slate-500 block">
                    {formData.firstGraduate === "Yes" ? "First Graduate" : "Family Income"}
                  </span>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Documents Attached</span>
                  <strong className="text-emerald-950 font-heading font-black text-lg">
                    {[
                      formData.studentPhoto,
                      formData.document10thMarksheet,
                      formData.document11thMarksheet,
                      formData.document12thMarksheet,
                      formData.documentCommunityCertificate,
                      formData.documentIncomeCertificate,
                      formData.documentAadhaarCard,
                      formData.documentParentIdProof,
                    ].filter(Boolean).length} / 8
                  </strong>
                  <span className="text-[10px] text-emerald-700 block">Proofs Uploaded</span>
                </div>
              </div>

              {/* ================= COMPREHENSIVE STUDENT DETAILS (ALL FILLED SECTIONS) ================= */}
              <div className="space-y-6">

                {/* Section A: Personal Information */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="font-heading font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-[#F7BC0F]" />
                      Personal Information
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentNavTab("dashboard");
                        setActiveTab("personal");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs font-bold text-[#b48400] hover:text-[#8a6500] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Student Full Name</span>
                      <strong className="text-slate-900 text-sm font-heading">{formData.fullName || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Date of Birth</span>
                      <strong className="text-slate-900">{formData.dob || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Gender</span>
                      <strong className="text-slate-900">{formData.gender || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Blood Group</span>
                      <strong className="text-slate-900">{formData.bloodGroup || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Primary Mobile Number</span>
                      <strong className="text-slate-900 font-mono">{formData.mobileNumber || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">WhatsApp Number</span>
                      <strong className="text-slate-900 font-mono">{formData.whatsappNumber || formData.mobileNumber || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Alternate Mobile</span>
                      <strong className="text-slate-900 font-mono">{formData.altMobileNumber || "None"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Email Address</span>
                      <strong className="text-slate-900 truncate block">{formData.email || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Aadhaar Card Number</span>
                      <strong className="text-slate-900 font-mono">{formData.aadhaarNumber || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Community / Category</span>
                      <strong className="text-slate-900">{formData.community || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Nationality</span>
                      <strong className="text-slate-900">{formData.nationality || "Indian"}</strong>
                    </div>
                  </div>
                </div>

                {/* Section B: Family Information */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="font-heading font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <HomeModernIcon className="w-4 h-4 text-[#F7BC0F]" />
                      Family Information
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentNavTab("dashboard");
                        setActiveTab("family");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs font-bold text-[#b48400] hover:text-[#8a6500] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                  </div>

                  {/* Father, Mother & Guardian Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Father Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center justify-between">
                        <span>Father's Particulars</span>
                        <span className="text-[11px] text-slate-500 font-normal">{formData.fatherEmploymentStatus || "—"}</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-500 block">Full Name:</span>
                          <strong className="text-slate-900">{formData.fatherName || "—"}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block">Occupation / Work:</span>
                          <strong className="text-slate-900">{formData.fatherOccupation || "—"}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block">Monthly Income:</span>
                          <strong className="text-slate-900 font-mono">{formData.fatherMonthlyIncome ? `₹${formData.fatherMonthlyIncome}` : "—"}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Mother Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center justify-between">
                        <span>Mother's Particulars</span>
                        <span className="text-[11px] text-slate-500 font-normal">{formData.motherEmploymentStatus || "—"}</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-500 block">Full Name:</span>
                          <strong className="text-slate-900">{formData.motherName || "—"}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block">Occupation / Work:</span>
                          <strong className="text-slate-900">{formData.motherOccupation || "—"}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block">Monthly Income:</span>
                          <strong className="text-slate-900 font-mono">{formData.motherMonthlyIncome ? `₹${formData.motherMonthlyIncome}` : "—"}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Guardian Card (if provided) */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center justify-between">
                        <span>Guardian's Particulars</span>
                        <span className="text-[11px] text-slate-500 font-normal">{formData.guardianRelation || "—"}</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-500 block">Guardian Name:</span>
                          <strong className="text-slate-900">{formData.guardianName || "Not applicable"}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block">Occupation:</span>
                          <strong className="text-slate-900">{formData.guardianOccupation || "—"}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block">Monthly Income:</span>
                          <strong className="text-slate-900 font-mono">{formData.guardianMonthlyIncome ? `₹${formData.guardianMonthlyIncome}` : "—"}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Family Household Context */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-3 border-t border-slate-200">
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Annual Family Income</span>
                      <strong className="text-slate-900 font-mono text-sm">{formData.annualIncome ? `₹${formData.annualIncome}` : "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Family Members Count</span>
                      <strong className="text-slate-900">{formData.familyMembersCount || "—"} Persons</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Family Structure</span>
                      <strong className="text-slate-900">{formData.familyType || "Nuclear Family"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Family Situation</span>
                      <strong className="text-slate-900">{formData.familySituation || "Both parents"}</strong>
                    </div>
                  </div>
                </div>

                {/* Section C: Siblings Information */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="font-heading font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <UserGroupIcon className="w-4 h-4 text-[#F7BC0F]" />
                      Siblings Information
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentNavTab("dashboard");
                        setActiveTab("siblings");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs font-bold text-[#b48400] hover:text-[#8a6500] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Total Siblings</span>
                      <strong className="text-slate-900 text-sm">{formData.siblingCount || siblings.length || "0"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Siblings Currently Studying</span>
                      <strong className="text-slate-900 text-sm">{formData.siblingsStudyingCount || "0"}</strong>
                    </div>
                  </div>
                  {siblings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                      {siblings.map((sib, i) => (
                        <div key={sib.id || i} className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <strong className="text-slate-900 font-heading text-sm">{sib.name || `Sibling ${i + 1}`}</strong>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 border border-slate-200">
                              {sib.relationship || "Sibling"}
                            </span>
                          </div>
                          <div className="text-slate-600">
                            Age: <strong className="text-slate-900">{sib.age || "—"}</strong>
                          </div>
                          <div className="text-slate-600">
                            Education: <strong className="text-slate-900">{sib.education || "—"}</strong>
                          </div>
                          {sib.institution && (
                            <div className="text-[11px] text-slate-500 truncate" title={sib.institution}>
                              Institution: {sib.institution}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-slate-200">
                      No siblings details entered by applicant.
                    </p>
                  )}
                </div>

                {/* Section D: Address Information */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="font-heading font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-[#F7BC0F]" />
                      Address Information
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentNavTab("dashboard");
                        setActiveTab("address");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs font-bold text-[#b48400] hover:text-[#8a6500] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Permanent Residential Address</span>
                      <strong className="text-slate-900 leading-relaxed block mt-0.5">
                        {formData.permanentAddress || formData.address || "—"}
                      </strong>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 uppercase font-medium">Current Residential Address</span>
                        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.2 rounded-full border border-slate-200">
                          {formData.sameAsPermanent ? "Same as permanent" : "Different current address"}
                        </span>
                      </div>
                      <strong className="text-slate-900 leading-relaxed block mt-0.5">
                        {formData.sameAsPermanent ? (formData.permanentAddress || formData.address || "—") : (formData.currentAddress || "—")}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Village / Town / City</span>
                      <strong className="text-slate-900">{formData.villageTown || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">District</span>
                      <strong className="text-slate-900">{formData.district || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">State</span>
                      <strong className="text-slate-900">{formData.state || "Tamil Nadu"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">PIN Code</span>
                      <strong className="text-slate-900 font-mono">{formData.pincode || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Residence Ownership</span>
                      <strong className="text-slate-900">{formData.residenceType || "Own"}</strong>
                    </div>
                    {formData.residenceType === "Rented" && (
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Monthly Rent</span>
                        <strong className="text-slate-900">{formData.rentAmount || "—"}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section E: Educational Information */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="font-heading font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <AcademicCapIcon className="w-4 h-4 text-[#F7BC0F]" />
                      Educational Information (10th, 11th, 12th & Higher Education)
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentNavTab("dashboard");
                        setActiveTab("educational");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs font-bold text-[#b48400] hover:text-[#8a6500] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                  </div>

                  {/* 10th Standard Summary */}
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#F7BC0F]" />
                        10th Standard (SSLC)
                      </span>
                      <span className="text-emerald-700 font-mono font-bold text-xs bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Total: {formData.tenthTotalMarks || "—"} Marks ({formData.tenthPercentage || "—"}%)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase">10th School Name</span>
                        <strong className="text-slate-900">{formData.tenthSchool || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase">Board of Examination</span>
                        <strong className="text-slate-900">{formData.tenthBoard || "State Board"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase">Year of Passing</span>
                        <strong className="text-slate-900">{formData.tenthYear || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase">School Address / Location</span>
                        <strong className="text-slate-900">{formData.tenthSchoolAddress || "—"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 11th Standard Summary & Mark Table */}
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                        11th Standard (HSC Plus One)
                      </span>
                      <span className="text-sky-700 font-mono font-bold text-xs bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                        Total: {calc11thTotal().total} / {calc11thTotal().max} {calc11thTotal().max > 0 ? `(${((calc11thTotal().total / calc11thTotal().max) * 100).toFixed(1)}%)` : ""}
                      </span>
                    </div>
                    {eleventhSubjects.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                            <tr>
                              <th className="py-2.5 px-3">Subject Name</th>
                              <th className="py-2.5 px-3 text-center w-28">Max Marks</th>
                              <th className="py-2.5 px-3 text-center w-36">Marks Obtained</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {eleventhSubjects.map((sub, i) => (
                              <tr key={sub.id || i} className="hover:bg-slate-50">
                                <td className="py-2 px-3 text-slate-900 font-medium">
                                  {sub.subjectName || `Subject ${i + 1}`}
                                </td>
                                <td className="py-2 px-3 text-center text-slate-500">{sub.maxMarks}</td>
                                <td className="py-2 px-3 text-center font-bold text-slate-900">{sub.marksObtained || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* 12th Standard Summary & Mark Table */}
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        12th Standard (HSC Plus Two)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-800 font-mono font-black text-xs bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Cutoff: {formData.twelfthCutoff || "—"} / 200
                        </span>
                        <span className="text-emerald-800 font-mono font-black text-xs bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Total: {formData.twelfthTotalMarks || calc12thTotal().total} / {calc12thTotal().max || 600}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase">12th School Name</span>
                        <strong className="text-slate-900">{formData.twelfthSchool || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase">Board of Examination</span>
                        <strong className="text-slate-900">{formData.twelfthBoard || "State Board"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase">Year of Passing</span>
                        <strong className="text-slate-900">{formData.twelfthYear || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase">Stream / Group</span>
                        <strong className="text-slate-900">{formData.twelfthStream || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase">Medium of Instruction</span>
                        <strong className="text-slate-900">{formData.mediumOfInstruction || "Tamil"}</strong>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-[11px] text-slate-500 block uppercase">School Address / District</span>
                        <strong className="text-slate-900">{formData.twelfthSchoolAddress || "—"}</strong>
                      </div>
                    </div>

                    {/* 12th Subject Marks Table */}
                    {twelfthSubjects.length > 0 && (
                      <div className="overflow-x-auto pt-2">
                        <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                            <tr>
                              <th className="py-2.5 px-3">Subject Name</th>
                              <th className="py-2.5 px-3 text-center w-28">Max Marks</th>
                              <th className="py-2.5 px-3 text-center w-36">Marks Obtained</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {twelfthSubjects.map((sub, i) => (
                              <tr key={sub.id || i} className="hover:bg-slate-50">
                                <td className="py-2 px-3 text-slate-900 font-medium">{sub.subjectName || `Subject ${i + 1}`}</td>
                                <td className="py-2 px-3 text-center text-slate-500">{sub.maxMarks}</td>
                                <td className="py-2 px-3 text-center font-bold text-slate-900">{sub.marksObtained || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Higher Education & Course Preferences */}
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      Higher Education & Course Aspirations
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">First-Gen College Learner</span>
                        <strong className="text-slate-900">{formData.firstGraduate || "Yes"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Preferred Degree</span>
                        <strong className="text-slate-900">{formData.preferredDegree || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">1st Choice Course / Branch</span>
                        <strong className="text-slate-900">{formData.preferredBranch || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">2nd Choice Course / Branch</span>
                        <strong className="text-slate-900">{formData.secondBranch || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Preferred College / Location</span>
                        <strong className="text-slate-900">{formData.preferredCollegeLocation || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Hostel Accommodation</span>
                        <strong className="text-slate-900">{formData.hostelRequired || "Yes"}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Initial Career Goal</span>
                        <strong className="text-slate-900">{formData.careerGoal || "—"}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section F: Financial Information */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="font-heading font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <CurrencyRupeeIcon className="w-4 h-4 text-[#F7BC0F]" />
                      Financial Information & Economic Hardship
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentNavTab("dashboard");
                        setActiveTab("financial");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs font-bold text-[#b48400] hover:text-[#8a6500] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Annual Family Income</span>
                      <strong className="text-slate-900 font-mono text-sm">{formData.annualIncome ? `₹${formData.annualIncome}` : "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Monthly Family Inflow</span>
                      <strong className="text-slate-900 font-mono text-sm">{formData.monthlyFamilyIncome ? `₹${formData.monthlyFamilyIncome}` : "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Income Sources</span>
                      <strong className="text-slate-900">{formData.incomeSources || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Outstanding Debts / Loans</span>
                      <strong className="text-slate-900">{formData.familyDebts || "None"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Existing Education Loans</span>
                      <strong className="text-slate-900">{formData.educationLoans || "None"}</strong>
                    </div>
                    <div className="sm:col-span-3">
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Ability to Afford College without Support</span>
                      <strong className="text-slate-900">{formData.affordabilityWithoutSupport || "Cannot afford higher education without full sponsorship"}</strong>
                    </div>
                    <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 block uppercase font-bold">Financial Difficulties Faced by Family</span>
                      <p className="text-slate-800 mt-1 leading-relaxed">{formData.financialDifficulties || "—"}</p>
                    </div>
                    <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 block uppercase font-bold">Why the Student Needs Financial Support</span>
                      <p className="text-slate-800 mt-1 leading-relaxed">{formData.whyNeedSupport || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Section G: Personal and Background Information */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="font-heading font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4 text-[#F7BC0F]" />
                      Personal and Background Information
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentNavTab("dashboard");
                        setActiveTab("background");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs font-bold text-[#b48400] hover:text-[#8a6500] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Orphan Status</span>
                      <strong className="text-slate-900">{formData.orphan || "No"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Single-Parent Status</span>
                      <strong className="text-slate-900">{formData.singleParent || "No"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">First-Generation Learner</span>
                      <strong className="text-slate-900">{formData.firstGenerationLearner || "Yes"}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-medium">Willingness to Relocate in TN</span>
                      <strong className="text-slate-900">{formData.willingToRelocateTN || "Yes"}</strong>
                    </div>
                    <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 block uppercase font-bold">Career Ambition</span>
                      <p className="text-slate-800 mt-1 leading-relaxed">{formData.careerAmbition || formData.careerGoal || "—"}</p>
                    </div>
                    <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 block uppercase font-bold">Why the Student Wants Higher Education</span>
                      <p className="text-slate-800 mt-1 leading-relaxed">{formData.higherEducationReason || "—"}</p>
                    </div>
                    <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 block uppercase font-bold">Future Goals & Vision</span>
                      <p className="text-slate-800 mt-1 leading-relaxed">{formData.futureGoals || "—"}</p>
                    </div>
                    <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 block uppercase font-bold">Special Family Circumstances</span>
                      <p className="text-slate-800 mt-1 leading-relaxed">{formData.specialCircumstances || "None specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Section H: Uploaded Documents & Certificates (Interactive Preview) */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="font-heading font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4 text-[#F7BC0F]" />
                      Uploaded Documents & Certificates (8 Documents)
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentNavTab("dashboard");
                        setActiveTab("documents");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs font-bold text-[#b48400] hover:text-[#8a6500] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" />
                      Manage Documents
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {[
                      { key: "studentPhoto", label: "Student Photograph", value: formData.studentPhoto, required: true },
                      { key: "document10thMarksheet", label: "10th Marksheet", value: formData.document10thMarksheet, required: true },
                      { key: "document12thMarksheet", label: "12th Marksheet", value: formData.document12thMarksheet, required: true },
                      { key: "documentAadhaarCard", label: "Aadhaar Document", value: formData.documentAadhaarCard, required: true },
                    ].map((doc, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 bg-white rounded-xl border transition flex flex-col justify-between shadow-2xs gap-3 ${doc.value ? "border-emerald-300" : "border-slate-200"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <strong className="text-slate-900 block font-heading text-xs">{doc.label}</strong>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {doc.required ? "Mandatory Proof" : ""}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.value
                              ? "bg-emerald-100 text-emerald-800"
                              : doc.required
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-500"
                              }`}
                          >
                            {doc.value ? "✓ Uploaded" : doc.required ? "Pending" : "Not Provided"}
                          </span>
                        </div>

                        {doc.value ? (
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            {doc.key === "studentPhoto" ? (
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200">
                                <img src={doc.value} alt={doc.label} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <DocumentTextIcon className="w-5 h-5 text-emerald-600" />
                            )}
                            <button
                              type="button"
                              onClick={() => setPreviewDocModal({ isOpen: true, title: doc.label, url: doc.value })}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                            >
                              <EyeIcon className="w-3.5 h-3.5 text-slate-600" />
                              <span>View File</span>
                            </button>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                setStudentNavTab("dashboard");
                                setActiveTab("documents");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="text-[11px] text-[#b48400] font-bold hover:underline"
                            >
                              + Upload Now
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section I: Legal Declaration */}
                <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3">
                  <CheckBadgeIcon className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <strong className="text-slate-900 block font-heading">
                      Official Applicant Declaration & Guarantee
                    </strong>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      "I hereby declare that all details submitted above are accurate and true to the best of my knowledge. I understand that Maatram Foundation provides <strong>100% cost-free education support</strong> without collecting any donation or admission fee."
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        ✓ Declared and Agreed by Applicant
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account & Session Actions Bottom Bar */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 font-medium">
                    All application details are securely synchronized with Maatram Foundation admission portal.
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStudentNavTab("dashboard");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-5 py-2.5 bg-[#F7BC0F] hover:bg-[#e5ad0c] text-slate-950 font-heading font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      {isSubmitted ? "Back to Selection Process" : "Open Application Form"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReviewOpen(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-heading font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
                    >
                      Print / Review Form
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSignOutModal(true)}
                      className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-heading font-bold text-xs rounded-xl border border-red-200 transition cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </main>
        ) : (
          /* ================= VIEW 1: APPLICATION DASHBOARD (FORM / REVIEW) ================= */
          <main className="w-full px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
            {isReviewOpen ? (
              /* ================= FULL PAGE APPLICATION DOCUMENT VIEW ================= */
              <div className="w-full space-y-6">

                {/* Official Application Document Sheet */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-7">

                  {/* Trust Letterhead Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
                    <div className="flex items-center gap-4">
                      <Image
                        src="/assets/images/logo.png"
                        alt="Maatram Foundation"
                        width={160}
                        height={80}
                        className="h-12 w-auto object-contain"
                      />
                      <div>
                        <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 uppercase tracking-wider">
                          Maatram Educational & Charitable Trust
                        </h3>
                        <p className="text-xs text-slate-600 font-medium">
                          Higher Education 100% Free Sponsorship Program (Academic Year 2025 - 2026)
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Zero Donation • Zero Tuition Fee • Free Higher Education
                        </p>
                      </div>
                    </div>
                    <div className="sm:text-right bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                      <span className="block font-mono text-xs font-bold text-slate-900">
                        Application ID: {formData.applicationNumber || "MF-2025-001"}
                      </span>
                      <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isSubmitted ? "text-emerald-700 bg-emerald-100/70" : "text-amber-700 bg-amber-100/70"
                      }`}>
                        {isSubmitted ? "Application Officially Submitted" : "Ready for Final Submission"}
                      </span>
                    </div>
                  </div>

                  {/* Section 1: Personal Details */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-[#F7BC0F]" />
                        Personal Information
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsReviewOpen(false);
                          setActiveTab("personal");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs font-bold text-[#b48400] hover:underline flex items-center gap-1"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit Section
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Student Full Name</span>
                        <strong className="text-slate-900 text-sm">{formData.fullName || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Date of Birth</span>
                        <strong className="text-slate-900">{formData.dob || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Gender</span>
                        <strong className="text-slate-900">{formData.gender || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Mobile Number</span>
                        <strong className="text-slate-900 font-mono">{formData.mobileNumber || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">WhatsApp Number</span>
                        <strong className="text-slate-900 font-mono">{formData.whatsappNumber || formData.mobileNumber || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Email Address</span>
                        <strong className="text-slate-900">{formData.email || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Aadhaar Number</span>
                        <strong className="text-slate-900 font-mono">{formData.aadhaarNumber || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Community / Category</span>
                        <strong className="text-slate-900">{formData.community || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Nationality</span>
                        <strong className="text-slate-900">{formData.nationality || "Indian"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Family Details */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <HomeModernIcon className="w-4 h-4 text-[#F7BC0F]" />
                        Family Information
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsReviewOpen(false);
                          setActiveTab("family");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs font-bold text-[#b48400] hover:underline flex items-center gap-1"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit Section
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Father's Name</span>
                        <strong className="text-slate-900">{formData.fatherName || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Father's Occupation</span>
                        <strong className="text-slate-900">{formData.fatherOccupation || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Father's Monthly Income</span>
                        <strong className="text-slate-900">{formData.fatherMonthlyIncome || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Father's Employment Status</span>
                        <strong className="text-slate-900">{formData.fatherEmploymentStatus || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Mother's Name</span>
                        <strong className="text-slate-900">{formData.motherName || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Mother's Occupation</span>
                        <strong className="text-slate-900">{formData.motherOccupation || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Mother's Monthly Income</span>
                        <strong className="text-slate-900">{formData.motherMonthlyIncome || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Mother's Employment Status</span>
                        <strong className="text-slate-900">{formData.motherEmploymentStatus || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Total Family Annual Income</span>
                        <strong className="text-slate-900 font-semibold">{formData.annualIncome || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Number of Family Members</span>
                        <strong className="text-slate-900">{formData.familyMembersCount || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Family Type</span>
                        <strong className="text-slate-900">{formData.familyType || "Nuclear"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Family Situation</span>
                        <strong className="text-slate-900">{formData.familySituation || "Both parents"}</strong>
                      </div>
                      {formData.guardianName && (
                        <>
                          <div>
                            <span className="text-[11px] text-slate-500 block uppercase font-medium">Guardian's Name</span>
                            <strong className="text-slate-900">{formData.guardianName}</strong>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block uppercase font-medium">Guardian's Occupation</span>
                            <strong className="text-slate-900">{formData.guardianOccupation || "-"}</strong>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block uppercase font-medium">Guardian's Monthly Income</span>
                            <strong className="text-slate-900">{formData.guardianMonthlyIncome || "-"}</strong>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block uppercase font-medium">Guardian Relationship</span>
                            <strong className="text-slate-900">{formData.guardianRelation || "-"}</strong>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Siblings Information */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <UserGroupIcon className="w-4 h-4 text-[#F7BC0F]" />
                        Siblings Information
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsReviewOpen(false);
                          setActiveTab("siblings");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs font-bold text-[#b48400] hover:underline flex items-center gap-1"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit Section
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-3">
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Number of Siblings</span>
                        <strong className="text-slate-900">{formData.siblingCount || siblings.length || "0"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Siblings Currently Studying</span>
                        <strong className="text-slate-900">{formData.siblingsStudyingCount || "0"}</strong>
                      </div>
                    </div>

                    {siblings.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {siblings.map((sib, i) => (
                          <div key={sib.id || i} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                            <strong className="text-slate-900 block font-heading">{sib.name || `Sibling ${i + 1}`}</strong>
                            <div className="text-slate-600 mt-1">
                              {sib.relationship || "Sibling"} • Age: {sib.age || "-"}
                            </div>
                            <div className="text-slate-500 text-[11px] mt-0.5">
                              {sib.education || "Studying / Working"} {sib.institution ? `@ ${sib.institution}` : ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No siblings entered.</p>
                    )}
                  </div>

                  {/* Section 4: Address Information */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-[#F7BC0F]" />
                        Address Information
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsReviewOpen(false);
                          setActiveTab("address");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs font-bold text-[#b48400] hover:underline flex items-center gap-1"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit Section
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                      <div className="sm:col-span-2">
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Permanent Address</span>
                        <strong className="text-slate-900">{formData.permanentAddress || formData.address || "-"}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Current Residential Address</span>
                        <strong className="text-slate-900">
                          {formData.sameAsPermanent ? (formData.permanentAddress || formData.address || "-") : (formData.currentAddress || "-")}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Village / Town</span>
                        <strong className="text-slate-900">{formData.villageTown || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">District</span>
                        <strong className="text-slate-900">{formData.district || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">State</span>
                        <strong className="text-slate-900">{formData.state || "Tamil Nadu"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">PIN Code</span>
                        <strong className="text-slate-900 font-mono">{formData.pincode || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Residence Type</span>
                        <strong className="text-slate-900">{formData.residenceType || "Own"}</strong>
                      </div>
                      {formData.residenceType === "Rented" && (
                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase font-medium">Monthly Rent</span>
                          <strong className="text-slate-900">{formData.rentAmount || "-"}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 5: Educational Information */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <AcademicCapIcon className="w-4 h-4 text-[#F7BC0F]" />
                        Educational Information
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsReviewOpen(false);
                          setActiveTab("educational");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs font-bold text-[#b48400] hover:underline flex items-center gap-1"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit Section
                      </button>
                    </div>

                    {/* 10th Standard Summary */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center justify-between">
                        <span>10th Standard (SSLC)</span>
                        <span className="text-emerald-700 font-bold">
                          {formData.tenthTotalMarks || "-"} Marks ({formData.tenthPercentage || "-"}%)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase">10th School Name</span>
                          <strong className="text-slate-900">{formData.tenthSchool || "-"}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase">10th Board</span>
                          <strong className="text-slate-900">{formData.tenthBoard || "-"}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase">10th Passing Year</span>
                          <strong className="text-slate-900">{formData.tenthYear || "-"}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase">10th Percentage</span>
                          <strong className="text-slate-900">{formData.tenthPercentage || "-"}%</strong>
                        </div>
                      </div>
                    </div>

                    {/* 12th Standard Summary & Mark Table */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5">
                        <span>12th Standard (HSC Plus Two)</span>
                        <span className="text-emerald-700 font-mono text-xs font-black">
                          Total: {formData.twelfthTotalMarks || calc12thTotal().total} | Cutoff: {formData.twelfthCutoff || "-"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase">12th School Name</span>
                          <strong className="text-slate-900">{formData.twelfthSchool || "-"}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase">12th Board</span>
                          <strong className="text-slate-900">{formData.twelfthBoard || "-"}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase">12th Passing Year</span>
                          <strong className="text-slate-900">{formData.twelfthYear || "-"}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase">12th Group</span>
                          <strong className="text-slate-900">{formData.twelfthStream || "-"}</strong>
                        </div>
                      </div>

                      {/* 12th Subject Marks Table */}
                      <div className="overflow-x-auto mt-2">
                        <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                            <tr>
                              <th className="py-2 px-3">Subject Name</th>
                              <th className="py-2 px-3 text-center w-28">Max Marks</th>
                              <th className="py-2 px-3 text-center w-36">Marks Obtained</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {twelfthSubjects.map((sub, i) => (
                              <tr key={sub.id || i} className="hover:bg-slate-50">
                                <td className="py-2 px-3 text-slate-900 font-medium">{sub.subjectName || `Subject ${i + 1}`}</td>
                                <td className="py-2 px-3 text-center text-slate-500">{sub.maxMarks}</td>
                                <td className="py-2 px-3 text-center font-bold text-slate-900">{sub.marksObtained || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Course Preferences */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase">First-Gen Graduate</span>
                          <strong className="text-slate-900">{formData.firstGraduate || "Yes"}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase">Preferred Degree</span>
                          <strong className="text-slate-900">{formData.preferredDegree || "-"}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase">Preferred Course (1st / 2nd)</span>
                          <strong className="text-slate-900">{formData.preferredBranch || "-"} {formData.secondBranch ? `/ ${formData.secondBranch}` : ""}</strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block uppercase">Preferred College / Location</span>
                          <strong className="text-slate-900">{formData.preferredCollegeLocation || "-"}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Financial Information */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <CurrencyRupeeIcon className="w-4 h-4 text-[#F7BC0F]" />
                        Financial Information
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsReviewOpen(false);
                          setActiveTab("financial");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs font-bold text-[#b48400] hover:underline flex items-center gap-1"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit Section
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Annual Family Income</span>
                        <strong className="text-slate-900">{formData.annualIncome || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Monthly Family Income</span>
                        <strong className="text-slate-900">{formData.monthlyFamilyIncome || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Income Sources</span>
                        <strong className="text-slate-900">{formData.incomeSources || "-"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Family Debts</span>
                        <strong className="text-slate-900">{formData.familyDebts || "None"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Existing Education Loans</span>
                        <strong className="text-slate-900">{formData.educationLoans || "None"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Ability to Afford College</span>
                        <strong className="text-slate-900">{formData.affordabilityWithoutSupport || "Cannot afford without full support"}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Financial Difficulties Faced</span>
                        <p className="text-slate-800 mt-0.5">{formData.financialDifficulties || "—"}</p>
                      </div>
                      <div className="sm:col-span-4">
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Why the Student Needs Financial Support</span>
                        <p className="text-slate-800 mt-0.5">{formData.whyNeedSupport || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 7: Personal and Background Information */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-[#F7BC0F]" />
                        Personal and Background Information
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsReviewOpen(false);
                          setActiveTab("background");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs font-bold text-[#b48400] hover:underline flex items-center gap-1"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit Section
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Orphan Status</span>
                        <strong className="text-slate-900">{formData.orphan || "No"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Single-Parent Status</span>
                        <strong className="text-slate-900">{formData.singleParent || "No"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">First-Generation Learner</span>
                        <strong className="text-slate-900">{formData.firstGenerationLearner || "Yes"}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Willingness to Relocate in TN</span>
                        <strong className="text-slate-900">{formData.willingToRelocateTN || "Yes"}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Career Ambition</span>
                        <p className="text-slate-800 mt-0.5">{formData.careerAmbition || formData.careerGoal || "—"}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Why the Student Wants Higher Education</span>
                        <p className="text-slate-800 mt-0.5">{formData.higherEducationReason || "—"}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">Future Goals</span>
                        <p className="text-slate-800 mt-0.5">{formData.futureGoals || "—"}</p>
                      </div>
                      {formData.specialCircumstances && (
                        <div className="sm:col-span-2">
                          <span className="text-[11px] text-slate-500 block uppercase font-medium">Special Family Circumstances</span>
                          <p className="text-slate-800 mt-0.5">{formData.specialCircumstances}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 8: Document Uploads Checklist */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-[#F7BC0F]" />
                        Document Uploads
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsReviewOpen(false);
                          setActiveTab("documents");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs font-bold text-[#b48400] hover:underline flex items-center gap-1"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit Documents
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                        <span className="font-medium text-slate-900">Student Photograph</span>
                        <span className={`text-[11px] font-bold ${formData.studentPhoto ? "text-emerald-600" : "text-amber-600"}`}>
                          {formData.studentPhoto ? "✓ Attached" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                        <span className="font-medium text-slate-900">10th Marksheet</span>
                        <span className={`text-[11px] font-bold ${formData.document10thMarksheet ? "text-emerald-600" : "text-amber-600"}`}>
                          {formData.document10thMarksheet ? "✓ Attached" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                        <span className="font-medium text-slate-900">12th Marksheet</span>
                        <span className={`text-[11px] font-bold ${formData.document12thMarksheet ? "text-emerald-600" : "text-amber-600"}`}>
                          {formData.document12thMarksheet ? "✓ Attached" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                        <span className="font-medium text-slate-900">Aadhaar Document</span>
                        <span className={`text-[11px] font-bold ${formData.documentAadhaarCard ? "text-emerald-600" : "text-amber-600"}`}>
                          {formData.documentAadhaarCard ? "✓ Attached" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Student Self Declaration Box */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 leading-relaxed">
                    <strong>Legal & Truthfulness Declaration:</strong> I hereby declare that all details entered in this application form are accurate and complete to the best of my knowledge. I understand that Maatram Foundation provides 100% cost-free education support and does not collect any donation or fee.
                  </div>

                  {/* Final Bottom Submission Buttons */}
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsReviewOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-heading font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      {isSubmitted ? "← Back to Selection Process" : "← Return to Form & Edit"}
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-heading font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <PrinterIcon className="w-4 h-4" />
                        <span>Print</span>
                      </button>
                      {isSubmitted ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                          <span>Application Submitted & Under Review</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowSubmitConfirmation(true)}
                          disabled={isSubmitting}
                          className="px-8 py-3 bg-[#F7BC0F] hover:bg-[#e5ad0c] text-slate-950 font-heading font-black text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-[#F7BC0F]/30 hover:shadow-xl transition-all cursor-pointer border border-[#e5ad0c]"
                        >
                          <span>Yes, Submit Application</span>
                          <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="w-full space-y-6">

                {/* Portal Welcome & Overview */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                        Application Form
                      </h1>
                      <p className="font-primary text-xs sm:text-sm text-slate-600 mt-1">
                        Fill out all sections below to apply for 100% cost-free higher education sponsorship.
                      </p>
                    </div>
                  </div>

                  {/* Sequential Application Stepper - 8 Steps A to H */}
                  <div className="mt-6 overflow-x-auto scrollbar-none">
                    <div className="min-w-[760px] flex items-start px-2">
                      {[
                        { id: "personal", label: "Personal", icon: UserIcon },
                        { id: "family", label: "Family", icon: HomeModernIcon },
                        { id: "siblings", label: "Siblings", icon: UserGroupIcon },
                        { id: "address", label: "Address", icon: MapPinIcon },
                        { id: "educational", label: "Educational", icon: AcademicCapIcon },
                        { id: "financial", label: "Financial", icon: CurrencyRupeeIcon },
                        { id: "background", label: "Background", icon: SparklesIcon },
                        { id: "documents", label: "Documents", icon: DocumentTextIcon },
                      ].map((tab, index, tabs) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const tabIndex = tabOrder.indexOf(tab.id as ApplicationTabType);
                        const firstIncompleteIndex = tabOrder.indexOf(getFirstIncompleteStep());
                        const isLocked = tabIndex > firstIncompleteIndex;
                        const isComplete = isSectionComplete(tab.id as ApplicationTabType);
                        return (
                          <React.Fragment key={tab.id}>
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => handleSectionChange(tab.id as ApplicationTabType)}
                              className={`group flex min-w-[78px] flex-col items-center gap-2 text-center transition ${isLocked ? "cursor-not-allowed" : "cursor-pointer"
                                }`}
                            >
                              <span
                                className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${isComplete
                                    ? "border-emerald-600 bg-emerald-600 text-white"
                                    : isActive
                                      ? "border-[#F7BC0F] bg-[#F7BC0F] text-slate-950 shadow-md shadow-[#F7BC0F]/30"
                                      : "border-slate-300 bg-white text-slate-400"
                                  } ${!isLocked && !isComplete && !isActive ? "group-hover:border-[#F7BC0F]" : ""}`}
                              >
                                {isComplete ? (
                                  <CheckCircleIcon className="h-5 w-5 stroke-[2.5]" />
                                ) : (
                                  <Icon className="h-5 w-5 stroke-[1.8]" />
                                )}
                              </span>
                              <span
                                className={`whitespace-nowrap text-[11px] font-semibold ${isComplete
                                    ? "text-emerald-700"
                                    : isActive
                                      ? "text-slate-900"
                                      : "text-slate-400"
                                  }`}
                              >
                                {tab.label}
                              </span>
                            </button>
                            {index < tabs.length - 1 && (
                              <span
                                className={`mt-5 h-0.5 min-w-[20px] flex-1 ${isComplete ? "bg-emerald-500" : "bg-slate-300"
                                  }`}
                                aria-hidden="true"
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Form Body Card */}
                <form onSubmit={handleOpenReview} autoComplete="off" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

                  {/* ================= TAB 1: PERSONAL INFORMATION ================= */}
                  {activeTab === "personal" && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-heading font-bold text-base text-slate-900">
                          Personal Information
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Please provide accurate identity and personal communication details.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Student Full Name */}
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Student Full Name <span className="text-rose-500">*</span> (as in 10th / 12th certificate)
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            placeholder="Enter your full name"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                        {/* Date of Birth */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Date of Birth <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Gender <span className="text-rose-500">*</span>
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Transgender">Transgender / Non-binary</option>
                          </select>
                        </div>

                        {/* Blood Group */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Blood Group
                          </label>
                          <input
                            type="text"
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={handleChange}
                            placeholder="e.g., O+, A+, B+, AB+"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                        {/* Mobile Number */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Mobile Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            placeholder="10-digit primary mobile"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                        {/* WhatsApp Number */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            WhatsApp Number
                          </label>
                          <input
                            type="tel"
                            name="whatsappNumber"
                            value={formData.whatsappNumber}
                            onChange={handleChange}
                            placeholder="WhatsApp contact number"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                        {/* Email Address */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Email Address <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                        {/* Aadhaar Number */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Aadhaar Number <span className="text-slate-400 font-normal">(only if officially required)</span>
                          </label>
                          <input
                            type="text"
                            name="aadhaarNumber"
                            value={formData.aadhaarNumber}
                            onChange={handleChange}
                            maxLength={12}
                            placeholder="12-digit Aadhaar number"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition font-mono"
                          />
                        </div>

                        {/* Community / Category */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Community / Category <span className="text-rose-500">*</span>
                          </label>
                          <select
                            name="community"
                            value={formData.community}
                            onChange={handleChange}
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          >
                            <option value="">Select Community</option>
                            <option value="BC">BC (Backward Class)</option>
                            <option value="BCM">BCM (Backward Class Muslim)</option>
                            <option value="MBC">MBC (Most Backward Class)</option>
                            <option value="DNC">DNC (De-notified Community)</option>
                            <option value="SC">SC (Scheduled Caste)</option>
                            <option value="SCA">SCA (Scheduled Caste Arunthathiyar)</option>
                            <option value="ST">ST (Scheduled Tribe)</option>
                            <option value="OC">OC (Open Competition / General)</option>
                          </select>
                        </div>

                        {/* Nationality */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Nationality
                          </label>
                          <input
                            type="text"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                            placeholder="Indian"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                      </div>
                    </div>
                  )}

                  {/* ================= TAB 2: FAMILY INFORMATION ================= */}
                  {activeTab === "family" && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-heading font-bold text-base text-slate-900">
                          Family Information
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Please provide truthful details regarding parents, occupations, income, and family situation.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Father's Name */}
                        <div className="lg:col-span-2">
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Father's Name
                          </label>
                          <input
                            type="text"
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleChange}
                            placeholder="Father's full name"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                        {/* Father's Occupation */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Father's Occupation
                          </label>
                          <input
                            type="text"
                            name="fatherOccupation"
                            value={formData.fatherOccupation}
                            onChange={handleChange}
                            placeholder="e.g., Daily wage labourer, Farmer"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                        {/* Father's Monthly Income */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Father's Monthly Income (₹)
                          </label>
                          <input
                            type="text"
                            name="fatherMonthlyIncome"
                            value={formData.fatherMonthlyIncome}
                            onChange={handleChange}
                            placeholder="e.g., ₹6,000"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                        {/* Father's Employment Status */}
                        <div className="lg:col-span-2">
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Father's Employment Status
                          </label>
                          <select
                            name="fatherEmploymentStatus"
                            value={formData.fatherEmploymentStatus}
                            onChange={handleChange}
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          >
                            <option value="">Select Employment Status</option>
                            <option value="Employed (Daily Wage / Unorganized)">Employed (Daily Wage / Unorganized)</option>
                            <option value="Self-Employed / Small Agriculture">Self-Employed / Small Agriculture</option>
                            <option value="Salaried Employee">Salaried Employee</option>
                            <option value="Unemployed / Sick">Unemployed / Medically Unfit</option>
                            <option value="Deceased">Deceased</option>
                          </select>
                        </div>

                        {/* Mother's Name */}
                        <div className="lg:col-span-2">
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Mother's Name
                          </label>
                          <input
                            type="text"
                            name="motherName"
                            value={formData.motherName}
                            onChange={handleChange}
                            placeholder="Mother's full name"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                        {/* Mother's Occupation */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Mother's Occupation
                          </label>
                          <input
                            type="text"
                            name="motherOccupation"
                            value={formData.motherOccupation}
                            onChange={handleChange}
                            placeholder="e.g., Homemaker, Domestic helper"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                        {/* Mother's Monthly Income */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Mother's Monthly Income (₹)
                          </label>
                          <input
                            type="text"
                            name="motherMonthlyIncome"
                            value={formData.motherMonthlyIncome}
                            onChange={handleChange}
                            placeholder="e.g., ₹3,000"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                        {/* Mother's Employment Status */}
                        <div className="lg:col-span-2">
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Mother's Employment Status
                          </label>
                          <select
                            name="motherEmploymentStatus"
                            value={formData.motherEmploymentStatus}
                            onChange={handleChange}
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          >
                            <option value="">Select Employment Status</option>
                            <option value="Homemaker">Homemaker</option>
                            <option value="Daily Wage / Agricultural Worker">Daily Wage / Agricultural Worker</option>
                            <option value="Self-Employed / Tailoring">Self-Employed / Tailoring</option>
                            <option value="Salaried Employee">Salaried Employee</option>
                            <option value="Deceased">Deceased</option>
                          </select>
                        </div>

                        {/* Total Family Annual Income */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Total Family Annual Income <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="annualIncome"
                            value={formData.annualIncome}
                            onChange={handleChange}
                            placeholder="e.g., ₹72,000"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                        {/* Number of Family Members */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Number of Family Members
                          </label>
                          <input
                            type="number"
                            name="familyMembersCount"
                            value={formData.familyMembersCount}
                            onChange={handleChange}
                            placeholder="e.g., 4"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          />
                        </div>

                        {/* Family Type */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Family Type
                          </label>
                          <select
                            name="familyType"
                            value={formData.familyType}
                            onChange={handleChange}
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          >
                            <option value="Nuclear">Nuclear Family</option>
                            <option value="Joint">Joint Family</option>
                          </select>
                        </div>

                        {/* Family Situation */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Family Situation <span className="text-rose-500">*</span>
                          </label>
                          <select
                            name="familySituation"
                            value={formData.familySituation}
                            onChange={handleChange}
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                          >
                            <option value="Both parents">Both parents alive & together</option>
                            <option value="Single parent (Mother)">Single parent (Mother alone)</option>
                            <option value="Single parent (Father)">Single parent (Father alone)</option>
                            <option value="Orphan">Orphan (Both parents deceased / Destitute)</option>
                          </select>
                        </div>

                        {/* Guardian Details (if applicable) */}
                        <div className="lg:col-span-4 pt-4 border-t border-slate-200">
                          <span className="font-heading font-bold text-xs text-slate-900 block mb-3">
                            Guardian Details (if applicable / supported by relative or legal guardian)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-xs font-heading font-bold text-slate-800">
                                Guardian Name
                              </label>
                              <input
                                type="text"
                                name="guardianName"
                                value={formData.guardianName}
                                onChange={handleChange}
                                placeholder="Guardian's name"
                                className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-heading font-bold text-slate-800">
                                Relationship to Student
                              </label>
                              <input
                                type="text"
                                name="guardianRelation"
                                value={formData.guardianRelation}
                                onChange={handleChange}
                                placeholder="e.g., Uncle, Grandmother"
                                className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-heading font-bold text-slate-800">
                                Guardian Occupation
                              </label>
                              <input
                                type="text"
                                name="guardianOccupation"
                                value={formData.guardianOccupation}
                                onChange={handleChange}
                                placeholder="Occupation"
                                className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-heading font-bold text-slate-800">
                                Guardian Monthly Income (₹)
                              </label>
                              <input
                                type="text"
                                name="guardianMonthlyIncome"
                                value={formData.guardianMonthlyIncome}
                                onChange={handleChange}
                                placeholder="e.g., ₹6,000"
                                className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white focus:ring-2 focus:ring-[#F7BC0F]/40 transition"
                              />
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================= TAB 3: SIBLINGS INFORMATION ================= */}
                  {activeTab === "siblings" && (
                    <div className="space-y-5">
                      <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-heading font-bold text-base text-slate-900">
                            Siblings Information
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Record your brothers and sisters, their ages, schooling status, and occupations.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddSibling}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-[#F7BC0F]/20 text-slate-900 border border-[#F7BC0F] font-heading font-bold text-xs rounded-xl shadow-xs transition active:scale-[0.98] cursor-pointer"
                        >
                          <PlusIcon className="w-4 h-4 text-slate-900 stroke-[2.5]" />
                          <span>+ Add Sibling</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Total Number of Siblings
                          </label>
                          <input
                            type="number"
                            name="siblingCount"
                            value={formData.siblingCount || (siblings.length ? String(siblings.length) : "")}
                            onChange={handleChange}
                            placeholder="e.g., 2"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Number of Siblings Currently Studying
                          </label>
                          <input
                            type="number"
                            name="siblingsStudyingCount"
                            value={formData.siblingsStudyingCount}
                            onChange={handleChange}
                            placeholder="e.g., 1"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>
                      </div>

                      {siblings.length === 0 ? (
                        <div className="bg-slate-50/70 border border-dashed border-slate-300 rounded-2xl p-8 text-center">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                            <UserGroupIcon className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-2">No siblings added yet</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                            If you have brothers or sisters, click "+ Add Sibling" to record their education and occupation.
                          </p>
                          <button
                            type="button"
                            onClick={handleAddSibling}
                            className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-heading font-bold text-xs rounded-lg transition cursor-pointer"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                            <span>+ Add Sibling Details</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {siblings.map((sibling, index) => (
                            <div
                              key={sibling.id}
                              className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 relative transition"
                            >
                              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70">
                                <span className="font-heading font-bold text-xs text-slate-800 flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-[#F7BC0F] text-slate-950 flex items-center justify-center text-[10px] font-black">
                                    {index + 1}
                                  </span>
                                  Sibling #{index + 1}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveSibling(sibling.id)}
                                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition cursor-pointer"
                                >
                                  <TrashIcon className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                <div>
                                  <label className="block text-xs font-heading font-bold text-slate-800">
                                    Sibling's Full Name
                                  </label>
                                  <input
                                    type="text"
                                    value={sibling.name}
                                    onChange={(e) => handleSiblingChange(sibling.id, "name", e.target.value)}
                                    placeholder="Enter sibling's name"
                                    className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-heading font-bold text-slate-800">
                                    Relationship
                                  </label>
                                  <select
                                    value={sibling.relationship}
                                    onChange={(e) => handleSiblingChange(sibling.id, "relationship", e.target.value)}
                                    className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                                  >
                                    <option value="">Select Relationship</option>
                                    <option value="Elder Brother">Elder Brother</option>
                                    <option value="Younger Brother">Younger Brother</option>
                                    <option value="Elder Sister">Elder Sister</option>
                                    <option value="Younger Sister">Younger Sister</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs font-heading font-bold text-slate-800">
                                    Age
                                  </label>
                                  <input
                                    type="text"
                                    value={sibling.age}
                                    onChange={(e) => handleSiblingChange(sibling.id, "age", e.target.value)}
                                    placeholder="e.g., 18"
                                    className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-heading font-bold text-slate-800">
                                    Sibling Education Level
                                  </label>
                                  <input
                                    type="text"
                                    value={sibling.education}
                                    onChange={(e) => handleSiblingChange(sibling.id, "education", e.target.value)}
                                    placeholder="e.g., 10th Std / B.Sc / 12th Std"
                                    className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F]"
                                  />
                                </div>

                                <div className="sm:col-span-2">
                                  <label className="block text-xs font-heading font-bold text-slate-800">
                                    Sibling Occupation / Institution
                                  </label>
                                  <input
                                    type="text"
                                    value={sibling.institution}
                                    onChange={(e) => handleSiblingChange(sibling.id, "institution", e.target.value)}
                                    placeholder="e.g., Student @ Govt HSS / Employed at Textile Mill"
                                    className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F]"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ================= TAB 4: ADDRESS INFORMATION ================= */}
                  {activeTab === "address" && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-heading font-bold text-base text-slate-900">
                          Address Information
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Please provide permanent and current living address details.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Permanent Address */}
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Permanent Address <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            name="permanentAddress"
                            rows={2}
                            value={formData.permanentAddress || formData.address}
                            onChange={handleChange}
                            placeholder="Door no., street name, village / post"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>

                        {/* Same as Permanent Checkbox */}
                        <div className="sm:col-span-2 lg:col-span-3 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            id="sameAsPerm"
                            name="sameAsPermanent"
                            checked={formData.sameAsPermanent}
                            onChange={handleChange}
                            className="w-4 h-4 rounded text-slate-900 border-slate-300"
                          />
                          <label htmlFor="sameAsPerm" className="text-xs font-bold text-slate-800 cursor-pointer">
                            Current residential address is same as permanent address
                          </label>
                        </div>

                        {/* Current Residential Address */}
                        {!formData.sameAsPermanent && (
                          <div className="sm:col-span-2 lg:col-span-3">
                            <label className="block text-xs font-heading font-bold text-slate-800">
                              Current Residential Address
                            </label>
                            <textarea
                              name="currentAddress"
                              rows={2}
                              value={formData.currentAddress}
                              onChange={handleChange}
                              placeholder="Current residence address"
                              className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                            />
                          </div>
                        )}

                        {/* Village / Town */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Village / Town <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="villageTown"
                            value={formData.villageTown}
                            onChange={handleChange}
                            placeholder="Village or Town name"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>

                        {/* District */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            District <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            placeholder="e.g., Tiruvannamalai, Madurai"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            State
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Tamil Nadu"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>

                        {/* PIN code */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            PIN Code <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="pincode"
                            maxLength={6}
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="6-digit PIN code"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white font-mono"
                          />
                        </div>

                        {/* Residence Type */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Residence Type (Own / Rented)
                          </label>
                          <select
                            name="residenceType"
                            value={formData.residenceType}
                            onChange={handleChange}
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          >
                            <option value="Own">Own House (Thatched / Tiled / Concrete)</option>
                            <option value="Rented">Rented House</option>
                            <option value="Relatives house / Shelter">Living in Relatives' House / Shelter</option>
                          </select>
                        </div>

                        {/* Monthly Rent */}
                        {formData.residenceType === "Rented" && <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Monthly Rent (₹) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="rentAmount"
                            value={formData.rentAmount}
                            onChange={handleChange}
                            placeholder="e.g., ₹6,000"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>}
                      </div>
                    </div>
                  )}

                  {/* ================= TAB 5: EDUCATIONAL INFORMATION ================= */}
                  {activeTab === "educational" && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-heading font-bold text-base text-slate-900">
                          Educational Information
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Enter 10th and 12th standard marks, school details, and preferred degree courses.
                        </p>
                      </div>

                      {/* 10th Standard Card */}
                      <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#F7BC0F]/20 text-slate-900 font-heading font-bold text-xs uppercase tracking-wider">
                          10th Standard (SSLC) Information
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-heading font-bold text-slate-800">
                              10th School Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="tenthSchool"
                              value={formData.tenthSchool}
                              onChange={handleChange}
                              placeholder="Enter 10th school name"
                              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-heading font-bold text-slate-800">
                              10th Board
                            </label>
                            <select
                              name="tenthBoard"
                              value={formData.tenthBoard}
                              onChange={handleChange}
                              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                            >
                              <option value="State Board">Tamil Nadu State Board</option>
                              <option value="CBSE">CBSE</option>
                              <option value="ICSE">ICSE</option>
                              <option value="Matriculation">Matriculation</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-heading font-bold text-slate-800">
                              10th Passing Year
                            </label>
                            <input
                              type="text"
                              name="tenthYear"
                              value={formData.tenthYear}
                              onChange={handleChange}
                              placeholder="e.g., 2023"
                              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                            />
                          </div>

                        </div>

                        <div className="pt-3 border-t border-slate-200">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div>
                              <h5 className="font-heading font-bold text-xs sm:text-sm text-slate-900">10th Subject-wise Marks</h5>
                              <p className="text-[11px] text-slate-500">Enter each 10th subject mark to calculate the total.</p>
                            </div>
                            <button type="button" onClick={handleAddTenthSubject} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-heading font-bold text-xs rounded-lg transition cursor-pointer">
                              <PlusIcon className="w-3.5 h-3.5" /> + Add Subject
                            </button>
                          </div>
                          <div className="space-y-2">
                            {tenthSubjects.map((subject, index) => (
                              <div key={subject.id} className="bg-white border border-slate-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
                                <span className="sm:col-span-1 w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">{index + 1}</span>
                                <input type="text" value={subject.subjectName} onChange={(e) => handleTenthSubjectChange(subject.id, "subjectName", e.target.value)} placeholder="Subject name" className="sm:col-span-6 w-full bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#F7BC0F]" />
                                <input type="number" min="0" max="100" value={subject.maxMarks} onChange={(e) => handleTenthSubjectChange(subject.id, "maxMarks", e.target.value)} placeholder="100" className="sm:col-span-2 w-full text-center bg-slate-50/70 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#F7BC0F]" />
                                <input type="number" min="0" max="100" value={subject.marksObtained} onChange={(e) => handleTenthSubjectChange(subject.id, "marksObtained", e.target.value)} placeholder="Marks" className="sm:col-span-2 w-full text-center font-bold bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#F7BC0F]" />
                                <button type="button" onClick={() => handleRemoveTenthSubject(subject.id)} disabled={tenthSubjects.length <= 1} className="sm:col-span-1 p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer" aria-label="Remove 10th subject">
                                  <TrashIcon className="w-4 h-4 mx-auto" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col gap-1 mt-3 text-xs font-semibold text-slate-700">
                            <span>10th Total: {calcTenthTotal().total} / {calcTenthTotal().max}</span>
                            <span className="text-[11px] text-slate-500">
                              10th Percentage: {calcTenthTotal().total && calcTenthTotal().max
                                ? `${((calcTenthTotal().total / calcTenthTotal().max) * 100).toFixed(2)}%`
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 11th Standard Subject-wise Marks */}
                      <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            ["eleventhSchool", "11th School Name", "Enter 11th school name"],
                            ["eleventhYear", "11th Passing Year", "e.g., 2024"],
                            ["eleventhStream", "11th Group / Stream", "e.g., Bio-Maths / CS"],
                          ].map(([name, label, placeholder]) => (
                            <div key={name}>
                              <label className="block text-xs font-heading font-bold text-slate-800">{label}</label>
                              <input type="text" name={name} value={formData[name as keyof typeof formData] as string} onChange={handleChange} placeholder={placeholder} className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]" />
                            </div>
                          ))}
                          <div>
                            <label className="block text-xs font-heading font-bold text-slate-800">11th Board</label>
                            <select name="eleventhBoard" value={formData.eleventhBoard} onChange={handleChange} className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]">
                              <option value="State Board">Tamil Nadu State Board</option>
                              <option value="CBSE">CBSE</option>
                              <option value="ICSE">ICSE</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#F7BC0F]/20 text-slate-900 font-heading font-bold text-xs uppercase tracking-wider">
                              11th Standard Subject-wise Marks
                            </span>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Enter marks obtained in each 11th standard subject.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAdd11thSubject}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-heading font-bold text-xs rounded-lg transition cursor-pointer"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                            <span>+ Add Subject</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {eleventhSubjects.map((sub, idx) => (
                            <div
                              key={sub.id}
                              className="bg-white border border-slate-200 rounded-xl p-3 sm:p-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center"
                            >
                              <div className="sm:col-span-1 flex justify-center">
                                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                  {idx + 1}
                                </span>
                              </div>
                              <div className="sm:col-span-6">
                                <input
                                  type="text"
                                  value={sub.subjectName}
                                  onChange={(e) => handle11thSubjectChange(sub.id, "subjectName", e.target.value)}
                                  placeholder="Subject name"
                                  className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={sub.maxMarks}
                                  onChange={(e) => handle11thSubjectChange(sub.id, "maxMarks", e.target.value)}
                                  placeholder="100"
                                  className="w-full text-center bg-slate-50/70 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={sub.marksObtained}
                                  onChange={(e) => handle11thSubjectChange(sub.id, "marksObtained", e.target.value)}
                                  placeholder="Marks"
                                  className="w-full text-center font-bold bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                                />
                              </div>
                              <div className="sm:col-span-1 flex justify-center">
                                {eleventhSubjects.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemove11thSubject(sub.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                    aria-label="Remove 11th subject"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                          <span>11th Total: {calc11thTotal().total} / {calc11thTotal().max}</span>
                          <span className="text-[11px] text-slate-500">
                            11th Percentage: {calc11thTotal().total && calc11thTotal().max
                              ? `${((calc11thTotal().total / calc11thTotal().max) * 100).toFixed(2)}%`
                              : "—"}
                          </span>
                        </div>
                      </div>

                      {/* 12th Standard Card */}
                      <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#F7BC0F]/20 text-slate-900 font-heading font-bold text-xs uppercase tracking-wider">
                          12th Standard (HSC Plus Two) Information
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-heading font-bold text-slate-800">
                              12th School Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="twelfthSchool"
                              value={formData.twelfthSchool}
                              onChange={handleChange}
                              placeholder="Enter 12th school name"
                              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-heading font-bold text-slate-800">
                              12th Passing Year
                            </label>
                            <input
                              type="text"
                              name="twelfthYear"
                              value={formData.twelfthYear}
                              onChange={handleChange}
                              placeholder="e.g., 2025"
                              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-heading font-bold text-slate-800">
                              12th Group / Stream
                            </label>
                            <input
                              type="text"
                              name="twelfthStream"
                              value={formData.twelfthStream}
                              onChange={handleChange}
                              placeholder="e.g., Bio-Maths / CS / Commerce"
                              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-heading font-bold text-slate-800">
                              12th Board
                            </label>
                            <select
                              name="twelfthBoard"
                              value={formData.twelfthBoard}
                              onChange={handleChange}
                              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                            >
                              <option value="State Board">Tamil Nadu State Board</option>
                              <option value="CBSE">CBSE</option>
                              <option value="ICSE / ISC">ICSE / ISC</option>
                            </select>
                          </div>
                        </div>

                        {/* Subject-wise marks */}
                        <div className="pt-3 border-t border-slate-200">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div>
                              <h5 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                                Subject-wise Marks
                              </h5>
                              <p className="text-[11px] text-slate-500 font-primary">
                                Enter marks obtained in each 12th standard subject.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={handleAdd12thSubject}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-heading font-bold text-xs rounded-lg transition cursor-pointer"
                            >
                              <PlusIcon className="w-3.5 h-3.5" />
                              <span>+ Add Subject</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {twelfthSubjects.map((sub, idx) => (
                              <div
                                key={sub.id}
                                className="bg-white border border-slate-200 rounded-xl p-3 sm:p-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center"
                              >
                                <div className="sm:col-span-1 flex items-center justify-between sm:justify-center">
                                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                    {idx + 1}
                                  </span>
                                </div>

                                <div className="sm:col-span-6">
                                  <input
                                    type="text"
                                    value={sub.subjectName}
                                    onChange={(e) => handle12thSubjectChange(sub.id, "subjectName", e.target.value)}
                                    placeholder="Subject name"
                                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                                  />
                                </div>

                                <div className="sm:col-span-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={sub.maxMarks}
                                    onChange={(e) => handle12thSubjectChange(sub.id, "maxMarks", e.target.value)}
                                    placeholder="100"
                                    className="w-full text-center bg-slate-50/70 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                                  />
                                </div>

                                <div className="sm:col-span-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={sub.marksObtained}
                                    onChange={(e) => handle12thSubjectChange(sub.id, "marksObtained", e.target.value)}
                                    placeholder="Marks"
                                    className="w-full text-center font-bold bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                                  />
                                </div>

                                <div className="sm:col-span-1 flex justify-center">
                                  {twelfthSubjects.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemove12thSubject(sub.id)}
                                      className="p-1 text-slate-400 hover:text-red-600 transition"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* 12th Marks Calculation Summary Strip */}
                          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200">
                            {/* Left: Total Marks & Percentage */}
                            <div className="flex flex-col">
                              <span className="font-heading font-black text-sm text-slate-900">
                                12th Total: {calc12thTotal().total} / {calc12thTotal().max}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">
                                Percentage: {calc12thTotal().total && calc12thTotal().max
                                  ? `${((calc12thTotal().total / calc12thTotal().max) * 100).toFixed(2)}%`
                                  : "—"}
                              </span>
                            </div>

                            {/* Right: Parallel Engineering & Paramedical Cut-offs */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              {/* Engineering Cutoff */}
                              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <div className="flex flex-col">
                                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-900">
                                    Engineering Cut-off
                                  </span>
                                  <span className="font-mono font-black text-xs text-emerald-950">
                                    {calculateEngineeringCutoff(twelfthSubjects)
                                      ? `${calculateEngineeringCutoff(twelfthSubjects)} / 200`
                                      : "— / 200"}
                                  </span>
                                </div>
                              </div>

                              {/* Paramedical Cutoff (Only displayed for students with Biology/Botany/Zoology) */}
                              {!isComputerScienceStudent(twelfthSubjects) && (
                                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl shadow-2xs">
                                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                                  <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-900">
                                      Paramedical Cut-off
                                    </span>
                                    <span className="font-mono font-black text-xs text-blue-950">
                                      {calculateParamedicalCutoff(twelfthSubjects)
                                        ? `${calculateParamedicalCutoff(twelfthSubjects)} / 200`
                                        : "— / 200"}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Course & Degree Preferences Card */}
                      <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#F7BC0F]/20 text-slate-900 font-heading font-bold text-xs uppercase tracking-wider">
                          Higher Education Preferences
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-heading font-bold text-slate-800">
                              First-Generation Graduate Status
                            </label>
                            <select
                              name="firstGraduate"
                              value={formData.firstGraduate}
                              onChange={handleChange}
                              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                            >
                              <option value="Yes">Yes (First in family to attend college)</option>
                              <option value="No">No</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-heading font-bold text-slate-800">
                              Preferred Degree <span className="text-rose-500">*</span>
                            </label>
                            <select
                              name="preferredDegree"
                              value={formData.preferredDegree}
                              onChange={handleChange}
                              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                            >
                              <option value="">Select Target Degree</option>
                              <option value="Engineering (B.E / B.Tech)">Engineering (B.E / B.Tech)</option>
                              <option value="Arts & Science (B.Sc / B.A)">Arts & Science (B.Sc / B.A)</option>
                              <option value="Nursing / Paramedical">Nursing / Paramedical</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-heading font-bold text-slate-800">
                              Preferred Course (1st Choice)
                            </label>
                            <input
                              type="text"
                              name="preferredBranch"
                              value={formData.preferredBranch}
                              onChange={handleChange}
                              placeholder="e.g., Computer Science & Engg"
                              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-heading font-bold text-slate-800">
                              Preferred Course (2nd Choice)
                            </label>
                            <input
                              type="text"
                              name="secondBranch"
                              value={formData.secondBranch}
                              onChange={handleChange}
                              placeholder="e.g., Electronics & Communication"
                              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-heading font-bold text-slate-800">
                              Preferred College / Location
                            </label>
                            <input
                              type="text"
                              name="preferredCollegeLocation"
                              value={formData.preferredCollegeLocation}
                              onChange={handleChange}
                              placeholder="e.g., Chennai, Coimbatore, or Anywhere in TN"
                              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-heading font-bold text-slate-800">
                              Hostel Accommodation Required?
                            </label>
                            <select
                              name="hostelRequired"
                              value={formData.hostelRequired}
                              onChange={handleChange}
                              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F]"
                            >
                              <option value="Yes">Yes - Hostel accommodation required</option>
                              <option value="No">No - Day scholar from home</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================= TAB 6: FINANCIAL INFORMATION ================= */}
                  {activeTab === "financial" && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-heading font-bold text-base text-slate-900">
                          Financial Information
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Please provide detailed and honest disclosure of family finances and difficulties.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Annual family income */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Annual Family Income <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="annualIncome"
                            value={formData.annualIncome}
                            onChange={handleChange}
                            placeholder="e.g., ₹72,000"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>

                        {/* Monthly family income */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Monthly Family Income
                          </label>
                          <input
                            type="text"
                            name="monthlyFamilyIncome"
                            value={formData.monthlyFamilyIncome}
                            onChange={handleChange}
                            placeholder="e.g., ₹6,000"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>

                        {/* Income sources */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Income Sources
                          </label>
                          <input
                            type="text"
                            name="incomeSources"
                            value={formData.incomeSources}
                            onChange={handleChange}
                            placeholder="e.g., Daily coolie work, Agriculture"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>

                        {/* Family debts */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Family Debts (if relevant)
                          </label>
                          <input
                            type="text"
                            name="familyDebts"
                            value={formData.familyDebts}
                            onChange={handleChange}
                            placeholder="e.g., ₹1,20,000 medical/agricultural debt"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>

                        {/* Existing education loans */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Existing Education Loans
                          </label>
                          <input
                            type="text"
                            name="educationLoans"
                            value={formData.educationLoans}
                            onChange={handleChange}
                            placeholder="e.g., None, or ₹50,000 loan for elder sibling"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>

                        {/* Ability to afford college expenses without support */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Ability to Afford College Expenses Without Support
                          </label>
                          <select
                            name="affordabilityWithoutSupport"
                            value={formData.affordabilityWithoutSupport || "Cannot afford at all"}
                            onChange={handleChange}
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          >
                            <option value="Cannot afford at all">Cannot afford at all (will have to drop out)</option>
                            <option value="Cannot afford private college">Cannot afford private college fees or hostel</option>
                            <option value="Only minimal support">Can manage only travel/minimal personal items</option>
                          </select>
                        </div>

                        {/* Financial difficulties faced by the family */}
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Financial Difficulties Faced by the Family
                          </label>
                          <textarea
                            name="financialDifficulties"
                            rows={2}
                            value={formData.financialDifficulties}
                            onChange={handleChange}
                            placeholder="Describe the economic challenges, irregular income, debts, or hardships faced by your family..."
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>

                        {/* Why the student needs financial support */}
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Why the Student Needs Financial Support <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            name="whyNeedSupport"
                            rows={3}
                            value={formData.whyNeedSupport}
                            onChange={handleChange}
                            placeholder="Explain why Maatram Foundation's 100% free education support is critical for you to pursue higher education..."
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================= TAB 7: PERSONAL AND BACKGROUND ================= */}
                  {activeTab === "background" && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-heading font-bold text-base text-slate-900">
                          Personal & Background Information
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tell us about your ambitions, special family circumstances, and future goals.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Orphan status */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Orphan Status
                          </label>
                          <select
                            name="orphan"
                            value={formData.orphan}
                            onChange={handleChange}
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes (Orphan student)</option>
                          </select>
                        </div>

                        {/* Single-parent status */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Single-Parent Status
                          </label>
                          <select
                            name="singleParent"
                            value={formData.singleParent}
                            onChange={handleChange}
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          >
                            <option value="No">No (Both parents alive)</option>
                            <option value="Single Mother">Single Parent - Mother</option>
                            <option value="Single Father">Single Parent - Father</option>
                          </select>
                        </div>

                        {/* First-generation learner */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            First-Generation Learner
                          </label>
                          <select
                            name="firstGenerationLearner"
                            value={formData.firstGenerationLearner}
                            onChange={handleChange}
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          >
                            <option value="Yes">Yes (First to attend college)</option>
                            <option value="No">No</option>
                          </select>
                        </div>

                        {/* Willingness to relocate anywhere in Tamil Nadu */}
                        <div>
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Willingness to Relocate in Tamil Nadu
                          </label>
                          <select
                            name="willingToRelocateTN"
                            value={formData.willingToRelocateTN}
                            onChange={handleChange}
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          >
                            <option value="Yes">Yes - Ready to study anywhere in TN</option>
                            <option value="No">No - Prefer nearby colleges only</option>
                          </select>
                        </div>

                        {/* Career ambition */}
                        <div className="sm:col-span-2 lg:col-span-2">
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Career Ambition <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            name="careerAmbition"
                            rows={2}
                            value={formData.careerAmbition || formData.careerGoal}
                            onChange={handleChange}
                            placeholder="e.g., Software Engineer, IAS officer, Bank Manager, Teacher"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>

                        {/* Why the student wants higher education */}
                        <div className="sm:col-span-2 lg:col-span-2">
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Why the Student Wants Higher Education <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            name="higherEducationReason"
                            rows={2}
                            value={formData.higherEducationReason}
                            onChange={handleChange}
                            placeholder="Why is completing a college degree important for you and your family?"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>

                        {/* Future goals */}
                        <div className="sm:col-span-2 lg:col-span-2">
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Future Goals & Vision
                          </label>
                          <textarea
                            name="futureGoals"
                            rows={2}
                            value={formData.futureGoals}
                            onChange={handleChange}
                            placeholder="What do you plan to achieve after graduating?"
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>

                        {/* Special family circumstances */}
                        <div className="sm:col-span-2 lg:col-span-2">
                          <label className="block text-xs font-heading font-bold text-slate-800">
                            Special Family Circumstances (if any)
                          </label>
                          <textarea
                            name="specialCircumstances"
                            rows={2}
                            value={formData.specialCircumstances}
                            onChange={handleChange}
                            placeholder="e.g., Parent's chronic illness, physical disability, natural disaster loss..."
                            className="w-full mt-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F7BC0F] focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================= TAB 8: DOCUMENT UPLOADS ================= */}
                  {activeTab === "documents" && (
                    <div className="space-y-5">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-heading font-bold text-base text-slate-900">
                          Document Uploads & Self Declaration
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Upload clear scanned copies or photos (PDF, JPG, PNG up to 5MB each).
                        </p>
                      </div>

                      {/* Upload Rows for Required Documents */}
                      <div className="space-y-3">
                        {[
                          { key: "studentPhoto", title: "Student Photograph", desc: "Recent passport size photo of the applicant", required: true },
                          { key: "document10thMarksheet", title: "10th Mark Sheet", desc: "SSLC statement of marks or provisional mark sheet", required: true },
                          { key: "document12thMarksheet", title: "12th Mark Sheet", desc: "HSC +2 statement of marks or internet result copy", required: true },
                          { key: "documentAadhaarCard", title: "Aadhaar Document", desc: "Front & back copy of student Aadhaar card", required: true },
                        ].map((doc) => {
                          const isAttached = Boolean((formData as any)[doc.key]);
                          return (
                            <div
                              key={doc.key}
                              className={`flex flex-wrap items-center justify-between p-4 rounded-2xl border transition ${isAttached ? "bg-emerald-50/60 border-emerald-300" : "bg-slate-50 border-slate-200"
                                } gap-3`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAttached ? "bg-emerald-100 text-emerald-700" : "bg-white border border-slate-200 text-slate-500"
                                    }`}
                                >
                                  {isAttached ? <CheckBadgeIcon className="w-6 h-6" /> : <CloudArrowUpIcon className="w-6 h-6" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                                      {doc.title}
                                    </span>
                                    {doc.required && (
                                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                        Required
                                      </span>
                                    )}
                                    {isAttached && (
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full">
                                        ✓ Uploaded
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-primary block mt-0.5">
                                    {doc.desc}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="text-xs font-heading font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-2xs">
                                  <span>{isAttached ? "Change File" : "Choose File"}</span>
                                  <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(doc.key, e)}
                                  />
                                </label>
                                {isAttached && (
                                  <button
                                    type="button"
                                    onClick={() => setFormData((prev) => ({ ...prev, [doc.key]: "" }))}
                                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                    title="Remove attachment"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Legal Declaration Checkbox */}
                      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl mt-4">
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            name="declarationAgreed"
                            checked={formData.declarationAgreed}
                            onChange={handleChange}
                            required
                            className="w-4 h-4 rounded border-slate-300 bg-white text-slate-900 focus:ring-0 accent-slate-900 cursor-pointer mt-0.5"
                          />
                          <span className="text-xs text-slate-700 font-primary leading-relaxed">
                            I hereby declare that all details submitted above are accurate and true to the best of my knowledge. I understand that Maatram Foundation provides <strong>100% cost-free education support</strong> without collecting any donation or admission fee.
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Form Controls / Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      {activeTab !== "personal" && (
                        <button
                          type="button"
                          onClick={() => {
                            const previousIndex = tabOrder.indexOf(activeTab) - 1;
                            if (previousIndex >= 0) {
                              setActiveTab(tabOrder[previousIndex]);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-heading font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>Previous Section</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {activeTab !== "documents" ? (
                        <button
                          type="button"
                          onClick={() => {
                            const missingField = getMissingSectionField(activeTab);
                            if (missingField) {
                              showIncompleteApplicationModal(missingField);
                              return;
                            }
                            const nextIndex = tabOrder.indexOf(activeTab) + 1;
                            if (nextIndex < tabOrder.length) {
                              handleSectionChange(tabOrder[nextIndex]);
                            }
                          }}
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-heading font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>Next Section</span>
                          <ArrowRightIcon className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-2.5 bg-[#F7BC0F] hover:bg-[#e5ad0c] active:scale-[0.99] text-slate-950 font-heading font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md shadow-[#F7BC0F]/30 hover:shadow-lg transition-all cursor-pointer border border-[#e5ad0c]"
                        >
                          <EyeIcon className="w-4 h-4 stroke-[2.5]" />
                          <span>Check Details & Review Application</span>
                        </button>
                      )}
                    </div>
                  </div>

                </form>
              </div>
            )}

          </main>
        )}
      </div>

      {/* ================= SIGN OUT CONFIRMATION MODAL ================= */}
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={() => {
          authApi.logout();
          setShowSignOutModal(false);
          router.push("/");
        }}
      />

      {showSubmitConfirmation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <InformationCircleIcon className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Confirm Application Submission
                </h3>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  Are you sure you want to submit your application? You will not be able to edit it after submission.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmation(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleFinalSubmit()}
                disabled={isSubmitting}
                className="rounded-xl bg-[#F7BC0F] px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-[#e5ad0c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      <CompleteApplicationModal
        isOpen={Boolean(missingApplicationField)}
        onClose={() => setMissingApplicationField(null)}
        onFillDetails={() => {
          if (missingApplicationField) {
            openApplicationSection(missingApplicationField);
          }
        }}
        missingSection={
          missingApplicationField
            ? {
              personal: "Personal",
              family: "Family",
              siblings: "Siblings",
              address: "Address",
              educational: "Educational",
              financial: "Financial",
              background: "Background",
              documents: "Documents",
            }[applicationFieldTabs[missingApplicationField] || "personal"]
            : undefined
        }
      />

      {/* ================= DOCUMENT PREVIEW MODAL ================= */}
      {previewDocModal && previewDocModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-[#F7BC0F]" />
                <h3 className="font-heading font-black text-sm text-slate-900">{previewDocModal.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {previewDocModal.url && (
                  <a
                    href={previewDocModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition"
                    title="Open in new window"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewDocModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100/50 min-h-[300px]">
              {previewDocModal.url ? (
                previewDocModal.url.startsWith("data:image/") || previewDocModal.url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ? (
                  <img
                    src={previewDocModal.url}
                    alt={previewDocModal.title}
                    className="max-h-[70vh] w-auto object-contain rounded-xl shadow-xs border border-slate-200"
                  />
                ) : (
                  <iframe
                    src={previewDocModal.url}
                    title={previewDocModal.title}
                    className="w-full h-[65vh] rounded-xl border border-slate-200 bg-white"
                  />
                )
              ) : (
                <p className="text-xs text-slate-400">No preview available for this document.</p>
              )}
            </div>
            <div className="p-3 border-t border-slate-100 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => setPreviewDocModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-heading font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
