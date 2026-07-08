"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/app/app-shell";
import { useAppContext } from "@/components/app/app-context";
import BusinessTasksPage from "./tasks-business";

function TasksContent() {
  const router = useRouter();
  const { businessGarden } = useAppContext();

  useEffect(() => {
    if (!businessGarden) router.replace("/calendar");
  }, [businessGarden, router]);

  if (!businessGarden) return null;
  return <BusinessTasksPage />;
}

export default function TasksPage() {
  return (
    <AppShell>
      <TasksContent />
    </AppShell>
  );
}
