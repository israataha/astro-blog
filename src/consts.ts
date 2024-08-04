import type { Site, Page, Links, Socials } from "@types";

// Global
export const SITE: Site = {
  TITLE: "Israa Taha",
  NAME: "Israa Taha",
  DESCRIPTION: "Developer, speaker and writer.",
  AUTHOR: "Israa Taha",
};

// Work Page
export const WORK: Page = {
  TITLE: "Work",
  DESCRIPTION: "Places I have worked.",
};

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Writing on topics I am passionate about.",
};

// Projects Page
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects I have worked on.",
};

// Search Page
export const ABOUT: Page = {
  TITLE: "About",
  DESCRIPTION: "About me.",
};

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
};

// Links
export const LINKS: Links = [
  {
    TEXT: "Home",
    HREF: "/",
  },

  {
    TEXT: "Blog",
    HREF: "/blog",
  },
  // {
  //   TEXT: "Projects",
  //   HREF: "/projects",
  // },
  // {
  //   TEXT: "Work",
  //   HREF: "/work",
  // },
  {
    TEXT: "About",
    HREF: "/about",
  },
];

// Socials
export const SOCIALS: Socials = [
  {
    NAME: "Email",
    ICON: "email",
    TEXT: "israataha@gmail.com",
    HREF: "mailto:israataha@gmail.com",
  },
  {
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "israa-taha",
    HREF: "https://www.linkedin.com/in/israa-taha/",
  },
  {
    NAME: "Twitter",
    ICON: "twitter-x",
    TEXT: "theisraataha",
    HREF: "https://x.com/theisraataha",
  },
  {
    NAME: "Github",
    ICON: "github",
    TEXT: "israataha",
    HREF: "https://github.com/israataha",
  },
];
