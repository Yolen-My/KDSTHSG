import StoryClient from "../../StoryClient";

type GroupStoryPageProps = {
  params: Promise<{ group: string }>;
};

export default async function GroupStoryPage({ params }: GroupStoryPageProps) {
  const { group } = await params;
  const groupNumber = Number(group);

  return <StoryClient initialGroupIndex={Number.isInteger(groupNumber) ? groupNumber - 1 : -1} />;
}
