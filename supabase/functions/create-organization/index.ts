import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject()
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

  const body = await req.json()
  const {
    orgName, orgPhone, orgAddress, orgCountry, orgState, orgCity,
    user_id, fullName, phone
  } = body

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: orgName,
      phone: orgPhone,
      address: orgAddress,
      country: orgCountry,
      state: orgState,
      city: orgCity
    })
    .select()
    .single()

  if (orgError) return new Response(JSON.stringify({ error: orgError.message }), { status: 400 })

  const { error: linkError } = await supabase
    .from('user_organizations')
    .insert({
      user_id,
      organization_id: org.id,
      role: 'super_admin'
    })

  if (linkError) return new Response(JSON.stringify({ error: linkError.message }), { status: 400 })

  return new Response(JSON.stringify({ organization_id: org.id }), { status: 200 })
})
