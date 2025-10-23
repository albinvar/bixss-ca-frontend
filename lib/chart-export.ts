import html2canvas from 'html2canvas';

/**
 * Capture all charts from the analysis details view
 * Returns an object with chart names as keys and base64 image data as values
 */
export async function captureAnalysisCharts(analysisDetailsElement: HTMLElement): Promise<Record<string, string>> {
  const charts: Record<string, string> = {};

  try {
    // Find all chart containers
    const chartContainers = analysisDetailsElement.querySelectorAll('[data-chart-name]');

    for (const container of Array.from(chartContainers)) {
      const chartName = container.getAttribute('data-chart-name');
      if (!chartName) continue;

      try {
        // Capture the chart as canvas
        const canvas = await html2canvas(container as HTMLElement, {
          backgroundColor: '#ffffff',
          scale: 2, // Higher quality
          logging: false,
          useCORS: true,
        });

        // Convert canvas to base64
        const imageData = canvas.toDataURL('image/png');
        charts[chartName] = imageData;
      } catch (error) {
        console.error(`Error capturing chart ${chartName}:`, error);
      }
    }

    return charts;
  } catch (error) {
    console.error('Error capturing charts:', error);
    return charts;
  }
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
