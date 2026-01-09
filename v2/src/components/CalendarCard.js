/**
 * Casa de Sowu PWA v2.0
 * Calendar Component
 */

export class CalendarCard {
  constructor(store, api, config) {
    this.store = store;
    this.api = api;
    this.config = config;
    this.container = document.getElementById('page-calendar');
    this.render();
    this.loadEvents();
  }

  render() {
    if (!this.container) return;
    const tasks = this.config.get('entities.tasks') || {};
    const taskEntries = Object.entries(tasks);

    this.container.innerHTML = `
      <div class="page-content calendar-page">
        <div class="section-header glass-card">
          <span class="mdi mdi-calendar"></span>
          <span>Today's Schedule</span>
        </div>
        <div class="calendar-events glass-card" id="calendar-events">
          <div class="loading-spinner"><span class="mdi mdi-loading mdi-spin"></span> Loading events...</div>
        </div>

        <div class="section-header glass-card">
          <span class="mdi mdi-calendar-week"></span>
          <span>This Week</span>
        </div>
        <div class="calendar-week glass-card" id="calendar-week">
          <div class="loading-spinner"><span class="mdi mdi-loading mdi-spin"></span> Loading...</div>
        </div>

        <div class="section-header glass-card">
          <span class="mdi mdi-checkbox-marked-outline"></span>
          <span>Tasks</span>
        </div>
        <div class="tasks-container" id="tasks-container">
          ${taskEntries.map(([name, entityId]) => `
            <div class="todo-list glass-card" data-entity="${entityId}">
              <div class="todo-header">
                <span class="mdi mdi-checkbox-marked-outline"></span>
                ${name.charAt(0).toUpperCase() + name.slice(1)}
              </div>
              <div class="todo-items" id="todo-${name}">
                <div class="loading-spinner"><span class="mdi mdi-loading mdi-spin"></span></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  async loadEvents() {
    const calendars = this.config.get('entities.calendars') || [];
    const eventsContainer = document.getElementById('calendar-events');
    const weekContainer = document.getElementById('calendar-week');

    if (calendars.length === 0) {
      if (eventsContainer) eventsContainer.innerHTML = '<div class="no-events">No calendars configured</div>';
      return;
    }

    try {
      // Get today's date range
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch events from all calendars
      let todayEvents = [];
      let weekEvents = [];

      // Calendars in config are just entity ID strings
      for (const calId of calendars) {
        try {
          const events = await this.api.getCalendarEvents(calId, todayStart, weekEnd);
          if (events && events.length > 0) {
            // Add calendar info to each event
            const calName = calId.replace('calendar.', '').replace(/_/g, ' ');
            events.forEach(e => {
              e.calendarName = calName;
              e.calendarColor = this.getCalendarColor(calId);
            });

            // Split into today vs this week
            const todayDate = now.toDateString();
            events.forEach(e => {
              const eventDate = new Date(e.start.dateTime || e.start.date).toDateString();
              if (eventDate === todayDate) todayEvents.push(e);
              else weekEvents.push(e);
            });
          }
        } catch (err) {
          console.warn('Failed to load calendar:', calId, err);
        }
      }

      // Sort by time
      todayEvents.sort((a, b) => new Date(a.start.dateTime || a.start.date) - new Date(b.start.dateTime || b.start.date));
      weekEvents.sort((a, b) => new Date(a.start.dateTime || a.start.date) - new Date(b.start.dateTime || b.start.date));

      // Render today's events
      if (eventsContainer) {
        if (todayEvents.length === 0) {
          eventsContainer.innerHTML = '<div class="no-events"><span class="mdi mdi-calendar-check"></span> No events today</div>';
        } else {
          eventsContainer.innerHTML = todayEvents.map(e => this.renderEvent(e)).join('');
        }
      }

      // Render week events
      if (weekContainer) {
        if (weekEvents.length === 0) {
          weekContainer.innerHTML = '<div class="no-events"><span class="mdi mdi-calendar-blank"></span> No upcoming events</div>';
        } else {
          weekContainer.innerHTML = weekEvents.slice(0, 10).map(e => this.renderEvent(e, true)).join('');
        }
      }

      // Load tasks
      this.loadTasks();

    } catch (error) {
      console.error('Calendar load error:', error);
      if (eventsContainer) eventsContainer.innerHTML = '<div class="no-events error">Failed to load calendar</div>';
    }
  }

  getCalendarColor(calId) {
    // Assign colors based on calendar type
    if (calId.includes('family')) return '#f093fb';
    if (calId.includes('basketball') || calId.includes('sports')) return '#4facfe';
    if (calId.includes('paul')) return '#667eea';
    if (calId.includes('tuella')) return '#f093fb';
    return '#00d9ff';
  }

  renderEvent(event, showDate = false) {
    const start = new Date(event.start.dateTime || event.start.date);
    const isAllDay = !event.start.dateTime;
    const timeStr = isAllDay ? 'All Day' : start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const dateStr = showDate ? start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + ' - ' : '';

    return `
      <div class="calendar-event" style="border-left: 3px solid ${event.calendarColor}">
        <div class="event-time">${dateStr}${timeStr}</div>
        <div class="event-title">${event.summary || 'Untitled'}</div>
        <div class="event-calendar">${event.calendarName}</div>
      </div>`;
  }

  async loadTasks() {
    const tasks = this.config.get('entities.tasks') || {};

    for (const [name, entityId] of Object.entries(tasks)) {
      try {
        const items = await this.api.getTodoItems(entityId);
        const container = document.getElementById('todo-' + name);
        if (container && items) {
          if (items.length === 0) {
            container.innerHTML = '<div class="no-tasks">No tasks</div>';
          } else {
            container.innerHTML = items.slice(0, 5).map(item => `
              <div class="todo-item ${item.status === 'completed' ? 'completed' : ''}">
                <span class="mdi mdi-${item.status === 'completed' ? 'checkbox-marked' : 'checkbox-blank-outline'}"></span>
                <span class="todo-text">${item.summary}</span>
              </div>
            `).join('');
          }
        }
      } catch (err) {
        console.warn('Failed to load todos:', entityId, err);
        const container = document.getElementById('todo-' + name);
        if (container) container.innerHTML = '<div class="no-tasks">Failed to load</div>';
      }
    }
  }
}
