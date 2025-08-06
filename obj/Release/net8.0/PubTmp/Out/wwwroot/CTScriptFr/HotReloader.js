class HotReloader {
    constructor() {
        // Initialize script content tracking
        this._scriptContents = new Map();

        // Bind methods to preserve context
        this.handleClick = this.handleClick.bind(this);
        this.handlePopState = this.handlePopState.bind(this);

        // Initialize popstate listener
        window.addEventListener('popstate', this.handlePopState);
    }

    // Initialize hot reloading on links
    initAllLinks(selector = 'a[href]') {
        document.querySelectorAll(selector).forEach(link => {
            link.addEventListener('click', (e) => this.handleClick(e, link));
        });
    }

    initATag(e, a) {
        this.handleClick(e, a);
    }

    // URL handling methods
    _cleanUrl(url) {
        if (!url || url === '#') return null;
        url = url.replace('~', '');
        return url.startsWith('/') ? url : '/' + url;
    }

    _getFullUrl(path) {
        return window.location.origin + path;
    }

    // Content fetching and parsing
    async _fetchContent(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    }

    _parseHTML(html) {
        const parser = new DOMParser();
        return parser.parseFromString(html, 'text/html');
    }

    // Script handling methods
    _categorizeScripts(doc) {
        const scripts = Array.from(doc.getElementsByTagName('script'));
        return {
            external: scripts.filter(script => script.src),
            inline: scripts.filter(script => !script.src)
        };
    }

    async _loadExternalScript(script) {
        const scriptSrc = script.src;
        try {
            // Get or fetch script content
            let scriptContent = this._scriptContents.get(scriptSrc);
            if (!scriptContent) {
                const response = await fetch(scriptSrc);
                scriptContent = await response.text();
                this._scriptContents.set(scriptSrc, scriptContent);
            }

            // Check if script contains DOMContentLoaded
            if (scriptContent.includes('DOMContentLoaded')) {
                scriptContent = `
                // Handle DOMContentLoaded for dynamically loaded scripts
                const originalContent = function() {
                    ${scriptContent}
                };

                if (document.readyState === 'loading') {
                    // Let original DOMContentLoaded handlers work if page is still loading
                    originalContent();
                } else {
                    // If page already loaded, replace DOMContentLoaded with immediate execution
                    const oldAddEventListener = document.addEventListener;
                    document.addEventListener = function(event, handler) {
                        if (event === 'DOMContentLoaded') {
                           setTimeout(function() { 
                            handler(); 
                        }, 1000);
                        } else {
                            oldAddEventListener.apply(document, arguments);
                        }
                    };
                    originalContent();
                    document.addEventListener = oldAddEventListener;
                }
            `;
            }

            // Create and configure new script element
            const newScript = document.createElement('script');
            newScript.setAttribute('data-dynamic', 'true');

            // Wrap content in IIFE with guard clause
            newScript.textContent = `
        (function() {
            ${scriptContent}
        })();
        `;

            // Copy original attributes except src
            Array.from(script.attributes).forEach(attr => {
                if (attr.name !== 'src' && attr.name !== 'data-dynamic') {
                    newScript.setAttribute(attr.name, attr.value);
                }
            });

            document.body.appendChild(newScript);
        } catch (error) {
            console.error(`Error loading script ${scriptSrc}:`, error);
        }
    }

    _loadInlineScript(script) {
        let scriptContent = script.textContent;

        // Check if script contains DOMContentLoaded
        if (scriptContent.includes('DOMContentLoaded')) {
            // Don't try to transform with regex, use a safer approach
            scriptContent = `
        (function() {
            const originalContent = function() {
                ${scriptContent}
            };

            if (document.readyState === 'loading') {
                // Let original DOMContentLoaded handlers work if page is still loading
                originalContent();
            } else { // complete
                // If page already loaded, replace DOMContentLoaded with immediate execution
                const oldAddEventListener = document.addEventListener;
                document.addEventListener = function(event, handler) {
                    if (event === 'DOMContentLoaded') {
                        setTimeout(function() {
                            handler(); 
                        }, 1000);
                        oldAddEventListener.apply(document, arguments);
                    }
                };
                originalContent();
                document.addEventListener = oldAddEventListener;
            }
        })()
        `;
        }

        const newScript = document.createElement('script');
        newScript.setAttribute('data-dynamic', 'true');
        newScript.textContent = `
        (function() {
            ${scriptContent}
        })();
    `;
        document.body.appendChild(newScript);
    }

    // Content update methods
    _cleanupOldScripts() {
        const oldScripts = document.querySelectorAll('script[data-dynamic]');
        oldScripts.forEach(script => {
            const src = script.getAttribute('src');
            if (src) {
                this._scriptContents.delete(src);
            }
            script.remove();
        });
    }

    async _updateContent(doc) {
        const newContent = doc.querySelector('#RenderBody');
        if (!newContent) {
            throw new Error('Could not find RenderBody element in new page');
        }

        const currentContent = document.querySelector('#RenderBody');
        if (currentContent) {
            this._cleanupOldScripts();
            currentContent.innerHTML = newContent.innerHTML;
        }

        // Process scripts
        const { external, inline } = this._categorizeScripts(doc);

        // Load scripts sequentially
        for (const script of external) {
            await this._loadExternalScript(script);
        }
        inline.forEach(script => this._loadInlineScript(script));
    }

    // Event handlers
    async handleClick(e, link) {
        e.preventDefault();
        const targetUrl = this._cleanUrl(link.getAttribute('href'));
        if (!targetUrl) return;

        const fullUrl = this._getFullUrl(targetUrl);
        history.pushState(null, '', targetUrl);

        try {
            const html = await this._fetchContent(fullUrl);
            const doc = this._parseHTML(html);
            await this._updateContent(doc);
        } catch (err) {
            console.error('Error loading page:', err);
            alert('Failed to load the page. Please try again.');
        }
    }

    async handlePopState() {
        try {
            const html = await this._fetchContent(window.location.href);
            const doc = this._parseHTML(html);
            await this._updateContent(doc);
        } catch (err) {
            console.error('Error handling navigation:', err);
        }
    }
}

// Export the class
//module.exports = HotReloader;

// Make Hot available globally
window.HotReloader = HotReloader;