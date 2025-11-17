(function mountApp() {
    const mountNode = document.getElementById('app');
    const template = document.getElementById('app-template');
    if (!mountNode || !template || !(template instanceof HTMLTemplateElement)) {
        console.error('[layout] Missing app mount node or template');
        return;
    }
    const cloned = template.content.cloneNode(true);
    mountNode.appendChild(cloned);
})();
//# sourceMappingURL=layout.js.map