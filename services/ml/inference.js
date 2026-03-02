export function argMax(values) {
  let bestIdx = 0;
  let bestValue = values[0] ?? Number.NEGATIVE_INFINITY;
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] > bestValue) {
      bestValue = values[i];
      bestIdx = i;
    }
  }
  return bestIdx;
}

export function selectHour(model, state, epsilon = 0.1) {
  if (Math.random() < epsilon) {
    return Math.floor(Math.random() * 24);
  }

  const qValues = model.predict(state);
  return argMax(qValues);
}
