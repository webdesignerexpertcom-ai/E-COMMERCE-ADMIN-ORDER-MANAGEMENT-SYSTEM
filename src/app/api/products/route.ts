import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// Helper: safely extract a string message from any thrown value (including Supabase error objects)
function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as Record<string, unknown>).message);
  }
  return String(err);
}

export const dynamic = 'force-dynamic';

// Sample Fallback Data
const DUMMY_PRODUCTS = [
  { _id: '1', name: 'Wild Forest Raw Honey', desc: 'Unprocessed & directly from Himalayas', price: 1250.00, oldPrice: 1550.00, tag: '-20%', tagColor: 'bg-rose-500', image: 'https://images.unsplash.com/photo-1587049352847-4d4b1ed74dd4?auto=format&fit=crop&q=80&w=800', status: 'active' },
  { _id: '2', name: 'Extra Virgin Coconut Oil', desc: 'Cold-pressed, unrefined organic oil', price: 850.00, oldPrice: null, tag: 'Bestseller', tagColor: 'bg-indigo-500', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800', status: 'active' },
  { _id: '3', name: 'California Premium Almonds', desc: 'Rich in antioxidants & naturally sweet', price: 950.00, oldPrice: 1100.00, tag: '-15%', tagColor: 'bg-rose-500', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=800', status: 'active' },
  { _id: '4', name: 'Black Chia Seeds Pack', desc: 'High fiber, omega-3 superfood core', price: 350.00, oldPrice: null, tag: 'New Arrival', tagColor: 'bg-emerald-500', image: 'https://images.unsplash.com/photo-1585236270275-fc9ce3bd18bd?auto=format&fit=crop&q=80&w=800', status: 'active' },
];

// IDs that belong to fallback/demo products (not real DB records)
const DUMMY_IDS = DUMMY_PRODUCTS.map(p => p._id);

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
      ...p,
      _id: p.id,
      desc: p.description,
      oldPrice: p.discount_price,
      tagColor: p.tag_color,
      image: p.images?.[0] || '',
    }));

    if (displayProducts.length < 4) {
      const remainingCount = 4 - displayProducts.length;
      displayProducts = [...displayProducts, ...DUMMY_PRODUCTS.slice(0, remainingCount)];
    }
    
    return NextResponse.json({ success: true, data: displayProducts, environment: env });
  } catch (error) {
    const message = extractMessage(error);
    console.error("GET Products Error:", message);
    return NextResponse.json({ success: true, isDemo: true, data: DUMMY_PRODUCTS });
  }
}

export async function POST(req: Request) {
  try {
    const env = getEnv(req);
    const supabase = getSupabaseClient(env);
    
    // Safety check for API Keys
    const isPlaceholder = (supabase as unknown as { supabaseKey: string }).supabaseKey === 'placeholder_key';
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
  } catch (error) {
    const message = extractMessage(error);
    console.error("POST Product Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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

    // Block updates to demo/fallback products
    if (DUMMY_IDS.includes(id)) {
      return NextResponse.json({ success: false, error: 'This is a demo product and cannot be edited. Add a real product via the Catalog to manage it.' }, { status: 400 });
    }

    const mappedUpdates: Record<string, unknown> = { ...updates };
    // Map camelCase client fields -> snake_case Supabase columns
    if (updates.oldPrice !== undefined) { mappedUpdates.discount_price = updates.oldPrice; delete mappedUpdates.oldPrice; }
    if (updates.stock !== undefined) { mappedUpdates.stock_quantity = updates.stock; delete mappedUpdates.stock; }
    if (updates.image !== undefined) { mappedUpdates.images = [updates.image]; delete mappedUpdates.image; }
    if (updates.desc !== undefined) { mappedUpdates.description = updates.desc; delete mappedUpdates.desc; }
    if (updates.metaTitle !== undefined) { mappedUpdates.meta_title = updates.metaTitle; delete mappedUpdates.metaTitle; }
    if (updates.metaDescription !== undefined) { mappedUpdates.meta_description = updates.metaDescription; delete mappedUpdates.metaDescription; }
    if (updates.tagColor !== undefined) { mappedUpdates.tag_color = updates.tagColor; delete mappedUpdates.tagColor; }
    if (updates.discountPrice !== undefined) { mappedUpdates.discount_price = updates.discountPrice; delete mappedUpdates.discountPrice; }
    if (updates.lowStockThreshold !== undefined) { mappedUpdates.low_stock_threshold = updates.lowStockThreshold; delete mappedUpdates.lowStockThreshold; }

    const { data: product, error } = await supabase
      .from('products')
      .update(mappedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found in database. It may be a demo entry.' }, { status: 404 });
    }

    // Log Warehouse Event if stock was updated
    if (updates.stock !== undefined) {
      const { data: currentProduct } = await supabase.from('products').select('stock_quantity, sku').eq('id', id).single();
      const diff = updates.stock - (currentProduct?.stock_quantity || 0);
      if (diff !== 0) {
        await supabase.from('warehouse_events').insert([{
          sku: product.sku,
          type: diff > 0 ? 'restock' : 'dispatch',
          amount: diff,
          performer: 'Admin (System)',
          notes: `Stock updated manually via Inventory Hub.`
        }]);
      }
    }

    // Log if restock status changed
    if (updates.restock_status !== undefined) {
      await supabase.from('warehouse_events').insert([{
        sku: product.sku,
        type: 'adjustment',
        amount: 0,
        performer: 'Automation Engine',
        notes: `Restock status changed to ${updates.restock_status}`
      }]);
    }
    
    return NextResponse.json({ success: true, data: product, environment: env });
  } catch (err) {
    const message = extractMessage(err);
    console.error('PUT Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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
  } catch (err) {
    const message = extractMessage(err);
    console.error('DELETE Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}




