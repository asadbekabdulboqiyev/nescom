import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NewEmployeeForm from '@/components/NewEmployeeForm';

export const dynamic = 'force-dynamic';

export default async function NewEmployeePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/');

  return <NewEmployeeForm />;
}
