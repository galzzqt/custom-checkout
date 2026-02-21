import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cartData = await request.json();
    
    console.log('Cart sync from WordPress:', cartData);
    
    // Simpan cart data ke localStorage melalui client-side
    // atau simpan ke session/database
    
    // Opsi 1: Simpan ke session (server-side)
    // const session = await getServerSession();
    // if (session) {
    //   // Save to database
    // }
    
    // Opsi 2: Return cart data untuk disimpan di client-side
    return NextResponse.json({
      success: true,
      data: cartData,
      message: 'Cart synced successfully'
    });
    
  } catch (error: any) {
    console.error('Error syncing cart:', error);
    return NextResponse.json(
      { error: 'Failed to sync cart' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Return current cart data jika diperlukan
    return NextResponse.json({
      success: true,
      message: 'Sync endpoint is working'
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Endpoint error' },
      { status: 500 }
    );
  }
}
