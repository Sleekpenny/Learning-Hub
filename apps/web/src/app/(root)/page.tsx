import { LazySection } from "@/components/common/lazy-section";
import AboutSection from "@/components/home/about-section";
import CtaSection from "@/components/home/cta-section";
import FeaturesStrip from "@/components/home/features-strip";
import HeroSection from "@/components/home/hero-section";
import HowItWorks from "@/components/home/how-it-works";
import PopularCourses from "@/components/home/popular-courses";

const Home = () => {
  return (
    <div>
   <HeroSection />
      <LazySection id="features" height={140}>
        <FeaturesStrip />
      </LazySection>
      <LazySection id="about" height={420}>
        <AboutSection />
      </LazySection>
      <LazySection id="courses" height={560}>
        <PopularCourses />
      </LazySection>
      <LazySection id="how-it-works" height={380}>
        <HowItWorks />
      </LazySection>
      <LazySection id="get-started" height={300}>
        <CtaSection />
      </LazySection>
    </div>
  );
}

export default Home