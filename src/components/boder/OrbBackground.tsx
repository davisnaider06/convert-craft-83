import { GridScan } from "./GridScan";

export function OrbBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <GridScan
        sensitivity={0.55}
        lineThickness={1}
        linesColor="#0d3d3d"
        scanColor="#00FFCC"
        scanOpacity={0.5}
        gridScale={0.1}
        lineStyle="solid"
        lineJitter={0.1}
        scanDirection="pingpong"
        enablePost={true}
        bloomIntensity={0.2}
        chromaticAberration={0.002}
        noiseIntensity={0.01}
        scanGlow={0.6}
        scanSoftness={2}
        scanPhaseTaper={0.9}
        scanDuration={2.0}
        scanDelay={2.0}
        scanOnClick={false}
      />
    </div>
  );
}
