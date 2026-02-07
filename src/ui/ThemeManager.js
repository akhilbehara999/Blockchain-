export class ThemeManager {
    constructor() {
        // Default to 'dark' if no preference stored, unless system explicitly requests light?
        // PRD requests Default Dark Mode. We will prioritize Dark.
        this.theme = localStorage.getItem('blocksim_theme') || 'dark';
        this.applyTheme();
        this.createToggle();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('blocksim_theme', this.theme);
        this.updateToggleIcon();
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
    }

    createToggle() {
        // Create a floating toggle button
        const btn = document.createElement('button');
        btn.id = 'theme-toggle';
        btn.style.position = 'fixed';
        btn.style.bottom = '20px';
        btn.style.right = '20px';
        btn.style.width = '50px';
        btn.style.height = '50px';
        btn.style.borderRadius = '50%';
        btn.style.padding = '0';
        btn.style.fontSize = '1.5rem';
        btn.style.zIndex = '1000';
        btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        btn.onclick = () => this.toggleTheme();

        document.body.appendChild(btn);
        this.toggleBtn = btn;
        this.updateToggleIcon();
    }

    updateToggleIcon() {
        if (this.toggleBtn) {
            this.toggleBtn.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
            this.toggleBtn.title = this.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        }
    }
}
