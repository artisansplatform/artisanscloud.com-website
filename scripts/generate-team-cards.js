#!/usr/bin/env node

/**
 * Team card HTML generator.
 *
 * Reads assets/data/team-members.json and generates a team/[slug].html
 * digital business card page for each member.
 *
 * Run:
 *   npm run generate:cards            # regenerate all cards
 *   npm run generate:cards -- --slug dev-nair   # one member only
 *
 * Existing HTML files are overwritten — team-members.json is the source of truth.
 * After running this, also run: npm run generate:og
 * Or use the combined shortcut: npm run add:card
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// SVG icons (inlined for zero runtime dependency)
const ICONS = {
  linkedin: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  github: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
  twitter: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  email: `<svg class="w-5 h-5 text-primary group-hover:text-white transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  phone: `<svg class="w-5 h-5 text-sky-2 group-hover:text-white transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`,
  company: `<svg class="w-5 h-5 text-sky-2 group-hover:text-white transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
  location: `<svg class="w-5 h-5 text-pink group-hover:text-white transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  share: `<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/></svg>`,
  link: `<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`,
  whatsapp: `<svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
  emailBtn: `<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  externalLink: `<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>`,
};

/** Extract @handle from a Twitter/X URL like https://x.com/Handle */
function twitterHandle(url) {
  if (!url) return '';
  const match = url.match(/(?:twitter\.com|x\.com)\/([^/?#]+)/i);
  return match ? `@${match[1]}` : '';
}

/** Build the social icon block for the left panel */
function buildSocialIcons(social) {
  if (!social) return '';
  const icons = [];

  if (social.linkedin) {
    icons.push(`
                            <a href="${social.linkedin}" target="_blank" rel="noopener noreferrer" title="LinkedIn"
                               class="w-9 h-9 rounded-full bg-white/20 grid place-items-center transition-all duration-300 hover:bg-white hover:text-primary text-white">
                                ${ICONS.linkedin}
                            </a>`);
  }
  if (social.github) {
    icons.push(`
                            <a href="${social.github}" target="_blank" rel="noopener noreferrer" title="GitHub"
                               class="w-9 h-9 rounded-full bg-white/20 grid place-items-center transition-all duration-300 hover:bg-white hover:text-primary text-white">
                                ${ICONS.github}
                            </a>`);
  }
  if (social.twitter) {
    icons.push(`
                            <a href="${social.twitter}" target="_blank" rel="noopener noreferrer" title="X (Twitter)"
                               class="w-9 h-9 rounded-full bg-white/20 grid place-items-center transition-all duration-300 hover:bg-white hover:text-primary text-white">
                                ${ICONS.twitter}
                            </a>`);
  }

  return icons.length
    ? `\n                        <div class="mt-5 flex items-center gap-2.5">${icons.join('')}\n                        </div>`
    : '';
}

/** Build contact detail rows for the right panel */
function buildContactRows(member) {
  const rows = [];

  if (member.email) {
    rows.push(`
                            <a href="mailto:${member.email}" class="flex items-center gap-3 group">
                                <div class="w-10 h-10 rounded-[10px] bg-light-purple grid place-items-center shrink-0 transition-all duration-300 group-hover:bg-primary">
                                    ${ICONS.email}
                                </div>
                                <div>
                                    <p class="text-xs text-description font-primary">Email</p>
                                    <p class="text-sm text-heading font-medium font-primary">${member.email}</p>
                                </div>
                            </a>`);
  }

  if (member.phone) {
    rows.push(`
                            <a href="tel:${member.phone}" class="flex items-center gap-3 group">
                                <div class="w-10 h-10 rounded-[10px] bg-light-green grid place-items-center shrink-0 transition-all duration-300 group-hover:bg-sky-2">
                                    ${ICONS.phone}
                                </div>
                                <div>
                                    <p class="text-xs text-description font-primary">Phone</p>
                                    <p class="text-sm text-heading font-medium font-primary">${member.phone}</p>
                                </div>
                            </a>`);
  }

  rows.push(`
                            <a href="${member.companyUrl}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 group">
                                <div class="w-10 h-10 rounded-[10px] bg-light-green grid place-items-center shrink-0 transition-all duration-300 group-hover:bg-sky-2">
                                    ${ICONS.company}
                                </div>
                                <div>
                                    <p class="text-xs text-description font-primary">Company</p>
                                    <p class="text-sm text-heading font-medium font-primary">${member.company}</p>
                                </div>
                            </a>`);

  if (member.location) {
    rows.push(`
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-[10px] bg-light-pink grid place-items-center shrink-0">
                                    ${ICONS.location}
                                </div>
                                <div>
                                    <p class="text-xs text-description font-primary">Location</p>
                                    <p class="text-sm text-heading font-medium font-primary">${member.location}</p>
                                </div>
                            </div>`);
  }

  return rows.join('');
}

function buildCardHtml(member) {
  const handle = twitterHandle(member.social?.twitter);
  const description = `Connect with ${member.name}, ${member.title} at ${member.company}. Save contact, scan QR code, or share digitally.`;
  const shortDescription = `Connect with ${member.name}, ${member.title} at ${member.company}.`;
  const canonicalUrl = `https://www.artisanscloud.com/team/${member.slug}`;
  const ogImage = `https://www.artisanscloud.com/assets/og/team/${member.slug}.png`;

  // card-data JSON — only include fields used by digital-card.js
  const cardData = {
    slug: member.slug,
    name: member.name,
    firstName: member.firstName,
    lastName: member.lastName,
    title: member.title,
    company: member.company,
    companyUrl: member.companyUrl,
    location: member.location || '',
    email: member.email || '',
    phone: member.phone || '',
    photo: member.photo,
    social: member.social || {},
  };

  return `<!DOCTYPE html>
<html>

<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">

    <title>${member.name} | Artisans Cloud</title>
    <link rel="canonical" href="${canonicalUrl}" />
    <meta name="description"
        content="${description}">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#8d68f6">

    <!-- Open Graph Meta Tags -->
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${member.name} | Artisans Cloud">
    <meta property="og:description"
        content="${description}">
    <meta property="og:type" content="profile">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter / X Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${member.name} | Artisans Cloud">
    <meta name="twitter:description" content="${shortDescription}">
    <meta name="twitter:image" content="${ogImage}">${handle ? `\n    <meta name="twitter:creator" content="${handle}">` : ''}

    <!-- Font Family -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="/assets/style/output.css">
</head>
<body class="bg-white">
    <div id="cursor" class="hidden lg:block fixed z-[1] w-36 h-36 rounded-full bg-primary blur-3xl pointer-events-none opacity-0"></div>

    <!-- Split Panel Layout -->
    <section class="w-full min-h-screen flex items-center justify-center py-8 px-4" data-digital-card="${member.slug}">

        <script id="card-data" type="application/json">
        ${JSON.stringify(cardData, null, 8).replace(/\n/g, '\n        ')}
        </script>

        <div class="max-w-[800px] w-full mx-auto">
            <div class="bg-white rounded-[30px] shadow-[0_8px_40px_rgba(141,104,246,0.12)] overflow-hidden">
                <div class="flex flex-col md:flex-row">
                    <!-- Left Panel - Purple gradient -->
                    <div class="md:w-[280px] shrink-0 bg-gradient-to-br from-primary via-[#a78bfa] to-sky p-6 md:p-8 flex flex-col items-center justify-center text-center text-white">
                        <div class="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/30 overflow-hidden mb-4 md:mb-5 shadow-lg">
                            <img src="${member.photo}" alt="${member.name}" class="w-full h-full object-cover" width="400" height="400">
                        </div>
                        <h1 class="text-xl font-semibold font-primary">${member.name}</h1>
                        <p class="mt-1 text-white/90 font-medium font-primary text-sm">${member.title}</p>
                        <p class="text-white/70 font-primary text-xs">${member.company}</p>
${buildSocialIcons(member.social)}

                        <!-- QR Code in left panel — hidden on mobile -->
                        <div class="hidden md:block mt-6 bg-white rounded-xl p-2">
                            <canvas id="qr-canvas"></canvas>
                        </div>
                    </div>

                    <!-- Right Panel - Content -->
                    <div class="flex-1 p-5 md:p-8 flex flex-col justify-center">
                        <!-- Bio -->
                        <div class="mb-6">
                            <p class="text-description text-sm font-primary leading-relaxed">${member.bio || ''}</p>
                        </div>

                        <!-- Contact Details -->
                        <div class="space-y-4 mb-6">${buildContactRows(member)}
                        </div>

                        <!-- Action Buttons -->
                        <div class="space-y-3">
                            <button data-action="save-contact"
                                class="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-[40px] bg-primary text-white font-semibold text-sm font-primary transition-all duration-300 hover:bg-primary-light active:scale-95 cursor-pointer">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                Save Contact
                            </button>

                            <div class="grid grid-cols-2 md:flex gap-2">
                                <button data-action="share-card"
                                    class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[40px] border border-[#D8D8D8] text-heading font-medium text-xs font-primary transition-all duration-300 hover:bg-heading hover:text-white active:scale-95 cursor-pointer">
                                    ${ICONS.share}
                                    Share
                                </button>
                                <button data-action="copy-link"
                                    class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[40px] border border-[#D8D8D8] text-heading font-medium text-xs font-primary transition-all duration-300 hover:bg-heading hover:text-white active:scale-95 cursor-pointer">
                                    ${ICONS.link}
                                    Copy Link
                                </button>
                                <button data-action="whatsapp-share"
                                    class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[40px] border border-[#D8D8D8] text-heading font-medium text-xs font-primary transition-all duration-300 hover:bg-[#25d366] hover:text-white hover:border-[#25d366] active:scale-95 cursor-pointer">
                                    ${ICONS.whatsapp}
                                    WhatsApp
                                </button>
                                <button data-action="email-card"
                                    class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[40px] border border-[#D8D8D8] text-heading font-medium text-xs font-primary transition-all duration-300 hover:bg-pink hover:text-white hover:border-pink active:scale-95 cursor-pointer">
                                    ${ICONS.emailBtn}
                                    Email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Branding -->
            <div class="mt-5 text-center">
                <a href="https://www.artisanscloud.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-description font-primary hover:text-primary transition-colors underline underline-offset-2">
                    Artisans Cloud
                    ${ICONS.externalLink}
                </a>
            </div>
        </div>
    </section>

    <script type='module' src='/assets/script/main.js'></script>
</body>
</html>
`;
}

function main() {
  const args = process.argv.slice(2);
  const slugIndex = args.indexOf('--slug');
  const targetSlug = slugIndex !== -1 ? args[slugIndex + 1] : null;

  const members = JSON.parse(
    readFileSync(join(ROOT, 'assets', 'data', 'team-members.json'), 'utf-8')
  );

  const toGenerate = targetSlug
    ? members.filter(m => m.slug === targetSlug)
    : members;

  if (targetSlug && toGenerate.length === 0) {
    console.error(`No member found with slug "${targetSlug}"`);
    process.exit(1);
  }

  mkdirSync(join(ROOT, 'team'), { recursive: true });

  for (const member of toGenerate) {
    const html = buildCardHtml(member);
    const outPath = join(ROOT, 'team', `${member.slug}.html`);
    writeFileSync(outPath, html, 'utf-8');
    console.log(`  team/${member.slug}.html`);
  }

  console.log(`Generated ${toGenerate.length} card(s).`);
}

main();
