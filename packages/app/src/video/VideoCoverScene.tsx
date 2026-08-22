import { AbsoluteFill, Img } from 'remotion';
import type { FlowVideoCompositionProps } from './videoBeats';

type VideoCoverSceneProps = Pick<
  FlowVideoCompositionProps,
  'title' | 'description' | 'version' | 'logoUrl' | 'appName' | 'primaryColor'
>;

export const VideoCoverScene = ({
  title,
  description,
  version,
  logoUrl,
  appName,
  primaryColor,
}: VideoCoverSceneProps) => (
  <AbsoluteFill className="bg-slate-950 px-24 py-20">
    <div className="flex h-full flex-col justify-between text-left">
      <div className="flex items-center gap-4">
        <Img src={logoUrl} className="h-14 w-14 object-contain" />
        <p className="text-xl font-semibold text-slate-300">{appName}</p>
      </div>
      <div>
        <p
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: primaryColor }}
        >
          Product walkthrough
        </p>
        <p className="mt-4 max-w-5xl text-6xl font-semibold leading-tight text-white">
          {title || 'Untitled flow'}
        </p>
        {description ? (
          <p className="mt-6 max-w-4xl text-2xl leading-snug text-slate-300">{description}</p>
        ) : null}
      </div>
      <p className="text-lg font-medium text-slate-400">
        {version.trim() ? `Version ${version.trim()}` : 'Unversioned'}
      </p>
    </div>
  </AbsoluteFill>
);
