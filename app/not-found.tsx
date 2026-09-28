import { Backdrop } from '@/components/backdrop/Backdrop';

export default function NotFound() {
  return (
    <>
      <Backdrop />
      <main className="container" style={{ display: 'grid', placeItems: 'center', minHeight: '100svh' }}>
        <div className="glass" data-glass="" style={{ padding: '48px 40px', textAlign: 'center', maxWidth: 440 }}>
          <p className="kicker">404</p>
          <h2>This page doesn’t exist.</h2>
          <p style={{ color: 'var(--muted)', margin: '16px 0 28px' }}>The link may be old, or the address has a typo.</p>
          <a className="btn btn-primary" href="/">
            Back to mlhkrds.dev
          </a>
        </div>
      </main>
    </>
  );
}
