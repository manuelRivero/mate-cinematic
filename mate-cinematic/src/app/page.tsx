import Scene from "../components/Scene";
import MateScrollDirector from "../components/MateScrollDirector";
import SectionNarrative from "../components/SectionNarrative";
import SiteHeader from "../components/SiteHeader";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050505] text-[#e8e6e1]">
      <SiteHeader />
      <Scene />
      <SectionNarrative />
      <MateScrollDirector />
    </main>
  );
}
