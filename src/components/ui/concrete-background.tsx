export function ConcreteBackground() {
  return (
    <>
      {/* Light mode texture */}
      <div
        className="pointer-events-none fixed inset-0 -z-30 dark:hidden"
        style={{
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/asfalt-dark.png")',
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      />

      {/* Dark mode texture */}
      <div
        className="pointer-events-none fixed inset-0 -z-30 hidden dark:block"
        style={{
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/asfalt-light.png")',
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      />
    </>
  )
}
