import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

// Mock AuthContext
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("LoginForm", () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });
  });

  describe("Rendering", () => {
    it("should render login form with all fields", () => {
      render(<LoginForm />);

      expect(screen.getByLabelText("ニックネーム")).toBeInTheDocument();
      expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /ログイン/i })).toBeInTheDocument();
    });

    it("should render link to registration page", () => {
      render(<LoginForm />);

      const registerLink = screen.getByRole("link", { name: /新規登録/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute("href", "/register");
    });

    it("should have proper ARIA labels", () => {
      render(<LoginForm />);

      const form = screen.getByRole("form", { name: "ログインフォーム" });
      expect(form).toBeInTheDocument();

      const nicknameInput = screen.getByLabelText("ニックネーム");
      expect(nicknameInput).toHaveAttribute("aria-required", "true");

      const passwordInput = screen.getByLabelText("パスワード");
      expect(passwordInput).toHaveAttribute("aria-required", "true");
    });
  });

  describe("User Input", () => {
    it("should update nickname field on change", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      await user.type(nicknameInput, "testuser");

      expect(nicknameInput).toHaveValue("testuser");
    });

    it("should update password field on change", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText("パスワード");
      await user.type(passwordInput, "password123");

      expect(passwordInput).toHaveValue("password123");
    });

    it("should clear error when user types in field with error", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const form = screen.getByRole("form", { name: "ログインフォーム" });

      // Type invalid data
      await user.type(nicknameInput, "ab");
      await user.type(passwordInput, "password123");
      fireEvent.submit(form);

      // Wait for validation errors
      await waitFor(() => {
        expect(screen.getByText(/3文字以上である必要があります/i)).toBeInTheDocument();
      });

      // Type to fix the error
      await user.type(nicknameInput, "c");

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/3文字以上である必要があります/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Validation", () => {
    it("should show validation error for short nickname", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const form = screen.getByRole("form", { name: "ログインフォーム" });

      await user.type(nicknameInput, "ab");
      await user.type(passwordInput, "password123");

      // Submit the form directly to bypass HTML5 validation
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/3文字以上である必要があります/i)).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should show validation error for invalid nickname characters", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const form = screen.getByRole("form", { name: "ログインフォーム" });

      await user.type(nicknameInput, "test@user");
      await user.type(passwordInput, "password123");
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/英数字、アンダースコア、ハイフンのみ使用できます/i)).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should show validation error for short password", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const form = screen.getByRole("form", { name: "ログインフォーム" });

      await user.type(nicknameInput, "testuser");
      await user.type(passwordInput, "pass");
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/8文字以上である必要があります/i)).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should show multiple validation errors", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const form = screen.getByRole("form", { name: "ログインフォーム" });

      await user.type(nicknameInput, "ab");
      await user.type(passwordInput, "pass");
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/3文字以上である必要があります/i)).toBeInTheDocument();
        expect(screen.getByText(/8文字以上である必要があります/i)).toBeInTheDocument();
      });
    });

    it("should mark invalid fields with aria-invalid", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const form = screen.getByRole("form", { name: "ログインフォーム" });

      await user.type(nicknameInput, "ab");
      await user.type(passwordInput, "password123");
      fireEvent.submit(form);

      await waitFor(() => {
        expect(nicknameInput).toHaveAttribute("aria-invalid", "true");
      });
    });
  });

  describe("Form Submission", () => {
    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });

      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const submitButton = screen.getByRole("button", { name: /ログイン/i });

      await user.type(nicknameInput, "testuser");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith("testuser", "password123");
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const submitButton = screen.getByRole("button", { name: /ログイン/i });

      await user.type(nicknameInput, "testuser");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      expect(screen.getByRole("button", { name: /ログイン中/i })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^ログイン$/i })).toBeInTheDocument();
      });
    });

    it("should disable inputs during submission", async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const submitButton = screen.getByRole("button", { name: /ログイン/i });

      await user.type(nicknameInput, "testuser");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      expect(nicknameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();

      await waitFor(() => {
        expect(nicknameInput).not.toBeDisabled();
      });
    });

    it("should show error message on login failure", async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: false, error: "ユーザー名またはパスワードが間違っています" });

      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const submitButton = screen.getByRole("button", { name: /ログイン/i });

      await user.type(nicknameInput, "testuser");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ユーザー名またはパスワードが間違っています/i)).toBeInTheDocument();
      });
    });

    it("should show generic error message on unexpected error", async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue(new Error("Network error"));

      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const submitButton = screen.getByRole("button", { name: /ログイン/i });

      await user.type(nicknameInput, "testuser");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ログインに失敗しました。もう一度お試しください。/i)).toBeInTheDocument();
      });
    });

    it("should clear error message when user starts typing", async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: false, error: "エラーメッセージ" });

      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const submitButton = screen.getByRole("button", { name: /ログイン/i });

      await user.type(nicknameInput, "testuser");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/エラーメッセージ/i)).toBeInTheDocument();
      });

      await user.type(nicknameInput, "a");

      await waitFor(() => {
        expect(screen.queryByText(/エラーメッセージ/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have error messages with role alert", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const form = screen.getByRole("form", { name: "ログインフォーム" });

      await user.type(nicknameInput, "ab");
      await user.type(passwordInput, "pass");
      fireEvent.submit(form);

      await waitFor(() => {
        const errorMessages = screen.getAllByRole("alert");
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it("should associate error messages with inputs via aria-describedby", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const form = screen.getByRole("form", { name: "ログインフォーム" });

      await user.type(nicknameInput, "ab");
      await user.type(passwordInput, "password123");
      fireEvent.submit(form);

      await waitFor(() => {
        expect(nicknameInput).toHaveAttribute("aria-describedby", "nickname-error");
      });
    });
  });
});
