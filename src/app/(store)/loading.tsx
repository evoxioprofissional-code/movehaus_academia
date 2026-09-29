export default function StoreLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6" role="status" aria-label="Carregando página">
      <div className="fixed inset-x-0 top-0 z-[70] h-0.5 overflow-hidden bg-white/5">
        <span className="block h-full w-1/3 animate-[mh-route-loading_1s_ease-in-out_infinite] bg-mh-red" />
      </div>
      <div className="animate-pulse">
        <div className="h-3 w-28 bg-mh-red/30" />
        <div className="mt-5 h-12 max-w-xl bg-white/8 sm:h-16" />
        <div className="mt-4 h-4 max-w-md bg-white/6" />
        <div className="mt-2 h-4 max-w-sm bg-white/6" />
      </div>
    </div>
  );
}
