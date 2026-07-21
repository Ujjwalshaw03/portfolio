document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const resultsSection = document.getElementById('resultsSection');
    const loader = document.getElementById('loader');
    const tableBody = document.getElementById('tableBody');
    const exportBtn = document.getElementById('exportBtn');
    
    // Modal Elements
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveKeysBtn = document.getElementById('saveKeysBtn');
    const serpApiKeyInput = document.getElementById('serpApiKey');
    const llmApiKeyInput = document.getElementById('llmApiKey');

    let currentLeads = [];

    // Load keys from local storage
    serpApiKeyInput.value = localStorage.getItem('serpApiKey') || '';
    llmApiKeyInput.value = localStorage.getItem('llmApiKey') || '';

    // Modal Logic
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    saveKeysBtn.addEventListener('click', () => {
        localStorage.setItem('serpApiKey', serpApiKeyInput.value);
        localStorage.setItem('llmApiKey', llmApiKeyInput.value);
        settingsModal.classList.add('hidden');
    });

    // Close modal on outside click
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    // Handle Search Submission
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const query = searchInput.value.trim();
        if (!query) return;

        // Show loading state
        resultsSection.classList.remove('hidden');
        loader.classList.remove('hidden');
        tableBody.innerHTML = '';
        exportBtn.classList.add('hidden');

        try {
            const serpApiKey = localStorage.getItem('serpApiKey') || '';
            const llmApiKey = localStorage.getItem('llmApiKey') || '';

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    serpApiKey,
                    llmApiKey
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate leads');
            }

            currentLeads = data.leads || [];
            
            if (data.message) {
                alert(data.message); // Show mock data message if applicable
            }

            renderTable(currentLeads);
            
            if (currentLeads.length > 0) {
                exportBtn.classList.remove('hidden');
            }

        } catch (error) {
            console.error('Error:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state" style="color: var(--error)">
                        Error: ${error.message}. <br> Check your API keys and try again.
                    </td>
                </tr>
            `;
        } finally {
            loader.classList.add('hidden');
        }
    });

    function renderTable(leads) {
        if (leads.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        No leads found. Try a different search query.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = leads.map(lead => `
            <tr>
                <td>${lead.count}</td>
                <td>${lead.firstName || '-'}</td>
                <td>${lead.lastName || '-'}</td>
                <td>${lead.companyName || '-'}</td>
                <td>
                    ${lead.companyWebsite ? `<a href="${lead.companyWebsite}" target="_blank">Link</a>` : '-'}
                </td>
                <td>
                    ${lead.socialLink ? `<a href="${lead.socialLink}" target="_blank">Profile</a>` : '-'}
                </td>
                <td>
                    ${lead.email ? `<a href="mailto:${lead.email}">${lead.email}</a>` : '-'}
                </td>
            </tr>
        `).join('');
    }

    // CSV Export
    exportBtn.addEventListener('click', () => {
        if (currentLeads.length === 0) return;

        const headers = ['Count', 'First Name', 'Last Name', 'Company Name', 'Company Website', 'Social Link', 'Email'];
        
        const csvRows = [
            headers.join(','),
            ...currentLeads.map(lead => [
                lead.count,
                `"${lead.firstName || ''}"`,
                `"${lead.lastName || ''}"`,
                `"${lead.companyName || ''}"`,
                `"${lead.companyWebsite || ''}"`,
                `"${lead.socialLink || ''}"`,
                `"${lead.email || ''}"`
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'leads_export.csv');
        a.click();
        
        URL.revokeObjectURL(url);
    });
});
