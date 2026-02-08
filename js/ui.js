import { AppState } from './appState.js';
import { navigateTo, isModuleLocked, completeModule } from './router.js';
import { renderModule1, isModule1Complete } from '../modules/ledger.js';
import { getBlockchain, isChainEmpty } from './blockchain.js';
import { renderModule2 } from '../modules/block.js';
import { renderModule3 } from '../modules/hashing.js';
import { renderModule4 } from '../modules/chain.js';

// DOM Elements
const sidebar = document.getElementById('sidebar');
const moduleNav = document.getElementById('module-nav');
const mobileNav = document.getElementById('mobile-nav');
const mainContent = document.getElementById('main-content');
const blockchainPanel = document.getElementById('blockchain-panel'); // The drawer content
const drawer = document.getElementById('blockchain-drawer');
const backdrop = document.getElementById('drawer-backdrop');
const toggleBtn = document.getElementById('blockchain-toggle-btn');
const closeDrawerBtn = document.getElementById('close-drawer-btn');

// Module Definitions (Metadata)
const MODULES = [
    { id: 0, title: "Introduction", icon: "👋", shortTitle: "Intro" },
    { id: 1, title: "Ledger", icon: "📒", shortTitle: "Ledger" },
    { id: 2, title: "Blocks", icon: "🧱", shortTitle: "Blocks" },
    { id: 3, title: "Hashing", icon: "🔐", shortTitle: "Hash" },
    { id: 4, title: "Blockchain", icon: "⛓️", shortTitle: "Chain" }
];

/**
 * Main render function.
 * Updates the entire UI based on the current AppState.
 */
export function renderUI() {
    renderSidebar();
    renderMobileNav();
    renderMainContent();
    renderBlockchainPanel();
    updateDrawerVisibility();
}

/**
 * Renders the sidebar navigation (Desktop).
 */
function renderSidebar() {
    if (!moduleNav) return;
    moduleNav.innerHTML = '';

    MODULES.forEach(mod => {
        const isLocked = isModuleLocked(mod.id);
        const isActive = AppState.currentModule === mod.id;

        const btn = document.createElement('button');
        btn.className = `nav-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`;

        let label = `${mod.icon} ${mod.title}`;
        if (isLocked) {
            label = `🔒 ${mod.title}`;
        }

        btn.textContent = label;

        btn.onclick = () => {
            if (!isLocked && !isActive) {
                navigateTo(mod.id);
            }
        };

        moduleNav.appendChild(btn);
    });
}

/**
 * Renders the bottom navigation (Mobile).
 */
function renderMobileNav() {
    if (!mobileNav) return;
    mobileNav.innerHTML = '';

    MODULES.forEach(mod => {
        const isLocked = isModuleLocked(mod.id);
        const isActive = AppState.currentModule === mod.id;

        const btn = document.createElement('button');
        btn.className = `mobile-nav-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`;

        const icon = isLocked ? '🔒' : mod.icon;

        btn.innerHTML = `
            <span class="mobile-nav-icon">${icon}</span>
            <span>${mod.shortTitle || mod.title}</span>
        `;

        btn.onclick = () => {
            if (!isLocked && !isActive) {
                navigateTo(mod.id);
            }
        };

        mobileNav.appendChild(btn);
    });
}

/**
 * Renders the main content area based on the current module.
 */
function renderMainContent() {
    mainContent.innerHTML = '';

    switch (AppState.currentModule) {
        case 0:
            renderModule0();
            break;
        case 1:
            renderModule1(); // Now imported from modules/ledger.js
            break;
        case 2:
            renderModule2();
            break;
        case 3:
            renderModule3();
            break;
        case 4:
            renderModule4();
            break;
        default:
            mainContent.innerHTML = '<h2>Module Not Found</h2>';
    }
}

/**
 * Renders Module 0: Introduction.
 */
function renderModule0() {
    const container = document.createElement('div');
    container.className = 'module-container text-center';

    // 1. Hero Section
    const hero = `
        <div class="mb-4">
            <h1 style="font-size: 2.2rem; margin-bottom: 0.5rem;">BlockSim</h1>
            <p style="font-size: 1.1rem; color: var(--accent-color);">Interactive Blockchain Simulator</p>
            <p style="font-size: 0.9rem; color: #888; margin-top: 1rem;">
                Learn how blockchain works by building one yourself. No coding required.
            </p>
            <div style="font-size: 3rem; margin: 2rem 0;">🔗</div>
        </div>
    `;

    // 2. What You'll Learn (Cards)
    const cardsData = [
        { icon: '📒', title: 'Ledger', desc: 'Transactions' },
        { icon: '🧱', title: 'Blocks', desc: 'Data Groups' },
        { icon: '🔐', title: 'Hash', desc: 'Security' },
        { icon: '⛓️', title: 'Chain', desc: 'Linking' }
    ];

    let cardsHtml = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 2rem;">';
    cardsData.forEach(card => {
        cardsHtml += `
            <div class="card" style="padding: 1rem; margin-bottom: 0; text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">${card.icon}</div>
                <h4 style="margin-bottom: 0.25rem; font-size: 0.9rem;">${card.title}</h4>
                <p style="font-size: 0.7rem; margin-bottom: 0; color: #888;">${card.desc}</p>
            </div>
        `;
    });
    cardsHtml += '</div>';

    // 3. Start Button
    const startBtn = `
        <button id="start-btn" style="width: 100%; padding: 1rem; font-size: 1.1rem;">
            Start Learning 🚀
        </button>
    `;

    container.innerHTML = hero + cardsHtml + startBtn;
    mainContent.appendChild(container);

    // Event Listener
    document.getElementById('start-btn').addEventListener('click', () => {
        completeModule(0); // Mark Intro complete
        navigateTo(1);     // Go to Ledger
    });
}

/**
 * Renders the Blockchain Visualization Panel (inside the Drawer).
 */
function renderBlockchainPanel() {
    if (!blockchainPanel) return;

    // We rely on Module 4 logic primarily, or simple placeholders for earlier stages.
    if (AppState.currentModule === 4) {
        import('../modules/chain.js').then(module => {
            module.renderBlockchainPanel();
        });
        return;
    }

    // Default visualization for Modules 1, 2, 3
    // If we have blocks (from Module 2+), show them
    // Otherwise show placeholder
    const blocks = getBlockchain();

    if (blocks.length === 0) {
         blockchainPanel.innerHTML = '<div class="placeholder-text" style="color: #666; width: 100%; text-align: center; padding: 2rem;">No blocks created yet. Continue to Module 2.</div>';
    } else {
        // We can reuse a simple renderer or just show count
        blockchainPanel.innerHTML = `<div style="padding: 1rem; color: #ccc;">Current Chain: ${blocks.length} Blocks. (Full visualizer unlocks in Module 4)</div>`;
    }
}

/**
 * Updates the visibility of the drawer toggle button.
 */
function updateDrawerVisibility() {
    if (!toggleBtn) return;

    // Show button only if not in Intro (Module 0)
    if (AppState.currentModule > 0) {
        toggleBtn.classList.remove('hidden');
    } else {
        toggleBtn.classList.add('hidden');
    }
}

// --- Drawer Logic ---

function toggleDrawer(show) {
    if (!drawer || !backdrop) return;
    if (show) {
        drawer.classList.add('open');
        backdrop.classList.add('open');
        // Re-render panel to ensure it's fresh
        renderBlockchainPanel();
    } else {
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
    }
}

// Attach Drawer Listeners (Once)
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => toggleDrawer(true));
}
if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', () => toggleDrawer(false));
}
if (backdrop) {
    backdrop.addEventListener('click', () => toggleDrawer(false));
}
