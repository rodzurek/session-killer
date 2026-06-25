import { NextResponse } from 'next/server'
import { deleteService } from '@/lib/db'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    deleteService(Number(id))
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'error'
    const status = msg === 'Not found' ? 404 : msg.startsWith('Cannot') ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
