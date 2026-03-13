import { ApiResponse } from "../types/ApiResponse";

/// Helper function to create a JSON response with the appropriate status code
export function apiJson(body: ApiResponse, status: number) {
  return Response.json(body, { status });
}