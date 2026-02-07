export class Renderer {
    constructor(blockchain, app) {
        this.blockchain = blockchain;
        this.app = app;
    }

    renderAll() {
        this.renderMempool();
        this.renderBlockchain();
    }

    renderMempool() {
        const list = document.getElementById('mempool-list');
        const countBadge = document.getElementById('mempool-count');
        const createBlockBtn = document.getElementById('create-block-btn');

        if (!list || !countBadge) return;

        list.innerHTML = '';
        countBadge.textContent = this.blockchain.mempool.length;

        if (this.blockchain.mempool.length === 0) {
            list.innerHTML = '<p class="placeholder-text">No pending transactions.</p>';
            if(createBlockBtn) createBlockBtn.disabled = true;
            return;
        }

        if(createBlockBtn) createBlockBtn.disabled = false;

        this.blockchain.mempool.forEach(tx => {
            const el = document.createElement('div');
            el.className = 'transaction-item';
            el.innerHTML = `
                <div class="tx-details">
                    <strong>${this.escapeHtml(tx.sender)}</strong> ➝ <strong>${this.escapeHtml(tx.receiver)}</strong> : ${tx.amount}
                    <br><small class="text-muted">${new Date(tx.timestamp).toLocaleTimeString()}</small>
                </div>
                <button class="tx-remove-btn" data-id="${tx.id}">&times;</button>
            `;
            // Add event listener for remove
            el.querySelector('.tx-remove-btn').addEventListener('click', () => {
                this.app.removeTransaction(tx.id);
            });
            list.appendChild(el);
        });
    }

    renderBlockchain() {
        const container = document.getElementById('blockchain-container');
        if (!container) return;

        container.innerHTML = '';

        this.blockchain.chain.forEach((block, index) => {
            if (index > 0) {
                const arrow = document.createElement('div');
                arrow.className = 'block-arrow';
                arrow.innerHTML = '➜';
                container.appendChild(arrow);
            }

            const card = document.createElement('div');
            card.className = `block-card ${block.isValid ? 'valid' : 'invalid'}`;
            if (!block.isValid) card.classList.add('tampered');

            // Validator info if PoS
            let validatorInfo = '';
            if (block.validator) {
                validatorInfo = `<div class="validator-badge" style="background-color: ${block.validator.color}; color: white; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 8px; font-size: 0.8rem;">
                    Validated by: ${block.validator.name}
                </div>`;
            }

            // Transactions List
            let txHtml = '';
            if (this.app.state.tamperMode && index > 0) { // Can't tamper Genesis tx easily via UI for now
                 txHtml = `<div class="block-tx-list">`;
                 block.transactions.forEach((tx, txIndex) => {
                     txHtml += `
                        <div style="margin-bottom: 8px; border-bottom: 1px dashed var(--border); padding-bottom: 4px;">
                            <input type="text" style="width: 80px; padding: 4px; font-size: 0.8rem;" value="${this.escapeHtml(tx.sender)}" onchange="window.app.tamperTransaction(${index}, ${txIndex}, 'sender', this.value)">
                            ➜
                            <input type="text" style="width: 80px; padding: 4px; font-size: 0.8rem;" value="${this.escapeHtml(tx.receiver)}" onchange="window.app.tamperTransaction(${index}, ${txIndex}, 'receiver', this.value)">
                            :
                            <input type="number" style="width: 60px; padding: 4px; font-size: 0.8rem;" value="${tx.amount}" onchange="window.app.tamperTransaction(${index}, ${txIndex}, 'amount', this.value)">
                        </div>
                     `;
                 });
                 txHtml += `</div>`;
            } else {
                const txClass = block.isValid ? '' : 'tx-invalid';
                // Using details/summary for expandability
                txHtml = `
                    <details ${block.transactions.length > 0 ? '' : 'disabled'}>
                        <summary style="cursor: pointer; outline: none;">${block.transactions.length} Transactions</summary>
                        <ul class="block-tx-list ${txClass}" style="list-style: none; padding-left: 0; margin-top: 5px;">
                            ${block.transactions.map(tx => `
                                <li style="padding: 4px 0; border-bottom: 1px dashed #eee;">
                                    ${this.escapeHtml(tx.sender)} ➝ ${this.escapeHtml(tx.receiver)}: <strong>${tx.amount}</strong>
                                </li>
                            `).join('')}
                        </ul>
                    </details>
                `;
            }

            // Previous Hash (Editable in Tamper Mode)
            let prevHashHtml = `<span class="prev-hash">${this.formatHash(block.previousHash)}</span>`;
            if (this.app.state.tamperMode && index > 0) {
                prevHashHtml = `<input type="text" style="font-family: monospace; font-size: 0.8rem; width: 100%;" value="${block.previousHash}" onchange="window.app.tamperPreviousHash(${index}, this.value)">`;
            }

            // Status Badge
            const statusHtml = block.isValid
                ? `<div class="block-status status-valid" style="color: var(--success); font-weight: bold;">✓ VALID</div>`
                : `<div class="block-status status-invalid" style="color: var(--danger); font-weight: bold;">✗ INVALID</div>`;

            const reasonHtml = block.isValid ? '' : `<div class="invalid-reason" style="color: var(--danger); font-size: 0.8rem; margin-bottom: 5px;">⚠️ ${block.invalidReason}</div>`;

            // Action Buttons
            let actionHtml = '';
            if (!block.isValid) {
                 actionHtml = `<button id="remine-btn-${index}" class="btn-sm" style="margin-top: 10px;" onclick="window.app.reMineBlock(${index})">Re-mine / Fix</button>`;
            }

            card.innerHTML = `
                <div class="block-index">#${block.index}</div>
                ${statusHtml}
                ${reasonHtml}
                ${validatorInfo}

                <div class="block-data-row" style="margin-bottom: 10px; font-size: 0.85rem; color: var(--text-muted);">
                     <span style="margin-right: 10px;">Diff: <strong>${block.difficulty}</strong></span>
                     <span>Nonce: <strong>${block.nonce}</strong></span>
                </div>

                <div style="margin: 10px 0;">
                    <small>Previous Hash:</small><br>
                    ${prevHashHtml}
                </div>

                <div style="margin: 10px 0;">
                    <small>Hash:</small><br>
                    <span class="hash">${this.formatHash(block.hash)}</span>
                </div>

                ${(!block.isValid && block.calculatedHash && block.calculatedHash !== block.hash) ? `
                <div style="margin: 10px 0; color: var(--danger);">
                    <small>Actual Hash (Mismatch):</small><br>
                    <span class="hash" style="background: var(--danger-bg);">${this.formatHash(block.calculatedHash)}</span>
                </div>` : ''}

                <div style="margin: 10px 0;">
                    ${txHtml}
                </div>

                <div style="text-align: center;">
                    ${actionHtml}
                </div>
            `;

            container.appendChild(card);
        });
    }

    formatHash(h) {
        return h ? `${h.substring(0, 10)}...${h.substring(h.length - 8)}` : "None";
    }

    escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
