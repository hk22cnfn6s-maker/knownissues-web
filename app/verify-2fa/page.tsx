import { Suspense } from 'react'
import Verify2faForm from './Verify2faForm'
import AuthLayout from '@/components/AuthLayout'

export default function Verify2faPage() {
  return (
    <AuthLayout>
      <Suspense>
        <Verify2faForm />
      </Suspense>
    </AuthLayout>
  )
}
