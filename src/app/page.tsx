import { getServices } from '@/lib/db'
import ChecklistApp from '@/components/ChecklistApp'

export default function Home() {
  const services = getServices()
  return <ChecklistApp initialServices={services} />
}
