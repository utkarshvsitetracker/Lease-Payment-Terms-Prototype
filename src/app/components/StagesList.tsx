import { Plus } from 'lucide-react';
import { StageCard } from './StageCard';
import type { PaymentStage } from './LeasePaymentTerms';

interface StagesListProps {
  stages: PaymentStage[];
  onAddStage: () => void;
  onEditStage: (stageId: string) => void;
  onMoveStage: (dragIndex: number, hoverIndex: number) => void;
  onDeleteStage: (stageId: string) => void;
  isPanelOpen: boolean;
}

export function StagesList({ stages, onAddStage, onEditStage, onMoveStage, onDeleteStage, isPanelOpen }: StagesListProps) {
  return (
    <div className="space-y-3">
      {stages.map((stage, index) => (
        <StageCard
          key={stage.id}
          stage={stage}
          index={index}
          allStages={stages}
          onEdit={onEditStage}
          onMove={onMoveStage}
          onDelete={onDeleteStage}
        />
      ))}

      {/* Add Stage Button */}
      <button
        onClick={onAddStage}
        disabled={isPanelOpen}
        className="w-full border-2 border-dashed border-border bg-card hover:bg-muted hover:border-primary transition-all duration-200 rounded-[var(--radius)] p-4 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:border-border"
      >
        <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="text-muted-foreground group-hover:text-primary transition-colors">Add Stage</span>
      </button>
    </div>
  );
}
