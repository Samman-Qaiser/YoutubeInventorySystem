import StatsSection from "../sections/StatsSection";
import ChartsSection from "../sections/ChartsSection";
import RecentChannels from "../sections/RecentChannels";

export default function Home({ channels }) {
  return (
    <div className="flex flex-col gap-6">
      <StatsSection channels={channels} />
      <ChartsSection channels={channels} />
      <RecentChannels channels={channels} />
    </div>
  );
}