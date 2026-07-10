import { NextResponse } from 'next/server'
import { toggleTask } from '@/lib/db'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await toggleTask(Number(id))
  return NextResponse.json({ ok: true })
}
