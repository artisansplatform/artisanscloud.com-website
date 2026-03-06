import QRCode from 'qrcode';

async function fetchPhotoBase64(photoPath) {
    try {
        const url = `${window.location.origin}${photoPath}`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const blob = await response.blob();

        // Convert to JPEG via canvas for maximum vCard compatibility.
        // iOS and Android contacts apps often reject TYPE=PNG or oversized photos.
        return new Promise((resolve) => {
            const objectUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                // Cap at 300×300 — large embedded photos get silently dropped by some apps
                const size = Math.min(img.naturalWidth, img.naturalHeight, 300);
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                // Center-crop to square
                const sx = (img.naturalWidth - size) / 2;
                const sy = (img.naturalHeight - size) / 2;
                ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
                URL.revokeObjectURL(objectUrl);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                resolve({ base64: dataUrl.split(',')[1], typeStr: 'JPEG' });
            };
            img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(null); };
            img.src = objectUrl;
        });
    } catch {
        return null;
    }
}

// Fold a vCard property value at 75 chars per line (CRLF + space continuation)
function foldVCardLine(line) {
    if (line.length <= 75) return line;
    let result = line.substring(0, 75);
    let i = 75;
    while (i < line.length) {
        result += '\r\n ' + line.substring(i, i + 74);
        i += 74;
    }
    return result;
}

async function generateVCardString(data) {
    const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        foldVCardLine(`N:${data.lastName};${data.firstName};;;`),
        foldVCardLine(`FN:${data.name}`),
        foldVCardLine(`ORG:${data.company}`),
        foldVCardLine(`TITLE:${data.title}`),
    ];

    if (data.email) lines.push(foldVCardLine(`EMAIL;TYPE=WORK:${data.email}`));
    if (data.phone) lines.push(foldVCardLine(`TEL;TYPE=WORK:${data.phone}`));
    if (data.companyUrl) lines.push(foldVCardLine(`URL:${data.companyUrl}`));
    if (data.social?.linkedin) lines.push(foldVCardLine(`X-SOCIALPROFILE;TYPE=linkedin:${data.social.linkedin}`));
    if (data.social?.twitter) lines.push(foldVCardLine(`X-SOCIALPROFILE;TYPE=twitter:${data.social.twitter}`));
    if (data.social?.github) lines.push(foldVCardLine(`X-SOCIALPROFILE;TYPE=github:${data.social.github}`));
    if (data.location) lines.push(foldVCardLine(`ADR;TYPE=WORK:;;${data.location};;;;`));

    // Embed photo as base64 for offline contact saving
    if (data.photo) {
        const photo = await fetchPhotoBase64(data.photo);
        if (photo) {
            lines.push(foldVCardLine(`PHOTO;ENCODING=b;TYPE=${photo.typeStr}:${photo.base64}`));
        } else {
            // Fallback to URI reference if fetch fails
            lines.push(foldVCardLine(`PHOTO;VALUE=URI:https://www.artisanscloud.com${data.photo}`));
        }
    }

    lines.push('END:VCARD');
    return lines.join('\r\n');
}

async function downloadVCard(data) {
    const vcf = await generateVCardString(data);
    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.slug}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function renderQRCode(canvasEl, url) {
    if (!canvasEl) return;
    try {
        await QRCode.toCanvas(canvasEl, url, {
            width: 200,
            margin: 2,
            color: {
                dark: '#222222',
                light: '#ffffff',
            },
        });
    } catch (err) {
        console.error('QR Code generation failed:', err);
    }
}

function shareCard(url, name) {
    if (navigator.share) {
        navigator.share({
            title: `${name} - Digital Business Card`,
            text: `Connect with ${name} at Artisans Cloud`,
            url: url,
        }).catch(() => {});
    } else {
        copyToClipboard(url);
    }
}

async function copyToClipboard(text) {
    // navigator.clipboard requires HTTPS and a user gesture — works on modern iOS/Android
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            showToast('Link copied to clipboard!');
            return;
        } catch {
            // fall through to textarea fallback
        }
    }
    // Fallback: textarea + setSelectionRange works on iOS Safari where execCommand
    // requires a visible, focused, selected element (input.select() alone is not enough)
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
    document.body.appendChild(el);
    el.focus();
    el.setSelectionRange(0, text.length);
    try { document.execCommand('copy'); } catch { /* silent */ }
    document.body.removeChild(el);
    showToast('Link copied to clipboard!');
}

function showToast(message) {
    const existing = document.querySelector('.card-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'card-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: #222222;
        color: white;
        padding: 12px 24px;
        border-radius: 40px;
        font-family: "Poppins", sans-serif;
        font-size: 14px;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

export function initDigitalCard() {
    const cardContainer = document.querySelector('[data-digital-card]');
    if (!cardContainer) return;

    const slug = cardContainer.dataset.digitalCard;
    const cardUrl = `${window.location.origin}/team/${slug}`;

    // Load team member data from the embedded script tag
    const dataEl = document.getElementById('card-data');
    if (!dataEl) return;

    let data;
    try {
        data = JSON.parse(dataEl.textContent);
    } catch {
        return;
    }

    // Render QR code
    const qrCanvas = document.getElementById('qr-canvas');
    if (qrCanvas) renderQRCode(qrCanvas, cardUrl);

    // Save Contact button
    const saveBtn = document.querySelector('[data-action="save-contact"]');
    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            saveBtn.disabled = true;
            await downloadVCard(data);
            saveBtn.disabled = false;
        });
    }

    // Share button (native share or copy)
    const shareBtn = document.querySelector('[data-action="share-card"]');
    if (shareBtn) {
        shareBtn.addEventListener('click', (e) => {
            e.preventDefault();
            shareCard(cardUrl, data.name);
        });
    }

    // Copy link button
    const copyBtn = document.querySelector('[data-action="copy-link"]');
    if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            copyToClipboard(cardUrl);
        });
    }

    // Email card button
    const emailBtn = document.querySelector('[data-action="email-card"]');
    if (emailBtn) {
        emailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const subject = encodeURIComponent(`${data.name} - Digital Business Card`);
            const body = encodeURIComponent(`Connect with ${data.name} at ${data.company}:\n${cardUrl}`);
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
        });
    }

    // WhatsApp share button
    const whatsappBtn = document.querySelector('[data-action="whatsapp-share"]');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const text = encodeURIComponent(`Connect with ${data.name} at ${data.company}: ${cardUrl}`);
            window.open(`https://wa.me/?text=${text}`, '_blank');
        });
    }
}
