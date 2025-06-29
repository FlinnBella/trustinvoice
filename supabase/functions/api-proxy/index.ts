/*
  # API Proxy Function
  
  This edge function provides API utilities for Pro and Premium users
  with rate limiting and authentication.
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface ApiRequest {
  endpoint: string;
  method: string;
  data?: any;
  apiKey?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Validate API key and get user info
    const keyHash = await hashApiKey(apiKey);
    const { data: keyData, error: keyError } = await supabaseClient
      .from('api_keys')
      .select('user_id, permissions, is_active, rate_limit')
      .eq('key_hash', keyHash)
      .single();

    if (keyError || !keyData || !keyData.is_active) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Check rate limiting
    const rateLimitPassed = await checkRateLimit(supabaseClient, keyHash, keyData.rate_limit);
    if (!rateLimitPassed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: corsHeaders }
      );
    }

    // Log API usage
    await logApiUsage(supabaseClient, keyHash, req.url);

    // Get user plan
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('plan')
      .eq('id', keyData.user_id)
      .single();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    const userPlan = userData.plan || 'basic';

    // Parse request
    const url = new URL(req.url);
    const endpoint = url.pathname.replace('/functions/v1/api-proxy', '');
    const requestData = req.method !== 'GET' ? await req.json() : null;

    // Route to appropriate handler
    let response;
    switch (endpoint) {
      case '/contracts/deploy':
        response = await handleContractDeploy(supabaseClient, keyData.user_id, userPlan, requestData);
        break;
      case '/contracts/status':
        response = await handleContractStatus(supabaseClient, keyData.user_id, url.searchParams);
        break;
      case '/invoices/create':
        response = await handleInvoiceCreate(supabaseClient, keyData.user_id, userPlan, requestData);
        break;
      case '/invoices/analytics':
        response = await handleInvoiceAnalytics(supabaseClient, keyData.user_id, userPlan, url.searchParams);
        break;
      case '/invoices/export':
        response = await handleInvoiceExport(supabaseClient, keyData.user_id, userPlan, url.searchParams);
        break;
      case '/webhooks/create':
        response = await handleWebhookCreate(supabaseClient, keyData.user_id, userPlan, requestData);
        break;
      case '/gas/estimate':
        response = await handleGasEstimate(requestData);
        break;
      default:
        response = { error: 'Endpoint not found', status: 404 };
    }

    return new Response(
      JSON.stringify(response),
      {
        status: response.status || 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('API proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkRateLimit(supabase: any, keyHash: string, limit: number): Promise<boolean> {
  const windowStart = new Date(Date.now() - 3600000); // 1 hour ago
  
  const { count, error } = await supabase
    .from('api_usage')
    .select('*', { count: 'exact', head: true })
    .eq('key_hash', keyHash)
    .gte('created_at', windowStart.toISOString());

  if (error) return false;
  return (count || 0) < limit;
}

async function logApiUsage(supabase: any, keyHash: string, endpoint: string): Promise<void> {
  await supabase
    .from('api_usage')
    .insert({ key_hash: keyHash, endpoint });

  await supabase.rpc('increment_usage', { key_hash: keyHash });
}

async function handleContractDeploy(supabase: any, userId: string, plan: string, data: any): Promise<any> {
  if (plan === 'basic') {
    return { error: 'Contract deployment requires Pro or Premium plan', status: 403 };
  }

  try {
    // Simulate contract deployment (replace with actual blockchain interaction)
    const contractAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    // Log deployment
    await supabase
      .from('contract_deployments')
      .insert({
        user_id: userId,
        contract_type: data.type || 'invoice',
        contract_address: contractAddress,
        transaction_hash: txHash,
        network: data.network || 'ethereum',
        parameters: data.parameters || {},
        status: 'confirmed'
      });

    return {
      success: true,
      contractAddress,
      transactionHash: txHash,
      network: data.network || 'ethereum'
    };
  } catch (error) {
    return { error: 'Contract deployment failed', status: 500 };
  }
}

async function handleContractStatus(supabase: any, userId: string, params: URLSearchParams): Promise<any> {
  const contractAddress = params.get('address');
  if (!contractAddress) {
    return { error: 'Contract address required', status: 400 };
  }

  const { data, error } = await supabase
    .from('contract_deployments')
    .select('*')
    .eq('user_id', userId)
    .eq('contract_address', contractAddress)
    .single();

  if (error || !data) {
    return { error: 'Contract not found', status: 404 };
  }

  return {
    address: data.contract_address,
    status: data.status,
    network: data.network,
    transactionHash: data.transaction_hash,
    createdAt: data.created_at
  };
}

async function handleInvoiceCreate(supabase: any, userId: string, plan: string, data: any): Promise<any> {
  try {
    // Check invoice limits
    const limits = getInvoiceLimits(plan);
    const currentCount = await getUserInvoiceCount(supabase, userId);
    
    if (currentCount >= limits.monthly && plan !== 'premium') {
      return { error: `Monthly invoice limit reached (${limits.monthly})`, status: 403 };
    }

    // Create invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        ...data,
        user_email: userId,
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, invoice };
  } catch (error) {
    return { error: 'Invoice creation failed', status: 500 };
  }
}

async function handleInvoiceAnalytics(supabase: any, userId: string, plan: string, params: URLSearchParams): Promise<any> {
  if (plan === 'basic') {
    return { error: 'Analytics requires Pro or Premium plan', status: 403 };
  }

  const timeframe = params.get('timeframe') || '30d';
  const startDate = getStartDate(timeframe);

  const { data, error } = await supabase
    .from('invoices')
    .select('amount, status, created_at, due_date')
    .eq('user_email', userId)
    .gte('created_at', startDate.toISOString());

  if (error) {
    return { error: 'Failed to fetch analytics', status: 500 };
  }

  return processAnalyticsData(data);
}

async function handleInvoiceExport(supabase: any, userId: string, plan: string, params: URLSearchParams): Promise<any> {
  if (plan === 'basic') {
    return { error: 'Data export requires Pro or Premium plan', status: 403 };
  }

  const format = params.get('format') || 'csv';
  
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_email', userId);

  if (error) {
    return { error: 'Export failed', status: 500 };
  }

  if (format === 'csv') {
    return { data: convertToCSV(data), contentType: 'text/csv' };
  } else {
    return { data: JSON.stringify(data, null, 2), contentType: 'application/json' };
  }
}

async function handleWebhookCreate(supabase: any, userId: string, plan: string, data: any): Promise<any> {
  if (plan === 'basic') {
    return { error: 'Webhooks require Pro or Premium plan', status: 403 };
  }

  try {
    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert({
        user_id: userId,
        url: data.url,
        events: data.events,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, webhookId: webhook.id };
  } catch (error) {
    return { error: 'Webhook creation failed', status: 500 };
  }
}

async function handleGasEstimate(data: any): Promise<any> {
  // Simulate gas estimation (replace with actual blockchain interaction)
  const baseGas = 21000;
  const operationGas = {
    'createInvoice': 150000,
    'payInvoice': 80000,
    'releaseEscrow': 60000,
    'refundInvoice': 60000
  };

  const estimatedGas = baseGas + (operationGas[data.operation] || 100000);
  const gasPrice = 20; // 20 gwei
  const estimatedCost = (estimatedGas * gasPrice) / 1e9; // in ETH

  return {
    estimatedGas,
    gasPrice,
    estimatedCost: estimatedCost.toFixed(6),
    currency: 'ETH'
  };
}

// Helper functions
function getInvoiceLimits(plan: string): { monthly: number } {
  const limits = {
    basic: { monthly: 10 },
    pro: { monthly: 100 },
    premium: { monthly: Infinity }
  };
  return limits[plan as keyof typeof limits] || limits.basic;
}

async function getUserInvoiceCount(supabase: any, userId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('user_email', userId)
    .gte('created_at', startOfMonth.toISOString());

  return count || 0;
}

function getStartDate(timeframe: string): Date {
  const now = new Date();
  switch (timeframe) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function processAnalyticsData(data: any[]): any {
  const totalAmount = data.reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0);
  const paidInvoices = data.filter(invoice => invoice.status === 'paid');
  const overdueInvoices = data.filter(invoice => 
    invoice.status !== 'paid' && new Date(invoice.due_date) < new Date()
  );

  return {
    totalInvoices: data.length,
    totalAmount,
    paidAmount: paidInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0),
    paidCount: paidInvoices.length,
    overdueCount: overdueInvoices.length,
    averageAmount: totalAmount / data.length || 0,
    paymentRate: (paidInvoices.length / data.length) * 100 || 0
  };
}

function convertToCSV(data: any[]): string {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(',')
    )
  ].join('\n');
  
  return csvContent;
}