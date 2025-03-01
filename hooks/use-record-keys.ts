export const hasKey = (State: Record<string, boolean>): boolean => {
  return Object.values(State).some(status => status === true);
};
