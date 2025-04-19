import { getUserDetailsFromUserId } from "../../../src/dao/clerk/users";

describe("Clerk", () => {
  test("Should throw an error if CLERK_API_KEY is not set", async () => {
    delete process.env.CLERK_API_KEY;
    await getUserDetailsFromUserId("test-user-id").catch((error) => {
      expect(error).toEqual(
        new Error("CLERK_API_KEY is not defined in environment variables"),
      );
    });
  });

  test("Should call the clerk API", async () => {
    process.env.CLERK_API_KEY = "test-clerk-api-key";
    const mockFetch = jest.fn();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        details: "test details",
      }),
    });

    const userDetails = await getUserDetailsFromUserId("test-user-id");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.clerk.dev/v1/users/test-user-id",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining("Bearer"),
        }),
      }),
    );

    expect(userDetails).toEqual({
      details: "test details",
    });
  });

  test("Should throw an error if the fetch fails", async () => {
    process.env.CLERK_API_KEY = "test-clerk-api-key";
    const mockFetch = jest.fn();
    global.fetch = mockFetch;
    mockFetch.mockRejectedValueOnce(new Error("Fetch failed"));

    await getUserDetailsFromUserId("test-user-id").catch((error) => {
      expect(error).toEqual(new Error("Failed to fetch user details"));
    });
  });
});
