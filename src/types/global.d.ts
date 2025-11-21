import type { Employee as DomainEmployee, GreenCard as DomainGreenCard, Violation as DomainViolation } from './domain';

type I18nKeyMap = {
  header: { title: string };
  nav: {
    overview: string;
    yellowCards: string;
    yellowCardsShort: string;
    greenCards: string;
    greenCardsShort: string;
    team: string;
    leaderboard: string;
    leaderboardShort: string;
  };
  theme: {
    dark: string;
    light: string;
    darkShort: string;
  };
  section: {
    dashboardOverview: string;
    detailedBreakdown: string;
    violationCategories: string;
    currentMonthStatus: string;
    greenCurrentStatus: string;
    teamStructure: string;
    positiveLeaderboard: string;
    positiveLeaderboardDescription: string;
    membersSuffix: string;
  };
  button: {
    giveYellowCard: string;
    giveGreenCard: string;
    addEmployee: string;
    removeEmployee: string;
  };
  filters: {
    week: string;
    month: string;
    new: string;
    allTime: string;
  };
  table: {
    employee: string;
    department: string;
    cards: string;
    violationTypes: string;
    status: string;
    greenCards: string;
    cardTypes: string;
    notes: string;
    lastGreenCard: string;
    never: string;
    noResults: string;
  };
  input: {
    searchPlaceholder: string;
    selectEmployee: string;
    selectType: string;
    selectEmployeeRemove: string;
    addDetailsPlaceholder: string;
  };
  modals: {
    violationsHeading: string;
    greenCardsHeading: string;
    dayTitle: string;
    noViolations: string;
    noComment: string;
  };
  badges: {
    new: string;
    streak3: string;
    streak5: string;
    streak10: string;
  };
  stats: {
    teamSizeLabel: string;
    totalCardsLabel: string;
    employeesSuffix: string;
    totalEmployeesLabel: string;
    complianceLabel: string;
    atRiskLabel: string;
    atRiskHint: string;
    mostViolationsLabel: string;
    greenCardsLabel: string;
    yellowCardsLabel: string;
    orangeCardsLabel: string;
    redCardsLabel: string;
  };
  cards: {
    documentation: string;
    workflow: string;
    communication: string;
  };
};

interface LanguageState {
  LANGUAGE_EVENT: string;
  getLanguage(): string;
  setLanguageState(lang: string, options?: { silent?: boolean }): void;
  subscribe(handler: (lang: string) => void): () => void;
}

type DepartmentColors = Record<string, string>;

interface Lucide {
  createIcons(): void;
}

declare global {
  type Employee = DomainEmployee;
  type GreenCard = DomainGreenCard;
  type Violation = DomainViolation;
  const I18N_KEYS: I18nKeyMap;
  const languageState: LanguageState;
  const currentDate: Date;
  let currentDateGreen: Date;
  const employees: Employee[];
  const departmentColors: DepartmentColors;
  const lucide: Lucide;
  const API_CONFIG: ApiConfig | undefined;
  function addEmployee(button: HTMLButtonElement): void;
  function removeEmployee(button: HTMLButtonElement): void;
  function submitYellowCard(button: HTMLButtonElement): void;
  function submitGreenCard(button: HTMLButtonElement): void;
  function giveCard(name: string, type: string, comment: string): void;
  function giveGreenCard(name: string, type: string, comment: string): void;
  function saveEmployeeChanges(button: HTMLButtonElement): void;
  function openEmailClient(email?: string): void;
  function openDiscordChat(discordId: string | undefined, name: string): void;
  function confirmDeleteViolation(id: number, employeeName: string, meta: Record<string, unknown>): void;
  function confirmDeleteGreenCard(id: number, employeeName: string, meta: Record<string, unknown>): void;
  function addViolationViaAPI(employeeId: number, violation: Violation): Promise<boolean>;
  function addGreenCardViaAPI(employeeId: number, greenCard: GreenCard): Promise<{ success: boolean; id?: number } | false>;
  function deleteViolation(payload: Record<string, unknown>): Promise<boolean>;
  function deleteGreenCard(payload: Record<string, unknown>): Promise<boolean>;
  function createEmployeeRemote(employee: Employee): Promise<Employee | null>;
  function removeEmployeeRemote(id: number): Promise<boolean>;
  function updateEmployeeRemote(employee: Employee): Promise<boolean>;
  function saveViaAPI(): Promise<boolean>;
  function loadEmployeesFromAPI(): Promise<Employee[]>;
  function persistIfPossible(): Promise<void>;
  function renderAll(): void;
  function renderCalendar(container?: HTMLElement | null, date?: Date | null): void;
  function renderGreenCardCalendar(container?: HTMLElement | null, date?: Date | null): void;
  function renderYellowCardTable(): void;
  function renderGreenCardTable(): void;
  function renderTeamGrids(): void;
  function renderModals(): void;
  function renderGreenCardModals(): void;
  function populateDeptFilter(): void;
  function renderLeaderboard(): void;
  function updateSaveStatus(message: string, type?: string): void;
  function closeModal(id: string): void;
  function openModal(id: string): void;
  function openAddEmployeeModal(): void;
  function openRemoveEmployeeModal(): void;
  function openGiveCardModal(name?: string): void;
  function openGiveGreenCardModal(name?: string): void;
  function openGiveCardModalForEmployee(name: string): void;
  function openGiveGreenCardModalForEmployee(name: string): void;
  function openEditEmployeeModal(name: string): void;
  function populateDeptFilter(): void;
  function renderLeaderboard(): void;
  function setPeriodFilter(button: HTMLElement): void;
  function initializeTheme(): void;
  function toggleTheme(): void;
  function updateThemeButton(isDark: boolean): void;
  function renderStats(): void;
  function renderTeamGrids(): void;
  function renderModals(): void;
  function renderGreenCardModals(): void;
  function switchTab(button: HTMLElement): void;
  function changeMonth(direction: number, event?: Event): boolean;
  function changeMonthGreen(direction: number, event?: Event): boolean;
  function navigateToEmployee(name: string): void;
  function showEmployeeModal(data: Record<string, unknown>): void;
  function showDayDetailsModal(year: number, month: number, day: number): void;
  function showDayDetailsModalGreen(year: number, month: number, day: number): void;
  function copyToClipboard(text: string, sourceElement?: HTMLElement): void;
  function createDropdown(
    containerId: string,
    options: Array<{ value: string; text: string }>,
    placeholder?: string,
    onChange?: () => void
  ): void;
  function applyInteractiveShadows(): void;
  function t(key: string, fallback?: string): string;
  function setLanguage(lang: string): void;
  function getCurrentLanguage(): string;
  function applyTranslations(root?: Element | DocumentFragment | Document): void;
  function formatMonthYear(date: Date): string;
  function formatDateLong(date: Date): string;
  function translateWithArgs(key: string, replacements: Record<string, string>, fallback?: string): string;
  function formatMonthYear(date: Date): string;
  function formatDateLong(date: Date): string;
  function serializeData(): string;
  interface ApiConfig {
    baseUrl?: string;
    addViolation?: string;
    updateData?: string;
    getEmployees?: string;
    addGreenCard?: string;
    deleteGreenCard?: string;
  }
  interface Window {
    I18N_KEYS: I18nKeyMap;
    languageState: LanguageState;
    currentDate: Date;
    currentDateGreen?: Date;
    employees: Employee[];
    departmentColors: DepartmentColors;
    lucide: Lucide;
    addEmployee: typeof addEmployee;
    removeEmployee: typeof removeEmployee;
    submitYellowCard: typeof submitYellowCard;
    submitGreenCard: typeof submitGreenCard;
    giveCard: typeof giveCard;
    giveGreenCard: typeof giveGreenCard;
    saveEmployeeChanges: typeof saveEmployeeChanges;
    openEmailClient: typeof openEmailClient;
    openDiscordChat: typeof openDiscordChat;
    confirmDeleteViolation: typeof confirmDeleteViolation;
    confirmDeleteGreenCard: typeof confirmDeleteGreenCard;
    addViolationViaAPI: typeof addViolationViaAPI;
    addGreenCardViaAPI: typeof addGreenCardViaAPI;
    deleteViolation: typeof deleteViolation;
    deleteGreenCard: typeof deleteGreenCard;
    createEmployeeRemote: typeof createEmployeeRemote;
    removeEmployeeRemote: typeof removeEmployeeRemote;
    updateEmployeeRemote: typeof updateEmployeeRemote;
    saveViaAPI: typeof saveViaAPI;
    loadEmployeesFromAPI: typeof loadEmployeesFromAPI;
    persistIfPossible: typeof persistIfPossible;
    renderAll: typeof renderAll;
    renderCalendar: typeof renderCalendar;
    renderGreenCardCalendar: typeof renderGreenCardCalendar;
    renderYellowCardTable: typeof renderYellowCardTable;
    renderGreenCardTable: typeof renderGreenCardTable;
    renderTeamGrids: typeof renderTeamGrids;
    renderModals: typeof renderModals;
    renderGreenCardModals: typeof renderGreenCardModals;
    populateDeptFilter: typeof populateDeptFilter;
    renderLeaderboard: typeof renderLeaderboard;
    setPeriodFilter: typeof setPeriodFilter;
    updateSaveStatus: typeof updateSaveStatus;
    closeModal: typeof closeModal;
    openModal: typeof openModal;
    openAddEmployeeModal: typeof openAddEmployeeModal;
    openRemoveEmployeeModal: typeof openRemoveEmployeeModal;
    openGiveCardModal: typeof openGiveCardModal;
    openGiveGreenCardModal: typeof openGiveGreenCardModal;
    openGiveCardModalForEmployee: typeof openGiveCardModalForEmployee;
    openGiveGreenCardModalForEmployee: typeof openGiveGreenCardModalForEmployee;
    openEditEmployeeModal: typeof openEditEmployeeModal;
    initializeTheme: typeof initializeTheme;
    toggleTheme: typeof toggleTheme;
    updateThemeButton: typeof updateThemeButton;
    switchTab: typeof switchTab;
    changeMonth: typeof changeMonth;
    changeMonthGreen: typeof changeMonthGreen;
    navigateToEmployee: typeof navigateToEmployee;
    showEmployeeModal: typeof showEmployeeModal;
    showDayDetailsModal: typeof showDayDetailsModal;
    showDayDetailsModalGreen: typeof showDayDetailsModalGreen;
    copyToClipboard: typeof copyToClipboard;
    createDropdown: typeof createDropdown;
    applyInteractiveShadows: typeof applyInteractiveShadows;
    formatMonthYear: typeof formatMonthYear;
    formatDateLong: typeof formatDateLong;
    translateWithArgs: typeof translateWithArgs;
    API_CONFIG?: ApiConfig;
  }
}

export {};


