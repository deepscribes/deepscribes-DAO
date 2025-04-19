import { ClerkUser } from "../../models/user";

/**
 * Retrieves user details from Clerk using the provided user ID.
 * @requires `process.env.CLERK_API_KEY`
 * @readonly
 * @param userId - The user ID to fetch details for.
 * @returns
 */
export async function getUserDetailsFromUserId(
  userId: string,
): Promise<ClerkUser> {
  const CLERK_API_URL = "https://api.clerk.dev/v1/users";
  const CLERK_API_KEY = process.env.CLERK_API_KEY;

  if (!CLERK_API_KEY) {
    throw new Error("CLERK_API_KEY is not defined in environment variables");
  }

  return fetch(`${CLERK_API_URL}/${userId}`, {
    headers: {
      Authorization: `Bearer ${CLERK_API_KEY}`,
    },
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching user details:", error);
      throw new Error("Failed to fetch user details");
    });
}
