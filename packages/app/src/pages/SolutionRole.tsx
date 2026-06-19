import { AppFooter } from "@/components/AppFooter";
import { SolutionProductModules } from "@/pages/solutions/SolutionProductModules";
import { SolutionRoleChallenges } from "@/pages/solutions/SolutionRoleChallenges";
import { SolutionRoleDetailExtras } from "@/pages/solutions/SolutionRoleDetailExtras";
import { SolutionRoleExploreMore } from "@/pages/solutions/SolutionRoleExploreMore";
import { SolutionRoleWhyPeacock } from "@/pages/solutions/SolutionRoleWhyPeacock";
import { SolutionRoleHero } from "@/pages/solutions/SolutionRoleHero";
import { SolutionRoleSubNav } from "@/pages/solutions/SolutionRoleSubNav";
import { SolutionsNav } from "@/pages/solutions/SolutionsNav";
import { getSolutionRoleBySlug } from "@/pages/solutions/solutionsData";
import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

export const SolutionRole = () => {
  const { roleSlug } = useParams<{ roleSlug: string }>();
  const role = getSolutionRoleBySlug(roleSlug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [role]);

  if (!role) return <Navigate to="/solutions" replace />;

  return (
    <div className="landing-page min-h-screen">
      <SolutionsNav backHref="/solutions" backLabel="All solutions" />
      <SolutionRoleHero role={role} />
      <SolutionRoleSubNav role={role} />
      <SolutionRoleChallenges role={role} />
      <SolutionProductModules role={role} />
      <SolutionRoleWhyPeacock role={role} />
      <SolutionRoleDetailExtras role={role} />
      <SolutionRoleExploreMore role={role} />
      <AppFooter />
    </div>
  );
};
