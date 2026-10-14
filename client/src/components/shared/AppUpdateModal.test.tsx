import { render, screen, fireEvent, waitFor } from '../../../tests/helpers/render'
import userEvent from '@testing-library/user-event'
import AppUpdateModal from './AppUpdateModal'
import * as serviceWorkerShell from '../../utils/serviceWorkerShell'
import * as chunkReload from '../../utils/chunkReload'

vi.mock('../../utils/serviceWorkerShell', () => ({
  dropAppShell: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../utils/chunkReload', () => ({
  reloadFresh: vi.fn(),
}))

describe('AppUpdateModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('FE-COMP-UPDATE-001: does not render when isOpen is false', () => {
    render(<AppUpdateModal isOpen={false} />)
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('FE-COMP-UPDATE-002: renders modal dialog when isOpen is true', () => {
    render(<AppUpdateModal isOpen={true} />)
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    expect(screen.getByRole('button', { name: /update/i })).toBeTruthy()
  })

  it('FE-COMP-UPDATE-003: cannot be closed via Escape key or backdrop click', () => {
    render(<AppUpdateModal isOpen={true} />)
    const dialog = screen.getByRole('alertdialog')

    // Escape key
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('alertdialog')).toBeTruthy()

    // Backdrop click
    fireEvent.click(dialog)
    expect(screen.getByRole('alertdialog')).toBeTruthy()
  })

  it('FE-COMP-UPDATE-004: clicking update button drops app shell and triggers fresh reload', async () => {
    const user = userEvent.setup()
    render(<AppUpdateModal isOpen={true} />)

    const updateButton = screen.getByRole('button', { name: /update/i })
    await user.click(updateButton)

    await waitFor(() => {
      expect(serviceWorkerShell.dropAppShell).toHaveBeenCalledTimes(1)
      expect(chunkReload.reloadFresh).toHaveBeenCalledTimes(1)
    })
  })

  it('FE-COMP-UPDATE-005: renders version badge when version is specified or detected', () => {
    render(<AppUpdateModal isOpen={true} version="4.3.4" />)
    const versionBadge = screen.getByTestId('app-update-version')
    expect(versionBadge).toBeTruthy()
    expect(versionBadge.textContent).toBe('v4.3.4')
  })
})
