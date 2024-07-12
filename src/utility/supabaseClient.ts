import { createClient } from "@refinedev/supabase";

const SUPABASE_URL = "https://sacpcuhbfmpwrkbaxdmu.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhY3BjdWhiZm1wd3JrYmF4ZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA3NTY3MjYsImV4cCI6MjAzNjMzMjcyNn0.pCHasgrkxC6w_XWahIBY-CPDZUBSndfrE8NCFN_qMak";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
  },
});
