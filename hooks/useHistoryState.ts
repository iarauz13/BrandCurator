import { useReducer, useCallback, Reducer } from 'react';

// The state for our hook, containing past, present, and future states.
interface State<T> {
  past: T[];
  present: T;
  future: T[];
}

// All the actions that can be performed on the state.
type Action<T> =
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET'; newPresent: T }
  | { type: 'RESET'; newPresent: T };

/**
 * Reducer function to manage the history state.
 */
const undoableReducer = <T>(state: State<T>, action: Action<T>): State<T> => {
  const { past, present, future } = state;

  switch (action.type) {
    case 'UNDO': {
      if (past.length === 0) {
        return state; // Can't undo
      }
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    }
    case 'REDO': {
      if (future.length === 0) {
        return state; // Can't redo
      }
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    }
    case 'SET': {
        if (action.newPresent === present) {
            return state; // No change
        }
        return {
            past: [...past, present],
            present: action.newPresent,
            future: [], // Clear future on new action
        };
    }
    case 'RESET': {
        return {
            past: [],
            present: action.newPresent,
            future: [],
        };
    }
    default: {
      return state;
    }
  }
};

/**
 * A custom hook to manage state with undo/redo capabilities.
 * @param initialPresent The initial state.
 * @returns An object with the current state, setters, and undo/redo handlers.
 */
export const useHistoryState = <T>(initialPresent: T) => {
  // FIX: The use of a generic on useReducer was causing incorrect type inference.
  // Using a type assertion on the generic reducer function ensures that 'state' is correctly typed,
  // resolving all errors in this file.
  const [state, dispatch] = useReducer(
    undoableReducer as Reducer<State<T>, Action<T>>,
    {
      past: [],
      present: initialPresent,
      future: [],
    }
  );

  const canUndo = state.past.length !== 0;
  const canRedo = state.future.length !== 0;

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const setState = useCallback((newPresent: T) => dispatch({ type: 'SET', newPresent }), []);
  const reset = useCallback((newPresent: T) => dispatch({ type: 'RESET', newPresent }), []);

  return {
    state: state.present,
    setState,
    reset,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};