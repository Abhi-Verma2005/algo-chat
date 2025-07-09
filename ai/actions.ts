import { generateObject } from "ai";
import { z } from "zod";

import { geminiFlashModel } from ".";
import { externalDb } from "@/lib/algo-db";
import {
  User,
  UserConfig,
  questions,
  Submission,
  QuestionTag,
  _QuestionToQuestionTagRelations,
  questionToQuestionTag,
  Bookmark,
  _QuestionToQuestionTag,
} from "@/lib/algo-schema";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { isThisWeek, isToday } from "date-fns";


const DIFFICULTY_ORDER = {
  BEGINNER: 1,
  EASY: 2,
  MEDIUM: 3,
  HARD: 4,
  VERYHARD: 5
} as const;
// Types for better error handling
interface DatabaseError extends Error {
  code?: string;
  constraint?: string;
}

interface UserInfo {
  username: string | null;
  leetcodeUsername: string | null;
  enrollmentNum: string | null;
  section: string | null;
  individualPoints: number | null;
  leetcodeQuestionsSolved: number | null;
  codeforcesQuestionsSolved: number | null;
  rank: number | null;
  userBrief: string | null;
}

interface FilteredQuestion {
  id: string;
  title: string;
  slug: string;
  difficulty: 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'VERYHARD';
  points: number;
  leetcodeUrl: string;
  inArena: boolean;
  arenaAddedAt: Date | null;
  index: number;
  isSolved: boolean;
  isBookmarked: boolean;
  questionTags: { name: string }[];
}

interface FilterQuestionsOptions {
  topics: string[];
  userId: string;
  limit?: number;
  unsolvedOnly?: boolean;
}

interface FilterQuestionsResult {
  questionsWithSolvedStatus: FilteredQuestion[];
  individualPoints: number;
}
interface FlightStatusResult {
  flightNumber: string;
  departure: {
    cityName: string;
    airportCode: string;
    airportName: string;
    timestamp: string;
    terminal: string;
    gate: string;
  };
  arrival: {
    cityName: string;
    airportCode: string;
    airportName: string;
    timestamp: string;
    terminal: string;
    gate: string;
  };
  totalDistanceInMiles: number;
}

interface SubmissionDifficulty {
  difficulty: string;
  status: string;
  count: number;
}

interface TagProgress {
  tagName: string;
  totalProblems: number;
  solvedProblems: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export async function generateSampleFlightStatus({
  flightNumber,
  date,
}: {
  flightNumber: string;
  date: string;
}): Promise<FlightStatusResult | null> {
  try {
    if (!flightNumber?.trim() || !date?.trim()) {
      throw new Error("Flight number and date are required");
    }

    const { object: flightStatus } = await generateObject({
      model: geminiFlashModel,
      prompt: `Flight status for flight number ${flightNumber} on ${date}`,
      schema: z.object({
        flightNumber: z.string().describe("Flight number, e.g., BA123, AA31"),
        departure: z.object({
          cityName: z.string().describe("Name of the departure city"),
          airportCode: z.string().describe("IATA code of the departure airport"),
          airportName: z.string().describe("Full name of the departure airport"),
          timestamp: z.string().describe("ISO 8601 departure date and time"),
          terminal: z.string().describe("Departure terminal"),
          gate: z.string().describe("Departure gate"),
        }),
        arrival: z.object({
          cityName: z.string().describe("Name of the arrival city"),
          airportCode: z.string().describe("IATA code of the arrival airport"),
          airportName: z.string().describe("Full name of the arrival airport"),
          timestamp: z.string().describe("ISO 8601 arrival date and time"),
          terminal: z.string().describe("Arrival terminal"),
          gate: z.string().describe("Arrival gate"),
        }),
        totalDistanceInMiles: z
          .number()
          .describe("Total flight distance in miles"),
      }),
    });

    return flightStatus;
  } catch (error) {
    console.error("❌ Failed to generate flight status:", {
      flightNumber,
      date,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Return null or throw based on your error handling strategy
    return null;
  }
}

export async function generateSampleFlightSearchResults({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) {
  try {
    if (!origin?.trim() || !destination?.trim()) {
      throw new Error("Origin and destination are required");
    }

    const { object: flightSearchResults } = await generateObject({
      model: geminiFlashModel,
      prompt: `Generate search results for flights from ${origin} to ${destination}, limit to 4 results`,
      output: "array",
      schema: z.object({
        id: z
          .string()
          .describe("Unique identifier for the flight, like BA123, AA31, etc."),
        departure: z.object({
          cityName: z.string().describe("Name of the departure city"),
          airportCode: z.string().describe("IATA code of the departure airport"),
          timestamp: z.string().describe("ISO 8601 departure date and time"),
        }),
        arrival: z.object({
          cityName: z.string().describe("Name of the arrival city"),
          airportCode: z.string().describe("IATA code of the arrival airport"),
          timestamp: z.string().describe("ISO 8601 arrival date and time"),
        }),
        airlines: z.array(
          z.string().describe("Airline names, e.g., American Airlines, Emirates"),
        ),
        priceInUSD: z.number().describe("Flight price in US dollars"),
        numberOfStops: z.number().describe("Number of stops during the flight"),
      }),
    });

    return { flights: flightSearchResults };
  } catch (error) {
    console.error("❌ Failed to generate flight search results:", {
      origin,
      destination,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Return empty results instead of throwing
    return { flights: [] };
  }
}

export async function generateSampleSeatSelection({
  flightNumber,
}: {
  flightNumber: string;
}) {
  try {
    if (!flightNumber?.trim()) {
      throw new Error("Flight number is required");
    }

    const { object: rows } = await generateObject({
      model: geminiFlashModel,
      prompt: `Simulate available seats for flight number ${flightNumber}, 6 seats on each row and 5 rows in total, adjust pricing based on location of seat`,
      output: "array",
      schema: z.array(
        z.object({
          seatNumber: z.string().describe("Seat identifier, e.g., 12A, 15C"),
          priceInUSD: z
            .number()
            .describe("Seat price in US dollars, less than $99"),
          isAvailable: z
            .boolean()
            .describe("Whether the seat is available for booking"),
        }),
      ),
    });

    return { seats: rows };
  } catch (error) {
    console.error("❌ Failed to generate seat selection:", {
      flightNumber,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return { seats: [] };
  }
}

export async function generateReservationPrice(props: {
  seats: string[];
  flightNumber: string;
  departure: {
    cityName: string;
    airportCode: string;
    timestamp: string;
    gate: string;
    terminal: string;
  };
  arrival: {
    cityName: string;
    airportCode: string;
    timestamp: string;
    gate: string;
    terminal: string;
  };
  passengerName: string;
}) {
  try {
    // Validate required props
    if (!props.seats?.length) {
      throw new Error("At least one seat must be selected");
    }
    if (!props.flightNumber?.trim()) {
      throw new Error("Flight number is required");
    }
    if (!props.passengerName?.trim()) {
      throw new Error("Passenger name is required");
    }

    const { object: reservation } = await generateObject({
      model: geminiFlashModel,
      prompt: `Generate price for the following reservation \n\n ${JSON.stringify(props, null, 2)}`,
      schema: z.object({
        totalPriceInUSD: z
          .number()
          .describe("Total reservation price in US dollars"),
      }),
    });

    return reservation;
  } catch (error) {
    console.error("❌ Failed to generate reservation price:", {
      flightNumber: props.flightNumber,
      seatCount: props.seats?.length || 0,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Return a default price structure
    return { totalPriceInUSD: 0 };
  }
}

export async function getUserProgress(
  userId: string, 
  options: { timeRange?: "week" | "month" | "all" } = {}
) {
  try {
    // Input validation
    if (!userId?.trim()) {
      throw new Error("User ID is required");
    }

    const { timeRange = "all" } = options;
    
    // Validate timeRange
    if (!["week", "month", "all"].includes(timeRange)) {
      throw new Error("Invalid time range. Must be 'week', 'month', or 'all'");
    }
    
    // Calculate date filter based on timeRange
    const dateFilter = getDateFilter(timeRange);
    
    // 1. Get basic user info with LeetCode stats
    
    let userInfo: UserInfo[] | null = null;
    try {
      //@ts-expect-error: no need here
      userInfo = await externalDb
        .select({
          username: User.username,
          leetcodeUsername: User.leetcodeUsername, 
          enrollmentNum: User.enrollmentNum,
          section: User.section,
          individualPoints: User.individualPoints,
          leetcodeQuestionsSolved: UserConfig.leetcode_questions_solved,
          codeforcesQuestionsSolved: UserConfig.codeforces_questions_solved,
          rank: UserConfig.rank,
          userBrief: UserConfig.user_brief
        })
        .from(User)
        .leftJoin(UserConfig, eq(User.email, UserConfig.userEmail))
        .where(eq(User.id, userId))
        .limit(1);

      if (!userInfo || userInfo.length === 0) {
        throw new Error(`User not found with ID: ${userId}`);
      }

    } catch (err) {
      const dbError = err as DatabaseError;
      console.error("❌ Failed to fetch user info:", {
        userId,
        error: dbError.message,
        code: dbError.code,
        constraint: dbError.constraint,
      });
      throw new Error(`Failed to fetch user information: ${dbError.message}`);
    }

    console.log("✅ User Info fetched successfully:", userInfo[0]);

    // 2. Get Submission breakdown by difficulty and tag
    let submissionByDifficulty: SubmissionDifficulty[] = [];
    try {
      submissionByDifficulty = await externalDb
        .select({
          difficulty: questions.difficulty,
          status: Submission.status,
          count: sql<number>`count(*)::int`
        })
        .from(Submission)
        .innerJoin(questions, eq(Submission.questionId, questions.id))
        .where(
          and(
            eq(Submission.userId, userId),
            dateFilter ? gte(Submission.createdAt, dateFilter) : undefined,
            eq(Submission.status, 'ACCEPTED')
          )
        )
        .groupBy(questions.difficulty, Submission.status);

    } catch (err) {
      const dbError = err as DatabaseError;
      console.error("❌ Failed to fetch submission breakdown:", {
        userId,
        timeRange,
        error: dbError.message,
        code: dbError.code,
      });
      // Continue with empty array instead of failing completely
      submissionByDifficulty = [];
    }

    // 3. Get tag-wise progress
    let tagProgress: TagProgress[] = [];
    try {
      tagProgress = await externalDb
        .select({
          tagName: QuestionTag.name,
          totalProblems: sql<number>`count(distinct ${questions.id})::int`,
          solvedProblems: sql<number>`count(distinct case when ${Submission.status} = 'ACCEPTED' then ${questions.id} end)::int`,
          easyCount: sql<number>`count(distinct case when ${questions.difficulty} = 'EASY' and ${Submission.status} = 'ACCEPTED' then ${questions.id} end)::int`,
          mediumCount: sql<number>`count(distinct case when ${questions.difficulty} = 'MEDIUM' and ${Submission.status} = 'ACCEPTED' then ${questions.id} end)::int`,
          hardCount: sql<number>`count(distinct case when ${questions.difficulty} = 'HARD' and ${Submission.status} = 'ACCEPTED' then ${questions.id} end)::int`
        })
        .from(QuestionTag)
        .innerJoin(_QuestionToQuestionTag, eq(_QuestionToQuestionTag.B, QuestionTag.id)) 
        .innerJoin(questions, eq(_QuestionToQuestionTag.A, questions.id))     
        .leftJoin(Submission, and(
          eq(Submission.questionId, questions.id),
          eq(Submission.userId, userId),
          dateFilter ? gte(Submission.createdAt, dateFilter) : undefined
        ))
        .groupBy(QuestionTag.name)
        .orderBy(desc(sql`count(distinct case when ${Submission.status} = 'ACCEPTED' then ${questions.id} end)`));

    } catch (err) {
      const dbError = err as DatabaseError;
      console.error("❌ Failed to fetch tag progress:", {
        userId,
        timeRange,
        error: dbError.message,
        code: dbError.code,
      });
      tagProgress = [];
    }

    // 4. Get recent activity and streaks
    let recentActivity: any[] = [];
    let currentStreak = 0;

    try {
      recentActivity = await getRecentActivity(userId, 30);
    } catch (err) {
      console.error("❌ Failed to fetch recent activity:", {
        userId,
        error: err instanceof Error ? err.message : "Unknown error",
      });
      recentActivity = [];
    }

    try {
      currentStreak = await calculateCurrentStreak(userId);
    } catch (err) {
      console.error("❌ Failed to calculate current streak:", {
        userId,
        error: err instanceof Error ? err.message : "Unknown error",
      });
      currentStreak = 0;
    }

    console.log("✅ User progress fetched successfully for userId:", userId);

    return {
      user: userInfo[0],
      overview: {
        totalSolved: calculateTotalSolved(submissionByDifficulty),
        difficultyBreakdown: formatDifficultyBreakdown(submissionByDifficulty),
        currentStreak,
        timeRange
      },
      tagProgress: tagProgress.map(tag => ({
        ...tag,
        completionRate: tag.totalProblems > 0 ? (tag.solvedProblems / tag.totalProblems) * 100 : 0
      })),
      recentActivity: {
        last30Days: recentActivity,
        thisWeek: recentActivity.filter(activity => 
          activity.createdAt ? isThisWeek(activity.createdAt) : false
        ),
        today: recentActivity.filter(activity => 
          activity.createdAt ? isToday(activity.createdAt) : false
        )
      }
    };
    
  } catch (error) {
    const err = error as Error;
    console.error("❌ Failed to get user progress:", {
      userId,
      timeRange: options.timeRange,
      error: err.message,
      stack: err.stack,
    });
    
    // Re-throw with more context
    throw new Error(`Failed to get user progress for ${userId}: ${err.message}`);
  }
}


export async function getFilteredQuestions(
  options: FilterQuestionsOptions
): Promise<FilterQuestionsResult> {
  try {
    const { topics, userId, limit = 50, unsolvedOnly = false } = options;

    const difficulties = ["BEGINNER", "EASY", "MEDIUM", "HARD", "VERYHARD"]

    // Input validation
    if (!userId?.trim()) {
      throw new Error("User email is required");
    }

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      throw new Error("Topics must be a non-empty array");
    }
    // Validate difficulty values
    const validDifficulties = Object.keys(DIFFICULTY_ORDER) as Array<keyof typeof DIFFICULTY_ORDER>;
    //@ts-expect-error: no need here
    const invalidDifficulties = difficulties.filter(d => !validDifficulties.includes(d));
    if (invalidDifficulties.length > 0) {
      throw new Error(`Invalid difficulties: ${invalidDifficulties.join(', ')}`);
    }

    console.log("🔍 Filtering questions with options:", {
      userId,
      topics: topics.slice(0, 3), // Log first 3 for brevity
      difficulties,
      limit
    });

    // 1. Get user information
    const user = await externalDb
      .select({
        id: User.id,
        email: User.email,
        individualPoints: User.individualPoints
      })
      .from(User)
      .where(eq(User.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      throw new Error(`User not found with id: ${userId}`);
    }

    const userPoints = user[0].individualPoints || 0;

    // 2. Get questions with tags that match criteria
    const filteredQuestions = await externalDb
      .select({
        id: questions.id,
        title: questions.slug,
        slug: questions.slug,
        difficulty: questions.difficulty,
        points: questions.points,
        leetcodeUrl: questions.leetcodeUrl,
        inArena: questions.inArena,
        arenaAddedAt: questions.arenaAddedAt,
        tagName: QuestionTag.name
      })
      .from(questions)
      .innerJoin(questionToQuestionTag, eq(questions.id, questionToQuestionTag.A))
      .innerJoin(QuestionTag, eq(questionToQuestionTag.B, QuestionTag.id))
      .where(
        and(
          eq(questions.inArena, true),
          inArray(QuestionTag.name, topics),
          //@ts-expect-error: no need here
          inArray(questions.difficulty, difficulties)
        )
      )
      .limit(limit)

    // 3. Group questions and collect tags
    const questionMap = new Map<string, FilteredQuestion>();
    
    filteredQuestions.forEach(row => {
      if (!questionMap.has(row.id)) {
        questionMap.set(row.id, {
          id: row.id,
          title: row.title,
          slug: row.slug,
          difficulty: row.difficulty,
          points: row.points,
          leetcodeUrl: row.leetcodeUrl || '',
          inArena: row.inArena || false,
          arenaAddedAt: row.arenaAddedAt,
          index: 0, // Will be set later
          isSolved: false, // Will be set later
          isBookmarked: false, // Will be set later
          questionTags: []
        });
      }
      
      // Add tag to the question
      const question = questionMap.get(row.id)!;
      question.questionTags.push({ name: row.tagName });
    });

    // Convert map to array and sort
    const questionsArray = Array.from(questionMap.values());
    
    // Sort questions following the same logic as Prisma version
    const sortedQuestions = questionsArray.sort((a, b) => {
      const diffA = DIFFICULTY_ORDER[a.difficulty];
      const diffB = DIFFICULTY_ORDER[b.difficulty];
      
      if (diffA !== diffB) {
        return diffA - diffB;
      }
      
      if (!a.arenaAddedAt && !b.arenaAddedAt) return 0;
      if (!a.arenaAddedAt) return 1;
      if (!b.arenaAddedAt) return -1;
      
      return a.arenaAddedAt.getTime() - b.arenaAddedAt.getTime();
    });

    // 4. Get bookmarks for these questions
    const questionIds = sortedQuestions.map(q => q.id);
    
    const bookmarks = await externalDb
      .select({
        questionId: Bookmark.questionId
      })
      .from(Bookmark)
      .where(
        and(
          eq(Bookmark.userId, userId),
          inArray(Bookmark.questionId, questionIds)
        )
      );

    // 5. Get accepted submissions for these questions
    const acceptedSubmissions = await externalDb
      .select({
        questionId: Submission.questionId
      })
      .from(Submission)
      .where(
        and(
          eq(Submission.userId, userId),
          eq(Submission.status, 'ACCEPTED'),
          inArray(Submission.questionId, questionIds)
        )
      );

    // Fetch all submissions for these questions (for unsolvedOnly logic)
    let allSubmittedQuestionIds: Set<string> = new Set();
    if (unsolvedOnly) {
      const allSubmissions = await externalDb
        .select({
          questionId: Submission.questionId
        })
        .from(Submission)
        .where(
          and(
            eq(Submission.userId, userId),
            inArray(Submission.questionId, questionIds)
          )
        );
      allSubmittedQuestionIds = new Set(allSubmissions.map(sub => sub.questionId));
    }

    // 6. Create sets for quick lookup
    const solvedQuestionIds = new Set(acceptedSubmissions.map(sub => sub.questionId));
    const bookmarkedQuestionIds = new Set(bookmarks.map(bookmark => bookmark.questionId));

    // 7. Add solved and bookmarked status, and set index
    let questionsWithSolvedStatus = sortedQuestions.map((question, index) => ({
      ...question,
      index: index,
      isSolved: solvedQuestionIds.has(question.id),
      isBookmarked: bookmarkedQuestionIds.has(question.id)
    }));

    // If unsolvedOnly is true, filter out any question with any submission
    if (unsolvedOnly) {
      questionsWithSolvedStatus = questionsWithSolvedStatus.filter(q => !allSubmittedQuestionIds.has(q.id));
    }

    console.log("✅ Filtered questions successfully:", {
      totalQuestions: questionsWithSolvedStatus.length,
      userPoints
    });

    return {
      questionsWithSolvedStatus,
      individualPoints: userPoints
    };

  } catch (error) {
    const err = error as Error;
    console.error("❌ Failed to get filtered questions:", {
      userId: options.userId,
      error: err.message,
      stack: err.stack,
    });
    
    throw new Error(`Failed to get filtered questions: ${err.message}`);
  }
}

// Calculate total solved problems from difficulty breakdown
function calculateTotalSolved(submissionByDifficulty: SubmissionDifficulty[]): number {
  try {
    return submissionByDifficulty
      .filter(sub => sub?.status === 'ACCEPTED')
      .reduce((total, sub) => total + (sub?.count || 0), 0);
  } catch (error) {
    console.error("❌ Error calculating total solved:", error);
    return 0;
  }
}

export async function getTags() {
  try {
    const tags = await externalDb
      .select({
        name: QuestionTag.name
      })
      .from(QuestionTag)
      .orderBy(desc(QuestionTag.createdAt));

    return tags;
  } catch (error) {
    console.error("❌ Failed to fetch tags:", error);
    throw new Error("Failed to fetch tags");
  }
}

// Calculate current streak - consecutive days with accepted Submission
async function calculateCurrentStreak(userId: string): Promise<number> {
  try {
    if (!userId?.trim()) {
      throw new Error("User ID is required for streak calculation");
    }

    // Get all submission dates (accepted only) ordered by date desc
    const submissionDates = await externalDb
      .select({
        date: sql<string>`DATE(${Submission.createdAt})`
      })
      .from(Submission)
      .where(
        and(
          eq(Submission.userId, userId),
          eq(Submission.status, 'ACCEPTED')
        )
      )
      .groupBy(sql`DATE(${Submission.createdAt})`)
      .orderBy(desc(sql`DATE(${Submission.createdAt})`));

    if (!submissionDates || submissionDates.length === 0) {
      return 0;
    }

    let streak = 0;
    const today = new Date();
    
    // Check if user solved today or yesterday (streak can continue from yesterday)
    const mostRecentDate = submissionDates[0]?.date;
    if (!mostRecentDate) return 0;

    const daysDiff = Math.floor((today.getTime() - new Date(mostRecentDate).getTime()) / (1000 * 60 * 60 * 24));
    
    // If last submission was more than 1 day ago, streak is broken
    if (daysDiff > 1) return 0;
    
    // Calculate consecutive days
    let expectedDate = new Date(mostRecentDate);
    
    for (const submission of submissionDates) {
      if (!submission?.date) continue;
      
      const submissionDate = new Date(submission.date);
      
      if (submissionDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;

  } catch (error) {
    const err = error as DatabaseError;
    console.error("❌ Failed to calculate current streak:", {
      userId,
      error: err.message,
      code: err.code,
      stack: err.stack,
    });
    return 0;
  }
}

// Get recent activity with submission details
export async function getRecentActivity(userId: string, days: number) {
  try {
    if (!userId?.trim()) {
      throw new Error("User ID is required");
    }
    
    if (!days || days <= 0) {
      throw new Error("Days must be a positive number");
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const activities = await externalDb
      .select({
        id: Submission.id,
        questionId: Submission.questionId,
        status: Submission.status,
        score: Submission.score,
        createdAt: Submission.createdAt,
        // Question details
        leetcodeUrl: questions.leetcodeUrl,
        questionSlug: questions.slug,
        difficulty: questions.difficulty,
        points: questions.points,
      })
      .from(Submission)
      .innerJoin(questions, eq(Submission.questionId, questions.id))
      .where(
        and(
          eq(Submission.userId, userId),
          gte(Submission.createdAt, cutoffDate)
        )
      )
      .orderBy(desc(Submission.createdAt));

    return activities.map(activity => ({
      ...activity,
      platform: activity.leetcodeUrl ? 'LEETCODE' : 'CODEFORCES',
      wasAccepted: activity.status === 'ACCEPTED'
    }));

  } catch (error) {
    const err = error as DatabaseError;
    console.error("❌ Failed to get recent activity:", {
      userId,
      days,
      error: err.message,
      code: err.code,
      stack: err.stack,
    });
    
    // Return empty array instead of throwing
    return [];
  }
}

// Format difficulty breakdown from Submission data
function formatDifficultyBreakdown(submissions: SubmissionDifficulty[]) {
  try {
    const breakdown = {
      BEGINNER: { solved: 0, attempted: 0 },
      EASY: { solved: 0, attempted: 0 },
      MEDIUM: { solved: 0, attempted: 0 },
      HARD: { solved: 0, attempted: 0 },
      VERYHARD: { solved: 0, attempted: 0 }
    };

    submissions.forEach(sub => {
      if (!sub?.difficulty) return;
      
      const difficulty = sub.difficulty as keyof typeof breakdown;
      if (breakdown[difficulty]) {
        breakdown[difficulty].attempted += sub.count || 0;
        if (sub.status === 'ACCEPTED') {
          breakdown[difficulty].solved += sub.count || 0;
        }
      }
    });

    // Calculate success rates and return formatted stats
    return Object.entries(breakdown).map(([difficulty, stats]) => ({
      difficulty,
      solved: stats.solved,
      attempted: stats.attempted,
      successRate: stats.attempted > 0 ? Math.round((stats.solved / stats.attempted) * 100) : 0
    })).filter(stat => stat.attempted > 0);

  } catch (error) {
    console.error("❌ Error formatting difficulty breakdown:", error);
    return [];
  }
}

// Get date filter based on time range
function getDateFilter(timeRange: string): Date | null {
  try {
    const now = new Date();
    
    switch (timeRange) {
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return weekAgo;
        
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return monthAgo;
        
      case 'all':
      default:
        return null;
    }
  } catch (error) {
    console.error("❌ Error creating date filter:", {
      timeRange,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}

// Get user context for system prompt templating
export async function getUserContextForPrompt(userId: string) {
  try {
    // Input validation
    if (!userId?.trim()) {
      throw new Error("User ID is required");
    }

    console.log("🔍 Getting user context for prompt templating:", { userId });

    // 1. Get basic user info with LeetCode stats
    const userInfo = await externalDb
      .select({
        username: User.username,
        leetcodeUsername: User.leetcodeUsername, 
        enrollmentNum: User.enrollmentNum,
        section: User.section,
        individualPoints: User.individualPoints,
        leetcodeQuestionsSolved: UserConfig.leetcode_questions_solved,
        codeforcesQuestionsSolved: UserConfig.codeforces_questions_solved,
        rank: UserConfig.rank,
        userBrief: UserConfig.user_brief
      })
      .from(User)
      .leftJoin(UserConfig, eq(User.email, UserConfig.userEmail))
      .where(eq(User.id, userId))
      .limit(1);

    if (!userInfo || userInfo.length === 0) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    const user = userInfo[0];

    // 2. Get recent submission activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSubmissions = await externalDb
      .select({
        questionId: Submission.questionId,
        status: Submission.status,
        score: Submission.score,
        createdAt: Submission.createdAt,
        difficulty: questions.difficulty,
        slug: questions.slug,
        title: questions.slug, // Using slug as title
        tagName: QuestionTag.name
      })
      .from(Submission)
      .innerJoin(questions, eq(Submission.questionId, questions.id))
      .leftJoin(_QuestionToQuestionTag, eq(questions.id, _QuestionToQuestionTag.A))
      .leftJoin(QuestionTag, eq(_QuestionToQuestionTag.B, QuestionTag.id))
      .where(
        and(
          eq(Submission.userId, userId),
          gte(Submission.createdAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(Submission.createdAt))
      .limit(50);

    // 3. Get current streak
    const currentStreak = await calculateCurrentStreak(userId);

    // 4. Get tag-wise progress for context
    const tagProgress = await externalDb
      .select({
        tagName: QuestionTag.name,
        totalProblems: sql<number>`count(distinct ${questions.id})::int`,
        solvedProblems: sql<number>`count(distinct case when ${Submission.status} = 'ACCEPTED' then ${questions.id} end)::int`,
        easyCount: sql<number>`count(distinct case when ${questions.difficulty} = 'EASY' and ${Submission.status} = 'ACCEPTED' then ${questions.id} end)::int`,
        mediumCount: sql<number>`count(distinct case when ${questions.difficulty} = 'MEDIUM' and ${Submission.status} = 'ACCEPTED' then ${questions.id} end)::int`,
        hardCount: sql<number>`count(distinct case when ${questions.difficulty} = 'HARD' and ${Submission.status} = 'ACCEPTED' then ${questions.id} end)::int`
      })
      .from(QuestionTag)
      .innerJoin(_QuestionToQuestionTag, eq(_QuestionToQuestionTag.B, QuestionTag.id)) 
      .innerJoin(questions, eq(_QuestionToQuestionTag.A, questions.id))     
      .leftJoin(Submission, and(
        eq(Submission.questionId, questions.id),
        eq(Submission.userId, userId)
      ))
      .groupBy(QuestionTag.name)
      .orderBy(desc(sql`count(distinct case when ${Submission.status} = 'ACCEPTED' then ${questions.id} end)`))
      .limit(10);

    // 5. Get bookmarked questions for context
    const bookmarkedQuestions = await externalDb
      .select({
        questionId: Bookmark.questionId,
        slug: questions.slug,
        difficulty: questions.difficulty,
        tagName: QuestionTag.name
      })
      .from(Bookmark)
      .innerJoin(questions, eq(Bookmark.questionId, questions.id))
      .leftJoin(_QuestionToQuestionTag, eq(questions.id, _QuestionToQuestionTag.A))
      .leftJoin(QuestionTag, eq(_QuestionToQuestionTag.B, QuestionTag.id))
      .where(eq(Bookmark.userId, userId))
      .limit(20);

    // 6. Calculate difficulty breakdown
    const difficultyBreakdown = await externalDb
      .select({
        difficulty: questions.difficulty,
        status: Submission.status,
        count: sql<number>`count(*)::int`
      })
      .from(Submission)
      .innerJoin(questions, eq(Submission.questionId, questions.id))
      .where(
        and(
          eq(Submission.userId, userId),
          eq(Submission.status, 'ACCEPTED')
        )
      )
      .groupBy(questions.difficulty, Submission.status);

    // Process and structure the data
    const totalSolved = difficultyBreakdown.reduce((sum, item) => sum + (item.count || 0), 0);
    
    const recentActivity = recentSubmissions.map(sub => ({
      question: sub.title,
      difficulty: sub.difficulty,
      status: sub.status,
      score: sub.score,
      date: sub.createdAt,
      tags: sub.tagName ? [sub.tagName] : []
    }));

    const topTags = tagProgress.map(tag => ({
      name: tag.tagName,
      solved: tag.solvedProblems,
      total: tag.totalProblems,
      completionRate: tag.totalProblems > 0 ? (tag.solvedProblems / tag.totalProblems) * 100 : 0,
      breakdown: {
        easy: tag.easyCount,
        medium: tag.mediumCount,
        hard: tag.hardCount
      }
    }));

    const bookmarks = bookmarkedQuestions.map(b => ({
      question: b.slug,
      difficulty: b.difficulty,
      tags: b.tagName ? [b.tagName] : []
    }));

    // Determine user level based on solved problems
    let userLevel = "Beginner";
    if (totalSolved >= 100) userLevel = "Advanced";
    else if (totalSolved >= 50) userLevel = "Intermediate";
    else if (totalSolved >= 20) userLevel = "Novice";

    // Get weak areas (tags with low completion rate)
    const weakAreas = topTags
      .filter(tag => tag.completionRate < 50 && tag.total > 5)
      .slice(0, 3)
      .map(tag => tag.name);

    // Get strong areas (tags with high completion rate)
    const strongAreas = topTags
      .filter(tag => tag.completionRate > 70 && tag.solved > 3)
      .slice(0, 3)
      .map(tag => tag.name);

    console.log("✅ User context fetched successfully for prompt templating");

    return {
      user: {
        username: user.username,
        leetcodeUsername: user.leetcodeUsername,
        section: user.section,
        enrollmentNum: user.enrollmentNum,
        individualPoints: user.individualPoints || 0,
        rank: user.rank || 'novice_1',
        userBrief: user.userBrief || 'Just started focusing on DSA to build problem-solving skills for placements.',
        level: userLevel,
        totalSolved,
        currentStreak
      },
      recentActivity: {
        submissions: recentActivity,
        count: recentActivity.length
      },
      progress: {
        topTags,
        weakAreas,
        strongAreas,
        difficultyBreakdown: formatDifficultyBreakdown(difficultyBreakdown)
      },
      bookmarks: {
        questions: bookmarks,
        count: bookmarks.length
      },
      stats: {
        leetcodeSolved: user.leetcodeQuestionsSolved || 0,
        codeforcesSolved: user.codeforcesQuestionsSolved || 0,
        totalSolved,
        currentStreak
      }
    };

  } catch (error) {
    const err = error as Error;
    console.error("❌ Failed to get user context for prompt:", {
      userId,
      error: err.message,
      stack: err.stack,
    });
    
    // Return a minimal context instead of throwing
    return {
      user: {
        username: "Unknown",
        leetcodeUsername: null,
        section: null,
        enrollmentNum: null,
        individualPoints: 0,
        rank: 'novice_1',
        userBrief: 'Just started focusing on DSA to build problem-solving skills for placements.',
        level: "Beginner",
        totalSolved: 0,
        currentStreak: 0
      },
      recentActivity: {
        submissions: [],
        count: 0
      },
      progress: {
        topTags: [],
        weakAreas: [],
        strongAreas: [],
        difficultyBreakdown: {
          BEGINNER: { solved: 0, attempted: 0 },
          EASY: { solved: 0, attempted: 0 },
          MEDIUM: { solved: 0, attempted: 0 },
          HARD: { solved: 0, attempted: 0 },
          VERYHARD: { solved: 0, attempted: 0 }
        }
      },
      bookmarks: {
        questions: [],
        count: 0
      },
      stats: {
        leetcodeSolved: 0,
        codeforcesSolved: 0,
        totalSolved: 0,
        currentStreak: 0
      }
    };
  }
}