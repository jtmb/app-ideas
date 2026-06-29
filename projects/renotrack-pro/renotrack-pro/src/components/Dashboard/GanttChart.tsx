import React, { useState } from "react";

interface Task {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  status: "pending" | "in-progress" | "completed";
};

interface GanttChartProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
};

const GanttChart: React.FC<GanttChartProps> = ({ tasks, onTaskClick }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const getMinMaxDates = (tasks: Task[]) => {
    if (tasks.length === 0) return { min: new Date(), max: new Date() };
    let minDate = new Date(tasks[0].start);
    let maxDate = new Date(tasks[0].end);
    tasks.forEach(task => {
      if (new Date(task.start) < minDate) minDate = new Date(task.start);
      if (new Date(task.end) > maxDate) maxDate = new Date(task.end);
    });
    minDate.setDate(minDate.getDate() - 2);
    maxDate.setDate(maxDate.getDate() + 2);
    return { min: minDate, max: maxDate };
  };
