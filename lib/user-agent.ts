interface ParsedUserAgent {
    browser: string;
    version: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    os: string;
}

export function parseUserAgent(userAgent: string): ParsedUserAgent {
    const ua = userAgent.toLowerCase();
    const result: ParsedUserAgent = {
        browser: 'Unknown Browser',
        version: 'unknown',
        deviceType: 'desktop',
        os: 'Unknown OS'
    };

    // Detect Browser and Version
    const browserMatches = [
        { regex: /opr\/([\d.]+)/, name: 'Opera' },
        { regex: /edg\/([\d.]+)/, name: 'Edge (Chromium)' },
        { regex: /edge\/([\d.]+)/, name: 'Edge (Legacy)' },
        { regex: /firefox\/([\d.]+)|fxios\/([\d.]+)/, name: 'Firefox' },
        { regex: /chrome\/([\d.]+)/, name: 'Chrome' },
        { regex: /version\/([\d.]+).*safari/, name: 'Safari' },
        { regex: /safari\/([\d.]+)/, name: 'Safari' },
        { regex: /msie ([\d.]+)/, name: 'Internet Explorer' },
    ];

    for (const { regex, name } of browserMatches) {
        const match = ua.match(regex);
        if (match) {
            result.browser = name;
            result.version = match[1] || match[2] || 'unknown';
            break;
        }
    }

    // Detect Operating System
    const osMatches = [
        { regex: /windows nt ([0-9._]+)/, name: 'Windows' },
        { regex: /mac os x ([0-9_]+)/, name: (v: string) => `macOS ${v.replace('_', '.').replace(/_/g, ' ')}` },
        { regex: /linux/, name: 'Linux' },
        { regex: /android ([0-9.]+)/, name: 'Android' },
        { regex: /(ipad|iphone|ipod)/, name: (match: string) => match === 'ipad' ? 'iPadOS' : 'iOS' },
    ];

    for (const { regex, name } of osMatches) {
        const match = ua.match(regex);
        if (match) {
            result.os = typeof name === 'function' ? name(match[1] || match[0]) : name;
            break;
        }
    }

    // Detect Device Type
    if (/ipad/.test(ua)) {
        result.deviceType = 'tablet';
    } else if (/android/.test(ua)) {
        result.deviceType = /mobile/.test(ua) ? 'mobile' : 'tablet';
    } else if (/iphone|ipod|mobile/.test(ua)) {
        result.deviceType = 'mobile';
    }

    return result;
}

export function formatUAString(parsed: ParsedUserAgent): string {
    const osDisplay = parsed.os.replace(/[0-9._]+$/, '').trim();
    return `${parsed.browser} ${parsed.version} on ${osDisplay}`;
}

// Example usage:
// const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15';
// const parsed = parseUserAgent(userAgent);
// console.log(formatUAString(parsed)); // "Safari 17.1 on macOS"
