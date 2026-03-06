import QRCode from 'qrcode';

function generateVCardString(data) {
    const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${data.lastName};${data.firstName};;;`,
        `FN:${data.name}`,
        `ORG:${data.company}`,
        `TITLE:${data.title}`,
    ];

    if (data.email) lines.push(`EMAIL;TYPE=WORK:${data.email}`);
    if (data.phone) lines.push(`TEL;TYPE=WORK:${data.phone}`);
    if (data.companyUrl) lines.push(`URL:${data.companyUrl}`);
    if (data.social?.linkedin) lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${data.social.linkedin}`);
    if (data.social?.twitter) lines.push(`X-SOCIALPROFILE;TYPE=twitter:${data.social.twitter}`);
    if (data.social?.github) lines.push(`X-SOCIALPROFILE;TYPE=github:${data.social.github}`);
    if (data.photo) lines.push(`PHOTO;VALUE=URI:https://www.artisanscloud.com${data.photo}`);
    if (data.location) lines.push(`ADR;TYPE=WORK:;;${data.location};;;;`);

    lines.push('END:VCARD');
    return lines.join('\r\n');
}

function downloadVCard(data) {
    const vcf = generateVCardString(data);
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

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Link copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('Link copied to clipboard!');
    });
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
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            downloadVCard(data);
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
