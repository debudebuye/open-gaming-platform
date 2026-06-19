/**
 * Standard API response envelope.
 *
 * Success:  { success: true,  data: T }
 * Error:    { success: false, error: { code, message, details? } }
 */
export class ApiResponse<T> {
  success!: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };

  static ok<T>(data: T): ApiResponse<T> {
    const res = new ApiResponse<T>();
    res.success = true;
    res.data = data;
    return res;
  }

  static fail(code: string, message: string, details?: unknown): ApiResponse<never> {
    const res = new ApiResponse<never>();
    res.success = false;
    res.error = { code, message, details };
    return res;
  }
}
