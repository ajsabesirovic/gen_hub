import axiosInstance from "@/lib/axios";

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface VerifyEmailResponse {
  message?: string;
  detail?: string;
}

export interface ResendEmailPayload {
  email: string;
}

export interface ResendEmailResponse {
  message?: string;
  detail?: string;
  retry_after?: number;
}

export interface ApiError {
  message?: string;
  detail?: string;
  code?: string;
  attempts_remaining?: number;
  retry_after?: number;
}

export async function verifyEmail(
  email: string,
  code: string
): Promise<VerifyEmailResponse> {
  const response = await axiosInstance.post<VerifyEmailResponse>(
    "/auth/registration/verify-email/",
    {
      email,
      code,
    }
  );
  return response.data;
}

export async function resendVerificationEmail(
  email: string
): Promise<ResendEmailResponse> {
  const response = await axiosInstance.post<ResendEmailResponse>(
    "/auth/registration/resend-email/",
    {
      email,
    }
  );
  return response.data;
}
