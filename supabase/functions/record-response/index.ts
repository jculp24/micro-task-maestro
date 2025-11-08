import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create client with user auth to verify identity
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser()

    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create service role client for database operations (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )


    const { game_type, action_type, response_data, reward_amount, game_session_id } = await req.json()

    console.log('Recording response:', { user_id: user.id, game_type, action_type, reward_amount })

    // Insert individual response
    const { error: responseError } = await supabaseClient
      .from('individual_responses')
      .insert({
        user_id: user.id,
        game_session_id: game_session_id || null,
        game_type,
        action_type,
        response_data,
        reward_earned: reward_amount,
      })

    if (responseError) {
      console.error('Error inserting response:', responseError)
      throw responseError
    }

    // Insert transaction
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'earning',
        amount: reward_amount,
        status: 'completed',
        description: `${game_type} - ${action_type}`,
        metadata: { game_type, action_type, response_data },
      })

    if (transactionError) {
      console.error('Error inserting transaction:', transactionError)
      throw transactionError
    }

    // Get current stats
    const { data: stats, error: statsError } = await supabaseClient
      .from('user_stats')
      .select('balance, total_earned, tasks_completed, earnings_today')
      .eq('user_id', user.id)
      .single()

    if (statsError) {
      console.error('Error fetching stats:', statsError)
      throw statsError
    }

    // Update user stats
    const newBalance = parseFloat(stats.balance) + parseFloat(reward_amount)
    const newTotalEarned = parseFloat(stats.total_earned) + parseFloat(reward_amount)
    const newEarningsToday = parseFloat(stats.earnings_today) + parseFloat(reward_amount)
    const newTasksCompleted = stats.tasks_completed + 1

    const { error: updateError } = await supabaseClient
      .from('user_stats')
      .update({
        balance: newBalance,
        total_earned: newTotalEarned,
        tasks_completed: newTasksCompleted,
        earnings_today: newEarningsToday,
        last_active: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating stats:', updateError)
      throw updateError
    }

    // Update or insert game-specific earnings
    const { data: existingGameEarnings } = await supabaseClient
      .from('game_type_earnings')
      .select('total_earned, actions_completed')
      .eq('user_id', user.id)
      .eq('game_type', game_type)
      .single()

    if (existingGameEarnings) {
      // Update existing record
      const { error: gameEarningsError } = await supabaseClient
        .from('game_type_earnings')
        .update({
          total_earned: parseFloat(existingGameEarnings.total_earned) + parseFloat(reward_amount),
          actions_completed: existingGameEarnings.actions_completed + 1,
          last_played: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('game_type', game_type)

      if (gameEarningsError) {
        console.error('Error updating game earnings:', gameEarningsError)
      }
    } else {
      // Insert new record
      const { error: gameEarningsError } = await supabaseClient
        .from('game_type_earnings')
        .insert({
          user_id: user.id,
          game_type,
          total_earned: reward_amount,
          actions_completed: 1,
          last_played: new Date().toISOString(),
        })

      if (gameEarningsError) {
        console.error('Error inserting game earnings:', gameEarningsError)
      }
    }

    console.log('Response recorded successfully. New balance:', newBalance)

    return new Response(
      JSON.stringify({ 
        success: true, 
        new_balance: newBalance,
        reward_earned: reward_amount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in record-response function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})