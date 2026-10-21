import { redirect } from "next/navigation";
import { requireUser, getProfile } from "@/lib/auth/user";
import { getSessionWithExercises } from "@/lib/coaching/workouts";
import { WorkoutRunner } from "@/components/coaching/workout-runner";

export const metadata = { title: "Modo treino" };

export default async function ModoTreinoPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const user = await requireUser("/acompanhamento");
  const { sessionId } = await params;
  const [{ session, exercises }, profile] = await Promise.all([getSessionWithExercises(sessionId), getProfile()]);
  if (!session || session.user_id !== user.id) redirect("/acompanhamento");
  if (session.finished_at) redirect("/acompanhamento");
  const dateLabel = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", timeZone: "America/Sao_Paulo" }).format(new Date());
  return <WorkoutRunner sessionId={session.id} dayName={session.day_name || "Treino"} exercises={exercises} athleteName={profile?.full_name || "Aluno"} dateLabel={dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)} />;
}
