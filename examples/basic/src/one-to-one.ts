import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema";

export const getProfile = async (userId: number) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      profile: true,
    },
  });
  if (user === undefined) {
    return undefined;
  }
  return {
    bio: user.profile.bio,
    name: user.name,
  };
};
