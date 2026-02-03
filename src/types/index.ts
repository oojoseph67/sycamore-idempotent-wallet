// add your custom types here
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

