import { useCallback, useEffect, useState } from 'react';
import { isCloudLibraryActive } from '@/cloud/authContext';
import {
  generateWorkflowArtifact,
  getWorkflowArtifact,
  listDocumentArtifactStatuses,
  listWorkflowArtifacts,
} from '@/services/workflowArtifactService';
import type {
  WorkflowArtifact,
  WorkflowArtifactSummary,
  WorkflowArtifactType,
} from '@/types/workflowArtifact';
import { GENERIC_USER_ERROR_MESSAGE, logAppError } from '@/utils/appError';

export function useWorkflowArtifactLibrary(artifactType: WorkflowArtifactType) {
  const [artifacts, setArtifacts] = useState<WorkflowArtifactSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isCloudLibraryActive()) {
      setArtifacts([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const next = await listWorkflowArtifacts(artifactType);
      setArtifacts(next);
    } catch (loadError) {
      logAppError('Failed to load workflow artifacts', loadError);
      setError(GENERIC_USER_ERROR_MESSAGE);
      setArtifacts([]);
    } finally {
      setIsLoading(false);
    }
  }, [artifactType]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { artifacts, isLoading, error, refresh };
}

export function useWorkflowArtifactDetail(
  documentId: string | undefined,
  artifactType: WorkflowArtifactType,
) {
  const [artifact, setArtifact] = useState<WorkflowArtifact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!documentId || !isCloudLibraryActive()) {
      setArtifact(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const next = await getWorkflowArtifact(documentId, artifactType);
      setArtifact(next ?? null);
    } catch (loadError) {
      logAppError('Failed to load workflow artifact', loadError);
      setError(GENERIC_USER_ERROR_MESSAGE);
      setArtifact(null);
    } finally {
      setIsLoading(false);
    }
  }, [artifactType, documentId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { artifact, isLoading, error, refresh };
}

export function useDocumentArtifactStatuses(documentId: string | undefined) {
  const [statuses, setStatuses] = useState<WorkflowArtifactSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!documentId || !isCloudLibraryActive()) {
      setStatuses([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const next = await listDocumentArtifactStatuses(documentId);
      setStatuses(next);
    } catch (loadError) {
      logAppError('Failed to load document artifact statuses', loadError);
      setError(GENERIC_USER_ERROR_MESSAGE);
      setStatuses([]);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const generate = useCallback(
    async (artifactType: WorkflowArtifactType) => {
      if (!documentId) return null;
      const created = await generateWorkflowArtifact(documentId, artifactType);
      await refresh();
      return created;
    },
    [documentId, refresh],
  );

  return { statuses, isLoading, error, refresh, generate };
}
