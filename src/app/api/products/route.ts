import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Sample Fallback Data if Supabase is not connected/empty (Using Let so we can push to it in demo mode)
// Sample Fallback Data if Supabase is not connected/empty (Using const for immutable dummy data)
const DUMMY_PRODUCTS = [
  { _id: '1', name: 'Wild Forest Raw Honey', desc: 'Unprocessed & directly from Himalayas', price: 1250.00, oldPrice: 1550.00, tag: '-20%', tagColor: 'bg-rose-500', image: 'https://images.unsplash.com/photo-1587049352847-4d4b1ed74dd4?auto=format&fit=crop&q=80&w=800', status: 'active' },
  { _id: '2', name: 'Extra Virgin Coconut Oil', desc: 'Cold-pressed, unrefined organic oil', price: 850.00, oldPrice: null, tag: 'Bestseller', tagColor: 'bg-indigo-500', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800', status: 'active' },
  { _id: '3', name: 'California Premium Almonds', desc: 'Rich in antioxidants & naturally sweet', price: 950.00, oldPrice: 1100.00, tag: '-15%', tagColor: 'bg-rose-500', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=800', status: 'active' },
  { _id: '4', name: 'Black Chia Seeds Pack', desc: 'High fiber, omega-3 superfood core', price: 350.00, oldPrice: null, tag: 'New Arrival', tagColor: 'bg-emerald-500', image: 'https://images.unsplash.com/photo-1585236270275-fc9ce3bd18bd?auto=format&fit=crop&q=80&w=800', status: 'active' },
];


export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // If we have fewer than 4 products, fill the rest with dummies for a rich UI
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
    
    return NextResponse.json({ success: true, data: displayProducts });
  } catch (error: any) {
    console.error("GET Products Error (Supabase):", error.message);
    return NextResponse.json({ success: true, isDemo: true, data: DUMMY_PRODUCTS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Handle Category - Get ID or Create New
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
        // Create category if not exists
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

    // 2. Generate slug from name
    const slug = body.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);

    // 3. Map frontend body to REAL Supabase columns
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
    
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    console.error("POST Product Error (Supabase):", error.message);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// PUT: Update an existing product
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required for updates' }, { status: 400 });
    }

    // Map update object to REAL Supabase columns
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
    
    return NextResponse.json({ success: true, data: product });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Remove a product
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required for deletion' }, { status: 400 });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}




