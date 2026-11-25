import { createSessionReader } from "./sessionExpiry";
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_BASE_URL = rawApiUrl.replace(/\/+$/, "").replace(/\/api$/, "");

// Use the same backend as the portal's API calls, even for URLs saved on localhost.
export function applicationMediaUrl(value: string): string {
  if (!value || /^(?:data:|blob:)/i.test(value)) return value;
  const match = value.match(/^(?:https?:\/\/[^/?#]+)?(?:\/(?:api|backend))?\/admin\/media\/(applications\/[^?#]+)(?:[?#].*)?$/i)
    || value.match(/^\/?(applications\/[^?#]+)$/);
  if (!match) return value;
  const mediaBase = process.env.NEXT_PUBLIC_API_URL ? API_BASE_URL : "/backend";
  return mediaBase + "/admin/media/" + match[1];
}

// Token & User storage helpers
export const getAuthToken = createSessionReader("maatram_auth_token", "/login", clearAuthToken);

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("maatram_auth_token", token);
    getAuthToken();
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("maatram_auth_token");
    localStorage.removeItem("maatram_user");
  }
}

export function saveUser(user: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("maatram_user", JSON.stringify(user));
  }
}

export function getStoredUser(): any | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("maatram_user");
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  session?: any;
  user?: any;
  target?: string;
  applicationNumber?: string;
  [key: string]: any;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Bearer JWT Token automatically (student auth or admin token)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Extract response data and handle network/auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<any>) => {
    // If 401 Unauthorized, token might be expired
    if (error.response?.status === 401) {
      console.warn("Unauthorized API call. Session may have expired.");
    }
    return Promise.reject(error);
  }
);

// Safe helper to wrap axios calls into standard ApiResponse
async function callApi<T = any>(
  requestFn: () => Promise<{ data: any }>
): Promise<ApiResponse<T>> {
  try {
    const response = await requestFn();
    return response.data as ApiResponse<T>;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ||
          `Request failed with status ${error.response.status}`,
        challengeId: error.response.data?.challengeId,
        error: error.response.data?.error || error.message,
      };
    }
    return {
      success: false,
      message: error?.message || "Failed to communicate with API server",
    };
  }
}

// Auth API Endpoints (Powered by Axios)
export const authApi = {
  // Student registration with email verification
  signup: async (payload: {
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
    confirmPassword: string;
    retry?: boolean;
    challengeId?: string;
  }): Promise<ApiResponse> => {
    return callApi(() => apiClient.post("/auth/signup", payload, { timeout: 90000 }));
  },

  // Student Login with Email and Password (No OTP)
  login: async (payload: {
    email?: string;
    identifier?: string;
    password: string;
  }): Promise<ApiResponse> => {
    const result = await callApi(() => apiClient.post("/auth/login", payload));
    if (result.success && result.session?.access_token) {
      setAuthToken(result.session.access_token);
      if (result.user) saveUser(result.user);
    }
    return result;
  },

  // Send OTP to Phone (SMS) or Email via Supabase Auth
  sendOtp: async (payload: {
    phone?: string;
    email?: string;
    type?: "login" | "signup";
    challengeId?: string;
    fullName?: string;
    channel?: "phone" | "email";
  }): Promise<ApiResponse> => {
    return callApi(() => apiClient.post("/auth/send-otp", payload, payload.type === "signup" ? { timeout: 90000 } : {}));
  },

  // Verify 6-digit OTP code and retrieve Supabase session
  verifyOtp: async (payload: {
    phone?: string;
    email?: string;
    token: string;
    type?: "login" | "signup";
    challengeId?: string;
    fullName?: string;
    channel?: "phone" | "email";
  }): Promise<ApiResponse> => {
    const result = await callApi(() => apiClient.post("/auth/verify-otp", payload));

    // Store token automatically upon successful OTP verification ONLY for login
    if (result.success && result.session?.access_token) {
      if (payload.type !== "signup") {
        setAuthToken(result.session.access_token);
        if (result.user) saveUser(result.user);
      }
    }

    return result;
  },

  // Get current user profile from auth.users
  getMe: async (): Promise<ApiResponse> => {
    return callApi(() => apiClient.get("/auth/me"));
  },

  logout: () => {
    clearAuthToken();
  },
};

// Application Form API Endpoints (Powered by Axios)
export const applicationApi = {
  // Fetch current student's application data
  getMyApplication: async (): Promise<ApiResponse> => {
    return callApi(() => apiClient.get("/application/me"));
  },

  // Save partial draft into Supabase database
  saveDraft: async (formData: any): Promise<ApiResponse> => {
    return callApi(() => apiClient.post("/application/save-draft", formData));
  },

  // Final submission of student application
  submitApplication: async (formData: any): Promise<ApiResponse> => {
    return callApi(async () => {
      try {
        return await apiClient.post("/application/submit", formData, { timeout: 120_000 });
      } catch (error) {
        if (!axios.isAxiosError(error)) throw error;
        const status = error.response?.status;
        if (status && ![408, 409, 502, 503, 504].includes(status)) throw error;
        // The POST may have committed even though its response never reached the browser.
        const check = await callApi(() => apiClient.get("/application/status"));
        if (check.success && check.status && check.status !== "draft") {
          return { data: { success: true, alreadySubmitted: true } };
        }
        return { data: { success: false, message: "We couldn't confirm your submission. Check your application status before submitting again." } };
      }
    });
  },

  // Get selection stage progress
  getStatus: async (): Promise<ApiResponse> => {
    return callApi(() => apiClient.get("/application/status"));
  },
};
