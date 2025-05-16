import { ClerkClient, createClerkClient } from "@clerk/backend";
import type { User } from "../../models/user";

export type UserDaoConfig = {
  CLERK_API_KEY?: string;
};

export class UserDao {
  private apiKey: string;
  private clerkInstance: ClerkClient;
  constructor(config?: UserDaoConfig) {
    this.apiKey = config?.CLERK_API_KEY ?? process.env.CLERK_API_KEY;
    if (!this.apiKey) {
      throw new Error("Couldn't load CLERK_API_KEY");
    }
    this.clerkInstance = createClerkClient({ secretKey: this.apiKey });
  }

  /**
   * Returns a user, or null if it's not found
   */
  public async getUserById(id: string): Promise<User | null> {
    try {
      return await this.clerkInstance.users.getUser(id);
    } catch (e) {
      console.error("Failed to fetch user details", e);
      return null;
    }
  }

  /**
   * Creates a new user (only use for testing purposes)
   */
  public async createUser(
    params: Parameters<typeof this.clerkInstance.users.createUser>
  ) {
    return await this.clerkInstance.users.createUser(params);
  }
}
