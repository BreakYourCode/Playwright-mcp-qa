import { AccessibilityReporter } from './utils/accessibility-reporter';

// Create demo accessibility report with sample data from the test run
const reporter = new AccessibilityReporter();

// Add sample violations from the test output
reporter.addViolations('Home Page', [
  {
    id: 'frame-title',
    impact: 'serious',
    tags: ['cat.text-alternatives', 'wcag2a', 'wcag241', 'wcag412', 'section508', 'section508.22.i'],
    description: 'Ensures <iframe> and <frame> elements have an accessible name',
    help: 'Frames must have an accessible name',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/frame-title',
    nodes: [
      {
        any: [],
        all: [],
        none: [],
        impact: 'serious',
        html: '<iframe src="https://example.com" style="display:none;"></iframe>',
        target: ['iframe'],
        failureSummary: 'Fix any of the following:\n  Element does not have a title attribute\n  aria-label attribute does not exist or is empty\n  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty\n  Element\'s default semantics were not overridden with role="none" or role="presentation"'
      }
    ]
  },
  {
    id: 'heading-order',
    impact: 'moderate',
    tags: ['cat.semantics', 'best-practice'],
    description: 'Ensures the order of headings is semantically correct',
    help: 'Heading levels should only increase by one',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/heading-order',
    nodes: [
      {
        any: [],
        all: [],
        none: [],
        impact: 'moderate',
        html: '<h3>Welcome</h3>',
        target: ['h3'],
        failureSummary: 'Fix any of the following:\n  Heading order invalid'
      }
    ]
  },
  {
    id: 'landmark-unique',
    impact: 'moderate',
    tags: ['cat.semantics', 'best-practice'],
    description: 'Ensures landmarks are unique',
    help: 'Landmarks should have a unique role or role/label/title (i.e. accessible name) combination',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/landmark-unique',
    nodes: [
      {
        any: [],
        all: [],
        none: [],
        impact: 'moderate',
        html: '<nav></nav>',
        target: ['nav:nth-child(1)'],
        failureSummary: 'Fix any of the following:\n  The landmark must have a unique aria-label, aria-labelledby, or title to make landmarks distinguishable'
      }
    ]
  },
  {
    id: 'link-name',
    impact: 'serious',
    tags: ['cat.name-role-value', 'wcag2a', 'wcag412', 'wcag244', 'section508', 'section508.22.a', 'ACT'],
    description: 'Ensures links have discernible text',
    help: 'Links must have discernible text',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/link-name',
    nodes: [
      {
        any: [],
        all: [],
        none: [],
        impact: 'serious',
        html: '<a href="/products"></a>',
        target: ['a[href="/products"]'],
        failureSummary: 'Fix any of the following:\n  Element does not have text that is visible to screen readers\n  aria-label attribute does not exist or is empty\n  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty\n  Element has no title attribute'
      }
    ]
  }
] as any);

reporter.addViolations('Air Fryers Category Page', [
  {
    id: 'aria-prohibited-attr',
    impact: 'serious',
    tags: ['cat.aria', 'wcag2a', 'wcag412'],
    description: 'Ensures ARIA attributes are not prohibited for an element\'s role',
    help: 'Elements must only use permitted ARIA attributes',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/aria-prohibited-attr',
    nodes: [
      { any: [], all: [], none: [], impact: 'serious', html: '<div role="button" aria-label="test"></div>', target: ['div[role="button"]'], failureSummary: 'Fix all of the following:\n  aria-label attribute cannot be used on a div with role="button"' },
      { any: [], all: [], none: [], impact: 'serious', html: '<span role="button" aria-label="test"></span>', target: ['span[role="button"]'], failureSummary: 'Fix all of the following:\n  aria-label attribute cannot be used on a span with role="button"' }
    ]
  },
  {
    id: 'scrollable-region-focusable',
    impact: 'serious',
    tags: ['cat.keyboard', 'wcag2a', 'wcag211'],
    description: 'Ensures elements that have scrollable content are accessible by keyboard',
    help: 'Scrollable region must have keyboard access',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/scrollable-region-focusable',
    nodes: [
      { any: [], all: [], none: [], impact: 'serious', html: '<div style="overflow:scroll"></div>', target: ['div[style*="overflow"]'], failureSummary: 'Fix any of the following:\n  Element should have focusable content\n  Element should be focusable' }
    ]
  }
] as any);

reporter.addViolations('Product Details Page', [
  {
    id: 'label-title-only',
    impact: 'serious',
    tags: ['cat.forms', 'best-practice'],
    description: 'Ensures that every form element has a visible label and is not solely labeled using hidden labels, or the title or aria-describedby attributes',
    help: 'Form elements should have a visible label',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/label-title-only',
    nodes: [
      { any: [], all: [], none: [], impact: 'serious', html: '<input type="text" title="Quantity">', target: ['input[title="Quantity"]'], failureSummary: 'Fix all of the following:\n  Form element does not have a visible label' }
    ]
  },
  {
    id: 'list',
    impact: 'serious',
    tags: ['cat.structure', 'wcag2a', 'wcag131'],
    description: 'Ensures that lists are structured correctly',
    help: '<ul> and <ol> must only directly contain <li>, <script> or <template> elements',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/list',
    nodes: [
      { any: [], all: [], none: [], impact: 'serious', html: '<ul><div><li>Item</li></div></ul>', target: ['ul'], failureSummary: 'Fix all of the following:\n  List element has direct children that are not allowed: div' }
    ]
  }
] as any);

reporter.addViolations('Payment Form', [
  {
    id: 'select-name',
    impact: 'critical',
    tags: ['cat.forms', 'wcag2a', 'wcag412', 'section508', 'section508.22.n', 'ACT'],
    description: 'Ensures select element has an accessible name',
    help: 'Select element must have an accessible name',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/select-name',
    nodes: [
      { any: [], all: [], none: [], impact: 'critical', html: '<select><option>Month</option></select>', target: ['#expirationMonth'], failureSummary: 'Fix any of the following:\n  Form element does not have an accessible name\n  aria-label attribute does not exist or is empty\n  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty\n  Form element has no associated label element\n  Element has no title attribute' },
      { any: [], all: [], none: [], impact: 'critical', html: '<select><option>Year</option></select>', target: ['#expirationYear'], failureSummary: 'Fix any of the following:\n  Form element does not have an accessible name' }
    ]
  }
] as any);

reporter.addViolations('Order Confirmation Page', [
  {
    id: 'link-name',
    impact: 'serious',
    tags: ['cat.name-role-value', 'wcag2a', 'wcag412', 'wcag244', 'section508', 'section508.22.a', 'ACT'],
    description: 'Ensures links have discernible text',
    help: 'Links must have discernible text',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/link-name',
    nodes: Array(43).fill({
      any: [], all: [], none: [], impact: 'serious', html: '<a href="#"></a>', target: ['a'], failureSummary: 'Fix any of the following:\n  Element does not have text that is visible to screen readers'
    })
  }
] as any);

// Generate the report
reporter.generateReport('US Cuisinart Guest Air Fryer Checkout - Demo');

console.log('\n✅ Demo accessibility report generated!');
console.log('📁 Location: playwright-report/accessibility-report.html');
