/**
 * Integration tests for task workflows using MSW
 * These tests use real API calls that are intercepted and mocked by MSW
 */
/// <reference types="vitest/globals" />
import "../integration-setup";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTasksByColumn, useCreateTask } from "../../hooks/useTasks";
import { useStatuses, useTaskTypes } from "../../hooks/useReferenceData";
import type { ReactNode } from "react";

// Create a wrapper component for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("Task Workflow Integration Tests", () => {
  it("should load and display tasks from the API", async () => {
    const TestComponent = () => {
      const { data: tasks, isLoading } = useTasksByColumn("column-1");

      if (isLoading) return <div>Loading...</div>;

      return (
        <div>
          <h1>Tasks</h1>
          {tasks?.map((task) => (
            <div key={task.id} data-testid={`task-${task.id}`}>
              {task.title}
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />, { wrapper: createWrapper() });

    // Initially loading
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText("Test Task")).toBeInTheDocument();
    });
  });

  it("should load reference data (statuses and types)", async () => {
    const TestComponent = () => {
      const { data: statuses, isLoading: statusesLoading } = useStatuses();
      const { data: types, isLoading: typesLoading } = useTaskTypes();

      if (statusesLoading || typesLoading) return <div>Loading...</div>;

      return (
        <div>
          <div data-testid="statuses">
            {statuses?.map((status) => (
              <span key={status.id}>{status.name}</span>
            ))}
          </div>
          <div data-testid="types">
            {types?.map((type) => (
              <span key={type.id}>{type.name}</span>
            ))}
          </div>
        </div>
      );
    };

    render(<TestComponent />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("To Do")).toBeInTheDocument();
      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("Done")).toBeInTheDocument();
      expect(screen.getByText("Task")).toBeInTheDocument();
      expect(screen.getByText("Bug")).toBeInTheDocument();
      expect(screen.getByText("Feature")).toBeInTheDocument();
    });
  });

  it("should create a new task through the API", async () => {
    const TestComponent = () => {
      const {
        mutate: createTask,
        data: createdTask,
        isPending,
      } = useCreateTask();

      const handleCreate = () => {
        createTask({
          title: "New Integration Test Task",
          description: "Created via integration test",
          boardId: "board-1",
          columnId: "column-1",
          statusId: "status-1",
          typeId: "type-1",
          priority: 1, // Medium priority
        });
      };

      return (
        <div>
          <button onClick={handleCreate} disabled={isPending}>
            Create Task
          </button>
          {createdTask && (
            <div data-testid="created-task">
              Task created: {createdTask.title}
            </div>
          )}
        </div>
      );
    };

    const user = userEvent.setup();
    render(<TestComponent />, { wrapper: createWrapper() });

    const createButton = screen.getByRole("button", { name: /create task/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId("created-task")).toHaveTextContent(
        "New Integration Test Task"
      );
    });
  });
});
