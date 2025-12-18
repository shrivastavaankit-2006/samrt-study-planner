import * as XLSX from 'xlsx';

/**
 * Parses a Markdown table string into an array of objects for Excel export
 */
export const downloadPlanAsExcel = (markdownPlan: string, filename: string = 'StudyPlan') => {
    try {
        // Simple Markdown table parser
        const lines = markdownPlan.split('\n');
        const data: any[] = [];
        let headers: string[] = [];

        lines.forEach((line) => {
            const trimmed = line.trim();
            // Skip separator line (e.g., |---|---|)
            if (trimmed.startsWith('|') && trimmed.includes('---')) return;

            if (trimmed.startsWith('|')) {
                // Split by pipe and remove empty first/last elements
                const cells = trimmed
                    .split('|')
                    .map(cell => cell.trim())
                    .filter((_, index, arr) => index !== 0 && index !== arr.length - 1);

                if (headers.length === 0) {
                    headers = cells;
                } else {
                    const row: any = {};
                    cells.forEach((cell, i) => {
                        if (headers[i]) {
                            row[headers[i]] = cell;
                        }
                    });
                    data.push(row);
                }
            }
        });

        if (data.length === 0) {
            console.error('No table data found in plan');
            return;
        }

        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Study Plan');

        // Download file
        XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Failed to export to Excel');
    }
};
