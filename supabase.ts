
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pymirgtaivndzfxuxgbn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bWlyZ3RhaXZuZHpmeHV4Z2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyODcxNjksImV4cCI6MjA4NTg2MzE2OX0.YgIlISq43wIApNGTCP4Rhj8tYe6ScSSF0G2PQxNJjFU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
