import { NextResponse } from 'next/server'
import { resetCompletions } from '@/lib/db'

export async function POST() {
  resetCompletions()
  return NextResponse.json({ ok: true })
}
