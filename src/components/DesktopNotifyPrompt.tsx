import { useEffect } from 'react';

function DesktopNotifyPrompt({ onRequest }: { onRequest: (showPreview?: boolean) => void }) {
  useEffect(() => {
    onRequest(true);
  }, [onRequest]);

  return null;
}

export default DesktopNotifyPrompt;
