import { describe, it, expect, vi } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  it("writes structured JSON logs", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("test_event", { userId: "u1" });
    expect(spy).toHaveBeenCalledOnce();
    const payload = JSON.parse(spy.mock.calls[0][0] as string);
    expect(payload.level).toBe("info");
    expect(payload.message).toBe("test_event");
    expect(payload.userId).toBe("u1");
    spy.mockRestore();
  });
});
