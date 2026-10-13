import { useState, useEffect, useCallback } from 'react';
import { api, Session, Message, Artifact, ProviderInfo } from '../services/api';

export function useChat() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  
  // Model selection state
  const [selectedProvider, setSelectedProvider] = useState<string>('ollama');
  const [selectedModel, setSelectedModel] = useState<string>('llama3:8b');
  const [providers, setProviders] = useState<ProviderInfo[]>([]);

  // Load available providers
  const loadProviders = useCallback(async () => {
    try {
      const data = await api.getProviders();
      setProviders(data.providers);
      if (data.active_default) {
        setSelectedProvider(data.active_default);
        const defaultProv = data.providers.find((p) => p.id === data.active_default);
        if (defaultProv) {
          setSelectedModel(defaultProv.default_model);
        }
      }
    } catch (err: any) {
      console.warn('Could not load providers, using defaults:', err.message);
    }
  }, []);

  // Load sessions list
  const loadSessions = useCallback(async () => {
    try {
      const list = await api.getSessions();
      setSessions(list);
      if (list.length > 0 && !activeSessionId) {
        // Auto-select latest session
        await selectSession(list[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load sessions:', err);
    }
  }, [activeSessionId]);

  useEffect(() => {
    loadProviders();
    loadSessions();
  }, []);

  const selectSession = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionData = await api.getSession(id);
      setActiveSessionId(id);
      setMessages(sessionData.messages || []);
      
      // Auto-open last generated artifact if present
      const lastMsgWithArtifact = [...(sessionData.messages || [])]
        .reverse()
        .find((m) => m.artifact);
      if (lastMsgWithArtifact?.artifact) {
        setActiveArtifact(lastMsgWithArtifact.artifact);
      }
    } catch (err: any) {
      setError(`Failed to load conversation: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewSession = useCallback(async () => {
    try {
      const newSession = await api.createSession('New Strategy Session');
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setMessages([]);
      setActiveArtifact(null);
    } catch (err: any) {
      setError(`Failed to create session: ${err.message}`);
    }
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    try {
      await api.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
        setMessages([]);
        setActiveArtifact(null);
      }
    } catch (err: any) {
      setError(`Failed to delete session: ${err.message}`);
    }
  }, [activeSessionId]);

  const sendMessage = useCallback(async (text: string, skill?: string) => {
    if (!text.trim()) return;

    // Create optimistic user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      session_id: activeSessionId || 'new',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.sendMessage({
        message: text,
        session_id: activeSessionId || undefined,
        provider: selectedProvider,
        model: selectedModel,
        skill: skill,
      });

      // Update active session ID if newly created
      if (!activeSessionId) {
        setActiveSessionId(response.session_id);
      }

      const assistantMsg: Message = {
        id: response.message_id,
        session_id: response.session_id,
        role: 'assistant',
        content: response.content,
        provider_used: response.provider_used,
        model_used: response.model_used,
        artifact: response.artifact,
        citations: response.citations,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically open artifact if returned
      if (response.artifact) {
        setActiveArtifact(response.artifact);
      }

      // Refresh sessions sidebar list
      const updatedList = await api.getSessions();
      setSessions(updatedList);
    } catch (err: any) {
      setError(err.message || 'Error executing request.');
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId, selectedProvider, selectedModel]);

  return {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    error,
    activeArtifact,
    setActiveArtifact,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    providers,
    createNewSession,
    selectSession,
    deleteSession,
    sendMessage,
    clearError: () => setError(null),
  };
}
