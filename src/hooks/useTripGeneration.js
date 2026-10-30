import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { planTripStream } from '../lib/api';
import { normalizeRequest } from '../lib/planner';
import { saveTrip, setLastRequest } from '../lib/storage';

const INITIAL = { status: 'idle', progress: null, error: null, request: null };

/**
 * Drives one trip generation: streams progress, saves the finished trip and
 * navigates to it. Only one generation runs at a time; starting a new one or
 * unmounting cancels the previous request.
 *
 * Render <GenerationOverlay generation={gen} /> next to the caller to show progress.
 *
 * @returns {{status:'idle'|'running'|'error', progress:object|null, error:Error|null,
 *            request:object|null, generate:(req:object, opts?:{replace?:boolean})=>Promise<void>,
 *            cancel:()=>void, retry:()=>void, reset:()=>void}}
 */
export default function useTripGeneration() {
  const navigate = useNavigate();
  const [state, setState] = useState(INITIAL);
  const controllerRef = useRef(null);
  const lastArgsRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const generate = useCallback(async (input, { replace = false } = {}) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const request = normalizeRequest(input);
    lastArgsRef.current = { input: request, replace };
    setLastRequest(request);
    setState({ status: 'running', progress: { stage: 'connecting', message: 'Connecting to Gemini…', percent: 2 }, error: null, request });

    try {
      const trip = await planTripStream(request, {
        signal: controller.signal,
        onProgress: (progress) => {
          if (!controller.signal.aborted) setState((s) => ({ ...s, progress }));
        },
      });
      if (controller.signal.aborted) return;
      saveTrip(trip);
      setState(INITIAL);
      navigate(`/trip/${trip.id}`, { replace, state: { fresh: true } });
    } catch (error) {
      if (error.name === 'AbortError' || controller.signal.aborted) return;
      setState((s) => ({ ...s, status: 'error', error }));
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, [navigate]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState(INITIAL);
  }, []);

  const retry = useCallback(() => {
    if (lastArgsRef.current) generate(lastArgsRef.current.input, { replace: lastArgsRef.current.replace });
  }, [generate]);

  const reset = useCallback(() => setState(INITIAL), []);

  return { ...state, generate, cancel, retry, reset };
}
