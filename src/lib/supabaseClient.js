import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://naxrplktughcemjjbhft.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5heHJwbGt0dWdoY2VtampiaGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDkyMDYsImV4cCI6MjA4ODgyNTIwNn0.8gzamBvq8CGVZa4gPDruzJdZsNEHbCH2CyUsuWdzDqE"

export const supabase = createClient(supabaseUrl, supabaseKey)