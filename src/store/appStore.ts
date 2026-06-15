import { create } from 'zustand';
import { format } from 'date-fns';

export interface AppState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Active view / navigation
  activeView: string;
  setActiveView: (view: string) => void;

  // Field Operations - clock in/out, break
  clockedIn: boolean;
  clockInTime: string | null;
  onBreak: boolean;
  toggleClockIn: () => void;
  toggleBreak: () => void;

  // Job management
  activeJobId: string | null;
  setActiveJob: (id: string | null) => void;
  completeJob: (id: string) => void;
  completedJobIds: string[];

  // Notifications
  unreadCount: number;
  decrementUnread: () => void;
  setUnreadCount: (count: number) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Schedule filters
  selectedCrews: string[];
  toggleCrewFilter: (crewId: string) => void;
  setSelectedCrews: (crewIds: string[]) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Modal/panel state
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Active view
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),

  // Field Operations
  clockedIn: false,
  clockInTime: null,
  onBreak: false,
  toggleClockIn: () =>
    set((state) => ({
      clockedIn: !state.clockedIn,
      clockInTime: !state.clockedIn ? new Date().toISOString() : null,
      onBreak: false,
    })),
  toggleBreak: () =>
    set((state) => ({
      onBreak: state.clockedIn ? !state.onBreak : false,
    })),

  // Job management
  activeJobId: null,
  setActiveJob: (id) => set({ activeJobId: id }),
  completedJobIds: [],
  completeJob: (id) =>
    set((state) => ({
      completedJobIds: [...state.completedJobIds, id],
      activeJobId: state.activeJobId === id ? null : state.activeJobId,
    })),

  // Notifications
  unreadCount: 5,
  decrementUnread: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  setUnreadCount: (count) => set({ unreadCount: count }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Schedule filters
  selectedCrews: [],
  toggleCrewFilter: (crewId) =>
    set((state) => ({
      selectedCrews: state.selectedCrews.includes(crewId)
        ? state.selectedCrews.filter((id) => id !== crewId)
        : [...state.selectedCrews, crewId],
    })),
  setSelectedCrews: (crewIds) => set({ selectedCrews: crewIds }),
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  setSelectedDate: (date) => set({ selectedDate: date }),

  // Modal/panel state
  selectedCustomerId: null,
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
  selectedJobId: null,
  setSelectedJobId: (id) => set({ selectedJobId: id }),
}));
