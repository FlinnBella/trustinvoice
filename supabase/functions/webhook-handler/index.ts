/*
  # Resend Webhook Handler
  
  Handles webhook events from Resend for email tracking
  (opens, clicks, deliveries, bounces, etc.)
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, resend-webhook-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify webhook signature (basic implementation)
    const signature = req.headers.get('resend-webhook-signature');
    if (!signature) {
      return new Response('Unauthorized', { status: 401 });
    }

    const webhookData = await req.json();
    const { type, data } = webhookData;

    // Process different webhook events
    switch (type) {
      case 'email.sent':
        await handleEmailSent(supabaseClient, data);
        break;
      
      case 'email.delivered':
        await handleEmailDelivered(supabaseClient, data);
        break;
      
      case 'email.opened':
        await handleEmailOpened(supabaseClient, data);
        break;
      
      case 'email.clicked':
        await handleEmailClicked(supabaseClient, data);
        break;
      
      case 'email.bounced':
        await handleEmailBounced(supabaseClient, data);
        break;
      
      case 'email.complained':
        await handleEmailComplained(supabaseClient, data);
        break;
      
      default:
        console.log('Unhandled webhook type:', type);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function handleEmailSent(supabase: any, data: any) {
  await updateEmailLog(supabase, data.email_id, {
    status: 'sent',
    sent_at: data.created_at
  });
}

async function handleEmailDelivered(supabase: any, data: any) {
  await updateEmailLog(supabase, data.email_id, {
    status: 'delivered',
    delivered_at: data.created_at
  });
}

async function handleEmailOpened(supabase: any, data: any) {
  // Log email open event
  await supabase
    .from('email_events')
    .insert({
      email_id: data.email_id,
      event_type: 'opened',
      timestamp: data.created_at,
      user_agent: data.user_agent,
      ip_address: data.ip
    });

  // Update email log with first open
  const { data: existingLog } = await supabase
    .from('email_logs')
    .select('opened_at')
    .eq('email_id', data.email_id)
    .single();

  if (existingLog && !existingLog.opened_at) {
    await updateEmailLog(supabase, data.email_id, {
      opened_at: data.created_at,
      open_count: 1
    });
  } else {
    // Increment open count
    await supabase.rpc('increment_open_count', { email_id: data.email_id });
  }
}

async function handleEmailClicked(supabase: any, data: any) {
  // Log email click event
  await supabase
    .from('email_events')
    .insert({
      email_id: data.email_id,
      event_type: 'clicked',
      timestamp: data.created_at,
      url: data.link.url,
      user_agent: data.user_agent,
      ip_address: data.ip
    });

  // Update email log with first click
  const { data: existingLog } = await supabase
    .from('email_logs')
    .select('clicked_at')
    .eq('email_id', data.email_id)
    .single();

  if (existingLog && !existingLog.clicked_at) {
    await updateEmailLog(supabase, data.email_id, {
      clicked_at: data.created_at,
      click_count: 1
    });
  } else {
    // Increment click count
    await supabase.rpc('increment_click_count', { email_id: data.email_id });
  }
}

async function handleEmailBounced(supabase: any, data: any) {
  await updateEmailLog(supabase, data.email_id, {
    status: 'bounced',
    bounced_at: data.created_at,
    bounce_reason: data.bounce?.type || 'unknown'
  });

  // Log bounce event
  await supabase
    .from('email_events')
    .insert({
      email_id: data.email_id,
      event_type: 'bounced',
      timestamp: data.created_at,
      bounce_type: data.bounce?.type,
      bounce_reason: data.bounce?.reason
    });
}

async function handleEmailComplained(supabase: any, data: any) {
  await updateEmailLog(supabase, data.email_id, {
    status: 'complained',
    complained_at: data.created_at
  });

  // Log complaint event
  await supabase
    .from('email_events')
    .insert({
      email_id: data.email_id,
      event_type: 'complained',
      timestamp: data.created_at
    });
}

async function updateEmailLog(supabase: any, emailId: string, updates: any) {
  try {
    await supabase
      .from('email_logs')
      .update(updates)
      .eq('email_id', emailId);
  } catch (error) {
    console.error('Failed to update email log:', error);
  }
}