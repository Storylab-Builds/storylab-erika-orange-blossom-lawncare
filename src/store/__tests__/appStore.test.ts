import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../appStore';

describe('appStore', () => {
  beforeEach(() => {
    // Reset to initial state
    useAppStore.setState({
      sidebarCollapsed: false,
      clockedIn: false,
      clockInTime: null,
      onBreak: false,
      completedJobIds: [],
      activeJobId: null,
      searchQuery: '',
      selectedCrews: [],
    });
  });

  it('toggleSidebar flips sidebarCollapsed', () => {
    expect(useAppStore.getState().sidebarCollapsed).toBe(false);
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(true);
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(false);
  });

  it('toggleClockIn flips clockedIn and sets clockInTime', () => {
    expect(useAppStore.getState().clockedIn).toBe(false);
    expect(useAppStore.getState().clockInTime).toBeNull();

    useAppStore.getState().toggleClockIn();
    expect(useAppStore.getState().clockedIn).toBe(true);
    expect(useAppStore.getState().clockInTime).toBeTruthy();

    useAppStore.getState().toggleClockIn();
    expect(useAppStore.getState().clockedIn).toBe(false);
    expect(useAppStore.getState().clockInTime).toBeNull();
  });

  it('toggleBreak flips onBreak when clocked in', () => {
    // Must be clocked in first
    useAppStore.getState().toggleClockIn();
    expect(useAppStore.getState().onBreak).toBe(false);

    useAppStore.getState().toggleBreak();
    expect(useAppStore.getState().onBreak).toBe(true);

    useAppStore.getState().toggleBreak();
    expect(useAppStore.getState().onBreak).toBe(false);
  });

  it('toggleBreak does nothing when not clocked in', () => {
    useAppStore.getState().toggleBreak();
    expect(useAppStore.getState().onBreak).toBe(false);
  });

  it('completeJob adds to completedJobIds and clears activeJobId if matches', () => {
    useAppStore.setState({ activeJobId: 'job-1' });
    useAppStore.getState().completeJob('job-1');

    expect(useAppStore.getState().completedJobIds).toContain('job-1');
    expect(useAppStore.getState().activeJobId).toBeNull();
  });

  it('completeJob keeps activeJobId if different', () => {
    useAppStore.setState({ activeJobId: 'job-2' });
    useAppStore.getState().completeJob('job-1');

    expect(useAppStore.getState().completedJobIds).toContain('job-1');
    expect(useAppStore.getState().activeJobId).toBe('job-2');
  });

  it('setSearchQuery updates query', () => {
    useAppStore.getState().setSearchQuery('mowing');
    expect(useAppStore.getState().searchQuery).toBe('mowing');
  });

  it('toggleCrewFilter adds crew ID', () => {
    useAppStore.getState().toggleCrewFilter('crew-1');
    expect(useAppStore.getState().selectedCrews).toEqual(['crew-1']);
  });

  it('toggleCrewFilter removes existing crew ID', () => {
    useAppStore.setState({ selectedCrews: ['crew-1', 'crew-2'] });
    useAppStore.getState().toggleCrewFilter('crew-1');
    expect(useAppStore.getState().selectedCrews).toEqual(['crew-2']);
  });
});
