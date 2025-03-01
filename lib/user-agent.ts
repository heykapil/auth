export function  parseUserAgent(ua: string): string {
    let device = "Unknown Device";
    let browser = "Unknown Browser";
    let version = "";

    // Detect device
    if (/Android/.test(ua)) {
        device = "Android Mobile";
    } else if (/iPhone|iPad|iPod/.test(ua)) {
        device = "iOS Device";
    } else if (/Macintosh/.test(ua)) {
        device = "macOS";
    } else if (/Windows/.test(ua)) {
        device = "Windows PC";
    } else if (/Linux/.test(ua) && !/Android/.test(ua)) {
        device = "Linux PC";
    }

    // Detect browser and version
    const browserRegexes: [RegExp, string][] = [
        [/Chrome\/([\d.]+)/, "Chrome"],
        [/Firefox\/([\d.]+)/, "Firefox"],
        [/Version\/([\d.]+) Safari\//, "Safari"],
        [/MSIE ([\d.]+)/, "Internet Explorer"],
        [/Trident.*rv:([\d.]+)/, "Internet Explorer"],
        [/Edge\/([\d.]+)/, "Edge"],
        [/Opera\/([\d.]+)/, "Opera"],
        [/OPR\/([\d.]+)/, "Opera"]
    ];

    for (const [regex, name] of browserRegexes) {
        const match = ua.match(regex);
        if (match) {
            browser = name;
            version = match[1];
            break;
        }
    }

    return `${browser} ${version} on ${device}`;
}

// Example usage:
// const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15';
// console.log(parseUserAgent(userAgent)); // "Safari 17.1 on macOS"
