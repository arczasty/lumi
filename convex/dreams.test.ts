import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "./schema";
import { saveDream, getDreams, getDreamById, updateDream, deleteDream } from "./dreams";

describe("dreams mutations and queries", () => {
  it("should save a new dream", async () => {
    const t = convexTest(schema);

    const dreamId = await t.mutation(saveDream, {
      userId: "user_123",
      text: "I dreamed of flying through the clouds",
      interpretation: "This represents freedom and aspiration",
      sentiment: "positive",
      symbols: ["clouds", "flying", "sky"],
      imageUrl: "https://example.com/dream.jpg",
    });

    expect(dreamId).toBeDefined();
  });

  it("should retrieve dreams for a user", async () => {
    const t = convexTest(schema);

    // Save multiple dreams
    await t.mutation(saveDream, {
      userId: "user_123",
      text: "First dream",
    });

    await t.mutation(saveDream, {
      userId: "user_123",
      text: "Second dream",
    });

    await t.mutation(saveDream, {
      userId: "user_456",
      text: "Different user dream",
    });

    // Query dreams for user_123
    const dreams = await t.query(getDreams, { userId: "user_123" });

    expect(dreams).toHaveLength(2);
    expect(dreams[0].text).toBe("Second dream"); // Most recent first
    expect(dreams[1].text).toBe("First dream");
  });

  it("should get a specific dream by id", async () => {
    const t = convexTest(schema);

    const dreamId = await t.mutation(saveDream, {
      userId: "user_123",
      text: "A specific dream",
      interpretation: "Dream interpretation here",
    });

    const dream = await t.query(getDreamById, { id: dreamId });

    expect(dream).toBeDefined();
    expect(dream?.text).toBe("A specific dream");
    expect(dream?.interpretation).toBe("Dream interpretation here");
  });

  it("should update a dream's text", async () => {
    const t = convexTest(schema);

    const dreamId = await t.mutation(saveDream, {
      userId: "user_123",
      text: "Original dream text",
    });

    await t.mutation(updateDream, {
      id: dreamId,
      text: "Updated dream text",
    });

    const updatedDream = await t.query(getDreamById, { id: dreamId });

    expect(updatedDream?.text).toBe("Updated dream text");
  });

  it("should delete a dream", async () => {
    const t = convexTest(schema);

    const dreamId = await t.mutation(saveDream, {
      userId: "user_123",
      text: "Dream to be deleted",
    });

    await t.mutation(deleteDream, { id: dreamId });

    const deletedDream = await t.query(getDreamById, { id: dreamId });

    expect(deletedDream).toBeNull();
  });

  it("should save dream with default createdAt timestamp", async () => {
    const t = convexTest(schema);

    const dreamId = await t.mutation(saveDream, {
      userId: "user_123",
      text: "Dream without timestamp",
    });

    const dream = await t.query(getDreamById, { id: dreamId });

    expect(dream?.createdAt).toBeDefined();
    expect(typeof dream?.createdAt).toBe("number");
  });

  it("should save dream with custom createdAt timestamp", async () => {
    const t = convexTest(schema);

    const customTimestamp = Date.now() - 86400000; // Yesterday

    const dreamId = await t.mutation(saveDream, {
      userId: "user_123",
      text: "Dream with custom timestamp",
      createdAt: customTimestamp,
    });

    const dream = await t.query(getDreamById, { id: dreamId });

    expect(dream?.createdAt).toBe(customTimestamp);
  });

  it("should handle dreams with all optional fields", async () => {
    const t = convexTest(schema);

    const dreamId = await t.mutation(saveDream, {
      userId: "user_123",
      text: "Complete dream",
      interpretation: "Full interpretation",
      sentiment: "neutral",
      symbols: ["symbol1", "symbol2"],
      imageUrl: "https://example.com/image.jpg",
    });

    const dream = await t.query(getDreamById, { id: dreamId });

    expect(dream?.interpretation).toBe("Full interpretation");
    expect(dream?.sentiment).toBe("neutral");
    expect(dream?.symbols).toEqual(["symbol1", "symbol2"]);
    expect(dream?.imageUrl).toBe("https://example.com/image.jpg");
  });

  it("should return empty array when user has no dreams", async () => {
    const t = convexTest(schema);

    const dreams = await t.query(getDreams, { userId: "user_no_dreams" });

    expect(dreams).toEqual([]);
  });
});
