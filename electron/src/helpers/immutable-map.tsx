export function set<TKey, TValue>(
  map: Map<TKey, TValue>,
  key: TKey,
  value: TValue
) {
  const newMap = new Map(map);
  newMap.set(key, value);
  return newMap;
}

export function del<TKey, TValue>(map: Map<TKey, TValue>, key: TKey) {
  const newMap = new Map(map);
  newMap.delete(key);
  return newMap;
}

export function firstEntry<TKey, TValue>(
  map: Map<TKey, TValue>
): [TKey, TValue] {
  return map.entries().next().value;
}

export function firstKey<TKey, TValue>(map: Map<TKey, TValue>): TKey {
  return map.keys().next().value;
}

export function getKeyByIndex<TKey, TValue>(
  map: Map<TKey, TValue>,
  index: number
): TKey {
  return Array.from(map.keys())[index];
}

export function valuesAsArray<TKey, TValue>(map: Map<TKey, TValue>) {
  return Array.from(map.values());
}
