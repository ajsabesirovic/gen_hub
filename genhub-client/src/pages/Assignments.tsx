import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export default function Assignments() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">
            View every active match between volunteers and seniors.
          </p>
        </div>

       
      </div>
    </DashboardLayout>
  );
}


