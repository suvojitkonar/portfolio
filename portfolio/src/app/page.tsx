import PortfolioContainer from "@/components/portfolio/PortfolioContainer";
import { getAllPostsMeta } from "@/lib/blog";
import { getAllProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [blogPostsMeta, projects] = await Promise.all([
    getAllPostsMeta(),
    getAllProjects(),
  ]);
  return (
    <PortfolioContainer blogPostsMeta={blogPostsMeta} projects={projects} />
  );
}
