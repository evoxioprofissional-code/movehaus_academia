import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/user";
import { getSessionWithExercises } from "@/lib/coaching/workouts";
import { WorkoutRunner } from "@/components/coaching/workout-runner";

export const metadata = { title: "Modo treino" };

export default async function ModoTreinoPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requireUser("/acompanhamento");
  const { sessionId } = await params;
  const { session, exercises } = await getSessionWithExercises(sessionId);

  if (!session || session.user_id !== user.id) redirect("/acompanhamento");
  if (session.finished_at) redirect("/acompanhamento");

  return (
    <WorkoutRunner
      sessionId={session.id}
      dayName={session.day_name || "Treino"}
      exercises={exercises}
    />
  );
}
