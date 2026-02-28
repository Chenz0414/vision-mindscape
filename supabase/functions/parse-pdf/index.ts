import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-pdf-api-url",
};

const DEFAULT_PDF_URL = "http://connect.westd.seetacloud.com:37672/api/v1/parse/upload";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pdfApiUrl = req.headers.get("x-pdf-api-url") || DEFAULT_PDF_URL;
    
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const proxyFormData = new FormData();
    proxyFormData.append("file", file);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2min timeout

    const response = await fetch(pdfApiUrl, {
      method: "POST",
      body: proxyFormData,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PDF parse proxy error:", error);
    const message = error.name === "AbortError" 
      ? "PDF解析服务连接超时，请确认服务是否在线" 
      : error.message;
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
