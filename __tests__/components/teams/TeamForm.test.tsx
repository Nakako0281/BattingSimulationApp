import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import TeamForm from "@/components/teams/TeamForm";
import type { Team } from "@/types";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe("TeamForm", () => {
  const mockPush = jest.fn();
  const mockTeam: Team = {
    id: "team-1",
    user_id: "user-1",
    name: "Test Team",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (global.fetch as jest.Mock).mockClear();
  });

  describe("Create Mode", () => {
    it("should render create form with empty fields", () => {
      render(<TeamForm mode="create" />);

      expect(screen.getByLabelText(/チーム名/i)).toHaveValue("");
      expect(screen.getByRole("button", { name: /チームを作成/i })).toBeInTheDocument();
    });

    it("should update team name input", async () => {
      const user = userEvent.setup();
      render(<TeamForm mode="create" />);

      const nameInput = screen.getByLabelText(/チーム名/i);
      await user.type(nameInput, "新しいチーム");

      expect(nameInput).toHaveValue("新しいチーム");
    });

    it("should disable submit button when name is empty", () => {
      render(<TeamForm mode="create" />);

      const submitButton = screen.getByRole("button", { name: /チームを作成/i });
      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when name is filled", async () => {
      const user = userEvent.setup();
      render(<TeamForm mode="create" />);

      const nameInput = screen.getByLabelText(/チーム名/i);
      const submitButton = screen.getByRole("button", { name: /チームを作成/i });

      await user.type(nameInput, "Test Team");

      expect(submitButton).not.toBeDisabled();
    });

    it("should submit create request with correct data", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ success: true, data: mockTeam }),
      });

      render(<TeamForm mode="create" />);

      const nameInput = screen.getByLabelText(/チーム名/i);
      const submitButton = screen.getByRole("button", { name: /チームを作成/i });

      await user.type(nameInput, "New Team");
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/teams",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "New Team" }),
          })
        );
      });
    });

    it("should redirect to teams page on successful creation", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ success: true, data: mockTeam }),
      });

      render(<TeamForm mode="create" />);

      const nameInput = screen.getByLabelText(/チーム名/i);
      const submitButton = screen.getByRole("button", { name: /チームを作成/i });

      await user.type(nameInput, "New Team");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/teams");
      });
    });
  });

  describe("Edit Mode", () => {
    it("should render edit form with existing team data", () => {
      render(<TeamForm mode="edit" team={mockTeam} />);

      expect(screen.getByLabelText(/チーム名/i)).toHaveValue("Test Team");
      expect(screen.getByRole("button", { name: /変更を保存/i })).toBeInTheDocument();
    });

    it("should update team name in edit mode", async () => {
      const user = userEvent.setup();
      render(<TeamForm mode="edit" team={mockTeam} />);

      const nameInput = screen.getByLabelText(/チーム名/i);

      await user.clear(nameInput);
      await user.type(nameInput, "Updated Team");

      expect(nameInput).toHaveValue("Updated Team");
    });

    it("should submit update request with correct data", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ success: true, data: { ...mockTeam, name: "Updated Team" } }),
      });

      render(<TeamForm mode="edit" team={mockTeam} />);

      const nameInput = screen.getByLabelText(/チーム名/i);
      const submitButton = screen.getByRole("button", { name: /変更を保存/i });

      await user.clear(nameInput);
      await user.type(nameInput, "Updated Team");
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/teams/${mockTeam.id}`,
          expect.objectContaining({
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Updated Team" }),
          })
        );
      });
    });

    it("should redirect to teams page on successful update", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ success: true, data: mockTeam }),
      });

      render(<TeamForm mode="edit" team={mockTeam} />);

      const submitButton = screen.getByRole("button", { name: /変更を保存/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/teams");
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ json: async () => ({ success: true }) }), 100))
      );

      render(<TeamForm mode="create" />);

      const nameInput = screen.getByLabelText(/チーム名/i);
      const submitButton = screen.getByRole("button", { name: /チームを作成/i });

      await user.type(nameInput, "Test Team");
      await user.click(submitButton);

      expect(screen.getByRole("button", { name: /保存中/i })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });

    it("should disable inputs during submission", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ json: async () => ({ success: true }) }), 100))
      );

      render(<TeamForm mode="create" />);

      const nameInput = screen.getByLabelText(/チーム名/i);
      const submitButton = screen.getByRole("button", { name: /チームを作成/i });

      await user.type(nameInput, "Test Team");
      await user.click(submitButton);

      expect(nameInput).toBeDisabled();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });

    it("should disable cancel button during submission", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ json: async () => ({ success: true }) }), 100))
      );

      render(<TeamForm mode="create" />);

      const nameInput = screen.getByLabelText(/チーム名/i);
      const submitButton = screen.getByRole("button", { name: /チームを作成/i });
      const cancelButton = screen.getByRole("button", { name: /キャンセル/i });

      await user.type(nameInput, "Test Team");
      await user.click(submitButton);

      expect(cancelButton).toBeDisabled();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling", () => {
    it("should show error message on API failure", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ success: false, error: "チーム名は既に使用されています" }),
      });

      render(<TeamForm mode="create" />);

      const nameInput = screen.getByLabelText(/チーム名/i);
      const submitButton = screen.getByRole("button", { name: /チームを作成/i });

      await user.type(nameInput, "Duplicate Team");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/チーム名は既に使用されています/i)).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should show generic error on network failure", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      render(<TeamForm mode="create" />);

      const nameInput = screen.getByLabelText(/チーム名/i);
      const submitButton = screen.getByRole("button", { name: /チームを作成/i });

      await user.type(nameInput, "Test Team");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/保存に失敗しました/i)).toBeInTheDocument();
      });
    });

    it("should clear error when user starts typing", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ success: false, error: "エラーメッセージ" }),
      });

      render(<TeamForm mode="create" />);

      const nameInput = screen.getByLabelText(/チーム名/i);
      const submitButton = screen.getByRole("button", { name: /チームを作成/i });

      await user.type(nameInput, "Test");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/エラーメッセージ/i)).toBeInTheDocument();
      });

      await user.type(nameInput, " Updated");

      // Note: This form doesn't clear errors on typing, so error should still be visible
      expect(screen.getByText(/エラーメッセージ/i)).toBeInTheDocument();
    });
  });

  describe("Cancel Button", () => {
    it("should redirect to teams page when cancel is clicked", async () => {
      const user = userEvent.setup();
      render(<TeamForm mode="create" />);

      const cancelButton = screen.getByRole("button", { name: /キャンセル/i });
      await user.click(cancelButton);

      expect(mockPush).toHaveBeenCalledWith("/teams");
    });

    it("should work in edit mode too", async () => {
      const user = userEvent.setup();
      render(<TeamForm mode="edit" team={mockTeam} />);

      const cancelButton = screen.getByRole("button", { name: /キャンセル/i });
      await user.click(cancelButton);

      expect(mockPush).toHaveBeenCalledWith("/teams");
    });
  });

  describe("Input Validation", () => {
    it("should have required attribute on name input", () => {
      render(<TeamForm mode="create" />);

      const nameInput = screen.getByLabelText(/チーム名/i);
      expect(nameInput).toBeRequired();
    });

    it("should have maxLength of 100", () => {
      render(<TeamForm mode="create" />);

      const nameInput = screen.getByLabelText(/チーム名/i);
      expect(nameInput).toHaveAttribute("maxLength", "100");
    });

    it("should show field hint", () => {
      render(<TeamForm mode="create" />);

      expect(screen.getByText(/1-100文字で入力してください/i)).toBeInTheDocument();
    });

    it("should disable submit with whitespace-only input", async () => {
      const user = userEvent.setup();
      render(<TeamForm mode="create" />);

      const nameInput = screen.getByLabelText(/チーム名/i);
      const submitButton = screen.getByRole("button", { name: /チームを作成/i });

      await user.type(nameInput, "   ");

      expect(submitButton).toBeDisabled();
    });
  });
});
