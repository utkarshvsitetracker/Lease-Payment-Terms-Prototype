import { FileText } from 'lucide-react';

export function PageHeader() {
  return (
    <div className="bg-card border-b border-border">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-muted-foreground text-[var(--text-label)]">Lease Payment Terms</p>
            <h1 className="text-foreground">Payment Terms Setup</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
