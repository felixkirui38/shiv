import { describe, it, expect } from "vitest";
import { apiSuccess, apiError } from "@/lib/api-response";

describe("api-response", () => {
  it("returns success payload", async () => {
    const res = apiSuccess({ id: "1" });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, data: { id: "1" } });
  });

  it("returns error payload", async () => {
    const res = apiError("Not found", 404);
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body).toEqual({ success: false, error: "Not found" });
  });
});
