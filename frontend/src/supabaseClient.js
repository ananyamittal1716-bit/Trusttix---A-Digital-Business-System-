import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gszgvadlbmagtbhsyqbn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzemd2YWRsYm1hZ3RiaHN5cWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNDc1MDgsImV4cCI6MjEwNDYyMzUwOH0.cVeE-mpB3A2IaMOFiKZGzAUdB6cEnE1qOFoBNJl46BI';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);