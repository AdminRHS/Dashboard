(function (global) {
    function renderStats() {
            const totalEmployees = employees.length;
            const totalCards = employees.reduce((s, e) => s + e.violations.length, 0);
            const compliantEmployees = employees.filter(e => e.violations.length === 0).length;
            const complianceRate = totalEmployees > 0 ? ((compliantEmployees / totalEmployees) * 100).toFixed(1) : "100.0";
            const atRiskCount = employees.filter(e => e.violations.length >= 2).length;
            
            let deptCards = {};
            employees.forEach(e => {
                deptCards[e.dept] = (deptCards[e.dept] || 0) + e.violations.length;
            });
            let maxDept = 'None', maxCount = 0;
            for (const d in deptCards) {
                if (deptCards[d] > maxCount) {
                    maxCount = deptCards[d];
                    maxDept = d;
                }
            }

            document.getElementById('team-size-stat').innerHTML = `<strong>Team Size:</strong> ${totalEmployees} employees`;
            document.getElementById('card-ratio-stat').innerHTML = `<strong>Total Cards:</strong> ${totalCards}`;
            
            document.getElementById('overview-stats').innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon bg-blue-100 text-blue-600"><i data-lucide="users"></i></div>
                    <div class="stat-info">
                        <div class="stat-number">${totalEmployees}</div>
                        <div class="stat-label">Total Employees</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-green-100 text-green-600"><i data-lucide="shield-check"></i></div>
                    <div class="stat-info">
                        <div class="stat-number">${complianceRate}%</div>
                        <div class="stat-label">Compliance</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-orange-100 text-orange-600"><i data-lucide="alert-triangle"></i></div>
                    <div class="stat-info">
                        <div class="flex items-baseline gap-2">
                             <div class="stat-number">${atRiskCount}</div>
                             <div class="stat-label" style="text-transform: none; line-height: 1.1;">AT RISK</div>
                        </div>
                        <div class="stat-sublabel">(2+ cards)</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-red-100 text-red-600"><i data-lucide="siren"></i></div>
                    <div class="stat-info">
                        <div class="flex items-baseline gap-2">
                            <div class="stat-number">${maxCount}</div>
                            <div class="stat-label" style="text-transform: none; line-height: 1.1;">MOST VIOL.</div>
                        </div>
                        <div class="stat-sublabel">${maxDept}</div>
                    </div>
                </div>
            `;
            lucide.createIcons();
            
            const cardCounts = {
                0: compliantEmployees,
                1: employees.filter(e => e.violations.length === 1).length,
                2: employees.filter(e => e.violations.length === 2).length,
                3: employees.filter(e => e.violations.length >= 3).length
            };
            
            document.getElementById('detailed-stats').innerHTML = `
                <div class="detailed-stat-card-v2 card-green"><div class="stat-number">${cardCounts[0]}</div></div>
                <div class="detailed-stat-card-v2 card-yellow"><div class="stat-number">${cardCounts[1]}</div><div class="card-stack-wrapper"><div class="stack-shape stack-medium"></div></div></div>
                <div class="detailed-stat-card-v2 card-orange"><div class="stat-number">${cardCounts[2]}</div><div class="card-stack-wrapper"><div class="stack-shape stack-dark"></div><div class="stack-shape stack-medium"></div></div></div>
                <div class="detailed-stat-card-v2 card-red"><div class="stat-number">${cardCounts[3]}</div><div class="card-stack-wrapper"><div class="stack-shape stack-dark"></div><div class="stack-shape stack-medium"></div><div class="stack-shape stack-light"></div></div></div>
            `;
    }

    global.renderStats = renderStats;
})(window);


