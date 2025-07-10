import { auth } from "@/app/(auth)/auth";
import { getUserContextForPrompt } from "@/ai/actions";

export async function GET() {
  const session = await auth();
  
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const userContext = await getUserContextForPrompt(session.user.id!);
    return Response.json(userContext);
  } catch (error) {
    console.error('Failed to fetch user context:', error);
    return new Response("Failed to fetch user context", { status: 500 });
  }
} 