import { StudyPlanInput, GeneratePlanResponse } from '../types';

// Your Cloudflare Worker URL
const WORKER_URL = 'https://flat-surf-cb0c.shrivastavaankit2006.workers.dev/';

// Build the study plan prompt
function buildPrompt(input: StudyPlanInput): string {
    const today = new Date().toDateString();

    // Format subjects with their specific details
    const formattedSubjects = input.subjects.map(s => {
        let details = `${s.name} (${s.difficulty})`;
        if (s.examDate) {
            try {
                const daysLeft = Math.ceil(
                    (new Date(s.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                details += ` - Exam in ${daysLeft} days (${s.examDate})`;
            } catch (e) {
                // Ignore invalid date parsing
            }
        }
        if (s.dailyHours) {
            details += ` - Allocate ~${s.dailyHours}h/day`;
        }
        return details;
    }).join('\n');

    return `CURRENT DATE: ${today}

INPUT DETAILS:
- Subjects & Constraints:
${formattedSubjects}

- Total Daily Study Budget: ${input.dailyHours} hours (guideline)

Create a detailed day-wise study plan starting from tomorrow.
IMPORTANT: Use actual dates (e.g., "Monday, Dec 12") instead of "Day 1".
Format the output as a Markdown Table.`;
}

const SYSTEM_INSTRUCTION = `You are an expert AI study planner.

Your task is to create a personalized, realistic, and stress-free study plan.

PLANNING RULES:
1. Prioritize subjects with upcoming exams.
2. Respect individual subject daily hour limits if provided.
3. Ensure regular revision.
4. Keep the schedule balanced.
5. Do NOT include 0-hour sessions or days with no study. Only output active study sessions.

OUTPUT FORMAT:
Provide the plan ONLY as a Markdown Table with the following columns:
| Date | Day | Subject | Hours |

Example Row:
| 2024-12-19 | Thursday | Math | 2h |

STRICT CONTENT RULES:
- Subject column: Subject Name ONLY (e.g., "Math"). NO topics, NO chapters, NO activities.
- Do NOT output rows where Hours is "0h" or "No Study".

FINAL OUTPUT REQUIREMENT:
Return ONLY the markdown table. No intros or outros.`;

export const generateStudyPlan = async (input: StudyPlanInput): Promise<GeneratePlanResponse> => {
    try {
        const prompt = buildPrompt(input);

        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                systemInstruction: SYSTEM_INSTRUCTION,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle error from your worker
        if (data.error) {
            throw new Error(data.error);
        }

        // Extract text from Gemini response format
        const plan = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!plan) {
            throw new Error('No response from AI');
        }

        return {
            success: true,
            plan: plan,
        };
    } catch (error) {
        console.error('Error generating study plan:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate study plan',
        };
    }
};
