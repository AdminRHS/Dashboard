(function registerTables(global: Window & typeof globalThis) {
  function renderYellowCardTable(): void {
    const tableBody = document.getElementById('yellow-card-table-body');
    if (!tableBody) return;

    let content = '';
    employees.forEach(emp => {
      const cards = emp.violations.length;
      let status;
      let cardIndicatorHtml;

      if (cards === 0) {
        status = '<span class="text-xs font-semibold px-2 py-1 rounded-md bg-green-100 text-green-700">✓ Safe</span>';
        cardIndicatorHtml = '<span class="text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">0</span>';
      } else {
        const tooltipText = emp.violations.map(v => `• ${v.date}: [${v.type}] - ${v.comment || 'No comment'}`).join('\n');
        let indicatorClass;
        let statusClass;
        let statusText;
        let statusIcon;

        if (cards === 1) {
          indicatorClass = 'bg-yellow-100 text-yellow-700';
          statusClass = 'bg-yellow-100 text-yellow-700';
          statusText = 'Warning';
          statusIcon = '⚠ ';
        } else if (cards === 2) {
          indicatorClass = 'bg-orange-100 text-orange-700';
          statusClass = 'bg-orange-100 text-orange-700';
          statusText = 'At Risk';
          statusIcon = '⚠ ';
        } else {
          indicatorClass = 'bg-red-100 text-red-700';
          statusClass = 'bg-red-100 text-red-700';
          statusText = 'High Risk';
          statusIcon = '<i data-lucide="siren" class="inline w-3 h-3 mr-1"></i>';
        }

        cardIndicatorHtml = `<div class="tooltip"><span class="text-sm font-semibold px-3 py-1 rounded-full ${indicatorClass}">${cards}</span><span class="tooltip-text">${tooltipText}</span></div>`;
        status = `<span class="text-xs font-semibold px-2 py-1 rounded-md ${statusClass}">${statusIcon} ${statusText}</span>`;
      }

      const violationTypes = emp.violations.map(v => v.type).join(', ');

      content += `<tr class="cursor-pointer" data-employee-name="${emp.name}"><td>${emp.name}</td><td>${emp.dept}</td><td>${cardIndicatorHtml}</td><td>${violationTypes || '—'}</td><td>${status}</td></tr>`;
    });

    tableBody.innerHTML = content;
    lucide.createIcons();
  }

  function renderGreenCardTable(): void {
    const tableBody = document.getElementById('green-card-table-body');
    if (!tableBody) return;

    let content = '';
    employees.forEach(emp => {
      const greenCards = (emp.greenCards && emp.greenCards.length) || 0;
      let status;
      let cardIndicatorHtml;

      if (greenCards === 0) {
        status = '<span class="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-700">No Cards</span>';
        cardIndicatorHtml = '<span class="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">0</span>';
      } else if (emp.greenCards) {
        const tooltipText = emp.greenCards.map(gc => `• ${gc.date}: [${gc.type}] - ${gc.comment || 'No comment'}`).join('\n');
        cardIndicatorHtml = `<div class="tooltip"><span class="text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">${greenCards}</span><span class="tooltip-text">${tooltipText}</span></div>`;
        status = `<span class="text-xs font-semibold px-2 py-1 rounded-md bg-green-100 text-green-700">✓ ${greenCards} Green Card(s)</span>`;
      } else {
        status = '<span class="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-700">No Cards</span>';
        cardIndicatorHtml = '<span class="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">0</span>';
      }

      const cardTypes = emp.greenCards ? emp.greenCards.map(gc => gc.type).join(', ') : '';

      content += `<tr class="cursor-pointer" data-employee-name="${emp.name}"><td>${emp.name}</td><td>${emp.dept}</td><td>${cardIndicatorHtml}</td><td>${cardTypes || '—'}</td><td>${status}</td></tr>`;
    });

    tableBody.innerHTML = content;
    lucide.createIcons();
  }

  global.renderYellowCardTable = renderYellowCardTable;
  global.renderGreenCardTable = renderGreenCardTable;
})(window);


