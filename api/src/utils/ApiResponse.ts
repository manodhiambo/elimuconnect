// Create: /home/manodhiambo/elimuconnect/api/src/utils/ApiResponse.ts

export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };

  constructor(message: string, data?: T, meta?: any) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}

export class ApiError {
  success: boolean;
  message: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;

  constructor(message: string, error?: string, errors?: any[]) {
    this.success = false;
    this.message = message;
    this.error = error;
    this.errors = errors;
  }
}

// Fix the typo - should be ApiResponse, not Apiponse
export const Apiponse = ApiResponse;
