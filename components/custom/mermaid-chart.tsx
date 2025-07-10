import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with dark theme
mermaid.initialize({ 
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#18181b',
    primaryColor: '#3b82f6',
    primaryTextColor: '#f4f4f5',
    primaryBorderColor: '#52525b',
    lineColor: '#52525b',
    secondaryColor: '#374151',
    tertiaryColor: '#1f2937',
  }
});

export const MermaidChart = ({ code }: { code: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      ref.current.id = id;
      //@ts-expect-error - mermaid types are not working
      mermaid.render(id, code, (svgCode) => {
        if (ref.current) {
          ref.current.innerHTML = svgCode;
        }
      }).catch((error) => {
        console.error('Mermaid rendering error:', error);
        if (ref.current) {
          ref.current.innerHTML = `<div class="text-red-400 p-4 bg-red-900/20 rounded border border-red-800">
            <p class="font-mono text-sm">Mermaid diagram error:</p>
            <p class="text-xs mt-1">${error.message}</p>
          </div>`;
        }
      });
    }
  }, [code]);

  return (
    <div className="my-4 rounded-lg bg-zinc-900 p-4 border border-zinc-800">
      <div ref={ref} className="flex justify-center" />
    </div>
  );
}; 