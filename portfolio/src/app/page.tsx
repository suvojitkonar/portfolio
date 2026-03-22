import PortfolioContainer from "@/components/portfolio/PortfolioContainer";
import { getAllPostsMeta } from "@/lib/blog";
import { getAllProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const blogPostsMeta = getAllPostsMeta();
  const projects = getAllProjects();
  return (
    <PortfolioContainer blogPostsMeta={blogPostsMeta} projects={projects} />
  );
}
