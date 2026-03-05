#!/usr/bin/env node

/**
 * Build-time OG image generator.
 *
 * Uses Satori (HTML/CSS → SVG) + Sharp (SVG → PNG) to create 1200×630
 * Open Graph images for every static page.
 *
 * Run automatically as part of `npm run build` via the build:og script.
 * Must run BEFORE build:html so that og:image meta tags reference real files.
 *
 * Usage:
 *   node scripts/generate-og-images.js
 */

import satori from 'satori';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'assets', 'og');

const WIDTH = 1200;
const HEIGHT = 630;

// Brand colors from input.css
const COLORS = {
  primary: '#8d68f6',
  sky: '#13d9e4',
  pink: '#fc4bda',
  heading: '#222222',
  description: '#686c71',
};

// Page definitions: filename → { title, subtitle }
// Titles are short display titles (not the full og:title with "| Artisans Cloud")
const PAGES = [
  {
    file: 'index',
    title: 'Intelligent Enterprise\nTransformation',
    subtitle: 'Unifying data, intelligence, and workflows',
  },
  {
    file: 'retail-platform',
    title: 'Retail Platform',
    subtitle: 'Unified Commerce & AI Automation',
  },
  {
    file: 'enterprise-ai',
    title: 'Enterprise AI',
    subtitle: 'From strategy to production',
  },
  {
    file: 'data-intelligence',
    title: 'Data Intelligence',
    subtitle: 'Transform data into intelligent action',
  },
  {
    file: 'overview',
    title: 'Unified Commerce',
    subtitle: 'All aspects of commerce, unified',
  },
  {
    file: 'about-us',
    title: 'About Us',
    subtitle: 'Architects of Enterprise Intelligence',
  },
  {
    file: 'automation',
    title: 'Automation Platform',
    subtitle: 'Low-code workflow automation',
  },
  {
    file: 'integrations',
    title: 'Integrations',
    subtitle: 'Seamless commerce connectivity',
  },
  {
    file: 'browser-pos',
    title: 'TabsyPOS',
    subtitle: 'Free AI-Powered Browser POS',
  },
  {
    file: 'POS',
    title: 'Point of Sale',
    subtitle: 'Unified offline & online retail',
  },
  {
    file: 'customer-experience-management',
    title: 'Customer Xperience\nManagement',
    subtitle: 'Omnichannel engagement at scale',
  },
  {
    file: 'd2c-eCommerce',
    title: 'D2C eCommerce',
    subtitle: 'Simplifying direct-to-consumer',
  },
  {
    file: 'distributed-order-management',
    title: 'Distributed Order\nManagement',
    subtitle: 'Multi-channel fulfillment orchestration',
  },
  {
    file: 'knowledge-harvester',
    title: 'Knowledge Harvester',
    subtitle: 'AI-powered knowledge capture',
  },
  {
    file: 'merchandise-and-assortment-planning',
    title: 'Merchandise &\nAssortment Planning',
    subtitle: 'Data-driven product mix optimization',
  },
  {
    file: 'role-play-agent',
    title: 'Role Play Agent',
    subtitle: 'AI-powered training simulations',
  },
  {
    file: 'warehouse-management-system',
    title: 'Warehouse Management',
    subtitle: 'Intelligent warehouse orchestration',
  },
  {
    file: 'blog-list',
    title: 'Insights & Thought\nLeadership',
    subtitle: 'Latest from Artisans Cloud',
  },
  {
    file: 'contact-us',
    title: 'Contact Us',
    subtitle: 'Let\'s build something together',
  },
  {
    file: 'privacy-policy',
    title: 'Privacy Policy',
    subtitle: 'How we protect your data',
  },
  {
    file: 'terms-and-conditions',
    title: 'Terms & Conditions',
    subtitle: 'Platform usage terms',
  },
];

// Read the dark logo SVG (for light backgrounds) and encode as data URI
const logoSvg = readFileSync(join(ROOT, 'assets', 'image', 'logo.svg'), 'utf-8');
const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`;

async function loadFonts() {
  // Fetch Poppins font files from Google Fonts for Satori
  // Poppins TTF files from Google Fonts GitHub repo (raw.githubusercontent.com)
  const fontUrls = [
    {
      url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-SemiBold.ttf',
      weight: 600,
      name: 'Poppins SemiBold',
    },
    {
      url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf',
      weight: 400,
      name: 'Poppins Regular',
    },
  ];

  const fonts = [];
  for (const { url, weight, name } of fontUrls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = await res.arrayBuffer();
      fonts.push({ name: 'Poppins', data: buffer, weight, style: 'normal' });
      console.log(`  Font loaded: ${name}`);
    } catch (err) {
      console.error(`  Failed to load font ${name}: ${err.message}`);
      process.exit(1);
    }
  }
  return fonts;
}

function buildTemplate(page) {
  // Split title into lines for manual line breaks
  const titleLines = page.title.split('\n');

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        fontFamily: 'Poppins',
        // Light lavender base matching website hero_bg
        background: 'linear-gradient(135deg, #f5f0ff 0%, #ede6ff 40%, #f0f8ff 100%)',
        color: COLORS.heading,
        position: 'relative',
        overflow: 'hidden',
      },
      children: [
        // Decorative accent blob — top-right (purple, like website swirls)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '-80px',
              right: '-60px',
              width: '360px',
              height: '360px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(141, 104, 246, 0.12), rgba(252, 77, 218, 0.08))',
              filter: 'blur(2px)',
            },
          },
        },
        // Decorative accent blob — bottom-left (cyan, like website swirls)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '-100px',
              left: '-80px',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(19, 217, 228, 0.10), rgba(141, 104, 246, 0.08))',
              filter: 'blur(2px)',
            },
          },
        },
        // Content container
        {
          type: 'div',
          props: {
            style: {
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '56px 70px',
              position: 'relative',
            },
            children: [
              // Top section: logo
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center' },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: logoDataUri,
                        width: 151,
                        height: 40,
                        style: { objectFit: 'contain' },
                      },
                    },
                  ],
                },
              },
              // Middle section: title + subtitle
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    flex: 1,
                    justifyContent: 'center',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: titleLines.some(l => l.length > 20) ? '50px' : '56px',
                          fontWeight: 600,
                          lineHeight: 1.15,
                          letterSpacing: '-0.02em',
                          color: COLORS.heading,
                          display: 'flex',
                          flexDirection: 'column',
                        },
                        children: titleLines.map(line => ({
                          type: 'span',
                          props: { children: line },
                        })),
                      },
                    },
                    // Accent line — purple to cyan gradient
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '80px',
                          height: '4px',
                          borderRadius: '2px',
                          background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.sky})`,
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '22px',
                          fontWeight: 400,
                          color: COLORS.description,
                          lineHeight: 1.4,
                        },
                        children: page.subtitle,
                      },
                    },
                  ],
                },
              },
              // Bottom section: URL
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '16px',
                          fontWeight: 400,
                          color: COLORS.primary,
                        },
                        children: 'artisanscloud.com',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function main() {
  console.log('Generating OG images...');

  mkdirSync(OUT_DIR, { recursive: true });

  const fonts = await loadFonts();

  let generated = 0;
  for (const page of PAGES) {
    const template = buildTemplate(page);
    const svg = await satori(template, { width: WIDTH, height: HEIGHT, fonts });
    const png = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer();

    const outPath = join(OUT_DIR, `${page.file}.png`);
    writeFileSync(outPath, png);
    generated++;
    console.log(`  ${page.file}.png (${(png.length / 1024).toFixed(1)} KB)`);
  }

  console.log(`OG images: ${generated} images generated → assets/og/`);
}

main().catch(err => {
  console.error('OG image generation failed:', err);
  process.exit(1);
});
