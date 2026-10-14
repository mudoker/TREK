import { render, screen, fireEvent } from '../../../tests/helpers/render'
import userEvent from '@testing-library/user-event'
import NewUserConfirmModal from './NewUserConfirmModal'

describe('NewUserConfirmModal', () => {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('FE-COMP-NEWUSER-001: does not render when isOpen is false', () => {
    render(
      <NewUserConfirmModal
        isOpen={false}
        username="alice"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('FE-COMP-NEWUSER-002: renders username, message, and action buttons when isOpen is true', () => {
    render(
      <NewUserConfirmModal
        isOpen={true}
        username="alice"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('alice')).toBeTruthy()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /create account/i })).toBeTruthy()
  })

  it('FE-COMP-NEWUSER-003: clicking cancel calls onCancel', async () => {
    const user = userEvent.setup()
    render(
      <NewUserConfirmModal
        isOpen={true}
        username="alice"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('FE-COMP-NEWUSER-004: clicking confirm calls onConfirm', async () => {
    const user = userEvent.setup()
    render(
      <NewUserConfirmModal
        isOpen={true}
        username="alice"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('FE-COMP-NEWUSER-005: pressing Escape key triggers onCancel', () => {
    render(
      <NewUserConfirmModal
        isOpen={true}
        username="alice"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('FE-COMP-NEWUSER-006: disables buttons and shows loading text when isLoading is true', () => {
    render(
      <NewUserConfirmModal
        isOpen={true}
        username="alice"
        isLoading={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    const confirmBtn = screen.getByRole('button', { name: /creating/i })
    expect(cancelBtn).toBeDisabled()
    expect(confirmBtn).toBeDisabled()
  })
})
