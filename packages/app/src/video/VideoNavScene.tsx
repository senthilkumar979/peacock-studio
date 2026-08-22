import { AbsoluteFill } from 'remotion';
import type { VideoBeat } from './videoBeats';
import { VideoBrowserChrome } from './VideoBrowserChrome';

interface VideoNavSceneProps {
  beat: VideoBeat;
}

export const VideoNavScene = ({ beat }: VideoNavSceneProps) => (
  <AbsoluteFill className="bg-slate-950 px-16 py-12">
    <div className="flex h-full w-full flex-col gap-6">
      <div className="min-h-0 flex-1">
        <VideoBrowserChrome url={beat.url}>
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-400">
              Navigation
            </p>
            <p className="text-4xl font-semibold text-white">{beat.title}</p>
            {beat.url ? (
              <p className="max-w-4xl break-all text-xl text-slate-300">{beat.url}</p>
            ) : null}
          </div>
        </VideoBrowserChrome>
      </div>
      {beat.description ? (
        <div className="shrink-0 rounded-2xl bg-slate-900 px-8 py-5 text-left">
          <p className="text-lg text-slate-300">{beat.description}</p>
        </div>
      ) : null}
    </div>
  </AbsoluteFill>
);
