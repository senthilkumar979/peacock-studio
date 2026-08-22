import { AbsoluteFill, Img } from 'remotion';

interface VideoEndSceneProps {
  title: string;
  stepCount: number;
  logoUrl: string;
  appName: string;
  primaryColor: string;
}

export const VideoEndScene = ({
  title,
  stepCount,
  logoUrl,
  appName,
  primaryColor,
}: VideoEndSceneProps) => (
  <AbsoluteFill className="bg-slate-950 px-24 py-20">
    <div className="flex h-full flex-col items-start justify-center gap-8 text-left">
      <Img src={logoUrl} className="h-16 w-16 object-contain" />
      <p
        className="text-sm font-semibold uppercase tracking-widest"
        style={{ color: primaryColor }}
      >
        End of walkthrough
      </p>
      <p className="max-w-5xl text-5xl font-semibold leading-tight text-white">
        {title || 'Untitled flow'}
      </p>
      <p className="text-2xl text-slate-300">
        {stepCount} {stepCount === 1 ? 'step' : 'steps'} in this cinematic path
      </p>
      <p className="text-lg text-slate-500">{appName}</p>
    </div>
  </AbsoluteFill>
);
