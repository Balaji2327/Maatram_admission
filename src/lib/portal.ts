import { useEffect } from "react";
import { applicationApi, getAuthToken } from "./api";

export const memberLoginUrl = process.env.NEXT_PUBLIC_MEMBER_PORTAL_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3001/login" : "https://matramites.tech/login");

export function redirectAdmittedApplicant(status?: string) {
  if (status !== "selected") return false;
  window.location.replace(memberLoginUrl);
  return true;
}

export function useAdmissionHandoff() {
  useEffect(() => {
    let active = true;
    let checking = false;
    async function checkAdmission() {
      if (document.visibilityState !== "visible" || !getAuthToken() || checking) return;
      checking = true;
      try {
        const result = await applicationApi.getStatus();
        if (active && result.success) redirectAdmittedApplicant((result.data || result).status);
      } finally {
        checking = false;
      }
    }
    document.addEventListener("visibilitychange", checkAdmission);
    const timer = window.setInterval(checkAdmission, 60000);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", checkAdmission);
      window.clearInterval(timer);
    };
  }, []);
}
