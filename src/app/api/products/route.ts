import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Sample Fallback Data
const DUMMY_PRODUCTS = [
  { _id: '1', name: 'Wild Forest Raw Honey', desc: 'Unprocessed & directly from Himalayas', price: 1250.00, oldPrice: 1550.00, tag: '-20%', tagColor: 'bg-rose-500', image: 'https://images.unsplash.com/photo-1587049352847-4d4b1ed74dd4?auto=format&fit=crop&q=80&w=800', status: 'active' },
  { _id: '2', name: 'Extra Virgin Coconut Oil', desc: 'Cold-pressed, unrefined organic oil', price: 850.00, oldPrice: null, tag: 'Bestseller', tagColor: 'bg-indigo-500', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800', status: 'active' },
  { _id: '3', name: 'California Premium Almonds', desc: 'Rich in antioxidants & naturally sweet', price: 950.00, oldPrice: 1100.00, tag: '-15%', tagColor: 'bg-rose-500', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=800', status: 'active' },
  { _id: '4', name: 'Black Chia Seeds Pack', desc: 'High fiber, omega-3 superfood core', price: 350.00, oldPrice: null, tag: 'New Arrival', tagColor: 'bg-emerald-500', image: 'https://images.unsplash.com/photo-1585236270275-fc9ce3bd18bd?auto=format&fit=crop&q=80&w=800', status: 'active' },
];

function getEnv(req: Request) {
  return req.headers.get('x-environment') || 'production';
}

export async function GET(req: Request) {
  try {
    const env = getEnv(req);
    const supabase = getSupabaseClient(env);
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    let displayProducts = (products || []).map(p => ({
      _id: p.id,
      name: p.name,
      desc: p.description,
      price: p.price,
      oldPrice: p.discount_price,
      tag: p.tag,
      tagColor: p.tag_color,
      image: p.images?.[0] || '',
      status: p.status
    }));

    if (displayProducts.length < 4) {
      const remainingCount = 4 - displayProducts.length;
      displayProducts = [...displayProducts, ...DUMMY_PRODUCTS.slice(0, remainingCount)];
    }
    
    return NextResponse.json({ success: true, data: displayProducts, environment: env });
  } catch (error: any) {
    console.error("GET Products Error:", error.message);
    return NextResponse.json({ success: true, isDemo: true, data: DUMMY_PRODUCTS });
  }
}

export async function POST(req: Request) {
  try {
    const env = getEnv(req);
    const supabase = getSupabaseClient(env);
    
    // Safety check for API Keys
    const isPlaceholder = (supabase as any).supabaseKey === 'placeholder_key' || !(supabase as any).supabaseKey;
    if (isPlaceholder) {
      const missingVar = env === 'staging' ? 'STAGING_SUPABASE_ANON_KEY' : 'SUPABASE_ANON_KEY';
      console.error(`🚨 CRITICAL: Supabase API Key is MISSING for environment: ${env}`);
      return NextResponse.json({ 
        success: false, 
        error: `Configuration Error: ${missingVar} is missing in Vercel/Environment Settings.` 
      }, { status: 500 });
    }

    const body = await req.json();

    // 1. Handle Category
    let categoryId = null;
    if (body.category) {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', body.category)
        .single();
      
      if (catData) {
        categoryId = catData.id;
      } else {
        const catSlug = body.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data: newCat, error: newCatError } = await supabase
          .from('categories')
          .insert([{ name: body.category, slug: catSlug }])
          .select()
          .single();
        
        if (!newCatError && newCat) {
          categoryId = newCat.id;
        }
      }
    }

    const slug = body.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);

    const productToCreate = {
      name: body.name,
      slug: slug,
      description: body.description,
      price: body.price,
      discount_price: body.oldPrice || null,
      stock_quantity: body.stock || 0,
      images: body.image ? (Array.isArray(body.image) ? body.image : [body.image]) : [],
      sku: body.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
      tag: body.tag || 'New',
      tag_color: body.tag_color || 'bg-emerald-500',
      status: body.status || 'active',
      category_id: categoryId,
      is_active: body.status === 'active'
    };

    const { data: product, error } = await supabase
      .from('products')
      .insert([productToCreate])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data: product, environment: env }, { status: 201 });
  } catch (error: any) {
    console.error("POST Product Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const env = getEnv(req);
    const supabase = getSupabaseClient(env);
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const mappedUpdates: any = { ...updates };
    if (updates.oldPrice !== undefined) { mappedUpdates.discount_price = updates.oldPrice; delete mappedUpdates.oldPrice; }
    if (updates.stock !== undefined) { mappedUpdates.stock_quantity = updates.stock; delete mappedUpdates.stock; }
    if (updates.image !== undefined) { mappedUpdates.images = [updates.image]; delete mappedUpdates.image; }
    if (updates.desc !== undefined) { mappedUpdates.description = updates.desc; delete mappedUpdates.desc; }

    const { data: product, error } = await supabase
      .from('products')
      .update(mappedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data: product, environment: env });
  } catch (err: any) {
    console.error('PUT Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const env = getEnv(req);
    const supabase = getSupabaseClient(env);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true, message: 'Deleted successfully', environment: env });
  } catch (err: any) {
    console.error('DELETE Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}




