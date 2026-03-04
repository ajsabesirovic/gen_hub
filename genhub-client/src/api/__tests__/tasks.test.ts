import { describe, it, expect, vi, beforeEach } from "vitest";
import axiosInstance from "@/lib/axios";
import { getParentTasks, getMyAcceptedTasks, getAvailableTasks } from "@/api/tasks";

vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axiosInstance);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getParentTasks", () => {
  it("returns tasks from a plain array response (no pagination)", async () => {
    const tasks = [
      { id: "1", title: "Task 1", status: "unclaimed" },
      { id: "2", title: "Task 2", status: "claimed" },
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: tasks });

    const result = await getParentTasks("open");

    expect(mockedAxios.get).toHaveBeenCalledWith("/tasks/parent/me/", {
      params: { segment: "open" },
    });
    expect(result).toEqual(tasks);
  });

  it("extracts results from a paginated response", async () => {
    const tasks = [{ id: "1", title: "Task 1" }];
    mockedAxios.get.mockResolvedValueOnce({
      data: { count: 1, next: null, previous: null, results: tasks },
    });

    const result = await getParentTasks();

    expect(mockedAxios.get).toHaveBeenCalledWith("/tasks/parent/me/", {
      params: {},
    });
    expect(result).toEqual(tasks);
  });
});

describe("getMyAcceptedTasks", () => {
  it("returns tasks from a plain array response", async () => {
    const tasks = [{ id: "3", title: "Accepted Task", status: "claimed" }];
    mockedAxios.get.mockResolvedValueOnce({ data: tasks });

    const result = await getMyAcceptedTasks("active");

    expect(mockedAxios.get).toHaveBeenCalledWith("/tasks/volunteer/me/", {
      params: { segment: "active" },
    });
    expect(result).toEqual(tasks);
  });
});

describe("getAvailableTasks", () => {
  it("returns available tasks as a plain array", async () => {
    const tasks = [
      { id: "4", title: "Available Task", status: "unclaimed" },
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: tasks });

    const result = await getAvailableTasks({ category: 5 });

    expect(mockedAxios.get).toHaveBeenCalledWith("/tasks/available/", {
      params: { category: 5 },
    });
    expect(result).toEqual(tasks);
  });
});
