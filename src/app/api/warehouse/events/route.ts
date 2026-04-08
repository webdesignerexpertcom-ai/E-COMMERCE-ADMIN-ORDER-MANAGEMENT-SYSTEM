import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function getEnv(req: Request) {
  return req.headers.get('x-environment') || 'production';
}

export async function GET(req: Request) {
  try {
    const env = getEnv(req);
    const supabase = getSupabaseClient(env);
    
    const { data: events, error } = await supabase
      .from('warehouse_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("GET Warehouse Events Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const env = getEnv(req);
    const supabase = getSupabaseClient(env);
    const body = await req.json();

    const { data: event, error } = await supabase
      .from('warehouse_events')
      .insert([
        {
          sku: body.sku,
          type: body.type,
          amount: body.amount,
          performer: body.performer || 'System',
          notes: body.notes || ''
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("POST Warehouse Event Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
