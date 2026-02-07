export class GuidedMode {
    constructor(app) {
        this.app = app;
        this.currentStep = 0;
        this.steps = [
            {
                title: "Welcome to BlockSim Pro",
                text: "This guided tour will teach you the fundamentals of Blockchain. Let's start!",
                target: null,
                action: "next"
            },
            {
                title: "1. Create a Transaction",
                text: "Blockchains store data in blocks. The data is usually transactions. Enter 'Alice', 'Bob', and '10' and click 'Add to Mempool'.",
                target: "transaction-creator",
                check: () => this.app.blockchain.mempool.length > 0
            },
            {
                title: "2. The Mempool",
                text: "Transactions wait here in the 'Mempool' until they are included in a block. Click 'Create Block' to gather them.",
                target: "mempool-section",
                check: () => document.getElementById('block-builder') && !document.getElementById('block-builder').classList.contains('hidden')
            },
            {
                title: "3. Mining (Proof of Work)",
                text: "To secure the block, we must solve a puzzle (find a hash starting with zeros). This is called Mining. Click 'Mine Block'.",
                target: "block-builder",
                check: () => this.app.currentBlock && this.app.currentBlock.hash
            },
            {
                title: "4. Add to Chain",
                text: "Once mined, the block is valid. Click 'Add Block to Chain' to permanently record it.",
                target: "block-builder",
                check: () => this.app.blockchain.chain.length > 1
            },
            {
                title: "5. The Blockchain",
                text: "Here is your new block! It is linked to the previous one via 'Previous Hash'. This link makes the chain secure.",
                target: "blockchain-section",
                action: "next"
            },
            {
                title: "6. Tampering (Attack)",
                text: "Let's try to break it. Enable 'Tamper Mode' in settings.",
                target: "settings-section",
                check: () => this.app.state.tamperMode
            },
            {
                title: "7. Edit Data",
                text: "Now, go to the last block and change a transaction amount. Notice how the block turns INVALID (Red).",
                target: "blockchain-container",
                check: () => this.app.blockchain.chain.some(b => !b.isValid)
            },
            {
                title: "8. Fix the Chain",
                text: "To fix it, you must re-mine the block. Click 'Re-mine/Fix' on the invalid block.",
                target: "blockchain-container",
                check: () => this.app.blockchain.chain.every(b => b.isValid)
            },
            {
                title: "Tutorial Complete!",
                text: "You've learned how blocks are created, mined, and secured. Feel free to explore freely!",
                target: null,
                action: "finish"
            }
        ];
    }

    start() {
        this.currentStep = 0;
        this.showOverlay();
        this.renderStep();
    }

    showOverlay() {
        if (document.getElementById('guide-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'guide-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '999';
        overlay.style.pointerEvents = 'none'; // Allow clicking through to target? No, usually we want to block except target.
        // But for simplicity, we allow clicks everywhere but highlight target.
        document.body.appendChild(overlay);

        const card = document.createElement('div');
        card.id = 'guide-card';
        card.className = 'card';
        card.style.position = 'fixed';
        card.style.bottom = '20px';
        card.style.left = '50%';
        card.style.transform = 'translateX(-50%)';
        card.style.zIndex = '1000';
        card.style.maxWidth = '90%';
        card.style.width = '400px';
        card.style.backgroundColor = 'var(--bg-secondary)';
        card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
        document.body.appendChild(card);
    }

    renderStep() {
        const step = this.steps[this.currentStep];
        const card = document.getElementById('guide-card');
        if (!card) return;

        // Highlight target
        document.querySelectorAll('.guide-highlight').forEach(el => el.classList.remove('guide-highlight'));
        if (step.target) {
            const targetEl = document.getElementById(step.target);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetEl.style.position = 'relative';
                targetEl.style.zIndex = '1001'; // Bring above overlay
                targetEl.style.boxShadow = '0 0 0 4px var(--accent)';
                targetEl.classList.add('guide-highlight');
            }
        }

        let btnText = "Next";
        let btnAction = `window.app.guidedMode.next()`;

        if (step.check) {
            btnText = "I did it! (Check)";
        } else if (step.action === 'finish') {
            btnText = "Finish";
            btnAction = `window.app.guidedMode.end()`;
        }

        card.innerHTML = `
            <h3 style="margin-top:0;">${step.title}</h3>
            <p>${step.text}</p>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button class="btn-sm" onclick="window.app.guidedMode.end()" style="background: transparent; color: var(--text-muted); border: 1px solid var(--border);">Skip</button>
                <button class="btn-sm" onclick="${btnAction}">${btnText}</button>
            </div>
            <small>Step ${this.currentStep + 1} of ${this.steps.length}</small>
        `;
    }

    next() {
        const step = this.steps[this.currentStep];
        if (step.check) {
            if (step.check()) {
                this.currentStep++;
                this.renderStep();
            } else {
                alert("Please complete the action first!");
            }
        } else {
            this.currentStep++;
            this.renderStep();
        }
    }

    end() {
        document.getElementById('guide-overlay').remove();
        document.getElementById('guide-card').remove();
        document.querySelectorAll('.guide-highlight').forEach(el => {
            el.style.zIndex = '';
            el.style.boxShadow = '';
            el.classList.remove('guide-highlight');
        });
    }
}
