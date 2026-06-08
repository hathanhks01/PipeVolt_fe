    export function showAlert(message, type = 'success', timeout = 4000) {
    try {
        const id = `pv-toast-${Date.now()}`;
        const container = document.createElement('div');
        container.id = id;
        container.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm shadow-lg text-white ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`;
        container.style.pointerEvents = 'auto';
        container.textContent = message;
        document.body.appendChild(container);
        setTimeout(() => {
        container.style.transition = 'opacity 200ms ease, transform 200ms ease';
        container.style.opacity = '0';
        container.style.transform = 'translateY(-6px)';
        setTimeout(() => {
            if (container.parentNode) container.parentNode.removeChild(container);
        }, 220);
        }, timeout);
    } catch (e) {
        // Fallback to native alert if DOM unavailable
        try { alert(message); } catch (e) { /* ignore */ }
    }
    }
