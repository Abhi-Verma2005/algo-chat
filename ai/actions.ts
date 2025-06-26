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
  questionTagMap,
} from "@/lib/algo-schema";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { isThisWeek, isToday } from "date-fns";

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
    console.log("Fetching user info for userId:", userId);
    
    let userInfo: UserInfo[] | null = null;
    try {
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
        .innerJoin(questions, eq(questionTagMap.tagId, QuestionTag.id))
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