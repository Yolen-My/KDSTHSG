import QuizClient from "../../QuizClient";

type SectorQuizPageProps = {
  params: Promise<{ sector: string }>;
};

export default async function SectorQuizPage({ params }: SectorQuizPageProps) {
  const { sector } = await params;
  const index = Number(sector);

  return <QuizClient initialSectorIndex={Number.isInteger(index) ? index : -1} />;
}
