import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gvovfqyqwyvicasdfghj.supabase.co'
const supabaseKey = 'sb_p_6e5300f807270e56e4569509890f05e043534954'

export const supabase = createClient(supabaseUrl, supabaseKey)
