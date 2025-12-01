/**
 * Error response structure from backend can vary:
 * - { new_password1: ["error1", "error2"], new_password2: ["error"] }
 * - { non_field_errors: ["error"] }
 * - { detail: "error message" }
 * - { message: "error message" }
 * - { error: "error message" }
 */
export interface BackendErrorResponse {
  [key: string]: string | string[] | undefined;
  detail?: string;
  message?: string;
  error?: string;
  non_field_errors?: string[];
}

export interface ParsedErrors {
  fieldErrors: Record<string, string[]>;
  nonFieldErrors: string[];
  genericError: string | null;
}

/**
 * Parses backend error response into structured format
 */
export function parseBackendErrors(error: any): ParsedErrors {
  const fieldErrors: Record<string, string[]> = {};
  const nonFieldErrors: string[] = [];
  let genericError: string | null = null;

  if (!error?.response?.data) {
    genericError = "Network error. Please check your connection and try again.";
    return { fieldErrors, nonFieldErrors, genericError };
  }

  const errorData: BackendErrorResponse = error.response.data;

  Object.keys(errorData).forEach((key) => {
    const value = errorData[key];
    
    if (key === "detail" || key === "message" || key === "error" || key === "non_field_errors") {
      return;
    }

    if (Array.isArray(value)) {
      fieldErrors[key] = value;
    } else if (typeof value === "string") {
      fieldErrors[key] = [value];
    }
  });

  if (errorData.non_field_errors) {
    if (Array.isArray(errorData.non_field_errors)) {
      nonFieldErrors.push(...errorData.non_field_errors);
    } else if (typeof errorData.non_field_errors === "string") {
      nonFieldErrors.push(errorData.non_field_errors);
    }
  }

  if (errorData.detail) {
    genericError = typeof errorData.detail === "string" ? errorData.detail : String(errorData.detail);
  } else if (errorData.message) {
    genericError = typeof errorData.message === "string" ? errorData.message : String(errorData.message);
  } else if (errorData.error) {
    genericError = typeof errorData.error === "string" ? errorData.error : String(errorData.error);
  }

  if (Object.keys(fieldErrors).length === 0 && nonFieldErrors.length === 0 && !genericError) {
    genericError = "An error occurred. Please try again.";
  }

  return { fieldErrors, nonFieldErrors, genericError };
}

/**
 * Gets the first error message for a specific field
 */
export function getFieldError(fieldErrors: Record<string, string[]>, fieldName: string): string | null {
  const errors = fieldErrors[fieldName];
  return errors && errors.length > 0 ? errors[0] : null;
}

