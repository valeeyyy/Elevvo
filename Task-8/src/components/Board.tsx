import { useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { Column as ColumnData, Job, Status } from "../types/job";
import { Column } from "./Column";
import { JobCard } from "./JobCard";

export interface BoardProps {
  columns: readonly ColumnData[];
  onMove: (jobId: string, toStatus: Status) => void;
  onOpen: (jobId: string) => void;
}

function isStatus(value: unknown, columns: readonly ColumnData[]): value is Status {
  return columns.some((column) => column.id === value);
}

export function Board({ columns, onMove, onOpen }: BoardProps) {
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const lastDragEnd = useRef(0);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space"] } })
  );

  const allJobs = columns.flatMap((column) => column.jobs);

  function handleDragStart(event: DragStartEvent): void {
    const job = allJobs.find((candidate) => candidate.id === event.active.id);
    setActiveJob(job ?? null);
  }

  function handleDragEnd(event: DragEndEvent): void {
    setActiveJob(null);
    lastDragEnd.current = Date.now();
    const { active, over } = event;
    if (!over) return;
    if (isStatus(over.id, columns)) {
      onMove(String(active.id), over.id);
    }
  }

  /** A drag that ends over its own card would otherwise also register as a click. */
  function handleOpen(jobId: string): void {
    if (Date.now() - lastDragEnd.current < 200) return;
    onOpen(jobId);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveJob(null)}
    >
      <div
        className="-mx-4 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0"
        data-testid="board"
      >
        {columns.map((column) => (
          <Column key={column.id} column={column} onOpen={handleOpen} />
        ))}
      </div>

      <DragOverlay>
        {activeJob ? (
          <ul className="m-0 list-none p-0">
            <JobCard job={activeJob} overlay />
          </ul>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
