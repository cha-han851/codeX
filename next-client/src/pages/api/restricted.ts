import { authOptions } from './api/auth/[...nextauth]'
import { unstable_getServerSession } from "next-auth/next"


export async function handler(req:any, res:any) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }

  return res.json({
    message: 'Success',
  })
}