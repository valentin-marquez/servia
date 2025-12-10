import { AsyncResult } from "./types";

/**
 * Type guards para trabajar con AsyncResult de forma segura
 */

export function isSuccess<T>(result: AsyncResult<T>): result is { success: true; data: T } {
  return result.success === true;
}

export function isError<T>(result: AsyncResult<T>): result is { success: false; error: string } {
  return result.success === false;
}

/**
 * Helper para unwrap AsyncResult de forma segura
 */
export function unwrapResult<T>(
  result: AsyncResult<T>,
  onError?: (error: string) => void
): T | null {
  if (isSuccess(result)) {
    return result.data;
  }
  
  if (onError) {
    onError(result.error);
  }
  
  return null;
}