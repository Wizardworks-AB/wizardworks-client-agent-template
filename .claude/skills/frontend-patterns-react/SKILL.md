---
name: frontend-patterns-react
description: Wizardworks frontend architecture patterns for TypeScript, React, TanStack ecosystem, and TDD. As a Wizardworks employee, you must adhere to these standards.
---

# Wizardworks Frontend Development Patterns (React/TypeScript)

Frontend architecture patterns and best practices for scalable React applications at Wizardworks.

**Important**: As a Wizardworks employee/agent, you are expected to follow these standards rigorously.

## Technology Stack

### Required Stack
- **React 19+** (always latest version)
- **TypeScript 5+** (strict mode enabled)
- **TanStack Query** (React Query) for data fetching and caching
- **React Router** or **Next.js** for routing (project-dependent)
- **TanStack Table** for complex tables
- **TanStack Form** for form management
- **Vite** or **Next.js** as build tool
- **Vitest** or **Jest** for testing
- **React Testing Library** for component tests
- **Playwright** for E2E tests

### Recommended Tools
- **Zod** for schema validation
- **Tailwind CSS** for styling (Wizardworks standard)
- **Radix UI** or **Shadcn/ui** for accessible components
- **Zustand** or **Context** for lightweight global state (avoid Redux unless necessary)

## Project Structure

```
src/
├── app/                      # Next.js app directory (if using Next.js)
├── components/               # React components
│   ├── ui/                  # Generic UI components (buttons, inputs, etc.)
│   ├── features/            # Feature-specific components
│   └── layouts/             # Layout components
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities and configurations
│   ├── api/                # API client and fetchers
│   ├── utils/              # Helper functions
│   └── constants/          # Constants
├── types/                   # TypeScript types and interfaces
├── services/               # Business logic and API services
└── __tests__/             # Test files
```

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## TanStack Query Patterns

### Query Client Setup

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### API Service Pattern

```typescript
// services/magicService.ts
import { apiClient } from '@/lib/api/apiClient';

export interface MagicDto {
  publicMagicId: string;
  name: string;
  description?: string;
  createdAt: string;
  isActive: boolean;
}

export interface CreateMagicDto {
  name: string;
  description?: string;
}

export interface UpdateMagicDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export const magicService = {
  getAll: async (): Promise<MagicDto[]> => {
    const response = await apiClient.get<MagicDto[]>('/api/magic');
    return response.data;
  },

  getByPublicId: async (publicMagicId: string): Promise<MagicDto> => {
    const response = await apiClient.get<MagicDto>(`/api/magic/${publicMagicId}`);
    return response.data;
  },

  create: async (dto: CreateMagicDto): Promise<MagicDto> => {
    const response = await apiClient.post<MagicDto>('/api/magic', dto);
    return response.data;
  },

  update: async (publicMagicId: string, dto: UpdateMagicDto): Promise<MagicDto> => {
    const response = await apiClient.put<MagicDto>(`/api/magic/${publicMagicId}`, dto);
    return response.data;
  },

  delete: async (publicMagicId: string): Promise<void> => {
    await apiClient.delete(`/api/magic/${publicMagicId}`);
  },
};
```

### Custom Hooks with TanStack Query

```typescript
// hooks/useMagic.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { magicService, type CreateMagicDto, type UpdateMagicDto } from '@/services/magicService';

const MAGIC_KEYS = {
  all: ['magic'] as const,
  lists: () => [...MAGIC_KEYS.all, 'list'] as const,
  list: (filters: string) => [...MAGIC_KEYS.lists(), { filters }] as const,
  details: () => [...MAGIC_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MAGIC_KEYS.details(), id] as const,
};

// Fetch all magic items
export function useMagicList() {
  return useQuery({
    queryKey: MAGIC_KEYS.lists(),
    queryFn: () => magicService.getAll(),
  });
}

// Fetch single magic item
export function useMagic(publicMagicId: string) {
  return useQuery({
    queryKey: MAGIC_KEYS.detail(publicMagicId),
    queryFn: () => magicService.getByPublicId(publicMagicId),
    enabled: !!publicMagicId,
  });
}

// Create magic item mutation
export function useCreateMagic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateMagicDto) => magicService.create(dto),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: MAGIC_KEYS.lists() });
    },
  });
}

// Update magic item mutation
export function useUpdateMagic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicMagicId, dto }: { publicMagicId: string; dto: UpdateMagicDto }) =>
      magicService.update(publicMagicId, dto),
    onSuccess: (data) => {
      // Update specific item in cache
      queryClient.setQueryData(MAGIC_KEYS.detail(data.publicMagicId), data);
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: MAGIC_KEYS.lists() });
    },
  });
}

// Delete magic item mutation
export function useDeleteMagic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicMagicId: string) => magicService.delete(publicMagicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MAGIC_KEYS.lists() });
    },
  });
}
```

## Component Patterns

### Atomic Component Structure

```typescript
// components/ui/Button.tsx
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'hover:bg-gray-100',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Feature Component with TanStack Query

```typescript
// components/features/MagicList.tsx
import { useMagicList, useDeleteMagic } from '@/hooks/useMagic';
import { Button } from '@/components/ui/Button';

export function MagicList() {
  const { data: magics, isLoading, error } = useMagicList();
  const deleteMagic = useDeleteMagic();

  if (isLoading) {
    return <div>Loading magic items...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>;
  }

  const handleDelete = async (publicMagicId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMagic.mutateAsync(publicMagicId);
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Magic Items</h2>
      {magics?.length === 0 ? (
        <p>No magic items found.</p>
      ) : (
        <ul className="space-y-2">
          {magics?.map((magic) => (
            <li key={magic.publicMagicId} className="border p-4 rounded-lg">
              <h3 className="font-semibold">{magic.name}</h3>
              {magic.description && <p className="text-gray-600">{magic.description}</p>}
              <div className="mt-2 space-x-2">
                <Button size="sm" variant="secondary">
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(magic.publicMagicId)}
                  isLoading={deleteMagic.isPending}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## TanStack Form Pattern

```typescript
// components/features/CreateMagicForm.tsx
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import { useCreateMagic } from '@/hooks/useMagic';
import { Button } from '@/components/ui/Button';

const createMagicSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
});

export function CreateMagicForm() {
  const createMagic = useCreateMagic();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await createMagic.mutateAsync(value);
        form.reset();
      } catch (error) {
        console.error('Failed to create magic:', error);
      }
    },
    validatorAdapter: zodValidator,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <form.Field
          name="name"
          validators={{
            onChange: createMagicSchema.shape.name,
          }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block font-medium mb-1">
                Name
              </label>
              <input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              {field.state.meta.errors && (
                <span className="text-red-600 text-sm">{field.state.meta.errors[0]}</span>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <div>
        <form.Field name="description">
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block font-medium mb-1">
                Description
              </label>
              <textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={4}
              />
            </div>
          )}
        </form.Field>
      </div>

      <Button type="submit" isLoading={createMagic.isPending}>
        Create Magic
      </Button>
    </form>
  );
}
```

## TanStack Table Pattern

```typescript
// components/features/MagicTable.tsx
import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { useMagicList } from '@/hooks/useMagic';
import type { MagicDto } from '@/services/magicService';
import { Button } from '@/components/ui/Button';

export function MagicTable() {
  const { data: magics = [], isLoading } = useMagicList();

  const columns = useMemo<ColumnDef<MagicDto>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: (info) => info.getValue() || '-',
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="space-x-2">
            <Button size="sm" variant="secondary">
              Edit
            </Button>
            <Button size="sm" variant="destructive">
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: magics,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="text-left p-2">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          size="sm"
        >
          Previous
        </Button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} size="sm">
          Next
        </Button>
      </div>
    </div>
  );
}
```

## Custom Hooks Patterns

```typescript
// hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const [searchQuery, setSearchQuery] = useState('');
const debouncedQuery = useDebounce(searchQuery, 500);

useEffect(() => {
  if (debouncedQuery) {
    // Perform search
  }
}, [debouncedQuery]);
```

## Error Handling Pattern

```typescript
// components/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h2 className="text-red-800 font-bold">Something went wrong</h2>
            <p className="text-red-600">{this.state.error?.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

## Testing Standards (TDD)

### Component Test with React Testing Library

```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Loading...');
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Hook Test with TanStack Query

```typescript
// __tests__/hooks/useMagic.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMagicList, useCreateMagic } from '@/hooks/useMagic';
import { magicService } from '@/services/magicService';

// Mock the service
vi.mock('@/services/magicService');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useMagicList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches magic list successfully', async () => {
    const mockMagics = [
      { publicMagicId: '1', name: 'Test Magic', createdAt: new Date().toISOString(), isActive: true },
    ];

    vi.mocked(magicService.getAll).mockResolvedValue(mockMagics);

    const { result } = renderHook(() => useMagicList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockMagics);
    expect(magicService.getAll).toHaveBeenCalledTimes(1);
  });

  it('handles error when fetching fails', async () => {
    vi.mocked(magicService.getAll).mockRejectedValue(new Error('Failed to fetch'));

    const { result } = renderHook(() => useMagicList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useCreateMagic', () => {
  it('creates magic item successfully', async () => {
    const newMagic = { name: 'New Magic', description: 'Test' };
    const createdMagic = {
      publicMagicId: '1',
      ...newMagic,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    vi.mocked(magicService.create).mockResolvedValue(createdMagic);

    const { result } = renderHook(() => useCreateMagic(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newMagic);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(createdMagic);
    expect(magicService.create).toHaveBeenCalledWith(newMagic);
  });
});
```

### E2E Test with Playwright

```typescript
// e2e/magic.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Magic Items Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/magic');
  });

  test('should display magic items list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Magic Items' })).toBeVisible();
  });

  test('should create a new magic item', async ({ page }) => {
    await page.getByRole('button', { name: 'Create New' }).click();

    await page.getByLabel('Name').fill('Test Magic Item');
    await page.getByLabel('Description').fill('This is a test description');

    await page.getByRole('button', { name: 'Create Magic' }).click();

    await expect(page.getByText('Test Magic Item')).toBeVisible();
  });

  test('should delete a magic item', async ({ page }) => {
    const firstItem = page.locator('[data-testid="magic-item"]').first();
    await firstItem.getByRole('button', { name: 'Delete' }).click();

    // Confirm dialog
    page.on('dialog', (dialog) => dialog.accept());

    await expect(firstItem).not.toBeVisible();
  });
});
```

## State Management

### Zustand for Global State (Lightweight)

```typescript
// stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

## Performance Best Practices

### Code Splitting

```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('@/components/features/HeavyChart'));

export function Dashboard() {
  return (
    <Suspense fallback={<div>Loading chart...</div>}>
      <HeavyChart />
    </Suspense>
  );
}
```

### Memoization

```typescript
import { useMemo, useCallback } from 'react';

export function ExpensiveComponent({ items }: { items: Item[] }) {
  // Memoize expensive computation
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => b.value - a.value);
  }, [items]);

  // Memoize callback
  const handleItemClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);

  return (
    <ul>
      {sortedItems.map((item) => (
        <li key={item.id} onClick={() => handleItemClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

## Wizardworks Frontend Best Practices Summary

1. **Always use TypeScript with strict mode**
2. **TanStack Query for all data fetching**
3. **TanStack Form for complex forms**
4. **TanStack Table for data tables**
5. **Write tests first (TDD)**
6. **Use Zod for validation**
7. **Component composition over complexity**
8. **Immutability patterns (spread operators)**
9. **Error boundaries for resilience**
10. **Accessibility-first (ARIA labels, semantic HTML)**

**Remember**: These patterns enable rapid development, excellent user experience, and maintainable code. Follow them rigorously as a Wizardworks employee.
