// Project health edge function
// Provides simple status info and available function list

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const functions = [
      "gemini-chat",
      "gemini-image",
      "generate-blog-content",
      "generate-code",
      "generate-image",
      "generate-website-content",
      "verify-domain",
      "project-health",
    ];

    const payload = {
      status: "ok",
      serverTime: new Date().toISOString(),
      functions,
    };

    return new Response(JSON.stringify(payload), { headers: corsHeaders });
  } catch (err) {
    console.error("project-health error", err);
    return new Response(
      JSON.stringify({ status: "error", message: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
});
