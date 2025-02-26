import { containsHebrew } from '@/lib/utils';

/**
 * MutationObserver to automatically detect and apply text direction
 * This is a lightweight solution that doesn't require modifying every component
 */
export function initAutoTextDirection() {
  // Skip if already initialized or not in browser environment
  if (typeof window === 'undefined' || window.__autoTextDirectionInitialized) {
    return;
  }
  
  // Mark as initialized to prevent duplicate observers
  window.__autoTextDirectionInitialized = true;
  
  // Create a mutation observer to watch for text changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Process only if text content changed
      if (mutation.type === 'characterData' || mutation.type === 'childList') {
        const node = mutation.target;
        
        // Skip processing for script and style elements
        if (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE') {
          return;
        }
        
        // Process text nodes
        if (node.nodeType === Node.TEXT_NODE) {
          const parentElement = node.parentElement;
          if (parentElement && parentElement.getAttribute('data-auto-dir') === 'true') {
            const text = node.textContent;
            const isRTL = containsHebrew(text);
            parentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
          }
        }
        
        // Process elements with data-auto-dir attribute
        if (node.nodeType === Node.ELEMENT_NODE && node.getAttribute('data-auto-dir') === 'true') {
          const text = node.textContent;
          const isRTL = containsHebrew(text);
          node.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
        }
        
        // Process input and textarea elements
        if ((node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') && 
            node.getAttribute('data-auto-dir') === 'true') {
          const text = node.value;
          const isRTL = containsHebrew(text);
          node.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
          node.style.textAlign = isRTL ? 'right' : 'left';
        }
      }
    });
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: false,
  });
  
  // Add event listeners for input elements
  document.addEventListener('input', (event) => {
    const target = event.target;
    if ((target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && 
        target.getAttribute('data-auto-dir') === 'true') {
      const text = target.value;
      const isRTL = containsHebrew(text);
      target.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      target.style.textAlign = isRTL ? 'right' : 'left';
    }
  }, { passive: true });
  
  return observer;
}

// Function to apply auto-direction to a specific element
export function applyAutoDirection(element) {
  if (!element) return;
  
  // Mark element for auto-direction
  element.setAttribute('data-auto-dir', 'true');
  
  // Initial direction detection
  const text = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' 
    ? element.value 
    : element.textContent;
    
  const isRTL = containsHebrew(text);
  element.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  
  // Apply text alignment for input elements
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    element.style.textAlign = isRTL ? 'right' : 'left';
  }
}

export default {
  initAutoTextDirection,
  applyAutoDirection
}; 