export function Footer() {
  return (
    <footer className="border-t border-border/60 px-5 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 text-center">
        <p className="text-xs text-muted-foreground">
          Powered &amp; Developed by{" "}
          <a
            href="https://ahmede-tech.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Ahmed Essam
          </a>
        </p>
      </div>
    </footer>
  );
}
