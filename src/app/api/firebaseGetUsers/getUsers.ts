import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "firebase-admin";

type User = {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const users: User[] = [];
    const listUsersResult = await auth.listUsers(1000); // Fetch first 1000 users

    listUsersResult.users.forEach((userRecord) => {
      users.push({
        uid: userRecord.uid,
        email: userRecord.email || undefined,
        phoneNumber: userRecord.phoneNumber || undefined,
        displayName: userRecord.displayName || undefined,
        photoURL: userRecord.photoURL || undefined,
      });
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
