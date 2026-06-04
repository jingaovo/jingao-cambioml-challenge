import type { AgentEvent, EventAction, EventStoreState } from "@/lib/events/types";

export const initialEventStoreState: EventStoreState = {
  events: [],
  eventsById: {},
};

function upsertEvent(
  state: EventStoreState,
  event: AgentEvent,
): EventStoreState {
  const existingIndex = state.events.findIndex(
    (candidate) => candidate.id === event.id,
  );

  if (existingIndex === -1) {
    return {
      events: [...state.events, event],
      eventsById: { ...state.eventsById, [event.id]: event },
    };
  }

  const events = [...state.events];
  events[existingIndex] = event;

  return {
    events,
    eventsById: { ...state.eventsById, [event.id]: event },
  };
}

export function eventStoreReducer(
  state: EventStoreState,
  action: EventAction,
): EventStoreState {
  switch (action.type) {
    case "EVENT_ADD":
      if (state.eventsById[action.event.id]) return state;
      return upsertEvent(state, action.event);

    case "EVENT_UPDATE": {
      const existing = state.eventsById[action.id];
      if (!existing) return state;

      const updated = { ...existing, ...action.patch } as AgentEvent;
      return upsertEvent(state, updated);
    }

    case "RESET":
      return initialEventStoreState;

    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
