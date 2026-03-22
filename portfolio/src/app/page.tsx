import PortfolioContainer from "@/components/portfolio/PortfolioContainer";
import { getAllPostsMeta } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const blogPostsMeta = getAllPostsMeta();
  return <PortfolioContainer blogPostsMeta={blogPostsMeta} />;
}
