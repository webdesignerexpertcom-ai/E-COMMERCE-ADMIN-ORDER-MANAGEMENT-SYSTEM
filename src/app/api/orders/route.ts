import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

function getEnv(req: Request) {
  return req.headers.get('x-environment') || 'production';
}

export async function GET(req: Request) {
  try {
    const env = getEnv(req);
    const supabase = getSupabaseClient(env);
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json({ success: true, data: orders, environment: env });
  } catch (error) {
    console.error("GET Orders Error:", error);
    return NextResponse.json({ 
      success: true, 
      isDemo: true, 
      data: [
        { id: 'uuid-1', order_id: 'ORD-84920', customer_name: 'Liam Neeson', customer_phone: '9492456488', status: 'delivered', total_amount: 124000, created_at: new Date().toISOString(), items_count: 3 },
      ] 
    });
  }
}

export async function POST(req: Request) {
  try {
    const env = getEnv(req);
    const supabase = getSupabaseClient(env);
    const body = await req.json();

    const orderToCreate = {
      order_id: `ORD-${Math.floor(Math.random() * 90000) + 10000}`,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      shipping_address: body.shippingAddress || { type: 'manual' },
      total_amount: body.totalAmount,
      items_count: body.itemsCount || 1,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([orderToCreate])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data, environment: env });
  } catch (error) {
    console.error("POST Order Error:", error);
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const env = getEnv(req);
    const supabase = getSupabaseClient(env);
    const body = await req.json();
    const { id, status } = body;

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('order_id', id) // We use order_id (ORD-XXXX) as the logical ID in many places
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
}
