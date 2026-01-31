import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Vercel Security Configuration', () => {
    let vercelConfig;

    beforeAll(() => {
        const configPath = join(process.cwd(), 'vercel.json');
        const configContent = readFileSync(configPath, 'utf8');
        vercelConfig = JSON.parse(configContent);
    });

    it('should have a valid vercel.json file', () => {
        expect(vercelConfig).toBeDefined();
        expect(vercelConfig).toBeTypeOf('object');
    });

    it('should have headers configuration', () => {
        expect(vercelConfig.headers).toBeDefined();
        expect(Array.isArray(vercelConfig.headers)).toBe(true);
        expect(vercelConfig.headers.length).toBeGreaterThan(0);
    });

    it('should apply security headers to all routes', () => {
        const headerConfig = vercelConfig.headers.find(h => h.source === '/(.*)');
        expect(headerConfig).toBeDefined();
        expect(headerConfig.headers).toBeDefined();
    });

    it('should have X-Content-Type-Options header set to nosniff', () => {
        const headerConfig = vercelConfig.headers[0];
        const xContentTypeOptions = headerConfig.headers.find(h => h.key === 'X-Content-Type-Options');
        
        expect(xContentTypeOptions).toBeDefined();
        expect(xContentTypeOptions.value).toBe('nosniff');
    });

    it('should have X-Frame-Options header set to DENY', () => {
        const headerConfig = vercelConfig.headers[0];
        const xFrameOptions = headerConfig.headers.find(h => h.key === 'X-Frame-Options');
        
        expect(xFrameOptions).toBeDefined();
        expect(xFrameOptions.value).toBe('DENY');
    });

    it('should have X-XSS-Protection header enabled', () => {
        const headerConfig = vercelConfig.headers[0];
        const xssProtection = headerConfig.headers.find(h => h.key === 'X-XSS-Protection');
        
        expect(xssProtection).toBeDefined();
        expect(xssProtection.value).toBe('1; mode=block');
    });

    it('should have Referrer-Policy header configured', () => {
        const headerConfig = vercelConfig.headers[0];
        const referrerPolicy = headerConfig.headers.find(h => h.key === 'Referrer-Policy');
        
        expect(referrerPolicy).toBeDefined();
        expect(referrerPolicy.value).toBe('strict-origin-when-cross-origin');
    });

    it('should have Permissions-Policy header configured', () => {
        const headerConfig = vercelConfig.headers[0];
        const permissionsPolicy = headerConfig.headers.find(h => h.key === 'Permissions-Policy');
        
        expect(permissionsPolicy).toBeDefined();
        expect(permissionsPolicy.value).toBe('camera=(), microphone=(), geolocation=()');
    });

    it('should have Strict-Transport-Security header configured', () => {
        const headerConfig = vercelConfig.headers[0];
        const hsts = headerConfig.headers.find(h => h.key === 'Strict-Transport-Security');
        
        expect(hsts).toBeDefined();
        expect(hsts.value).toBe('max-age=31536000; includeSubDomains');
    });

    it('should have all 6 essential security headers', () => {
        const headerConfig = vercelConfig.headers[0];
        const securityHeaders = [
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection',
            'Referrer-Policy',
            'Permissions-Policy',
            'Strict-Transport-Security'
        ];
        
        const configuredHeaders = headerConfig.headers.map(h => h.key);
        
        securityHeaders.forEach(header => {
            expect(configuredHeaders).toContain(header);
        });
        
        expect(headerConfig.headers.length).toBe(6);
    });
});
