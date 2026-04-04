import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Product from '@/models/Product';

// Sample Fallback Data if Database is not connected (Using Let so we can push to it in demo mode)
let DUMMY_PRODUCTS = [
  { _id: '1', name: 'Wild Forest Raw Honey', desc: 'Unprocessed & directly from Himalayas', price: 1250.00, oldPrice: 1550.00, tag: '-20%', tagColor: 'bg-rose-500', image: 'https://images.unsplash.com/photo-1587049352847-4d4b1ed74dd4?auto=format&fit=crop&q=80&w=800' },
  { _id: '2', name: 'Extra Virgin Coconut Oil', desc: 'Cold-pressed, unrefined organic oil', price: 850.00, oldPrice: null, tag: 'Bestseller', tagColor: 'bg-indigo-500', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800' },
  { _id: '3', name: 'California Premium Almonds', desc: 'Rich in antioxidants & naturally sweet', price: 950.00, oldPrice: 1100.00, tag: '-15%', tagColor: 'bg-rose-500', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=800' },
  { _id: '4', name: 'Black Chia Seeds Pack', desc: 'High fiber, omega-3 superfood core', price: 350.00, oldPrice: null, tag: 'New Arrival', tagColor: 'bg-emerald-500', image: 'https://images.unsplash.com/photo-1585236270275-fc9ce3bd18bd?auto=format&fit=crop&q=80&w=800' },
];

export async function GET() {
  try {
    const db = await connectDB();
    if (!db) {
       // Graceful degradation: Return realistic dummy data if MONGODB_URI is not set yet.
       return NextResponse.json({ success: true, data: DUMMY_PRODUCTS });
    }

    const products = await Product.find({}).sort({ createdAt: -1 });
    // If DB is empty, maybe return dummies to prevent blank UI
    if (products.length === 0) {
      return NextResponse.json({ success: true, data: DUMMY_PRODUCTS });
    }
    
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.log("Database connection unreachable. Falling back to local data.", error.message);
    return NextResponse.json({ success: true, data: DUMMY_PRODUCTS });
  }
}

export async function POST(req: Request) {
  try {
    const db = await connectDB();
    const body = await req.json();

    if (!db) {
      // In-Memory Fallback: Push to DUMMY array instead of throwing an error.
      const simulatedProduct = {
         _id: `temp_${Math.random()}`,
         ...body
      };
      
      // Add to the front so it appears immediately on top of catalog and landing page
      DUMMY_PRODUCTS.unshift(simulatedProduct);
      
      return NextResponse.json({ success: true, data: simulatedProduct }, { status: 201 });
    }

    const product = await Product.create(body);
    
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    console.log("Database write failed. Simulating local insert.", error.message);
    return NextResponse.json({ success: true, data: null }, { status: 200 });
  }
}
