
/*
How to use: 
<select class="switcherSelect TtBx Pg0 PgLtRt5 PgTpBm5">
    <option value="HTML">HTML</option>
    <option value="Js">JavaScript</option>
    <option value="Ts">TypeScript</option>
    <option value="cpp">c++</option>
</select>

<pre class="codeBlock highlight BrRs10">
    <code class="language-html  BrRs10" style="background: none">
    I am HTML code
    </code>
    <code class="language-js  BrRs10" style="background: none">
    I am JS code
    </code>
    <code class="language-ts  BrRs10" style="background: none">
    I am TS code
    </code>
    <code class="language-cpp  BrRs10" style="background: none">
    I am c++ code
    </code>
</pre>
Important: Value of option: <option value="HTML"> should match with class of code after {language - { value }}: <code class="language-html>
*/

class CodeSwitcherAndCopy {
    timeout;

    constructor() {
        this.init();
        this.timeout = null;
    }

    init() {
        const codeContainers = document.querySelectorAll('.codeContainer');
        codeContainers.forEach(container => this.setupContainer(container));
    }

    setupContainer(codeContainer) {
        const switcherSelect = codeContainer.querySelector('.switcherSelect');
        const codeBlock = codeContainer.querySelector('.codeBlock');
        const copyButton = codeContainer.querySelector('.copyButton');

        if (switcherSelect) {
            this.showCode(switcherSelect.value, codeBlock);
            switcherSelect.addEventListener('change', (e) => {
                this.showCode(e.target.value, codeBlock);
            });
        } else {
            console.log('No .switcherSelect found in this codeContainer');
        }

        if (copyButton) {
            copyButton.addEventListener('click', () => {
                this.copyCode(switcherSelect.value, codeBlock, copyButton);
            });
        }
    }

    showCode(programmingLanguage, codeBlock) {
        const codes = codeBlock.querySelectorAll('code');
        codes.forEach(code => {
            const language = `language-${programmingLanguage}`.toLowerCase();
            code.style.display = code.classList.contains(language) ? 'block' : 'none';
        });
    }

    copyCode(programmingLanguage, codeBlock, copyButton) {
        const codes = codeBlock.querySelectorAll('code');
        codes.forEach(code => {
            const language = `language-${programmingLanguage}`.toLowerCase();
            if (code.classList.contains(language)) {
                this.copyCodeHelper(code, copyButton);
            }
        });
    }

    async copyCodeHelper(codeElement, copyButton) {
        const codeContent = codeElement.textContent;
        // throttling: prevent multiple rapid clicks
        if (this.timeout) return;
        try {
            await navigator.clipboard.writeText(codeContent);
            // Get SVG elements inside the button
            const copyIcon = copyButton.querySelector("svg.copy-icon");
            const checkIcon = copyButton.querySelector("svg.check-icon");
            // Toggle visibility
            // Apply transition and toggle sizes
            Object.assign(copyIcon.style, {
                height: '0px',
                width: '0px',
                transition: 'width 0.3s ease, height 0.3s ease'
            });
            Object.assign(checkIcon.style, {
                height: '16px',
                width: '16px',
                transition: 'width 0.3s ease, height 0.3s ease'
            });

            // first clear the time 
            clearTimeout(this.timeout)
            // Revert back after 1 seconds
            this.timeout = setTimeout(() => {

                Object.assign(checkIcon.style, {
                    height: '0px',
                    width: '0px',
                    transition: 'width 0.3s ease, height 0.3s ease'
                });
                Object.assign(copyIcon.style, {
                    height: '16px',
                    width: '16px',
                    transition: 'width 0.3s ease, height 0.3s ease'
                });

                clearTimeout(this.timeout)
                this.timeout = null;
            }, 1000);
        } catch (error) {
            console.log("Failed to copy code");
        }
    }

}

// Initialize
const codeSwitcherAndCopy = new CodeSwitcherAndCopy();