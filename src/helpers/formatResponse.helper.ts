// Optimized response formatter
export default function formatResponse(text: string): string {
  let formatted = text;
  
  // Basic cleanup
  formatted = formatted.replace(/\*\*/g, '').trim();

  // Section formatting with emojis
  formatted = formatted
    .replace(/(WARNINGS?|CAUTION):/gi, '\n\n Warnings:\n')
    .replace(/(STEPS?|PROCEDURE|INSTRUCTIONS?):/gi, '\n\nSteps:\n')
    .replace(/(ADDITIONAL NOTES?|NOTES):/gi, '\n\nAdditional Notes:\n')
    .replace(/(SEEK MEDICAL HELP|WHEN TO CALL|EMERGENCY):/gi, '\n\nWhen to Seek Medical Help:\n');
  
  // Format step numbers
  formatted = formatted.replace(/(\d+)\.\s+/g, '\n$1. ');
  
  // Ensure proper paragraph spacing
  formatted = formatted.replace(/([.!?])([A-Z])/g, '$1\n$2');
  
  // Clean up excessive whitespace
  formatted = formatted.replace(/(\n\s*){2,}/g, '\n\n').trim();

  return formatted;
}