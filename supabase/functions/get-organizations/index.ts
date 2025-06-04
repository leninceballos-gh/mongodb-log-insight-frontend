import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject()
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get('user_id')

  if (!user_id) return new Response('Missing user_id', { status: 400 })

  const { data, error } = await supabase
    .from('user_organizations')
    .select('organization_id, organizations(name)')
    .eq('user_id', user_id)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })

  const result = data.map((item: any) => ({
    id: item.organization_id,
    name: item.organizations.name
  }))

  return new Response(JSON.stringify(result), { status: 200 })
})
