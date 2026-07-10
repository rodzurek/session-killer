export const dynamic = 'force-dynamic'

import { getServices } from '@/lib/db'
import ChecklistApp from '@/components/ChecklistApp'

export default async function Home() {
  const services = await getServices()
  return <ChecklistApp initialServices={services} />
}
