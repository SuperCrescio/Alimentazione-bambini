import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmnixpdfviwfgijqfvxq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtbml4cGRmdml3ZmdpanFmdnhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTA0NzIsImV4cCI6MjA2NDI2NjQ3Mn0.ogaOu2vXCqgbdpjr0uPd12U1ZxPyFSlMiWXvJpg7fZ8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);