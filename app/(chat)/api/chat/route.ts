import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";
import { geminiProModel } from "@/ai";
import {
  getUserProgress,
  getRecentActivity,
  getFilteredQuestions,
  getTags,
} from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
import {
  db,
  deleteChatById,
  getChatById,
  saveChat,
} from "@/db/queries";
import { codeSubmissions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();
  
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // const pvtModel = geminiProModel(session.user.apikey || "NOT_FOUND")
  
  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  // TODO: Dynamic system prompt per user 

  const result = await streamText({
    model: geminiProModel,
    system: `
You are an expert DSA (Data Structures & Algorithms) tutor helping users master programming concepts and problem-solving skills.

## Your Teaching Philosophy:
- **Encouraging but honest**: Celebrate progress while acknowledging real difficulties
- **Step-by-step guidance**: Never give direct solutions, provide hints and progressive guidance
- **Contextual learning**: Use user's progress data to personalize advice and recommendations
- **Adaptive teaching**: Adjust difficulty and approach based on user's level and learning patterns
- **Conversational flow**: Maintain natural conversation while leveraging your tools for context

## Your Capabilities:
- Track and analyze user progress across different topics and difficulty levels
- Provide personalized problem recommendations based on learning patterns
- Explain concepts with examples tailored to user's experience level
- Give hints and guidance for specific problems without revealing solutions
- Identify weak areas and suggest focused practice
- Create learning paths for structured skill development

## Guidelines:
- Always check user progress before making recommendations
- Don't confirm too much, which question to solve i predefined you need not to ask much about what to fetch
- Use encouraging language while being realistic about difficulty
- Break down complex problems into manageable steps
- Reference user's past solved problems to build confidence
- Ask clarifying questions to understand what the user needs help with
- Keep responses concise but comprehensive
- Use tools to fetch relevant context instead of making assumptions

## Today's date: ${new Date().toLocaleDateString()}

Remember: Your goal is to guide users to understand concepts and solve problems independently, not to give them answers directly.
    `,
    messages: coreMessages.slice(-10),
    tools: {
      // =============================================
      // USER PROGRESS & ANALYTICS TOOLS
      // =============================================
      getUserProgressOverview: {
        description: "Get comprehensive overview of user's DSA learning progress including total problems solved, difficulty breakdown, and overall statistics",
        parameters: z.object({
          includeStats: z.boolean().default(true).describe("Include detailed statistics"),
          timeRange: z.enum(["week", "month", "all"]).default("all").describe("Time range for progress data")
        }),
        execute: async ({ timeRange }) => {
          const userId = session.user!.id;
          if(!userId) {
            return null
          }
          const progress = await getUserProgress(userId, { timeRange });
        
          
          return progress;
        },
      },
      getFilteredQuestionsToSolve: {
          description: "Fetch a curated list of DSA questions by passing SCREAMING_SNAKE_CASE topic name based on selected topics and difficulty levels, along with user-specific metadata like solved/bookmarked status.",
          parameters: z.object({
            topics: z.array(z.string()).min(1).describe("List of topic tags to filter questions by"),
            limit: z.number().min(1).max(100).default(50).describe("Maximum number of questions to fetch (default 50)")
          }),
          execute: async ({ topics, limit }) => {
            const userId = session.user!.id;
            if(!userId) {
              return null
            }

            const response = await getFilteredQuestions({ topics, userId, limit });

            console.log(response)
            
            return response
          }
      },

      getUserSubmissionForProblem: {
        description: "Get the user's latest code submission for a specific problem/question",
        parameters: z.object({
          questionSlug: z.string().describe("The slug/identifier of the problem (e.g., 'two-sum', 'binary-search')"),
          includeMetadata: z.boolean().default(true).describe("Include submission metadata like language, timestamp, etc.")
        }),
        execute: async ({ questionSlug, includeMetadata }) => {
          const userId = session.user!.id;
          if (!userId) {
            return null;
          }

          try {
            // Get the user's submission for this specific problem
            const [submission] = await db
              .select({
                id: codeSubmissions.id,
                code: codeSubmissions.code,
                language: codeSubmissions.language,
                problemTitle: codeSubmissions.problemTitle,
                submissionStatus: codeSubmissions.submissionStatus,
                createdAt: codeSubmissions.createdAt,
                updatedAt: codeSubmissions.updatedAt,
              })
              .from(codeSubmissions)
              .where(
                and(
                  eq(codeSubmissions.externalUserId, userId),
                  eq(codeSubmissions.questionSlug, questionSlug)
                )
              )
              .limit(1);

            if (!submission) {
              return {
                found: false,
                message: `No submission found for problem: ${questionSlug}`
              };
            }

            const result: any = {
              found: true,
              questionSlug,
              code: submission.code,
              language: submission.language,
              submissionStatus: submission.submissionStatus,
            };

            if (includeMetadata) {
              result.problemTitle = submission.problemTitle;
              result.createdAt = submission.createdAt;
              result.updatedAt = submission.updatedAt;
              result.submissionId = submission.id;
            }

            return result;
          } catch (error) {
            console.error('Error fetching user submission:', error);
            return {
              found: false,
              error: 'Failed to fetch submission'
            };
          }
        },
      },

      // getTopicSpecificProgress: {
      //   description: "Get detailed progress for a specific DSA topic (arrays, linked lists, trees, graphs, etc.)",
      //   parameters: z.object({
      //     topic: z.string().describe("DSA topic to get progress for"),
      //     includeProblems: z.boolean().default(false).describe("Include list of solved problems in this topic")
      //   }),
      //   execute: async ({ topic, includeProblems }) => {
      //     const userId = session.user!.id;
      //     return await getTopicProgress(userId, topic, includeProblems);
      //   },
      // },

      // getWeakAreasAnalysis: {
      //   description: "Analyze user's weak areas and topics that need more practice",
      //   parameters: z.object({
      //     limit: z.number().default(5).describe("Number of weak areas to return")
      //   }),
      //   execute: async ({ limit }) => {
      //     const userId = session.user!.id;
      //     return await getWeakAreas(userId, limit);
      //   },
      // },

      
      // =============================================
      // PROBLEM RECOMMENDATION & DISCOVERY TOOLS
      // =============================================
      // getPersonalizedRecommendations: {
      //   description: "Get personalized problem recommendations based on user's progress, weak areas, and learning goals",
      //   parameters: z.object({
      //     difficulty: z.enum(["easy", "medium", "hard", "mixed"]).optional().describe("Preferred difficulty level"),
      //     topic: z.string().optional().describe("Specific topic to focus on"),
      //     count: z.number().default(5).describe("Number of recommendations to return"),
      //     avoidSolved: z.boolean().default(true).describe("Exclude already solved problems")
      //   }),
      //   execute: async ({ difficulty, topic, count, avoidSolved }) => {
      //     const userId = session.user!.id;
      //     return await getRecommendedProblems(userId, {
      //       difficulty,
      //       topic,
      //       count,
      //       avoidSolved
      //     });
      //   },
      // },

      // getLearningPathSuggestions: {
      //   description: "Get structured learning path suggestions for systematic skill development",
      //   parameters: z.object({
      //     currentLevel: z.enum(["beginner", "intermediate", "advanced"]).optional().describe("Current skill level (auto-detected if not provided)"),
      //     focusArea: z.string().optional().describe("Specific area to focus the learning path on")
      //   }),
      //   execute: async ({ currentLevel, focusArea }) => {
      //     const userId = session.user!.id;
      //     const userLevel = currentLevel || await getUserLevel(userId);
      //     return await getLearningPath(userId, userLevel, focusArea);
      //   },
      // },

      // getSimilarProblems: {
      //   description: "Find problems similar to a specific problem for additional practice",
      //   parameters: z.object({
      //     problemId: z.string().describe("ID or name of the reference problem"),
      //     count: z.number().default(3).describe("Number of similar problems to return")
      //   }),
      //   execute: async ({ problemId, count }) => {
      //     return await getSimilarProblems(problemId, count);
      //   },
      // },

      // =============================================
      // PROBLEM-SPECIFIC HELP TOOLS
      // =============================================
      // getProblemDetails: {
      //   description: "Get detailed information about a specific problem including description, constraints, and examples",
      //   parameters: z.object({
      //     problemId: z.string().describe("Problem ID or name"),
      //     includeHints: z.boolean().default(false).describe("Include available hints"),
      //     checkSolved: z.boolean().default(true).describe("Check if user has solved this problem")
      //   }),
      //   execute: async ({ problemId, includeHints, checkSolved }) => {
      //     const userId = session.user!.id;
      //     const problemDetails = await getProblemDetails(problemId);
          
      //     const result: any = { ...problemDetails };
          
      //     if (includeHints) {
      //       result.hints = await getHintForProblem(problemId, userId);
      //     }
          
      //     if (checkSolved) {
      //       result.userSolved = await checkProblemSolved(userId, problemId);
      //     }
          
      //     return result;
      //   },
      // },

      // getProgressiveHints: {
      //   description: "Get progressive hints for a problem without revealing the complete solution",
      //   parameters: z.object({
      //     problemId: z.string().describe("Problem ID or name"),
      //     hintLevel: z.number().min(1).max(3).default(1).describe("Level of hint (1=gentle nudge, 2=approach hint, 3=implementation hint)")
      //   }),
      //   execute: async ({ problemId, hintLevel }) => {
      //     const userId = session.user!.id;
      //     return await getHintForProblem(problemId, userId, hintLevel);
      //   },
      // },

      // =============================================
      // CONCEPT EXPLANATION TOOLS
      // =============================================
      // getConceptExplanation: {
      //   description: "Get detailed explanation of a DSA concept with examples and use cases",
      //   parameters: z.object({
      //     concept: z.string().describe("DSA concept to explain (e.g., 'binary search', 'dynamic programming', 'graph traversal')"),
      //     userLevel: z.enum(["beginner", "intermediate", "advanced"]).optional().describe("Explanation complexity level"),
      //     includeExamples: z.boolean().default(true).describe("Include code examples and problems")
      //   }),
      //   execute: async ({ concept, userLevel, includeExamples }) => {
      //     const userId = session.user!.id;
      //     const level = userLevel || await getUserLevel(userId);
      //     return await getConceptExplanation(concept, level, includeExamples);
      //   },
      // },

      // =============================================
      // PROGRESS UPDATE TOOLS
      // =============================================
      // recordProblemSolved: {
      //   description: "Record that user has successfully solved a problem",
      //   parameters: z.object({
      //     problemId: z.string().describe("Problem ID or name"),
      //     difficulty: z.enum(["easy", "medium", "hard"]).describe("Problem difficulty level"),
      //     timeSpent: z.number().optional().describe("Time spent solving in minutes"),
      //     approach: z.string().optional().describe("Approach or algorithm used"),
      //     notes: z.string().optional().describe("Additional notes or learnings")
      //   }),
      //   execute: async ({ problemId, difficulty, timeSpent, approach, notes }) => {
      //     const userId = session.user!.id;
      //     const result = await updateUserProgress(userId, problemId, {
      //       solved: true,
      //       difficulty,
      //       timeSpent,
      //       approach,
      //       notes,
      //       solvedAt: new Date()
      //     });
          
      //     // Return updated progress summary
      //     const updatedProgress = await getUserProgress(userId, { timeRange: "week" });
      //     return {
      //       success: true,
      //       message: "Great job! Problem marked as solved.",
      //       updatedProgress
      //     };
      //   },
      // },

      // recordStudySession: {
      //   description: "Record a study session or practice activity",
      //   parameters: z.object({
      //     topic: z.string().describe("Topic studied"),
      //     duration: z.number().describe("Study duration in minutes"),
      //     activities: z.array(z.string()).describe("List of activities performed"),
      //     notes: z.string().optional().describe("Session notes or key learnings")
      //   }),
      //   execute: async ({ topic, duration, activities, notes }) => {
      //     const userId = session.user!.id;
      //     // This would be implemented to track study sessions
      //     return {
      //       success: true,
      //       message: `Study session recorded: ${duration} minutes on ${topic}`,
      //       topic,
      //       duration,
      //       activities
      //     };
      //   },
      // },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            externalUserId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save DSA tutor chat:", error);
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "dsa-tutor-stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Chat not found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.externalUserId !== session.user.id) {
      return new Response("Unauthorized to delete this chat", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("DSA tutor chat deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting DSA tutor chat:", error);
    return new Response("An error occurred while deleting the chat", {
      status: 500,
    });
  }
}