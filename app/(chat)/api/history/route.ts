import { auth } from "@/app/(auth)/auth";
import { getChatsByExternalUserId } from "@/db/queries";

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json("Unauthorized!", { status: 401 });
  }

  const chats = await getChatsByExternalUserId({ externalUserId: session.user.id! });
  return Response.json(chats);
}
