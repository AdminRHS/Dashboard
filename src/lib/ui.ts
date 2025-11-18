(function registerUI(global: Window & typeof globalThis) {
  function createDropdown(
    containerId: string,
    options: Array<{ value: string; text: string }>,
    placeholder: string = 'Select...',
    onchangeCallback?: () => void
  ): void {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.classList.add('custom-dropdown');
    container.innerHTML = `
                <div class="custom-dropdown-toggle" tabindex="0">
                    <span class="selected-value placeholder">${placeholder}</span>
                    <i data-lucide="chevron-down" class="chevron-icon w-4 h-4"></i>
                </div>
                <ul class="custom-dropdown-menu"></ul>
            `;
    lucide.createIcons();
    const toggle = container.querySelector('.custom-dropdown-toggle') as HTMLElement | null;
    const menu = container.querySelector('.custom-dropdown-menu') as HTMLElement | null;
    if (!toggle || !menu) return;
    menu.innerHTML = options.map(opt => `<li data-value="${opt.value}">${opt.text}</li>`).join('');
    const selectedValue = toggle.querySelector('.selected-value') as HTMLElement | null;
    const placeholderClass = 'placeholder';
    const items = menu.querySelectorAll('li');
    items.forEach(item => {
      item.addEventListener('click', () => {
        if (!selectedValue) return;
        selectedValue.textContent = item.textContent;
        selectedValue.classList.remove(placeholderClass);
        toggle.dataset.value = item.getAttribute('data-value') || '';
        menu.querySelectorAll('li').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        container.classList.remove('open');
        if (onchangeCallback) onchangeCallback();
      });
    });
  }

  const TAB_SEQUENCE = ['overview', 'yellowcard', 'greencard', 'team', 'leaderboard'] as const;
  const TAB_TRANSITION_MS = 450;

  function switchTab(buttonElement: HTMLElement): void {
    const tabId = buttonElement.dataset.tab;
    if (!tabId) return;

    const targetTab = document.getElementById(tabId) as HTMLElement | null;
    if (!targetTab) return;

    if (targetTab.classList.contains('active')) return;

    const pedestalContainer = document.getElementById('leaderboard-pedestal-container');

    const currentActive = document.querySelector<HTMLElement>('.tab-content.active');
    const currentIndex = currentActive ? TAB_SEQUENCE.indexOf(currentActive.id as typeof TAB_SEQUENCE[number]) : -1;
    const targetIndex = TAB_SEQUENCE.indexOf(tabId as typeof TAB_SEQUENCE[number]);
    const slideDirection: 'left' | 'right' =
      currentIndex !== -1 && targetIndex < currentIndex ? 'left' : 'right';

    if (currentActive) {
      const exitClass = slideDirection === 'right' ? 'sliding-out-left' : 'sliding-out-right';
      currentActive.classList.remove('slide-from-left', 'slide-from-right', 'sliding-out-left', 'sliding-out-right');
      currentActive.classList.add(exitClass);

      let exitHandled = false;
      const finalizeExit = () => {
        if (exitHandled) return;
        exitHandled = true;
        currentActive.classList.add('hidden');
        currentActive.classList.remove(exitClass);
        currentActive.removeEventListener('transitionend', handleTransitionEnd);
      };

      const handleTransitionEnd = (event: TransitionEvent) => {
        if (event.propertyName !== 'transform' && event.propertyName !== 'opacity') return;
        finalizeExit();
      };
      currentActive.addEventListener('transitionend', handleTransitionEnd);

      requestAnimationFrame(() => {
        currentActive.classList.remove('active');
      });

      window.setTimeout(finalizeExit, TAB_TRANSITION_MS + 100);
    }

    document.querySelectorAll<HTMLElement>('.tab-btn').forEach(b => b.classList.remove('active'));

    targetTab.classList.remove('hidden', 'sliding-out-left', 'sliding-out-right');
    const enterClass = slideDirection === 'right' ? 'slide-from-right' : 'slide-from-left';
    targetTab.classList.remove('sliding-out-left', 'sliding-out-right');
    targetTab.classList.add(enterClass);

    const activateTab = () => {
      targetTab.classList.add('active');

      let enterHandled = false;
      const finalizeEnter = () => {
        if (enterHandled) return;
        enterHandled = true;
        targetTab.classList.remove(enterClass);
        targetTab.removeEventListener('transitionend', cleanup);
      };

      const cleanup = (event: TransitionEvent) => {
        if (event.propertyName !== 'transform' && event.propertyName !== 'opacity') return;
        finalizeEnter();
      };

      targetTab.addEventListener('transitionend', cleanup);

      window.setTimeout(finalizeEnter, TAB_TRANSITION_MS + 100);
    };

    requestAnimationFrame(() => requestAnimationFrame(activateTab));

    buttonElement.classList.add('active');

    lucide.createIcons();

    if (tabId === 'leaderboard') {
      renderLeaderboard();
      pedestalContainer?.classList.remove('hidden');
    } else {
      pedestalContainer?.classList.add('hidden');
    }

    if (tabId === 'greencard') {
      renderGreenCardCalendar();
      renderGreenCardTable();
    }
  }

  let isCalendarAnimating = false;

  function changeMonth(direction: number, event?: Event): boolean {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (isCalendarAnimating) return false;

    const container = document.querySelector('.calendar-container') as HTMLElement | null;
    const oldMonth = document.getElementById('calendar-month-current');

    if (!container || !oldMonth) return false;

    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    isCalendarAnimating = true;

    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);

    const newMonth = document.createElement('div');
    newMonth.className = 'calendar-month';

    renderCalendar(newMonth, newDate);

    newMonth.style.transform = `translateX(${direction > 0 ? '100%' : '-100%'})`;
    container.appendChild(newMonth);
    newMonth.offsetHeight;

    const oldMonthHeight = oldMonth.offsetHeight;
    const currentHeight = container.offsetHeight || oldMonthHeight;
    const heightToUse = Math.max(currentHeight, oldMonthHeight, 0);
    if (heightToUse > 0) {
      container.style.height = `${heightToUse}px`;
    }

    if (oldMonth.style.position !== 'absolute') {
      oldMonth.style.position = 'absolute';
    }

    newMonth.style.position = 'absolute';

    const maintainScroll = () => {
      window.scrollTo(scrollX, scrollY);
    };

    requestAnimationFrame(() => {
      maintainScroll();
      requestAnimationFrame(() => {
        maintainScroll();
        oldMonth.style.transform = `translateX(${direction > 0 ? '-100%' : '100%'})`;
        newMonth.style.transform = 'translateX(0)';
      });
    });

    const scrollInterval = setInterval(maintainScroll, 50);

    setTimeout(() => {
      currentDate.setMonth(currentDate.getMonth() + direction);

      const currentContainerHeight = container.offsetHeight;

      newMonth.id = 'calendar-month-current';
      newMonth.style.transform = '';

      newMonth.style.position = 'relative';
      newMonth.offsetHeight;

      oldMonth.remove();

      const newHeight = newMonth.offsetHeight;
      if (newHeight > 0) {
        container.style.height = `${newHeight}px`;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            container.style.height = '';
            newMonth.style.position = '';
          });
        });
      } else if (currentContainerHeight > 0) {
        container.style.height = `${currentContainerHeight}px`;
        requestAnimationFrame(() => {
          container.style.height = '';
          newMonth.style.position = '';
        });
      } else {
        container.style.height = '';
        newMonth.style.position = '';
      }

      const headerEl = document.getElementById('calendar-month-year');
      if (headerEl) {
        headerEl.textContent = currentDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        });
      }

      clearInterval(scrollInterval);
      window.scrollTo(scrollX, scrollY);
      requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY);
        requestAnimationFrame(() => {
          window.scrollTo(scrollX, scrollY);
        });
      });

      isCalendarAnimating = false;
    }, 400);

    return true;
  }

  function navigateToEmployee(name: string): void {
    const employee = employees.find(e => e.name === name);
    if (employee) {
      const modalData = {
        name: employee.name,
        role: employee.role,
        dept: employee.dept,
        cards: employee.violations.length,
        email: employee.email,
        discordId: employee.discordId
      };
      showEmployeeModal(modalData);
    }
  }

  let isGreenCardCalendarAnimating = false;

  function changeMonthGreen(direction: number, event?: Event): boolean {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (isGreenCardCalendarAnimating) return false;

    const container = document.querySelector('#greencard .calendar-container') as HTMLElement | null;
    const oldMonth = document.getElementById('calendar-month-current-green');

    if (!container || !oldMonth) return false;

    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    isGreenCardCalendarAnimating = true;

    const greenDate = typeof window.currentDateGreen !== 'undefined' ? window.currentDateGreen : new Date();
    const newDate = new Date(greenDate);
    newDate.setMonth(greenDate.getMonth() + direction);

    const newMonth = document.createElement('div');
    newMonth.className = 'calendar-month';

    renderGreenCardCalendar(newMonth, newDate);

    newMonth.style.transform = `translateX(${direction > 0 ? '100%' : '-100%'})`;
    container.appendChild(newMonth);
    newMonth.offsetHeight;

    const oldMonthHeight = oldMonth.offsetHeight;
    const currentHeight = container.offsetHeight || oldMonthHeight;
    const heightToUse = Math.max(currentHeight, oldMonthHeight, 0);
    if (heightToUse > 0) {
      container.style.height = `${heightToUse}px`;
    }

    if (oldMonth.style.position !== 'absolute') {
      oldMonth.style.position = 'absolute';
    }

    newMonth.style.position = 'absolute';

    const maintainScroll = () => {
      window.scrollTo(scrollX, scrollY);
    };

    requestAnimationFrame(() => {
      maintainScroll();
      requestAnimationFrame(() => {
        maintainScroll();
        oldMonth.style.transform = `translateX(${direction > 0 ? '-100%' : '100%'})`;
        newMonth.style.transform = 'translateX(0)';
      });
    });

    const scrollInterval = setInterval(maintainScroll, 50);

    setTimeout(() => {
      if (typeof window.currentDateGreen !== 'undefined') {
        window.currentDateGreen.setMonth(window.currentDateGreen.getMonth() + direction);
      } else if (typeof currentDateGreen !== 'undefined') {
        currentDateGreen.setMonth(currentDateGreen.getMonth() + direction);
      }

      const currentContainerHeight = container.offsetHeight;

      newMonth.id = 'calendar-month-current-green';
      newMonth.style.transform = '';

      newMonth.style.position = 'relative';
      newMonth.offsetHeight;

      oldMonth.remove();

      const newHeight = newMonth.offsetHeight;
      if (newHeight > 0) {
        container.style.height = `${newHeight}px`;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            container.style.height = '';
            newMonth.style.position = '';
          });
        });
      } else if (currentContainerHeight > 0) {
        container.style.height = `${currentContainerHeight}px`;
        requestAnimationFrame(() => {
          container.style.height = '';
          newMonth.style.position = '';
        });
      } else {
        container.style.height = '';
        newMonth.style.position = '';
      }

      const headerEl = document.getElementById('calendar-month-year-green');
      if (headerEl) {
        const activeGreenDate = typeof window.currentDateGreen !== 'undefined' ? window.currentDateGreen : (typeof currentDateGreen !== 'undefined' ? currentDateGreen : new Date());
        headerEl.textContent = activeGreenDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        });
      }

      clearInterval(scrollInterval);
      window.scrollTo(scrollX, scrollY);
      requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY);
        requestAnimationFrame(() => {
          window.scrollTo(scrollX, scrollY);
        });
      });

      isGreenCardCalendarAnimating = false;
    }, 400);

    return true;
  }

  function updateSaveStatus(message: string, type: 'saving' | 'success' | 'error' | 'info' = 'info'): void {
    const statusElement = document.getElementById('save-status');
    if (!statusElement) return;
    const colors: Record<string, string> = {
      saving: 'text-blue-600',
      success: 'text-green-600',
      error: 'text-red-600',
      info: 'text-gray-600'
    };
    statusElement.textContent = message;
    statusElement.className = `text-sm ${colors[type] || colors.info}`;
    if (type === 'success') {
      setTimeout(() => {
        statusElement.textContent = '';
      }, 3000);
    }
  }

  global.switchTab = switchTab;
  global.changeMonth = changeMonth;
  global.changeMonthGreen = changeMonthGreen;
  global.navigateToEmployee = navigateToEmployee;
  global.createDropdown = createDropdown;
  global.updateSaveStatus = updateSaveStatus;
})(window);


