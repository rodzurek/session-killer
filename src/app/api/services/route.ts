import { NextResponse } from 'next/server'
import { getServices, addService } from '@/lib/db'

export async function GET() {
  const services = getServices()
  return NextResponse.json(services)
}

export async function POST(req: Request) {
  const body = await req.json()
  const name = body?.name?.trim()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const id = addService(name)
  return NextResponse.json({ id })
}
