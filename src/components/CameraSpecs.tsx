export function CameraSpecs({ specs }: { specs: { label: string; value: string }[] }) {
  return (
    <dl className="panel-world grid grid-cols-2 gap-x-6 gap-y-3 rounded-sm p-4 sm:grid-cols-3 lg:grid-cols-1">
      {specs.map((s) => (
        <div key={s.label} className="border-world border-b pb-2 last:border-b-0">
          <dt className="text-world-dim font-tech text-[0.55rem] tracking-[0.3em] uppercase">{s.label}</dt>
          <dd className="text-world font-tech text-[0.8rem] tracking-[0.1em]">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
