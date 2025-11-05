/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import useAsync from 'react-use/lib/useAsync';
import type { DependencyList } from 'react';
import { getNotification } from '../api';

export function useGetNotification(deps: DependencyList) {
  const { value, error, loading } = useAsync(() => {
    return getNotification();
  }, deps);

  return {
    value,
    error,
    loading,
  };
}
