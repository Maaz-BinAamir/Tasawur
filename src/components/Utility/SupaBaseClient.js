import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kwebqbdcvbwonprlzwuy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3ZWJxYmRjdmJ3b25wcmx6d3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0NDUxNDIsImV4cCI6MjA0ODAyMTE0Mn0.urhzDnWoKR14FmLG58bNCZ5-l-SEOhpG0Lk1-DI2vG8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
