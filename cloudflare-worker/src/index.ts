/**
 * Smart Study Planner - Cloudflare Worker
 * Flexible proxy for Gemini API
 */

interface Env {
    GEMINI_API_KEY: string;
}

// CORS headers for frontend access
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS preflight requests
function handleOptions(): Response {
    return new Response(null, {
        headers: corsHeaders,
    });
}

// Call Gemini API
async function callGeminiAPI(prompt: string, systemInstruction: string, apiKey: string): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const body: any = {
        contents: [
            {
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
        ],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
        },
    };

    if (systemInstruction) {
        body.systemInstruction = {
            parts: [
                {
                    text: systemInstruction,
                },
            ],
        };
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    return response.json();
}

// Main request handler
export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return handleOptions();
        }

        // Handle POST request (Root path to match api.ts)
        if (request.method === 'POST') {
            try {
                // Check for API key
                if (!env.GEMINI_API_KEY) {
                    return new Response(
                        JSON.stringify({ error: 'API key not configured' }),
                        {
                            status: 500,
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders,
                            },
                        }
                    );
                }

                // Parse request body
                const body = await request.json() as { prompt: string; systemInstruction: string };

                // Validate request
                if (!body.prompt) {
                    return new Response(
                        JSON.stringify({ error: 'Prompt is required' }),
                        {
                            status: 400,
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders,
                            },
                        }
                    );
                }

                // Call Gemini API
                const data = await callGeminiAPI(body.prompt, body.systemInstruction, env.GEMINI_API_KEY);

                // Return raw Gemini response to match api.ts expectations
                return new Response(
                    JSON.stringify(data),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders,
                        },
                    }
                );
            } catch (error) {
                console.error('Error handling request:', error);
                return new Response(
                    JSON.stringify({
                        error: error instanceof Error ? error.message : 'Internal Server Error',
                    }),
                    {
                        status: 500,
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders,
                        },
                    }
                );
            }
        }

        // Health check endpoint (GET)
        if (request.method === 'GET') {
            return new Response(
                JSON.stringify({ status: 'ok', message: 'Smart Study Planner API Proxy' }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                }
            );
        }

        // 404 for unknown routes/methods
        return new Response(
            JSON.stringify({ error: 'Not found' }),
            {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            }
        );
    },
};
