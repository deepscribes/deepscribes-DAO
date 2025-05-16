import { UserDao } from "../../../src/dao/clerk/users";
import { TEST_TEST_USER_ID } from "../../constants";

describe("Clerk integ", () => {
  test("Should return user details", async () => {
    const userDao = new UserDao();
    const user = await userDao.getUserById(TEST_TEST_USER_ID);
    expect(user).toBeDefined();
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("emailAddresses");
    expect(user!.emailAddresses[0].emailAddress).toBe("test@example.com");
    expect(user?.id).toBe(TEST_TEST_USER_ID);
  });
});
