import { ContextBlock } from '../types/ContextBlock';
import { SavedPrompt } from '../types/SavedPrompt';
import { Project } from '../types/Project';

export const mockContextBlocks: ContextBlock[] = [
  {
    id: 1,
    title: 'Getting Started with React',
    content: 'React is a JavaScript library for building user interfaces. It allows you to create reusable UI components.',
    tags: ['tutorial', 'javascript', 'react', 'beginner'],
    project: 'notes',
    lastUpdated: new Date('2024-01-15'),
  },
  {
    id: 2,
    title: 'CSS Grid Layout Guide',
    content: 'CSS Grid Layout is a two-dimensional layout system for the web. It lets you layout content in rows and columns.',
    tags: ['documentation', 'css', 'advanced'],
    project: 'notes',
    lastUpdated: new Date('2024-01-14'),
  },
  {
    id: 3,
    title: 'TypeScript Basics',
    content: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds optional static typing.',
    tags: ['tutorial', 'typescript', 'javascript', 'beginner'],
    project: 'notes',
    lastUpdated: new Date('2024-01-13'),
  },
  {
    id: 4,
    title: 'Advanced React Patterns',
    content: 'Learn advanced React patterns including render props, higher-order components, and custom hooks.',
    tags: ['advanced', 'react', 'javascript'],
    project: 'notes',
    lastUpdated: new Date('2024-01-12'),
  },
  {
    id: 5,
    title: 'JavaScript Array Methods',
    content: 'Comprehensive guide to JavaScript array methods: map, filter, reduce, and more with examples.',
    tags: ['documentation', 'javascript', 'reference'],
    project: 'notes',
    lastUpdated: new Date('2024-01-11'),
  },
  {
    id: 6,
    title: 'Tailwind CSS Utility Classes',
    content: 'Tailwind CSS is a utility-first CSS framework. Learn how to use utility classes to build custom designs.',
    tags: ['documentation', 'css', 'tutorial'],
    project: 'notes',
    lastUpdated: new Date('2024-01-10'),
  },
  {
    id: 7,
    title: "Project Context",
    content: "This is a React-based prompt builder application that helps users create and manage prompts with context blocks.",
    tags: ["react", "prompt", "context"],
    project: "prompt-builder",
    lastUpdated: new Date('2024-01-16'),
  },
  {
    id: 8,
    title: "Development Guidelines",
    content: "Follow clean code principles, use TypeScript for type safety, and implement responsive design with Tailwind CSS.",
    tags: ["development", "guidelines", "typescript"],
    project: "prompt-builder",
    lastUpdated: new Date('2024-01-16'),
  },
  {
    id: 9,
    title: "UI Requirements",
    content: "Create a dark themed interface with gradient backgrounds, rounded corners, and smooth transitions. Use neutral colors with blue accents.",
    tags: ["ui", "design", "dark-theme"],
    project: "prompt-builder",
    lastUpdated: new Date('2024-01-16'),
  },
  {
    id: 10,
    title: "Performance Considerations",
    content: "Implement lazy loading for components, optimize bundle size, and ensure smooth interactions with proper state management.",
    tags: ["performance", "optimization", "state"],
    project: "prompt-builder",
    lastUpdated: new Date('2024-01-16'),
  }
];

// Mock projects data
export const mockProjects: Project[] = [
  {
    id: 'notes',
    name: 'Notes',
    icon: '📝',
    type: 'datasets',
    promptCount: 0,
    isSystem: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'project1',
    name: 'Prompt Project 1',
    icon: '📁',
    type: 'prompts',
    promptCount: 12,
    isSystem: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: 'project2',
    name: 'Dataset Project 1',
    icon: '📊',
    type: 'datasets',
    promptCount: 0,
    isSystem: false,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'project3',
    name: 'Prompt Project 2',
    icon: '📁',
    type: 'prompts',
    promptCount: 8,
    isSystem: false,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-17')
  },
];

// Mock saved prompts data - different content for each project
export const mockSavedPrompts: SavedPrompt[] = [
  // Project 1 - React/TypeScript focused prompts
  {
    id: 1,
    title: 'React Component Template',
    description: 'A template for creating reusable React components with TypeScript',
    content: 'const Component: React.FC<Props> = ({ children, ...props }) => { ... };',
    projectId: 'project1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    folder: null,
    tags: ['react', 'typescript', 'template']
  },
  {
    id: 2,
    title: 'API Response Handler',
    description: 'Generic function to handle API responses with error handling',
    content: 'const handleApiResponse = async (response) => { ... };',
    projectId: 'project1',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    folder: null,
    tags: ['api', 'javascript', 'async']
  },
  {
    id: 3,
    title: 'Form Validation Hook',
    description: 'Custom React hook for form validation with TypeScript',
    content: 'const useFormValidation = (initialValues, validationSchema) => { ... };',
    projectId: 'project1',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-15'),
    folder: null,
    tags: ['react', 'hooks', 'validation', 'typescript']
  },

  // Project 3 - Node.js/Backend focused prompts
  {
    id: 4,
    title: 'Express Route Handler',
    description: 'REST API route handler with middleware and error handling',
    content: 'app.get("/api/users", authenticate, async (req, res) => { ... });',
    projectId: 'project3',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-17'),
    folder: null,
    tags: ['nodejs', 'express', 'api', 'backend']
  },
  {
    id: 5,
    title: 'Database Connection Pool',
    description: 'PostgreSQL connection pool with proper error handling',
    content: 'const pool = new Pool({ connectionString: process.env.DATABASE_URL });',
    projectId: 'project3',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    folder: null,
    tags: ['database', 'postgresql', 'nodejs', 'pool']
  },
  {
    id: 6,
    title: 'JWT Authentication Middleware',
    description: 'Express middleware for JWT token verification',
    content: 'const verifyToken = (req, res, next) => { const token = req.headers.authorization?.split(" ")[1]; ... };',
    projectId: 'project3',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-15'),
    folder: null,
    tags: ['authentication', 'jwt', 'middleware', 'security']
  }
];