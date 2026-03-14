import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import OficinaDashboardClient from './dashboard-client'

export default async function OficinaDashboard() {
  const session = await getSession()
  
  if (!session || session.role !== 'oficina') {
    redirect('/oficina/login')
  }

  return <OficinaDashboardClient session={session} />
}
