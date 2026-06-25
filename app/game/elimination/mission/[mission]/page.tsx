import EliminationClient from "../../EliminationClient";

type MissionEliminationPageProps = {
  params: Promise<{ mission: string }>;
};

export default async function MissionEliminationPage({ params }: MissionEliminationPageProps) {
  const { mission } = await params;
  const missionNumber = Number(mission);

  return <EliminationClient initialMissionIndex={Number.isInteger(missionNumber) ? missionNumber - 1 : -1} />;
}
