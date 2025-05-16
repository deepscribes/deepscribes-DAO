import { UserDao } from "../../../src/dao/clerk/users";

jest.mock("@clerk/backend", () => ({
  createClerkClient: jest.fn().mockImplementation(() => ({
    users: {
      getUser: jest.fn().mockImplementation(() => ({
        id: "test-user-id",
        firstName: "John",
        lastName: "Doe",
      })),
    },
  })),
}));

describe("Clerk", () => {
  test("Should throw an error if CLERK_API_KEY is not set", async () => {
    delete process.env.CLERK_API_KEY;
    expect(() => {
      new UserDao();
    }).toThrow("Couldn't load CLERK_API_KEY");
  });

  test("Should call the clerk API", async () => {
    process.env.CLERK_API_KEY = "test-clerk-api-key";

    const userDao = new UserDao();
    const userDetails = await userDao.getUserById("test-user-id");

    expect(userDetails).toEqual({
      id: "test-user-id",
      firstName: "John",
      lastName: "Doe",
    });
  });

  test("Should throw an error if the fetch fails", async () => {
    process.env.CLERK_API_KEY = "test-clerk-api-key";
    const mockFetch = jest.fn();
    global.fetch = mockFetch;
    mockFetch.mockRejectedValueOnce(new Error("Fetch failed"));

    const userDao = new UserDao();
    await userDao.getUserById("test-user-id").catch((error) => {
      expect(error).toEqual(new Error("Failed to fetch user details"));
    });
  });
});
