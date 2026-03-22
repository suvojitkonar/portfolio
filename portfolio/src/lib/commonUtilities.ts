import type { ComponentType } from "react";
import Home from "@/components/portfolio/Home/Home";
import AboutMe from "@/components/portfolio/AboutMe/AboutMe";
import Resume from "@/components/portfolio/Resume/Resume";
import Projects from "@/components/portfolio/Projects/Projects";
import Testimonial from "@/components/portfolio/Testimonial/Testimonial";
import ContactMe from "@/components/portfolio/ContactMe/ContactMe";

export type ScreenProps = { id?: string; screenName?: string };

export const TOTAL_SCREENS: {
  screen_name: string;
  navLabel: string;
  component: ComponentType<ScreenProps> | null;
}[] = [
  { screen_name: "Home", navLabel: "Home", component: Home },
  { screen_name: "AboutMe", navLabel: "About Me", component: AboutMe },
  { screen_name: "Resume", navLabel: "Resume", component: Resume },
  { screen_name: "Projects", navLabel: "Projects", component: Projects },
  { screen_name: "Blog", navLabel: "Blog", component: null },
  { screen_name: "Testimonial", navLabel: "Testimonials", component: Testimonial },
  { screen_name: "ContactMe", navLabel: "Contact", component: ContactMe },
];

export type ScreenEntry = (typeof TOTAL_SCREENS)[number];

export const GET_SCREEN_INDEX = (screenName: string) => {
  if (!screenName) return -1;
  for (let i = 0; i < TOTAL_SCREENS.length; i++) {
    if (TOTAL_SCREENS[i].screen_name === screenName) return i;
  }
  return -1;
};
