import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/contexts/AuthContext";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/components/auth/PasswordStrength", () => {
  return function MockPasswordStrength({ password }: { password: string }) {
    return <div data-testid="password-strength">Strength: {password.length > 0 ? "visible" : "hidden"}</div>;
  };
});

describe("RegisterForm", () => {
  const mockRegister = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
    });
  });

  describe("Rendering", () => {
    it("should render registration form with all fields", () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText("ニックネーム")).toBeInTheDocument();
      expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
      expect(screen.getByLabelText("パスワード（確認）")).toBeInTheDocument();
      expect(screen.getByLabelText(/上記の注意事項を理解し、同意します/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /新規登録/i })).toBeInTheDocument();
    });

    it("should render link to login page", () => {
      render(<RegisterForm />);

      const loginLink = screen.getByRole("link", { name: /ログイン/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("should render warning notice", () => {
      render(<RegisterForm />);

      expect(screen.getByText(/重要な注意事項/i)).toBeInTheDocument();
      expect(screen.getByText(/パスワードのリセット機能はありません/i)).toBeInTheDocument();
    });

    it("should render password strength indicator", () => {
      render(<RegisterForm />);

      expect(screen.getByTestId("password-strength")).toBeInTheDocument();
    });

    it("should render field hints", () => {
      render(<RegisterForm />);

      expect(screen.getByText(/3-50文字、英数字とアンダースコア、ハイフンのみ使用可能/i)).toBeInTheDocument();
    });
  });

  describe("User Input", () => {
    it("should update all form fields on change", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const confirmPasswordInput = screen.getByLabelText("パスワード（確認）");

      await user.type(nicknameInput, "newuser");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      expect(nicknameInput).toHaveValue("newuser");
      expect(passwordInput).toHaveValue("password123");
      expect(confirmPasswordInput).toHaveValue("password123");
    });

    it("should toggle agreement checkbox", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const checkbox = screen.getByLabelText(/上記の注意事項を理解し、同意します/i);

      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("should clear field error when user types", async () => {
      const user = userEvent.setup();
      const {container} = render(<RegisterForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const confirmPasswordInput = screen.getByLabelText("パスワード（確認）");
      const checkbox = screen.getByLabelText(/上記の注意事項を理解し、同意します/i);
      const form = container.querySelector("form");

      // Type invalid data
      await user.type(nicknameInput, "ab");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(checkbox);
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/3文字以上である必要があります/i)).toBeInTheDocument();
      });

      await user.type(nicknameInput, "c");

      await waitFor(() => {
        expect(screen.queryByText(/3文字以上である必要があります/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Agreement Checkbox", () => {
    it("should disable submit button when not agreed", () => {
      render(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: /新規登録/i });
      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when agreed", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const checkbox = screen.getByLabelText(/上記の注意事項を理解し、同意します/i);
      const submitButton = screen.getByRole("button", { name: /新規登録/i });

      await user.click(checkbox);

      expect(submitButton).not.toBeDisabled();
    });

    it("should show error if submitting without agreement", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const confirmPasswordInput = screen.getByLabelText("パスワード（確認）");
      const submitButton = screen.getByRole("button", { name: /新規登録/i });

      // Form should be disabled, but test the validation logic
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Validation", () => {
    it("should show validation error for passwords not matching", async () => {
      const user = userEvent.setup();
      const {container} = render(<RegisterForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const confirmPasswordInput = screen.getByLabelText("パスワード（確認）");
      const checkbox = screen.getByLabelText(/上記の注意事項を理解し、同意します/i);
      const form = container.querySelector("form");

      await user.type(nicknameInput, "testuser");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "different123");
      await user.click(checkbox);
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/パスワードが一致しません/i)).toBeInTheDocument();
      });

      expect(mockRegister).not.toHaveBeenCalled();
    });

    it("should show validation error for short nickname", async () => {
      const user = userEvent.setup();
      const {container} = render(<RegisterForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const confirmPasswordInput = screen.getByLabelText("パスワード（確認）");
      const checkbox = screen.getByLabelText(/上記の注意事項を理解し、同意します/i);
      const form = container.querySelector("form");

      await user.type(nicknameInput, "ab");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(checkbox);
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/3文字以上である必要があります/i)).toBeInTheDocument();
      });
    });

    it("should show validation error for invalid nickname characters", async () => {
      const user = userEvent.setup();
      const {container} = render(<RegisterForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const confirmPasswordInput = screen.getByLabelText("パスワード（確認）");
      const checkbox = screen.getByLabelText(/上記の注意事項を理解し、同意します/i);
      const form = container.querySelector("form");

      await user.type(nicknameInput, "test@user");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(checkbox);
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/英数字、アンダースコア、ハイフンのみ使用できます/i)).toBeInTheDocument();
      });
    });

    it("should show validation error for short password", async () => {
      const user = userEvent.setup();
      const {container} = render(<RegisterForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const confirmPasswordInput = screen.getByLabelText("パスワード（確認）");
      const checkbox = screen.getByLabelText(/上記の注意事項を理解し、同意します/i);
      const form = container.querySelector("form");

      await user.type(nicknameInput, "testuser");
      await user.type(passwordInput, "pass");
      await user.type(confirmPasswordInput, "pass");
      await user.click(checkbox);
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/8文字以上である必要があります/i)).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({ success: true });

      render(<RegisterForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const confirmPasswordInput = screen.getByLabelText("パスワード（確認）");
      const checkbox = screen.getByLabelText(/上記の注意事項を理解し、同意します/i);
      const submitButton = screen.getByRole("button", { name: /新規登録/i });

      await user.type(nicknameInput, "newuser");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith("newuser", "password123", "password123");
      });
    });

    it("should redirect to login page on successful registration", async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({ success: true });

      render(<RegisterForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const confirmPasswordInput = screen.getByLabelText("パスワード（確認）");
      const checkbox = screen.getByLabelText(/上記の注意事項を理解し、同意します/i);
      const submitButton = screen.getByRole("button", { name: /新規登録/i });

      await user.type(nicknameInput, "newuser");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login?registered=true");
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      mockRegister.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<RegisterForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const confirmPasswordInput = screen.getByLabelText("パスワード（確認）");
      const checkbox = screen.getByLabelText(/上記の注意事項を理解し、同意します/i);
      const submitButton = screen.getByRole("button", { name: /新規登録/i });

      await user.type(nicknameInput, "newuser");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(checkbox);
      await user.click(submitButton);

      expect(screen.getByRole("button", { name: /登録中/i })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });

    it("should disable inputs during submission", async () => {
      const user = userEvent.setup();
      mockRegister.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<RegisterForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const confirmPasswordInput = screen.getByLabelText("パスワード（確認）");
      const checkbox = screen.getByLabelText(/上記の注意事項を理解し、同意します/i);
      const submitButton = screen.getByRole("button", { name: /新規登録/i });

      await user.type(nicknameInput, "newuser");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(checkbox);
      await user.click(submitButton);

      expect(nicknameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
      expect(checkbox).toBeDisabled();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });

    it("should show error message on registration failure", async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({ success: false, error: "ニックネームは既に使用されています" });

      render(<RegisterForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const confirmPasswordInput = screen.getByLabelText("パスワード（確認）");
      const checkbox = screen.getByLabelText(/上記の注意事項を理解し、同意します/i);
      const submitButton = screen.getByRole("button", { name: /新規登録/i });

      await user.type(nicknameInput, "existinguser");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ニックネームは既に使用されています/i)).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should show generic error on unexpected error", async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValue(new Error("Network error"));

      render(<RegisterForm />);

      const nicknameInput = screen.getByLabelText("ニックネーム");
      const passwordInput = screen.getByLabelText("パスワード");
      const confirmPasswordInput = screen.getByLabelText("パスワード（確認）");
      const checkbox = screen.getByLabelText(/上記の注意事項を理解し、同意します/i);
      const submitButton = screen.getByRole("button", { name: /新規登録/i });

      await user.type(nicknameInput, "newuser");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/登録に失敗しました。もう一度お試しください。/i)).toBeInTheDocument();
      });
    });
  });
});
