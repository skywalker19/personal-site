import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: process.env.SITE_URL || "http://150.109.196.200",
  trailingSlash: "always",
});
