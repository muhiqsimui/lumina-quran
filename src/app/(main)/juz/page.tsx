import Link from 'next/link';

export default function JuzListPage() {
  const juzs = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 pt-4 px-4 sm:px-0">
      <header className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Daftar Juz</h1>
        <p className="text-muted-foreground">Pilih juz untuk mulai membaca</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {juzs.map((juz) => (
          <Link
            key={juz}
            href={`/juz/${juz}`}
            className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all flex flex-col items-center justify-center gap-2 aspect-square"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Juz
            </span>
            <span className="text-4xl font-bold group-hover:text-primary transition-colors">
              {juz}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
