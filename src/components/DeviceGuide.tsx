export function DeviceGuide({ expanded = false }: { expanded?: boolean }) {
  return (
    <section className="device-guide" aria-label="A quick guide for grown-ups">
      <p className="eyebrow">A QUICK GUIDE FOR GROWN-UPS</p>
      <h2>Keep their discoveries on this device</h2>
      <p>
        Progress saves automatically after each answer. No account is needed,
        and your child’s name and progress are never uploaded.
      </p>
      <details open={expanded || undefined}>
        <summary>Saving progress & adding to your iPad</summary>
        <div className="device-guide-content">
          <h3>Add to your iPad Home Screen</h3>
          <ol>
            <li>
              Open Little Numbers in <strong>Safari</strong>.
            </li>
            <li>
              Tap <strong>Share</strong> (the square with an upward arrow), then{" "}
              <strong>Add to Home Screen</strong>. You may need to tap{" "}
              <strong>More</strong> or <strong>View More</strong> first.
            </li>
            <li>
              If shown, turn on <strong>Open as Web App</strong>, then tap{" "}
              <strong>Add</strong>.
            </li>
            <li>
              Open the new Little Numbers icon while online and let it finish
              loading. After that, you can practise offline too.
            </li>
          </ol>
          <p className="small">
            <a
              href="https://support.apple.com/guide/ipad/ipad8f1f7a29/ipados"
              target="_blank"
              rel="noreferrer"
            >
              Apple’s iPad instructions ↗
            </a>
          </p>
          <h3>Keep using the same little space</h3>
          <p>
            Use the same device and browser, or keep opening the same Home
            Screen icon. Avoid Private Browsing. Progress does not automatically
            sync between devices, browsers or the Safari and Home Screen
            versions.
          </p>
          <h3>Keep an occasional backup</h3>
          <p>
            Open <strong>For parents</strong>, hold the button, then choose{" "}
            <strong>Export progress</strong>. Save the backup file somewhere
            safe. Use <strong>Restore progress</strong> to bring it back or move
            it to another device. Export before switching to the Home Screen app
            if you have already started practising.
          </p>
          <p className="device-guide-note">
            Adding to the Home Screen is not a backup. Clearing website data,
            removing the app or your device freeing up storage can remove saved
            progress. A normal app update does not erase it.
          </p>
        </div>
      </details>
    </section>
  );
}
