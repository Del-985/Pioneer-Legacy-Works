import {
  copyFileSync,
  existsSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { basename, resolve } from "node:path";

const distDir = resolve("dist");
const indexPath = resolve(distDir, "index.html");
const fallbackPath = resolve(distDir, "404.html");

if (!existsSync(indexPath)) {
  throw new Error(
    "dist/index.html was not found. Build the frontend before creating the Pages fallback."
  );
}

const resolveDistAsset = (assetUrl) =>
  resolve(distDir, assetUrl.replace(/^\/+/, ""));

let html = readFileSync(indexPath, "utf8");

html = html.replace(
  /<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi,
  (tag) => {
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];

    if (!href) {
      return tag;
    }

    const cssPath = resolveDistAsset(href);

    if (!existsSync(cssPath)) {
      return tag;
    }

    const css = readFileSync(cssPath, "utf8").replace(
      /<\/style/gi,
      "<\\/style"
    );

    return `<style data-inline-source="${basename(cssPath)}">\n${css}\n</style>`;
  }
);

html = html.replace(
  /<script\b[^>]*\btype=["']module["'][^>]*><\/script>/gi,
  (tag) => {
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];

    if (!src) {
      return tag;
    }

    const jsPath = resolveDistAsset(src);

    if (!existsSync(jsPath)) {
      return tag;
    }

    const javascript = readFileSync(jsPath, "utf8").replace(
      /<\/script/gi,
      "<\\/script"
    );

    return `<script type="module" data-inline-source="${basename(jsPath)}">\n${javascript}\n</script>`;
  }
);

if (/\/assets\/[^"']+\.(?:js|css)(?:["'])/i.test(html)) {
  throw new Error(
    "The Pages HTML still references an external JavaScript or CSS asset after inlining."
  );
}

writeFileSync(indexPath, html);
copyFileSync(indexPath, fallbackPath);

console.log(
  "Inlined frontend JavaScript and CSS and created dist/404.html for GitHub Pages routing."
);
