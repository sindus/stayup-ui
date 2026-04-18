import { AdminLoginForm } from '@/components/admin/AdminLoginForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Administration</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
