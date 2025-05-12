import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://znveczjbttqoexackpmm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudmVjempidHRxb2V4YWNrcG1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjkzMjIsImV4cCI6MjA2MjY0NTMyMn0.6kLIYL6G5i0A2flLr1FY5WwXS6_5AsJN35iwTT-08UA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
