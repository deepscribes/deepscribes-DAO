import { getUserDetailsFromUserId } from "../../../src/dao/clerk/users";
import { TEST_TEST_USER_ID } from "../../constants";

describe("Clerk integ", () => {
  test("Should return user details", async () => {
    const user = await getUserDetailsFromUserId(TEST_TEST_USER_ID);
    expect(user).toBeDefined();
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email_addresses");
    expect(user.email_addresses[0].email_address).toBe("test@example.com");
    expect(user.id).toBe(TEST_TEST_USER_ID);
  });
});
