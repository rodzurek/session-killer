import { prisma } from './prisma'
import type { Service } from '@/types'

export async function getServices(): Promise<Service[]> {
  const services = await prisma.service.findMany({
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    include: {
      tasks: {
        orderBy: { sortOrder: 'asc' },
        include: { completion: true },
      },
    },
  })

  return services.map(s => ({
    id: s.id,
    name: s.name,
    category: s.category as Service['category'],
    sort_order: s.sortOrder,
    is_builtin: s.isBuiltin ? 1 : 0,
    tasks: s.tasks.map(t => ({
      id: t.id,
      service_id: t.serviceId,
      label: t.label,
      description: t.description,
      url: t.url,
      sort_order: t.sortOrder,
      completed: t.completion !== null,
    })),
  }))
}

export async function toggleTask(taskId: number): Promise<void> {
  const existing = await prisma.completion.findUnique({ where: { taskId } })
  if (existing) {
    await prisma.completion.delete({ where: { taskId } })
  } else {
    await prisma.completion.create({ data: { taskId } })
  }
}

export async function addService(name: string): Promise<number> {
  const service = await prisma.service.create({
    data: {
      name,
      category: 'custom',
      sortOrder: 999,
      isBuiltin: false,
      tasks: {
        create: [
          { label: 'Sign out all sessions', sortOrder: 0 },
          { label: 'Change password', sortOrder: 1 },
          { label: 'Enable 2FA', sortOrder: 2 },
          { label: 'Review connected apps', sortOrder: 3 },
        ],
      },
    },
  })
  return service.id
}

export async function deleteService(id: number): Promise<void> {
  const service = await prisma.service.findUnique({ where: { id } })
  if (!service) throw new Error('Not found')
  if (service.isBuiltin) throw new Error('Cannot delete built-in service')
  await prisma.service.delete({ where: { id } })
}

export async function resetCompletions(): Promise<void> {
  await prisma.completion.deleteMany()
}
