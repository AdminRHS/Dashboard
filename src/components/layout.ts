(function mountApp() {
  const mountNode = document.getElementById('app');
  const template = document.getElementById('app-template') as HTMLTemplateElement | null;

  if (!mountNode || !template || !(template instanceof HTMLTemplateElement)) {
    console.error('[layout] Missing app mount node or template');
    return;
  }

  const cloned = template.content.cloneNode(true);
  mountNode.appendChild(cloned);
})();


